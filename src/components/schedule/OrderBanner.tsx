import { Clock, AlertTriangle } from "lucide-react";

interface OrderBannerProps {
  status: "none" | "warning" | "stopped";
  message: string;
}

export const OrderBanner = ({ status, message }: OrderBannerProps) => {
  if (status === "none") {
    return (
      <div className="text-center py-4 text-muted-foreground text-sm">
        No order reminder banner
      </div>
    );
  }

  return (
    <div className="border border-yellow-400 bg-yellow-50 text-yellow-800 rounded-lg p-4">
      <div className="flex items-center gap-2">
        {status === "warning" ? (
          <Clock className="h-4 w-4" />
        ) : (
          <AlertTriangle className="h-4 w-4" />
        )}
        <span className="font-medium">
          {message}
        </span>
      </div>
    </div>
  );
}; 