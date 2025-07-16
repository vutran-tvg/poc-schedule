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

export type BufferSettings = {
  kitchenBufferMinutes: number;
  lastOrderBufferMinutes: number;
};

export type BannerStatus = "none" | "warning" | "stopped"; 