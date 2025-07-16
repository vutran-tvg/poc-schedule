import { useState, useMemo } from "react";
import { ServiceHours, TimePeriod } from "@/types/schedule";
import { INITIAL_SERVICE_HOURS } from "@/constants/schedule";
import { getStoreStatus, formatScheduleForDisplay, getNextEvent } from "@/utils/schedule";

export const useSchedule = (currentTime: Date) => {
  const [serviceHours, setServiceHours] = useState<ServiceHours>(INITIAL_SERVICE_HOURS);

  const storeStatus = useMemo(
    () => getStoreStatus(serviceHours, currentTime),
    [serviceHours, currentTime],
  );

  const displaySchedule = useMemo(
    () => formatScheduleForDisplay(serviceHours),
    [serviceHours],
  );

  const nextEvent = useMemo(
    () => getNextEvent(serviceHours, currentTime),
    [serviceHours, currentTime],
  );

  const handleTimeChange = (
    day: string,
    index: number,
    type: "startTime" | "endTime",
    value: string,
  ) => {
    const newServiceHours = { ...serviceHours };
    const periods = [...newServiceHours[day].periods];
    periods[index] = { ...periods[index], [type]: value ? `${value}:00` : "" };
    newServiceHours[day] = { periods };
    setServiceHours(newServiceHours);
  };

  const addPeriod = (day: string) => {
    const newServiceHours = { ...serviceHours };
    newServiceHours[day].periods.push({ startTime: "", endTime: "" });
    setServiceHours(newServiceHours);
  };

  const removePeriod = (day: string, index: number) => {
    const newServiceHours = { ...serviceHours };
    newServiceHours[day].periods.splice(index, 1);
    setServiceHours(newServiceHours);
  };

  return {
    serviceHours,
    storeStatus,
    displaySchedule,
    nextEvent,
    handleTimeChange,
    addPeriod,
    removePeriod,
  };
}; 