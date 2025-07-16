import { ServiceHours } from "@/types/schedule";
import { DAY_ORDER } from "@/constants/schedule";
import { formatTimeForDisplay, formatTimeForFriendlyDisplay } from "./time";

export const getStoreStatus = (
  serviceHours: ServiceHours,
  date: Date,
): "open" | "closed" => {
  const currentDayIndex = date.getDay();
  const currentDayKey = DAY_ORDER[currentDayIndex];
  const prevDayIndex = (currentDayIndex - 1 + 7) % 7;
  const prevDayKey = DAY_ORDER[prevDayIndex];
  const currentTime = date.toTimeString().split(" ")[0];

  const currentDayPeriods = serviceHours[currentDayKey]?.periods || [];
  for (const period of currentDayPeriods) {
    if (currentTime >= period.startTime && currentTime <= period.endTime) {
      return "open";
    }
  }

  const prevDayPeriods = serviceHours[prevDayKey]?.periods || [];
  const isOvernightFromPrev = prevDayPeriods.some(
    (p) => p.endTime === "23:59:00",
  );

  if (isOvernightFromPrev) {
    const continuationPeriod = currentDayPeriods.find(
      (p) => p.startTime === "00:00:00",
    );
    if (continuationPeriod && currentTime <= continuationPeriod.endTime) {
      return "open";
    }
  }

  return "closed";
};

// Helper function to detect continuous overnight span length
const getContinuousOvernightSpan = (
  serviceHours: ServiceHours,
  startDayIndex: number,
): number => {
  let spanLength = 1;
  let currentIndex = startDayIndex;

  // Check if current day ends at 23:59
  const currentDayKey = DAY_ORDER[currentIndex];
  const currentDayPeriods = serviceHours[currentDayKey]?.periods || [];
  const endsOvernight = currentDayPeriods.some((p) => p.endTime === "23:59:00");

  if (!endsOvernight) return 1;

  // Look ahead to find the full span
  for (let i = 1; i < 7; i++) {
    const nextIndex = (currentIndex + i) % 7;
    const nextDayKey = DAY_ORDER[nextIndex];
    const nextDayPeriods = serviceHours[nextDayKey]?.periods || [];

    // Check if next day starts at 00:00
    const startsFromMidnight = nextDayPeriods.some((p) => p.startTime === "00:00:00");
    if (!startsFromMidnight) break;

    spanLength++;

    // Check if this day also ends at 23:59 (continues further)
    const nextEndsOvernight = nextDayPeriods.some((p) => p.endTime === "23:59:00");
    if (!nextEndsOvernight) break;
  }

  return spanLength;
};

export const formatScheduleForDisplay = (
  serviceHours: ServiceHours,
): { [key: string]: string } => {
  const displayData: { [key: string]: string } = {};

  DAY_ORDER.forEach((dayKey, index) => {
    const dayPeriods =
      serviceHours[dayKey]?.periods
        .filter((p) => p.startTime && p.endTime)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)) || [];

    if (dayPeriods.length === 0) {
      displayData[dayKey] = "Closed";
      return;
    }

    if (
      dayPeriods.length === 1 &&
      dayPeriods[0].startTime === "00:00:00" &&
      dayPeriods[0].endTime === "23:59:00"
    ) {
      displayData[dayKey] = "Open 24 hours";
      return;
    }

    const dayStrings: string[] = [];
    const nextDayKey = DAY_ORDER[(index + 1) % 7];
    const nextDayPeriods = serviceHours[nextDayKey]?.periods || [];

    dayPeriods.forEach((period) => {
      if (period.endTime === "23:59:00") {
        const overnightContinuation = nextDayPeriods.find(
          (p) => p.startTime === "00:00:00",
        );
        if (overnightContinuation) {
          // Check if this is a simple 2-day overnight or multi-day span
          const overnightSpan = getContinuousOvernightSpan(serviceHours, index);
          
          if (overnightSpan === 2) {
            // Simple 2-day overnight: use "(Next day)" pattern
            dayStrings.push(
              `${formatTimeForFriendlyDisplay(period.startTime)} - ${formatTimeForFriendlyDisplay(overnightContinuation.endTime)} (Next day)`,
            );
          } else {
            // Multi-day span: show exact schedule for each day
            dayStrings.push(
              `${formatTimeForFriendlyDisplay(period.startTime)} - ${formatTimeForFriendlyDisplay(period.endTime)}`,
            );
          }
        } else {
          dayStrings.push(
            `${formatTimeForFriendlyDisplay(period.startTime)} - ${formatTimeForFriendlyDisplay(period.endTime)}`,
          );
        }
      } else {
        dayStrings.push(
          `${formatTimeForFriendlyDisplay(period.startTime)} - ${formatTimeForFriendlyDisplay(period.endTime)}`,
        );
      }
    });

    displayData[dayKey] =
      dayStrings.length > 0 ? dayStrings.join(" | ") : "Closed";
  });

  return displayData;
};

export const getNextEvent = (
  serviceHours: ServiceHours,
  currentDate: Date,
): { type: "Opens" | "Closes"; time: string; date: Date } | null => {
  const status = getStoreStatus(serviceHours, currentDate);
  const currentDayIndex = currentDate.getDay();
  const currentTime = currentDate.toTimeString().split(" ")[0];

  if (status === "open") {
    const currentDayKey = DAY_ORDER[currentDayIndex];
    const currentDayPeriods =
      serviceHours[currentDayKey]?.periods.sort((a, b) =>
        a.startTime.localeCompare(b.startTime),
      ) || [];
    for (const period of currentDayPeriods) {
      if (currentTime >= period.startTime && currentTime <= period.endTime) {
        return { type: "Closes", time: period.endTime, date: currentDate };
      }
    }

    const prevDayIndex = (currentDayIndex - 1 + 7) % 7;
    const prevDayKey = DAY_ORDER[prevDayIndex];
    const isOvernightFromPrev = (serviceHours[prevDayKey]?.periods || []).some(
      (p) => p.endTime === "23:59:00",
    );

    if (isOvernightFromPrev) {
      const continuationPeriod = currentDayPeriods.find(
        (p) => p.startTime === "00:00:00",
      );
      if (continuationPeriod && currentTime <= continuationPeriod.endTime) {
        return {
          type: "Closes",
          time: continuationPeriod.endTime,
          date: currentDate,
        };
      }
    }
    return null;
  }

  if (status === "closed") {
    const currentDayKey = DAY_ORDER[currentDayIndex];
    const todayPeriods =
      serviceHours[currentDayKey]?.periods.sort((a, b) =>
        a.startTime.localeCompare(b.startTime),
      ) || [];
    const nextPeriodToday = todayPeriods.find((p) => p.startTime > currentTime);
    if (nextPeriodToday) {
      return {
        type: "Opens",
        time: nextPeriodToday.startTime,
        date: currentDate,
      };
    }

    for (let i = 1; i < 8; i++) {
      const nextDayDate = new Date(currentDate);
      nextDayDate.setDate(currentDate.getDate() + i);

      const dayIndex = nextDayDate.getDay();
      const dayKey = DAY_ORDER[dayIndex];
      const dayPeriods =
        serviceHours[dayKey]?.periods.sort((a, b) =>
          a.startTime.localeCompare(b.startTime),
        ) || [];

      const prevDayIndex = (dayIndex - 1 + 7) % 7;
      const prevDayKey = DAY_ORDER[prevDayIndex];
      const prevDayEndsOvernight = (
        serviceHours[prevDayKey]?.periods || []
      ).some((p) => p.endTime === "23:59:00");

      for (const period of dayPeriods) {
        if (period.startTime === "00:00:00" && prevDayEndsOvernight) {
          continue;
        }
        return { type: "Opens", time: period.startTime, date: nextDayDate };
      }
    }
    return null;
  }

  return null;
}; 