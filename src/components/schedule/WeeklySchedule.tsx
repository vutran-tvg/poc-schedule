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
          {DAY_ORDER.map((day) => (
            <li key={day} className="flex justify-between items-center">
              <span className="font-medium">{DAY_NAMES[day]}</span>
              <span className="text-muted-foreground text-right">
                {displaySchedule[day]}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}; 