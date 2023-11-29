import { invoke } from "@tauri-apps/api";
import { useState, useEffect, useRef } from "preact/hooks";
import PerfectScrollbar from "perfect-scrollbar";
import debounce from "lodash-es/debounce";

import { TimezonesList } from "./components/TimezonesList";
import useTimezones from "./hooks/useTimezones";
import { useTheme } from "./hooks/useTheme";
import { SearchIcon } from "./components/icons/search";
import { StatusesFooter } from "./components/StatusesFooter";

import "perfect-scrollbar/css/perfect-scrollbar.css";

import { mockTimezones } from "./mocks";

function App() {
  const [timezones, setTimezones] = useState(mockTimezones);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    timezones: fetchedTimezones,
    loading,
    error,
    cancelSearch,
  } = useTimezones(searchTerm);

  const timezonesListRef = useRef(null);
  const resultsListRef = useRef(null);

  const theme = useTheme();

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

  function changeTitle() {
    invoke("update_menu_title", { title: "New Title" }).then(() => {
      console.log("called succesfully");
    });
  }

  const debounceSearch = debounce((value) => {
    setSearchTerm(value);
  }, 500);

  const handleCancelSearch = () => {
    setSearchTerm("");
    cancelSearch();
  };

  const handleSearchChange = (e) => {
    debounceSearch(e.target.value);
  };

  return (
    <main
      data-theme={theme === "dark" ? "dim" : "light"}
      class="container mx-auto px-2 pt-4 flex flex-col justify-center items-center"
    >
      <input
        type="text"
        placeholder="Search timezones. Eg: New York"
        className="input input-bordered join-item input-sm w-full mb-2 focus:outline-none"
        onChange={handleSearchChange}
      />
      {fetchedTimezones && fetchedTimezones.length > 0 ? (
        <div className="absolute top-9 w-full px-2 z-50">
          <ul
            className="flex flex-col space-y-2 relative max-h-60 bg-slate-700 px-4 h-60 pt-2"
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
          <button
            className="btn btn-xs btn-square btn-info w-full"
            onClick={handleCancelSearch}
          >
            Cancel Search
          </button>
        </div>
      ) : null}
      <button
        type="submit"
        class="absolute right-2 top-0 mt-6 mr-4"
        onClick={changeTitle}
      >
        <SearchIcon />
      </button>
      <div className="max-h-60 relative w-full" ref={timezonesListRef}>
        <TimezonesList timezones={timezones} setTimezones={setTimezones} />
      </div>
      <StatusesFooter loading={loading} error={!!error} />
    </main>
  );
}

export default App;
