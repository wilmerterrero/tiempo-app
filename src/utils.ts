import addHours from "date-fns/addHours";
import format from "date-fns/format";
import getHours from "date-fns/getHours";
import subHours from "date-fns/subHours";
import { DropResult } from "react-beautiful-dnd";

export const getReorderedList = ({
  drop,
  list,
}: {
  drop: DropResult;
  list: any[];
}) => {
  const { destination, source } = drop;
  if (!destination) return;

  if (
    destination.droppableId === source.droppableId &&
    destination.index === source.index
  )
    return;

  const reorderedList = [...list];
  const [removed] = reorderedList.splice(source.index, 1);
  reorderedList.splice(destination.index, 0, removed);

  return reorderedList;
};

export const handleDragEnd = ({
  drop,
  list,
  action,
}: {
  drop: DropResult;
  list: any[];
  action: (newList: any[]) => void;
}) => {
  const reorderedList = getReorderedList({
    list,
    drop,
  });

  if (reorderedList) {
    action(reorderedList);
  }
};

export const calculateTimeFromOffset = (offset: number) => {
  const date = new Date();
  const newTime =
    offset >= 0 ? addHours(date, offset) : subHours(date, Math.abs(offset));
  const formattedTime = format(newTime, "h:mm a");

  return formattedTime;
};

export const isNight = (offset: number) => {
  const nowUtc = new Date();
  const localTime =
    offset >= 0 ? addHours(nowUtc, offset) : subHours(nowUtc, Math.abs(offset));
  const hour = getHours(localTime);

  return hour < 6 || hour >= 18;
};
