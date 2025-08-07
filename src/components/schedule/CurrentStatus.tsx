import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatTimeForFriendlyDisplay, getRelativeDayName } from "@/utils/time";

interface CurrentStatusProps {
  storeStatus: "open" | "closed";
  currentTime: Date;
  nextEvent: {
    type: "Opens" | "Closes" | "Open";
    time: string;
    date: Date;
  } | null;
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
      <CardContent className="flex flex-col items-center justify-center space-y-2">
        <div
          className={`flex items-center space-x-3 px-4 py-1 rounded-full ${storeStatus === "open" ? "bg-green-200" : "bg-red-200"}`}
        >
          <span
            className={cn(
              "text-2xl font-bold font-mono",
              storeStatus === "open" ? "text-green-600" : "text-red-600",
            )}
          >
            {storeStatus.toUpperCase()}
          </span>
        </div>
        {nextEvent ? (
          <p className="text-md h-5">
            {nextEvent.type === "Open" && nextEvent.time === "24/7"
              ? "Open 24 hours"
              : `${nextEvent.type} ${formatTimeForFriendlyDisplay(nextEvent.time)} ${getRelativeDayName(currentTime, nextEvent.date)}`}
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
