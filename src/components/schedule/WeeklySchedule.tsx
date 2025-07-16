import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { DAY_ORDER, DAY_NAMES } from "@/constants/schedule";

interface WeeklyScheduleProps {
  displaySchedule: { [key: string]: string };
}

export const WeeklySchedule = ({ displaySchedule }: WeeklyScheduleProps) => {
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