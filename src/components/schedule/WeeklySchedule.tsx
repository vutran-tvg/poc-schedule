import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { DAY_ORDER, DAY_NAMES } from "@/constants/schedule";
import { ServiceHours } from "@/types/schedule";

interface WeeklyScheduleProps {
  displaySchedule: { [key: string]: string };
  serviceHours: ServiceHours;
}

// Helper function to check if a period has invalid time range
const isInvalidPeriod = (startTime: string, endTime: string): boolean => {
  if (!startTime || !endTime) return false; // Empty times are not invalid, just incomplete
  return endTime < startTime;
};

// Helper function to check if a day has any invalid periods
const hasInvalidPeriods = (periods: { startTime: string; endTime: string }[]): boolean => {
  return periods.some(period => isInvalidPeriod(period.startTime, period.endTime));
};

export const WeeklySchedule = ({ displaySchedule, serviceHours }: WeeklyScheduleProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Schedule</CardTitle>
        <CardDescription>
          Formatted display of operating hours.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm">
          {DAY_ORDER.map((day) => {
            const scheduleText = displaySchedule[day];
            const dayPeriods = serviceHours[day]?.periods || [];
            const hasInvalid = hasInvalidPeriods(dayPeriods);
            
            // If there are invalid periods, show error message
            if (hasInvalid) {
              return (
                <li key={day} className="flex justify-between items-start">
                  <span className="font-medium">{DAY_NAMES[day]}</span>
                  <div className="text-right">
                    <span className="text-red-600 font-medium">Invalid input</span>
                  </div>
                </li>
              );
            }
            
            // Otherwise show normal schedule
            const periods = scheduleText.includes(" | ") 
              ? scheduleText.split(" | ") 
              : [scheduleText];
            
            return (
              <li key={day} className="flex justify-between items-start">
                <span className="font-medium">{DAY_NAMES[day]}</span>
                <div className="text-muted-foreground text-right space-y-1 font-mono">
                  {periods.map((period, index) => (
                    <div key={index}>{period}</div>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}; 