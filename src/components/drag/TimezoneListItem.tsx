import { forwardRef } from "preact/compat";
import { useState } from "preact/hooks";

import { calculateTimeFromOffset, isNight } from "../../utils";
import { DeleteIcon } from "../icons/delete";
import { DeleteLightIcon } from "../icons/delete-light";
import { DragBarsIcon } from "../icons/drag-bars";
import { FavoriteIcon } from "../icons/favorite";
import { FavoriteLightIcon } from "../icons/favorite-light";
import { Moon } from "../icons/moon";
import { Sun } from "../icons/sun";

type TimezoneListItemProps = {
  timezone: Timezone;
  theme: string;
};

export const TimezoneListItem = forwardRef<
  HTMLLIElement,
  TimezoneListItemProps
>(({ timezone, theme, ...props }, ref) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const isDark = theme === "dark";

  return (
    <li
      ref={ref}
      class="flex items-center justify-between p-2"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setIsEditing(false);
      }}
      onDblClick={() => setIsEditing(true)}
      {...props}
    >
      <div className="flex items-center space-x-2">
        <DragBarsIcon />
        {isEditing ? (
          <input
            type="text"
            value={timezone.name}
            onChange={(e) => console.log(e.currentTarget.value)}
            className="input input-bordered join-item input-sm w-full focus:outline-none"
          />
        ) : (
          <p class="max-w-[245px] truncate cursor-pointer font-medium">
            {timezone.name}
          </p>
        )}
      </div>
      {!isEditing ? (
        <div className="flex items-center gap-2">
          <p
            class={`badge badge-sm font-bold ${
              isNight(timezone.offSet) ? "badge-primary" : "badge-accent"
            } gap-1`}
          >
            {isNight(timezone.offSet) ? <Moon /> : <Sun />}{" "}
            {calculateTimeFromOffset(timezone.offSet)}
          </p>
          <div className="tooltip tooltip-left" data-tip="Mark as favorite">
            <button className="pt-1">
              {isDark ? (
                <FavoriteIcon isFavorite={timezone.isFavorite} />
              ) : (
                <FavoriteLightIcon isFavorite={timezone.isFavorite} />
              )}
            </button>
          </div>
          {isHovering && (
            <div className="tooltip tooltip-left" data-tip="Delete timezone">
              <button
                className="pt-1"
                onClick={() => console.log("Delete", timezone.id)}
              >
                {isDark ? <DeleteIcon /> : <DeleteLightIcon />}
              </button>
            </div>
          )}
        </div>
      ) : null}
    </li>
  );
});
