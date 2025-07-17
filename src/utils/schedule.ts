import { ServiceHours } from "@/types/schedule";
import { DAY_ORDER } from "@/constants/schedule";
import { formatTimeForFriendlyDisplay } from "./time";

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

export const formatScheduleForDisplay = (
  serviceHours: ServiceHours,
): { [key: string]: string } => {
  const displayData: { [key: string]: string } = {};

  DAY_ORDER.forEach((dayKey) => {
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

    dayPeriods.forEach((period) => {
      dayStrings.push(
        `${formatTimeForFriendlyDisplay(period.startTime)} - ${formatTimeForFriendlyDisplay(period.endTime)}`,
      );
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
    // Get current operating period using the same logic as banner system
    const { period, dayIndex } = getCurrentOperatingPeriod(
      serviceHours,
      currentDate,
    );
    if (!period) {
      return null;
    }

    // Find the real end time (following continuous chains)
    const { realEndTime, endDayIndex } = findRealEndTime(
      serviceHours,
      dayIndex,
      period,
    );

    // Calculate the appropriate date for the closing time
    const closingDate = new Date(currentDate);
    if (endDayIndex !== currentDayIndex) {
      // Closing time is on a different day
      const dayDifference = endDayIndex - currentDayIndex;
      // Handle week wrap-around (e.g., Sunday=0, Monday=1, ..., Saturday=6)
      const adjustedDifference =
        dayDifference > 0 ? dayDifference : dayDifference + 7;
      closingDate.setDate(currentDate.getDate() + adjustedDifference);
    }

    return {
      type: "Closes",
      time: realEndTime,
      date: closingDate,
    };
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

// Helper function to find the current operating period
const getCurrentOperatingPeriod = (
  serviceHours: ServiceHours,
  date: Date,
): {
  period: { startTime: string; endTime: string } | null;
  dayIndex: number;
} => {
  const currentDayIndex = date.getDay();
  const currentDayKey = DAY_ORDER[currentDayIndex];
  const prevDayIndex = (currentDayIndex - 1 + 7) % 7;
  const prevDayKey = DAY_ORDER[prevDayIndex];
  const currentTime = date.toTimeString().split(" ")[0];

  // Check current day periods
  const currentDayPeriods = serviceHours[currentDayKey]?.periods || [];
  for (const period of currentDayPeriods) {
    if (currentTime >= period.startTime && currentTime <= period.endTime) {
      return { period, dayIndex: currentDayIndex };
    }
  }

  // Check if we're in an overnight period from previous day
  const prevDayPeriods = serviceHours[prevDayKey]?.periods || [];
  const isOvernightFromPrev = prevDayPeriods.some(
    (p) => p.endTime === "23:59:00",
  );

  if (isOvernightFromPrev) {
    const continuationPeriod = currentDayPeriods.find(
      (p) => p.startTime === "00:00:00",
    );
    if (continuationPeriod && currentTime <= continuationPeriod.endTime) {
      return { period: continuationPeriod, dayIndex: currentDayIndex };
    }
  }

  return { period: null, dayIndex: currentDayIndex };
};

// Helper function to find the real end time of a continuous service period
const findRealEndTime = (
  serviceHours: ServiceHours,
  startDayIndex: number,
  startPeriod: { startTime: string; endTime: string },
): { realEndTime: string; endDayIndex: number } => {
  let endTime = startPeriod.endTime;
  let dayIndex = startDayIndex;

  // Keep following the chain while periods are continuous
  while (endTime === "23:59:00") {
    const nextDayIndex = (dayIndex + 1) % 7;
    const nextDayKey = DAY_ORDER[nextDayIndex];
    const nextDayPeriods = serviceHours[nextDayKey]?.periods || [];

    // Check if next day starts at 00:00 (continuous)
    const continuesPeriod = nextDayPeriods.find(
      (p) => p.startTime === "00:00:00",
    );

    if (!continuesPeriod) {
      // Next day doesn't start at 00:00 → current 23:59 is real end
      break;
    }

    // Continue to next period
    endTime = continuesPeriod.endTime;
    dayIndex = nextDayIndex;
  }

  return { realEndTime: endTime, endDayIndex: dayIndex };
};

// Helper function to calculate minutes difference between two times
// Returns positive if target is in the future, negative if in the past
const getMinutesDifference = (
  currentTime: string,
  targetTime: string,
  targetIsNextDay: boolean = false,
): number => {
  const [currentHour, currentMin] = currentTime.split(":").map(Number);
  const [targetHour, targetMin] = targetTime.split(":").map(Number);

  const currentMinutes = currentHour * 60 + currentMin;
  let targetMinutes = targetHour * 60 + targetMin;

  // If target is next day, add 24 hours worth of minutes
  if (targetIsNextDay) {
    targetMinutes += 24 * 60;
  }

  return targetMinutes - currentMinutes;
};

// Helper function to subtract minutes from a time string
const subtractMinutes = (timeStr: string, minutes: number): string => {
  const [hour, min] = timeStr.split(":").map(Number);
  const totalMinutes = hour * 60 + min - minutes;

  if (totalMinutes < 0) {
    // Handle negative time (previous day)
    const adjustedMinutes = 24 * 60 + totalMinutes;
    const newHour = Math.floor(adjustedMinutes / 60);
    const newMin = adjustedMinutes % 60;
    return `${String(newHour).padStart(2, "0")}:${String(newMin).padStart(2, "0")}`;
  }

  const newHour = Math.floor(totalMinutes / 60);
  const newMin = totalMinutes % 60;
  return `${String(newHour).padStart(2, "0")}:${String(newMin).padStart(2, "0")}`;
};

// Helper function to check if any periods have invalid time ranges
const hasInvalidPeriods = (serviceHours: ServiceHours): boolean => {
  return DAY_ORDER.some((day) => {
    const periods = serviceHours[day]?.periods || [];
    return periods.some((period) => {
      if (!period.startTime || !period.endTime) return false;
      return period.endTime < period.startTime;
    });
  });
};

export const getBannerStatus = (
  serviceHours: ServiceHours,
  date: Date,
  kitchenBufferMinutes: number,
  lastOrderBufferMinutes: number,
): { status: "none" | "warning" | "stopped"; kitchenCloseTime?: string; displayKitchenCloseTime?: string } => {
  // Don't show banner if there are invalid periods
  if (hasInvalidPeriods(serviceHours)) {
    return { status: "none" };
  }

  // Check if store is currently open
  const storeStatus = getStoreStatus(serviceHours, date);
  if (storeStatus === "closed") {
    return { status: "none" };
  }

  // Get current operating period
  const { period, dayIndex } = getCurrentOperatingPeriod(serviceHours, date);
  if (!period) {
    return { status: "none" };
  }

  // Find the real end time
  const { realEndTime, endDayIndex } = findRealEndTime(
    serviceHours,
    dayIndex,
    period,
  );

  // Calculate kitchen close time
  const kitchenCloseTime = subtractMinutes(realEndTime, kitchenBufferMinutes);

  // Special case: when store closes at midnight, round kitchen time to 23:30 for display
  let displayKitchenCloseTime = kitchenCloseTime;
  if (realEndTime === "23:59:00" && kitchenCloseTime === "23:29") {
    displayKitchenCloseTime = "23:30";
  }

  // Calculate warning start time
  const warningStartTime = subtractMinutes(
    kitchenCloseTime,
    lastOrderBufferMinutes,
  );

  const currentTime = date.toTimeString().split(" ")[0];
  const currentDayIndex = date.getDay();

  // Determine if kitchen times are on a different day
  const kitchenIsNextDay = endDayIndex !== currentDayIndex;

  // Check if we're in warning period
  const minutesToWarning = getMinutesDifference(
    currentTime,
    warningStartTime,
    kitchenIsNextDay,
  );
  const minutesToKitchenClose = getMinutesDifference(
    currentTime,
    kitchenCloseTime,
    kitchenIsNextDay,
  );

  if (minutesToWarning <= 0 && minutesToKitchenClose > 0) {
    return { status: "warning", kitchenCloseTime, displayKitchenCloseTime };
  }

  if (minutesToKitchenClose <= 0) {
    return { status: "stopped", kitchenCloseTime, displayKitchenCloseTime };
  }

  return { status: "none" };
};

export const formatBannerMessage = (
  status: "warning" | "stopped",
  kitchenCloseTime: string,
  displayKitchenCloseTime?: string,
): string => {
  if (status === "warning") {
    const timeToDisplay = displayKitchenCloseTime || kitchenCloseTime;
    return `Heads up, last order by ${formatTimeForFriendlyDisplay(timeToDisplay + ":00")}`;
  }

  if (status === "stopped") {
    return "This store has stopped accepting orders.";
  }

  return "";
};
