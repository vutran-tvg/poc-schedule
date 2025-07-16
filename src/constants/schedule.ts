import { ServiceHours } from "@/types/schedule";

export const DAY_ORDER = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export const DAY_NAMES: { [key: string]: string } = {
  sun: "Sunday",
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
};

export const INITIAL_SERVICE_HOURS: ServiceHours = {
  sun: { periods: [{ startTime: "09:00:00", endTime: "17:00:00" }] },
  mon: { periods: [{ startTime: "09:00:00", endTime: "17:00:00" }] },
  tue: { periods: [] },
  wed: {
    periods: [
      { startTime: "09:00:00", endTime: "12:00:00" },
      { startTime: "13:00:00", endTime: "18:00:00" },
    ],
  },
  thu: { periods: [{ startTime: "20:00:00", endTime: "23:59:00" }] },
  fri: {
    periods: [
      { startTime: "00:00:00", endTime: "03:00:00" },
      { startTime: "09:00:00", endTime: "17:00:00" },
    ],
  },
  sat: { periods: [{ startTime: "00:00:00", endTime: "23:59:00" }] },
}; 