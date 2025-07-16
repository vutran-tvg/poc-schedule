import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ServiceHours } from "@/types/schedule";
import { DAY_ORDER } from "@/constants/schedule";
import { DayEditor } from "./DayEditor";

interface ScheduleEditorProps {
  serviceHours: ServiceHours;
  onTimeChange: (day: string, index: number, type: "startTime" | "endTime", value: string) => void;
  onAddPeriod: (day: string) => void;
  onRemovePeriod: (day: string, index: number) => void;
}

export const ScheduleEditor = ({
  serviceHours,
  onTimeChange,
  onAddPeriod,
  onRemovePeriod,
}: ScheduleEditorProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule Editor</CardTitle>
        <CardDescription>
          Define operating hours for each day. Use 23:59 for overnight shifts.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {DAY_ORDER.map((day) => (
          <DayEditor
            key={day}
            day={day}
            schedule={serviceHours[day]}
            onTimeChange={onTimeChange}
            onAddPeriod={onAddPeriod}
            onRemovePeriod={onRemovePeriod}
          />
        ))}
      </CardContent>
    </Card>
  );
}; 