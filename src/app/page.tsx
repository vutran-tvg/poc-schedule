"use client";

import { useState } from "react";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import { useSchedule } from "@/hooks/useSchedule";
import { ScheduleEditor, CurrentStatus, WeeklySchedule, BufferSettings, OrderBanner, TimeSettings } from "@/components/schedule";

// Helper function to create Date object from manual time string
const createManualTimeDate = (timeString: string, referenceDate: Date): Date => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const manualDate = new Date(referenceDate);
  manualDate.setHours(hours, minutes, 0, 0);
  return manualDate;
};

export default function StoreScheduleDemo() {
  // Time control state
  const [isUsingCurrentTime, setIsUsingCurrentTime] = useState(true);
  const [manualTime, setManualTime] = useState("12:00");
  
  // Get real current time
  const realCurrentTime = useCurrentTime();
  
  // Calculate effective time based on user preference
  const effectiveTime = isUsingCurrentTime 
    ? realCurrentTime 
    : createManualTimeDate(manualTime, realCurrentTime);

  const {
    serviceHours,
    storeStatus,
    displaySchedule,
    nextEvent,
    handleTimeChange,
    addPeriod,
    removePeriod,
    bufferSettings,
    setBufferSettings,
    bannerStatus,
    bannerMessage,
  } = useSchedule(effectiveTime);

  return (
    <div className="bg-background text-foreground min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Store Schedule Management
          </h1>
          <p className="text-muted-foreground mt-1">
            View real-time store status and manage weekly operating hours.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <TimeSettings
              useCurrentTime={isUsingCurrentTime}
              manualTime={manualTime}
              onToggleCurrentTime={setIsUsingCurrentTime}
              onManualTimeChange={setManualTime}
              currentTime={effectiveTime}
            />

            <ScheduleEditor
              serviceHours={serviceHours}
              onTimeChange={handleTimeChange}
              onAddPeriod={addPeriod}
              onRemovePeriod={removePeriod}
            />
          </div>

          <div className="space-y-8">
            <CurrentStatus
              storeStatus={storeStatus}
              currentTime={effectiveTime}
              nextEvent={nextEvent}
            />

            <WeeklySchedule 
              displaySchedule={displaySchedule}
              serviceHours={serviceHours}
            />

            <BufferSettings
              bufferSettings={bufferSettings}
              onBufferChange={setBufferSettings}
            />

            <OrderBanner
              status={bannerStatus}
              message={bannerMessage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
