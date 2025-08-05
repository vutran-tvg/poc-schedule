interface TimeSettingsProps {
  useCurrentTime: boolean;
  manualDate: string;
  manualTime: string;
  onToggleCurrentTime: (useCurrentTime: boolean) => void;
  onManualDateChange: (date: string) => void;
  onManualTimeChange: (time: string) => void;
  currentTime: Date;
}

export const TimeSettings = ({
  useCurrentTime,
  manualDate,
  manualTime,
  onToggleCurrentTime,
  onManualDateChange,
  onManualTimeChange,
  currentTime,
}: TimeSettingsProps) => {
  const formatDisplayTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="bg-card text-card-foreground p-6 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">Time Settings</h3>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="radio"
            id="useCurrentTime"
            checked={useCurrentTime}
            onChange={(e) => onToggleCurrentTime(e.target.checked)}
            className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
          />
          <label htmlFor="useCurrentTime" className="text-sm font-medium">
            Use current time (live updates)
          </label>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="useManualTime"
              checked={!useCurrentTime}
              onChange={(e) => onToggleCurrentTime(!e.target.checked)}
              className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
            />
            <label htmlFor="useManualTime" className="text-sm font-medium">
              Manual date & time for testing:
            </label>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={manualDate}
              onChange={(e) => onManualDateChange(e.target.value)}
              disabled={useCurrentTime}
              className={`px-3 py-2 text-sm border rounded-md bg-background border-border 
                ${useCurrentTime 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
                }`}
            />
            <input
              type="time"
              value={manualTime}
              onChange={(e) => onManualTimeChange(e.target.value)}
              disabled={useCurrentTime}
              step="60"
              lang="en-GB"
              className={`px-3 py-2 text-sm border rounded-md bg-background border-border 
                ${useCurrentTime 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
                }`}
            />
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <div className="text-sm text-muted-foreground">
            Current effective time:
          </div>
          <div className="text-lg font-mono font-medium" suppressHydrationWarning>
            {formatDisplayTime(currentTime)}
          </div>
          <div className="text-xs text-muted-foreground">
            {currentTime.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long", 
              day: "numeric"
            })}
          </div>
        </div>
      </div>
    </div>
  );
}; 