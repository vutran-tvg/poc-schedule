import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { DaySchedule } from "@/types/schedule";
import { DAY_NAMES } from "@/constants/schedule";
import { TimePeriodInput } from "./TimePeriodInput";

interface DayEditorProps {
  day: string;
  schedule: DaySchedule;
  onTimeChange: (day: string, index: number, type: "startTime" | "endTime", value: string) => void;
  onAddPeriod: (day: string) => void;
  onRemovePeriod: (day: string, index: number) => void;
}

export const DayEditor = ({
  day,
  schedule,
  onTimeChange,
  onAddPeriod,
  onRemovePeriod,
}: DayEditorProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{DAY_NAMES[day]}</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddPeriod(day)}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Period
        </Button>
      </div>
      <div className="space-y-2 pl-4 border-l-2">
        {schedule.periods.length > 0 ? (
          schedule.periods.map((period, index) => (
            <TimePeriodInput
              key={index}
              period={period}
              index={index}
              day={day}
              onTimeChange={onTimeChange}
              onRemove={onRemovePeriod}
            />
          ))
        ) : (
          <p className="text-sm text-muted-foreground py-2">
            Closed
          </p>
        )}
      </div>
    </div>
  );
}; 