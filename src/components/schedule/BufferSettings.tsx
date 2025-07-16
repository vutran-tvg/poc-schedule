import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BufferSettings as BufferSettingsType } from "@/types/schedule";

interface BufferSettingsProps {
  bufferSettings: BufferSettingsType;
  onBufferChange: (settings: BufferSettingsType) => void;
}

export const BufferSettings = ({
  bufferSettings,
  onBufferChange,
}: BufferSettingsProps) => {
  const handleKitchenBufferChange = (value: string) => {
    const minutes = parseInt(value) || 0;
    onBufferChange({
      ...bufferSettings,
      kitchenBufferMinutes: minutes,
    });
  };

  const handleLastOrderBufferChange = (value: string) => {
    const minutes = parseInt(value) || 0;
    onBufferChange({
      ...bufferSettings,
      lastOrderBufferMinutes: minutes,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Reminders</CardTitle>
        <CardDescription>
          Kitchen closing time and order reminders.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="kitchen-buffer" className="text-sm font-medium">
              Kitchen Buffer
            </label>
            <Input
              id="kitchen-buffer"
              type="number"
              value={bufferSettings.kitchenBufferMinutes}
              onChange={(e) => handleKitchenBufferChange(e.target.value)}
              placeholder="30"
              min="0"
              max="120"
            />
            <p className="text-xs text-muted-foreground">
              Kitchen closes this many minutes before store close
            </p>
          </div>
          <div className="space-y-2">
            <label htmlFor="order-buffer" className="text-sm font-medium">
              Last Order Reminder
            </label>
            <Input
              id="order-buffer"
              type="number"
              value={bufferSettings.lastOrderBufferMinutes}
              onChange={(e) => handleLastOrderBufferChange(e.target.value)}
              placeholder="20"
              min="0"
              max="60"
            />
            <p className="text-xs text-muted-foreground">
              Show reminder this many minutes before kitchen close
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 