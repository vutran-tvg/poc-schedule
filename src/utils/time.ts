import { DAY_ORDER, DAY_NAMES } from "@/constants/schedule";

export const formatTimeForDisplay = (timeStr: string) => timeStr.substring(0, 5);

export const formatTimeForFriendlyDisplay = (timeStr: string) => {
  const time = timeStr.substring(0, 5);
  return time === "23:59" ? "Midnight" : time;
};

export const getRelativeDayName = (currentDate: Date, eventDate: Date): string => {
  const current = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
  );
  const event = new Date(
    eventDate.getFullYear(),
    eventDate.getMonth(),
    eventDate.getDate(),
  );

  const diffTime = event.getTime() - current.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "";
  }
  // if (diffDays === 1) {
  //   return "tomorrow";
  // }
  return `${DAY_NAMES[DAY_ORDER[event.getDay()]]}`;
}; 