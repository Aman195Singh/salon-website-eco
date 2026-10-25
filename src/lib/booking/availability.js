/**
 * Pure Availability Calculation Engine for V2 Appointment Booking
 * Authorizing PRD: PRD-V2.md §7
 * 
 * Rules:
 * - Timezone: Strictly Asia/Kolkata (IST, UTC+05:30).
 * - Slot increments: 15 minutes (e.g. 10:00, 10:15, 10:30).
 * - Notice window: Minimum 2 hours notice before appointment start time.
 * - Booking horizon: Maximum 30 calendar days ahead.
 * - Prep/Sanitization buffer: Default 10 minutes between appointments.
 */

export const IST_TIMEZONE = "Asia/Kolkata";
export const SLOT_INCREMENT_MINUTES = 15;
export const MIN_NOTICE_HOURS = 2;
export const MAX_HORIZON_DAYS = 30;
export const DEFAULT_BUFFER_MINUTES = 10;

/**
 * Format an IST Date object into YYYY-MM-DD
 */
export function formatToISTDateString(dateObj) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: IST_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(dateObj);

  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  return `${year}-${month}-${day}`;
}

/**
 * Format time to 12-hour display string (e.g. "10:30 AM")
 */
export function formatSlotTimeDisplay(hour, minute) {
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const displayMinute = minute.toString().padStart(2, "0");
  return `${displayHour}:${displayMinute} ${period}`;
}

/**
 * Classify hour into day period (Morning, Afternoon, Evening)
 */
export function getSlotPeriod(hour) {
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

/**
 * Parse time string "HH:MM:SS" or "HH:MM" into total minutes from midnight
 */
export function timeStringToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + (m || 0);
}

/**
 * Generate candidate slots for a given staff on a specific target date
 */
export function generateStaffSlotsForDate({
  targetDateStr, // YYYY-MM-DD
  durationMinutes = 30,
  bufferMinutes = DEFAULT_BUFFER_MINUTES,
  workingHours = null, // { start_time: "10:00", end_time: "20:00" }
  breaks = [], // [{ start_time: "13:00", end_time: "14:00" }]
  timeOff = [], // [{ starts_at, ends_at }]
  existingAppointments = [], // [{ starts_at, ends_at, status }]
  now = new Date(),
}) {
  // If no working hours or salon closed on this day, return empty
  if (!workingHours || !workingHours.start_time || !workingHours.end_time) {
    return [];
  }

  const workStartMin = timeStringToMinutes(workingHours.start_time);
  const workEndMin = timeStringToMinutes(workingHours.end_time);

  // Minimum cutoff timestamp (current time + 2 hours notice)
  const noticeCutoffMs = now.getTime() + MIN_NOTICE_HOURS * 60 * 60 * 1000;

  // Maximum horizon cutoff timestamp (current time + 30 days)
  const horizonCutoffMs = now.getTime() + MAX_HORIZON_DAYS * 24 * 60 * 60 * 1000;

  const validSlots = [];

  // Iterate in 15-minute increments
  for (
    let slotStartMin = workStartMin;
    slotStartMin + durationMinutes <= workEndMin;
    slotStartMin += SLOT_INCREMENT_MINUTES
  ) {
    const slotEndMin = slotStartMin + durationMinutes;

    const startHour = Math.floor(slotStartMin / 60);
    const startMinute = slotStartMin % 60;

    // Construct IST ISO timestamp string
    const startHourStr = startHour.toString().padStart(2, "0");
    const startMinStr = startMinute.toString().padStart(2, "0");
    const slotIsoString = `${targetDateStr}T${startHourStr}:${startMinStr}:00+05:30`;
    const slotStartTimeMs = new Date(slotIsoString).getTime();

    const endHour = Math.floor(slotEndMin / 60);
    const endMinute = slotEndMin % 60;
    const endHourStr = endHour.toString().padStart(2, "0");
    const endMinStr = endMinute.toString().padStart(2, "0");
    const slotEndIsoString = `${targetDateStr}T${endHourStr}:${endMinStr}:00+05:30`;
    const slotEndTimeMs = new Date(slotEndIsoString).getTime();

    // 1. Notice window check (must be at least 2 hours from now)
    if (slotStartTimeMs < noticeCutoffMs) {
      continue;
    }

    // 2. Horizon cutoff (must be within 30 days)
    if (slotStartTimeMs > horizonCutoffMs) {
      continue;
    }

    // 3. Breaks check (cannot overlap staff daily breaks)
    const overlapsBreak = breaks.some((b) => {
      const breakStart = timeStringToMinutes(b.start_time);
      const breakEnd = timeStringToMinutes(b.end_time);
      // Overlap condition: slotStart < breakEnd && slotEnd > breakStart
      return slotStartMin < breakEnd && slotEndMin > breakStart;
    });
    if (overlapsBreak) {
      continue;
    }

    // 4. Staff time-off (leave) check
    const overlapsTimeOff = timeOff.some((leave) => {
      const leaveStartMs = new Date(leave.starts_at).getTime();
      const leaveEndMs = new Date(leave.ends_at).getTime();
      return slotStartTimeMs < leaveEndMs && slotEndTimeMs > leaveStartMs;
    });
    if (overlapsTimeOff) {
      continue;
    }

    // 5. Existing appointments check (including 10-minute prep buffer)
    const overlapsAppointment = existingAppointments.some((appt) => {
      if (appt.status === "cancelled" || appt.status === "no_show") {
        return false;
      }
      const apptStartMs = new Date(appt.starts_at).getTime();
      const apptEndMs = new Date(appt.ends_at).getTime();

      // Buffer applied between appointments
      const bufferedStart = apptStartMs - bufferMinutes * 60 * 1000;
      const bufferedEnd = apptEndMs + bufferMinutes * 60 * 1000;

      return slotStartTimeMs < bufferedEnd && slotEndTimeMs > bufferedStart;
    });
    if (overlapsAppointment) {
      continue;
    }

    validSlots.push({
      isoString: slotIsoString,
      displayTime: formatSlotTimeDisplay(startHour, startMinute),
      period: getSlotPeriod(startHour),
      startHour,
      startMinute,
    });
  }

  return validSlots;
}

/**
 * Fallback working schedule when database tables have not been populated yet.
 * Mon - Sun: 10:00 AM - 08:00 PM IST (with Lunch Break 1:00 PM - 2:00 PM).
 */
export function getDefaultSalonSchedule() {
  return {
    workingHours: {
      start_time: "10:00:00",
      end_time: "20:00:00",
    },
    breaks: [
      {
        start_time: "13:00:00",
        end_time: "14:00:00",
        label: "Lunch Break",
      },
    ],
  };
}
