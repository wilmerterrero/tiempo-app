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

const getOffsetTime = (offset: number) => {
  // Create a date object for the current time in UTC
  const targetTime = new Date();
  //get the timezone offset from local time in minutes
  const tzDifference = offset * 60 + targetTime.getTimezoneOffset();
  //convert the offset to milliseconds, add to targetTime, and make a new Date
  const offsetTime = new Date(targetTime.getTime() + tzDifference * 60 * 1000);

  return offsetTime;
};

export const calculateTimeFromOffset = (offset: number) => {
  const offsetTime = getOffsetTime(offset);
  const formattedTime = format(offsetTime, "h:mm a");

  return formattedTime;
};

export const isNight = (offset: number) => {
  const date = getOffsetTime(offset);
  const hour = getHours(date);

  return hour < 6 || hour >= 18;
};
