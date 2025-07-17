# Store Schedule Management System - Business Logic Documentation

A comprehensive business hours management system that handles complex scheduling scenarios with intelligent status detection and order timing notifications.

## Business Problem

Real-world businesses need schedule management that handles:
- **Overnight operations** spanning multiple calendar days
- **Kitchen closing times** different from store closing times  
- **Complex multi-period schedules** with gaps
- **Continuous multi-day operations** (24/7 with maintenance windows)
- **Customer communication** around order cutoff times

This system implements precise business logic to interpret schedules correctly and provide accurate customer information.

## Core Business Logic Implementation

### 1. Store Status Detection

**Business Logic Flow:**

The system determines store status using a two-step process:

**Step 1: Current Day Period Check**
```
For current day periods:
  If currentTime >= startTime AND currentTime <= endTime:
    Return OPEN
```

**Step 2: Overnight Continuation Check**
```
If previous day ended at "23:59:00":
  Find current day period starting at "00:00:00"
  If currentTime <= continuationEndTime:
    Return OPEN
Return CLOSED
```

**Business Cases:**

**Case 1: Regular Hours (Mon 09:00-17:00)**
- Current time 10:30 Mon → Step 1 matches → OPEN
- Current time 18:00 Mon → No match → CLOSED

**Case 2: Overnight Hours (Mon 22:00-23:59, Tue 00:00-02:00)**
- Current time 23:30 Mon → Step 1 matches Mon period → OPEN
- Current time 01:00 Tue → Step 1 fails, Step 2 detects overnight continuation → OPEN
- Current time 03:00 Tue → No active periods → CLOSED

**Case 3: Multi-Day Continuous (Tue 20:00-23:59, Wed 00:00-23:59, Thu 00:00-06:00)**
- Current time 23:30 Tue → Step 1 matches → OPEN
- Current time 12:00 Wed → Step 1 matches Wed period → OPEN
- Current time 03:00 Thu → Step 1 matches Thu period → OPEN

### 2. Schedule Display Logic

**Business Logic: Continuous Span Detection**

The system analyzes schedule structure to determine display format:

**Algorithm:**
```
For each day ending at "23:59:00":
  Count consecutive days starting at "00:00:00"
  If span = 2 days: Use "(Next day)" format
  If span = 3+ days: Show exact times per day
```

**Implementation Cases:**

**Case 1: Simple Overnight (2-day span)**
- Data: `Mon: 20:00-23:59`, `Tue: 00:00-02:00`
- Span detection: 2 days
- Display: 
  - Mon: "20:00 - 02:00 (Next day)"
  - Tue: "00:00 - 02:00"

**Case 2: Multi-Day Continuous (3+ day span)**
- Data: `Tue: 20:00-23:59`, `Wed: 00:00-23:59`, `Thu: 00:00-06:00`
- Span detection: 3 days
- Display:
  - Tue: "20:00 - Midnight"
  - Wed: "Open 24 hours"
  - Thu: "00:00 - 06:00"

**Case 3: Multiple Periods**
- Data: `Mon: 09:00-12:00, 13:00-17:00`
- Display: "09:00 - 12:00" (new line) "13:00 - 17:00"

**Case 4: 24-Hour Operation**
- Data: `Mon: 00:00-23:59`
- Display: "Open 24 hours"

### 3. Next Event Calculation

**Business Logic: Priority-Based Search**

**When Store is OPEN:**
```
Find current active period
Return closing time of that period
```

**When Store is CLOSED:**
```
1. Check remaining periods today (after current time)
2. Check next 7 days for first opening
3. Skip overnight continuation periods (already counted)
```

**Implementation Examples:**

**Example 1: Regular Hours (Mon 09:00-17:00)**
- 08:59 Mon → Next: "Opens at 09:00 today"
- 10:00 Mon → Next: "Closes at 17:00 today" 
- 17:00 Mon → Next: "Opens at 09:00 tomorrow"

**Example 2: Overnight Continuous (Mon 22:00-23:59, Tue 00:00-02:00)**
- 21:59 Mon → Next: "Opens at 22:00 today"
- 23:30 Mon → Next: "Closes at 02:00 tomorrow"
- 01:00 Tue → Next: "Closes at 02:00 today"
- 03:00 Tue → Next: "Opens at 22:00 today"

**Example 3: Multiple Periods (Mon 09:00-12:00, 13:00-17:00)**
- 08:59 Mon → Next: "Opens at 09:00 today"
- 10:00 Mon → Next: "Closes at 12:00 today"
- 12:30 Mon → Next: "Opens at 13:00 today"
- 15:00 Mon → Next: "Closes at 17:00 today"

### 4. Order Banner Logic

**Business Logic: Real End Time Detection**

The banner system traces through continuous periods to find actual service end:

**Algorithm:**
```
1. Find current operating period
2. Trace continuous chain to find real end time
3. Calculate kitchen close = real end - buffer minutes
4. Calculate warning start = kitchen close - warning minutes
5. Determine banner state based on current time
```

**Real End Time Detection:**
```
While current period ends at "23:59:00":
  Check if next day starts at "00:00:00"
  If yes: Continue to next period
  If no: Current "23:59:00" is real end
```

**Banner State Logic:**
```
If currentTime < warningStart: No banner
If warningStart <= currentTime < kitchenClose: Warning banner
If kitchenClose <= currentTime < realEnd: Stopped banner
If currentTime >= realEnd: No banner (store closed)
```

**Implementation Cases:**

**Case 1: Simple Overnight (Mon 20:00-23:59, Tue 00:00-02:00)**
- Real end time: 02:00 Tuesday
- Kitchen closes: 01:30 Tuesday (30min buffer)
- Warning starts: 01:10 Tuesday (20min before kitchen)
- Business logic:
  - 23:30 Monday → No banner (continuous service)
  - 01:10 Tuesday → Warning: "Heads up, last order by 01:30"
  - 01:30 Tuesday → Stopped: "This store has stopped accepting orders"

**Case 2: Multi-Day Continuous (Tue 20:00-23:59, Wed 00:00-23:59, Thu 00:00-06:00)**
- Real end time: 06:00 Thursday
- Kitchen closes: 05:30 Thursday
- Warning starts: 05:10 Thursday
- Business logic:
  - 23:30 Tuesday → No banner (continuous service)
  - 12:00 Wednesday → No banner (continuous service)
  - 05:10 Thursday → Warning banner
  - 05:30 Thursday → Stopped banner

**Case 3: Separate Periods (Mon 20:00-22:00, Tue 08:00-17:00)**
- Each period independent (gap between 22:00 and 08:00)
- Monday period: Kitchen closes 21:30, warning at 21:10
- Tuesday period: Kitchen closes 16:30, warning at 16:10
- Business logic:
  - 21:10 Monday → Warning for Monday period
  - 03:00 Tuesday → No banner (store closed)
  - 16:10 Tuesday → Warning for Tuesday period

**Case 4: Multiple Daily Periods (Mon 09:00-12:00, 13:00-17:00)**
- Each period gets independent banner logic
- Morning period: Kitchen closes 11:30, warning at 11:10
- Afternoon period: Kitchen closes 16:30, warning at 16:10
- Business logic:
  - 11:10 Monday → Warning for morning period
  - 12:30 Monday → No banner (store closed between periods)
  - 16:10 Monday → Warning for afternoon period

### 5. Input Validation Logic

**Business Logic: Invalid Range Detection**

**Validation Rules:**
```
For each time period:
  If endTime < startTime: Mark as invalid
  If any period invalid: Show "Invalid input" and disable banners
```

**Examples:**
- `09:00-08:00` → Invalid (end before start)
- `22:00-02:00` → Valid (overnight, handled by two separate entries)
- Empty fields → Valid (incomplete, not invalid)

## Edge Cases & Business Rules

### Continuous Service Detection Rules

**Rule 1: Overnight Detection**
- Previous day ends `23:59:00` + Current day starts `00:00:00` = Continuous
- Previous day ends `22:00:00` + Current day starts `00:00:00` = Separate periods

**Rule 2: Multi-Day Span Classification**
- 2-day continuous → "(Next day)" display format
- 3+ day continuous → Exact times per day
- Gaps in sequence → Separate periods

**Rule 3: Banner Calculation Rules**
- Only during active operating periods
- Based on real end time, not display formatting
- Disabled when invalid schedule data present
- No banners during continuous service gaps

### Status Update Behavior

**Real-Time Requirements:**
- Status checks every second via `useCurrentTime` hook
- All displays update automatically without page refresh
- Banner state transitions happen precisely at calculated times

**Error Handling:**
- Invalid schedules show "Invalid input" in red
- System never crashes on bad data
- Graceful degradation for incomplete schedules

## System Architecture

### Data Flow
1. **Schedule Input** → Validation → Storage
2. **Current Time** → Status Calculation → Display
3. **Schedule + Time** → Banner Logic → Customer Notifications

### Key Functions
- `getStoreStatus()`: Two-step status detection
- `formatScheduleForDisplay()`: Span-aware formatting
- `getNextEvent()`: Priority-based event search
- `getBannerStatus()`: Real end time tracing
- `findRealEndTime()`: Continuous period chain following

### State Management
- `useSchedule` hook manages all computed values
- `useCurrentTime` provides real-time updates
- Memoized calculations for performance

## Success Criteria

The system successfully handles these complex business scenarios:

- ✅ **Simple overnight shifts** (restaurant closing at 2 AM)
- ✅ **Multi-day continuous operations** (24/7 with kitchen maintenance)
- ✅ **Multiple daily periods** (lunch break closures)
- ✅ **Real-time status updates** with precise timing
- ✅ **Order cutoff notifications** with configurable buffers
- ✅ **Input validation** preventing system errors
- ✅ **Mobile-responsive interface** for all screen sizes

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Target Use Cases

This system handles scheduling complexity for:

- **Restaurants:** Kitchen vs dining hours, delivery cutoffs
- **Retail:** Seasonal hours, holiday schedules  
- **Healthcare:** Multiple shift patterns, emergency hours
- **Service Businesses:** Appointment availability windows
- **Entertainment:** Event-based schedules, maintenance windows

The business logic addresses real-world scheduling scenarios that simple time-range systems cannot handle accurately.
