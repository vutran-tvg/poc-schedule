import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { TimePeriod } from "@/types/schedule";
import { formatTimeForDisplay } from "@/utils/time";

interface TimePeriodInputProps {
  period: TimePeriod;
  index: number;
  day: string;
  onTimeChange: (day: string, index: number, type: "startTime" | "endTime", value: string) => void;
  onRemove: (day: string, index: number) => void;
}

export const TimePeriodInput = ({
  period,
  index,
  day,
  onTimeChange,
  onRemove,
}: TimePeriodInputProps) => {
  return (
    <div className="flex items-center gap-2">
      <Input
        type="time"
        value={formatTimeForDisplay(period.startTime)}
        onChange={(e) => onTimeChange(day, index, "startTime", e.target.value)}
        className="w-full"
        step="60"
        lang="en-GB"
      />
      <span className="text-muted-foreground">-</span>
      <Input
        type="time"
        value={formatTimeForDisplay(period.endTime)}
        onChange={(e) => onTimeChange(day, index, "endTime", e.target.value)}
        className="w-full"
        step="60"
        lang="en-GB"
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(day, index)}
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}; 