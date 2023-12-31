import { useEffect, useState } from "preact/hooks";
import { useLocalStorage } from "usehooks-ts";

export const TimeTravel = () => {
  const [rangeValue, setRangeValue] = useState(50);
  const [timeTravel, setTimeTravel] = useLocalStorage("timeTravel", 0);
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    const difference = rangeValue - 50;
    const hourDifference = difference / 10;
    setTimeTravel(() => hourDifference);
    setDisplayText(
      timeTravel === 0 ? "" : `${timeTravel > 0 ? "+" : ""}${timeTravel} hours`
    );
  }, [rangeValue, timeTravel, setTimeTravel]);

  return (
    <div className="w-full pb-4">
      <div className="flex justify-between pb-2">
        <p className="text-sm font-medium">Time traveling</p>
        <p className="text-sm font-medium block">{displayText}</p>
      </div>
      <input
        type="range"
        min={0}
        max="100"
        className="range range-xs"
        value={rangeValue}
        step="10"
        onChange={(e) => setRangeValue(parseInt(e.currentTarget.value, 10))}
      />
      <div className="w-full flex justify-between text-xs px-2">
        {Array.from({ length: 11 }).map((_, index) => (
          <span key={index} className="text-gray-400">
            |
          </span>
        ))}
      </div>
    </div>
  );
};
