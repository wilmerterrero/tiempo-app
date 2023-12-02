import { HTMLAttributes } from "preact/compat";
import { StateUpdater, useState } from "preact/hooks";
import debounce from "lodash-es/debounce";

import useDB from "../db/useDB";
import { calculateTimeFromOffset, isNight } from "../utils";

import { DeleteIcon } from "./icons/delete";
import { DeleteLightIcon } from "./icons/delete-light";
import { FavoriteIcon } from "./icons/favorite";
import { FavoriteLightIcon } from "./icons/favorite-light";
import { Moon } from "./icons/moon";
import { Sun } from "./icons/sun";
import { ONLY_TEXT_REGEX, TextInput } from "./TextInput";

type TimezoneListItemProps = {
  timezone: Timezone;
  theme: string;
  setTimezones: StateUpdater<Timezone[] | []>;
} & HTMLAttributes<HTMLLIElement>;

export const TimezoneListItem = ({
  timezone,
  theme,
  setTimezones,
  ...props
}: TimezoneListItemProps) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const { deleteTimezone, updateTimezone } = useDB();

  const isLightTheme = theme === "light";

  const onEditName = async (id: string, name: string) => {
    await updateTimezone(id, { ...timezone, name });
    setTimezones((prev: Timezone[]) =>
      prev.map((timezone) => {
        if (timezone.id === id) {
          return { ...timezone, name };
        }
        return timezone;
      })
    );
  };

  const handleOnEditName = debounce((value: string) => {
    if (!isEditing) return;
    onEditName(timezone.id, value);
  }, 300);

  const handleDelete = async (id: string) => {
    await deleteTimezone(id);
    setTimezones((prev: Timezone[]) =>
      prev.filter((timezone) => timezone.id !== id)
    );
  };

  const handleFavorite = async (id: string) => {
    await updateTimezone(id, { ...timezone, isFavorite: !timezone.isFavorite });
    setTimezones((prev: Timezone[]) =>
      prev.map((timezone) => {
        if (timezone.id === id) {
          return { ...timezone, isFavorite: !timezone.isFavorite };
        }
        return timezone;
      })
    );
  };

  return (
    <li
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
        {isEditing ? (
          <TextInput
            mask={ONLY_TEXT_REGEX}
            unmask={true}
            value={timezone.name}
            onAccept={(value) => handleOnEditName(value)}
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
            <button
              className="pt-1"
              onClick={() => handleFavorite(timezone.id)}
            >
              {isLightTheme ? (
                <FavoriteLightIcon isFavorite={timezone.isFavorite} />
              ) : (
                <FavoriteIcon isFavorite={timezone.isFavorite} />
              )}
            </button>
          </div>
          {isHovering && (
            <div className="tooltip tooltip-left" data-tip="Delete timezone">
              <button
                className="pt-1"
                onClick={() => handleDelete(timezone.id)}
              >
                {isLightTheme ? <DeleteLightIcon /> : <DeleteIcon />}
              </button>
            </div>
          )}
        </div>
      ) : null}
    </li>
  );
};
