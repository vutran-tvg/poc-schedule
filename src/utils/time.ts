import { DAY_ORDER, DAY_NAMES } from "@/constants/schedule";

export const formatTimeForDisplay = (timeStr: string) => timeStr.substring(0, 5);

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
    return "today";
  }
  if (diffDays === 1) {
    return "tomorrow";
  }
  return `on ${DAY_NAMES[DAY_ORDER[event.getDay()]]}`;
}; 