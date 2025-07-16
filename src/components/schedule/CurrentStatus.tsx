import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatTimeForFriendlyDisplay, getRelativeDayName } from "@/utils/time";

interface CurrentStatusProps {
  storeStatus: "open" | "closed";
  currentTime: Date;
  nextEvent: { type: "Opens" | "Closes"; time: string; date: Date } | null;
}

export const CurrentStatus = ({
  storeStatus,
  currentTime,
  nextEvent,
}: CurrentStatusProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Status</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-2 pt-6">
        <div className="flex items-center space-x-3">
          <span
            className={cn(
              "h-4 w-4 rounded-full",
              storeStatus === "open" ? "bg-green-500" : "bg-red-500",
              storeStatus === "open" && "animate-pulse",
            )}
          />
          <span
            className={cn(
              "text-2xl font-bold",
              storeStatus === "open"
                ? "text-green-600"
                : "text-red-600",
            )}
          >
            {storeStatus.toUpperCase()}
          </span>
        </div>
        {nextEvent ? (
          <p className="text-sm text-muted-foreground h-5">
            {nextEvent.type} at {formatTimeForFriendlyDisplay(nextEvent.time)}{" "}
            {getRelativeDayName(currentTime, nextEvent.date)}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground h-5">
            {storeStatus === "closed" ? "Remains closed" : ""}
          </p>
        )}
        <p
          className="text-lg font-mono text-muted-foreground pt-2"
          suppressHydrationWarning
        >
          {currentTime.toLocaleTimeString()}
        </p>
      </CardContent>
    </Card>
  );
}; 