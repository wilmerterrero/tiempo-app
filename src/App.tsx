import { invoke } from "@tauri-apps/api";
import { useState, useEffect, useRef } from "preact/hooks";
import PerfectScrollbar from "perfect-scrollbar";
import debounce from "lodash-es/debounce";

import { TimezonesList } from "./components/TimezonesList";
import useTimezones from "./hooks/useTimezones";
import { SearchIcon } from "./components/icons/search";
import { StatusesFooter } from "./components/StatusesFooter";

import "perfect-scrollbar/css/perfect-scrollbar.css";

import { mockTimezones } from "./mocks";
import { TimeTravel } from "./components/TimeTravel";
import { CloseIcon } from "./components/icons/close";
import { ChangeEvent } from "preact/compat";

function App() {
  const [timezones, setTimezones] = useState(mockTimezones);
  const [searchTerm, setSearchTerm] = useState("");
  // Needed to update the time every minute
  const [_, setTick] = useState(new Date());

  const {
    timezones: fetchedTimezones,
    loading,
    error,
    cancelSearch,
  } = useTimezones(searchTerm);

  const timezonesListRef = useRef(null);
  const resultsListRef = useRef(null);

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
    const updateTime = () => {
      setTick(new Date());
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
  }, []);

  function changeTitle() {
    invoke("update_menu_title", { title: "SDQ 7:00 PM / CR 5:00 PM" }).then(
      () => {
        console.log("called succesfully");
      }
    );
  }

  const debounceSearch = debounce((value) => {
    setSearchTerm(value);
  }, 500);

  const handleCancelSearch = () => {
    setSearchTerm("");
    cancelSearch();
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    debounceSearch(e.currentTarget.value);
  };

  return (
    <main class="container mx-auto px-2 pt-4 flex flex-col justify-center items-center">
      <input
        type="text"
        placeholder="Search timezones. Eg: New York"
        className="input input-bordered join-item input-sm w-full mb-2 text-app-primary-color bg-transparent focus:outline-none"
        value={searchTerm}
        onChange={handleSearchChange}
      />
      {fetchedTimezones && fetchedTimezones.length > 0 ? (
        <div className="absolute top-14 w-full px-2 z-50">
          <ul
            className="flex flex-col space-y-2 relative max-h-56 bg-slate-800 px-4 h-56 pt-2 rounded-md"
            ref={resultsListRef}
          >
            {fetchedTimezones.map((tz) => (
              <li
                key={tz.id}
                className="text-xs font-bold text-white underline cursor-pointer"
              >
                {tz.name}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <button
        type="submit"
        class="absolute right-2 top-0 mt-[22px] mr-4"
        onClick={resultsListRef.current ? handleCancelSearch : changeTitle}
      >
        {resultsListRef.current ? <CloseIcon /> : <SearchIcon />}
      </button>
      <div className="max-h-56 relative w-full" ref={timezonesListRef}>
        <TimezonesList timezones={timezones} setTimezones={setTimezones} />
      </div>
      <div className="flex flex-col w-full px-2 divide-y space-y-2 divide-slate-400">
        <TimeTravel />
        <div className="flex justify-between pt-6">
          <p class="text-sm font-medium">Options</p>
          <p>+</p>
        </div>
      </div>

      <StatusesFooter loading={loading} error={!!error} />
    </main>
  );
}

export default App;
