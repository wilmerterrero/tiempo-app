import { TimezoneListItem } from "./TimezoneListItem";
import { useTheme } from "../hooks/useTheme";

type TimezonesListProps = {
  timezones: Timezone[];
  setTimezones: (timezones: Timezone[]) => void;
};

export const TimezonesList = ({ timezones }: TimezonesListProps) => {
  const theme = useTheme();
  return (
    <ul class="px-1 flex-1 h-56">
      {timezones.map((timezone) => (
        <TimezoneListItem timezone={timezone} theme={theme} />
      ))}
    </ul>
  );
};
