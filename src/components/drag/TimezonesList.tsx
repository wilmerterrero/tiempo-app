import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { handleDragEnd } from "../utils";
import { TimezoneListItem } from "./TimezoneListItem";
import { useTheme } from "../hooks/useTheme";

type TimezonesListProps = {
  timezones: Timezone[];
  setTimezones: (timezones: Timezone[]) => void;
};

export const TimezonesList = ({
  timezones,
  setTimezones,
}: TimezonesListProps) => {
  const theme = useTheme();
  return (
    <DragDropContext
      onDragEnd={(drop) =>
        handleDragEnd({
          drop,
          list: timezones,
          action: setTimezones,
        })
      }
    >
      <Droppable droppableId="timezones-list">
        {(provided) => (
          <ul
            ref={provided.innerRef}
            class="px-1 flex-1 h-60"
            {...provided.droppableProps}
          >
            {timezones.map((timezone, index) => (
              <Draggable
                key={timezone.id}
                index={index}
                draggableId={timezone.id}
              >
                {(provided) => (
                  <TimezoneListItem
                    ref={provided.innerRef}
                    timezone={timezone}
                    theme={theme}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  />
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  );
};
