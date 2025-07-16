"use client";

import { useCurrentTime } from "@/hooks/useCurrentTime";
import { useSchedule } from "@/hooks/useSchedule";
import { ScheduleEditor, CurrentStatus, WeeklySchedule } from "@/components/schedule";

export default function StoreScheduleDemo() {
  const currentTime = useCurrentTime();
  const {
    serviceHours,
    storeStatus,
    displaySchedule,
    nextEvent,
    handleTimeChange,
    addPeriod,
    removePeriod,
  } = useSchedule(currentTime);

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
          <div className="lg:col-span-2">
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
              currentTime={currentTime}
              nextEvent={nextEvent}
            />

            <WeeklySchedule displaySchedule={displaySchedule} />
          </div>
        </div>
      </div>
    </div>
  );
}
