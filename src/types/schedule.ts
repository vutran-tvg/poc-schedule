export type TimePeriod = {
  startTime: string;
  endTime: string;
};

export type DaySchedule = {
  periods: TimePeriod[];
};

export type ServiceHours = {
  [key: string]: DaySchedule;
}; 