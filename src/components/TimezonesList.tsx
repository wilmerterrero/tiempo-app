import { useTheme } from "../hooks/useTheme";

import { TimezoneListItem } from "./TimezoneListItem";

type TimezonesListProps = {
  timezones: Timezone[];
};

export const TimezonesList = ({ timezones }: TimezonesListProps) => {
  const theme = useTheme();
  return (
    <ul class="px-1 flex-1 h-56">
      {timezones.map((timezone) => (
        <TimezoneListItem key={timezone.id} timezone={timezone} theme={theme} />
      ))}
    </ul>
  );
};
