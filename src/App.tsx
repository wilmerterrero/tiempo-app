import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { invoke } from "@tauri-apps/api";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { WebviewWindow } from "@tauri-apps/api/window";
import debounce from "lodash-es/debounce";
import isEmpty from "lodash-es/isEmpty";
import PerfectScrollbar from "perfect-scrollbar";
import { initDB } from "react-indexed-db-hook";
import { useLocalStorage, useReadLocalStorage } from "usehooks-ts";

import { CloseIcon } from "./components/icons/close";
import { SearchIcon } from "./components/icons/search";
import { StatusesFooter } from "./components/StatusesFooter";
import { ONLY_TEXT_REGEX, TextInput } from "./components/TextInput";
import { TimeTravel } from "./components/TimeTravel";
import { TimezonesList } from "./components/TimezonesList";
import { DBConfig } from "./db/config";
import useDB from "./db/useDB";
import { useAppVersion } from "./hooks/useAppVersion";
import { useTheme } from "./hooks/useTheme";
import useTimezones from "./hooks/useTimezones";
import { mockTimezones } from "./mocks";
import { calculateTimeFromOffset, getInitials } from "./utils";

import "perfect-scrollbar/css/perfect-scrollbar.css";

initDB(DBConfig);

function App() {
  const [timezones, setTimezones] = useState<Timezone[] | []>([]);
  const [searchTerm, setSearchTerm] = useState("");
  // Needed to update the time every minute
  const [_, setTick] = useState(new Date());

  const [isFirstTime, setIsFirstTime] = useLocalStorage("isFirstTime", true);
  const timeFormat = (useReadLocalStorage("timeFormat") as number) ?? 12;
  const timeTravel = (useReadLocalStorage("timeTravel") as number) ?? 0;

  const {
    timezones: fetchedTimezones,
    isSearchMode,
    loading,
    error,
    cancelSearch,
  } = useTimezones(searchTerm);

  const { fetchTimezones, addTimezone } = useDB();

  const theme = useTheme();
  const appVersion = useAppVersion();

  const timezonesListRef = useRef(null);
  const resultsListRef = useRef(null);
  const inputSearchRef = useRef<HTMLInputElement>(null);

  const getFavoriteTimezonesTitle = useCallback(() => {
    const favorites = timezones.filter((timezone) => timezone.isFavorite);
    const title = favorites.reduce((acc, curr, index) => {
      const { name, offSet } = curr;
      const initials = getInitials(name);
      const time = calculateTimeFromOffset({
        offset: offSet,
        timeFormat,
        timeTravel,
      });
      const timeString = `${initials} ${time}`;
      if (index === 0) {
        return timeString;
      }
      return `${acc} / ${timeString}`;
    }, "");
    return title;
  }, [timeFormat, timeTravel, timezones]);

  const updateMenuTitle = useCallback(() => {
    const title = getFavoriteTimezonesTitle();

    if (!title) return;

    invoke("update_menu_title", { title }).then(() => {
      console.log("update_menu_title called succesfully");
    });
  }, [getFavoriteTimezonesTitle]);

  useEffect(() => {
    const getTimezones = async () => {
      const _timezones = await fetchTimezones();
      if (isEmpty(_timezones) && isFirstTime) {
        for (const tz of mockTimezones) {
          await addTimezone(tz);
        }
        setTimezones(mockTimezones);
        setIsFirstTime((prev) => !prev);
        return;
      }

      if (!_timezones) return;
      setTimezones(_timezones);
    };
    getTimezones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!timezonesListRef.current) return;
    const ps = new PerfectScrollbar(timezonesListRef.current, {
      wheelSpeed: 2,
      wheelPropagation: true,
      minScrollbarLength: 20,
    });
    ps.update();
    return () => {
      ps.destroy();
    };
  }, [timezonesListRef]);

  useEffect(() => {
    if (!resultsListRef.current) return;
    const ps = new PerfectScrollbar(resultsListRef.current, {
      wheelSpeed: 2,
      wheelPropagation: true,
      minScrollbarLength: 20,
    });
    ps.update();
    return () => {
      ps.destroy();
    };
  }, [resultsListRef]);

  useEffect(() => {
    let _unlisten: UnlistenFn;
    const listenThemeEvent = async () => {
      _unlisten = await listen("theme_changed", () => {
        window.location.reload();
      });
    };
    listenThemeEvent();
    return () => {
      _unlisten();
    };
  }, []);

  useEffect(() => {
    updateMenuTitle();
  }, [timezones, updateMenuTitle]);

  useEffect(() => {
    const updateTime = () => {
      setTick(new Date());
      updateMenuTitle();
    };

    // Calculate delay until the next full minute
    const now = new Date();
    const delayUntilNextMinute =
      (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

    // Set a timeout to align the interval with the next full minute
    const timeoutId = setTimeout(() => {
      updateTime(); // Update immediately when the full minute is reached
      // Start the interval from the full minute mark
      const intervalId = setInterval(updateTime, 60000); // Update every minute

      // Clear interval on component unmount
      return () => {
        clearInterval(intervalId);
      };
    }, delayUntilNextMinute);

    // Clear timeout on component unmount
    return () => {
      clearTimeout(timeoutId);
    };
  }, [updateMenuTitle]);

  const debounceSearch = debounce((value) => {
    setSearchTerm(value);
  }, 500);

  const handleCancelSearch = () => {
    setSearchTerm("");
    inputSearchRef.current?.value && (inputSearchRef.current.value = "");
    cancelSearch();
  };

  const handleSearchChange = (searchValue: string) => {
    debounceSearch(searchValue);
  };

  const handleAddTimezone = async (timezone: Timezone) => {
    const result = await addTimezone(timezone);
    if (!result) return;
    setTimezones((prev) => [...prev, timezone]);
  };

  const handleOpenWindow = (name: string, path: string) => {
    const randomId = Date.now();
    const webview = new WebviewWindow(`${name}-${randomId}`, {
      url: `${path}?theme=${theme}`,
      title: name,
      height: 450,
      width: 450,
      resizable: false,
      maximizable: false,
      fullscreen: false,
    });

    webview.once("tauri://created", () => {
      console.log("webview window created");
    });
    webview.once("tauri://error", (e) => {
      console.log("webview window error", e);
    });
  };

  return (
    <main class="container mx-auto px-2 pt-4 flex flex-col justify-center items-center">
      <div className="flex-1 w-full px-2 mb-2">
        <TextInput
          inputRef={inputSearchRef}
          mask={ONLY_TEXT_REGEX}
          onAccept={(value) => handleSearchChange(value)}
          placeholder="Search timezones. Eg: New York"
        />
      </div>
      <button
        type="submit"
        class="absolute right-2 top-0 mt-[22px] mr-5"
        onClick={isSearchMode ? handleCancelSearch : void 0}
      >
        {isSearchMode ? <CloseIcon /> : <SearchIcon />}
      </button>
      {isSearchMode ? (
        <div className="absolute top-14 w-full px-4 z-50">
          <ul
            className="flex flex-col space-y-2 relative max-h-56 bg-slate-600 px-4 h-56 pt-2 rounded-md"
            ref={resultsListRef}
          >
            {fetchedTimezones.map((tz) => (
              <li
                key={tz.id}
                className="text-xs font-bold text-white underline cursor-pointer"
                onClick={() => {
                  handleCancelSearch();
                  handleAddTimezone({
                    id: tz.id,
                    name: tz.abbreviation,
                    offSet: tz.offset,
                    timeZone: tz.abbreviation,
                    isFavorite: false,
                    order: 0,
                  });
                }}
              >
                {tz.name}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="max-h-56 relative w-full" ref={timezonesListRef}>
        <TimezonesList timezones={timezones} setTimezones={setTimezones} />
      </div>
      <div className="absolute bottom-2 w-full">
        <div className="flex flex-col px-4 divide-y space-y-2 divide-slate-400">
          <TimeTravel />
          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={() =>
                handleOpenWindow("Preferences", "extras/preferences/index.html")
              }
            >
              <span class="text-sm font-medium">Preferences...</span>
            </button>
            <button
              type="button"
              onClick={() =>
                handleOpenWindow("Feedback", "extras/feedback/index.html")
              }
            >
              <span class="text-sm font-medium">Feedback/Bug report...</span>
            </button>
            <span class="text-xs font-medium">Version {appVersion}</span>
          </div>
        </div>
        <StatusesFooter loading={loading} error={!!error} />
      </div>
    </main>
  );
}

export default App;
