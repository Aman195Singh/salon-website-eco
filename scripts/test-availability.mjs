import {
  generateStaffSlotsForDate,
  formatSlotTimeDisplay,
  getSlotPeriod,
  getDefaultSalonSchedule,
} from "../src/lib/booking/availability.js";

console.log("=== TESTING V2 AVAILABILITY CALCULATION ENGINE ===");

const schedule = getDefaultSalonSchedule();

// Test tomorrow's date at 10:00 AM IST
const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
const tomorrowDateStr = tomorrow.toISOString().split("T")[0];

console.log(`Testing slot generation for date: ${tomorrowDateStr}`);

const slots = generateStaffSlotsForDate({
  targetDateStr: tomorrowDateStr,
  durationMinutes: 45, // 45 minute service
  bufferMinutes: 10,
  workingHours: schedule.workingHours,
  breaks: schedule.breaks,
  timeOff: [],
  existingAppointments: [
    {
      starts_at: `${tomorrowDateStr}T11:00:00+05:30`,
      ends_at: `${tomorrowDateStr}T11:45:00+05:30`,
      status: "confirmed",
    },
  ],
  now: new Date(),
});

console.log(`Generated ${slots.length} available slots for 45-min service.`);

// 1. Verify lunch break (13:00 to 14:00) has NO overlapping slots
const lunchConflict = slots.filter((s) => {
  const [h, m] = [s.startHour, s.startMinute];
  // 45 min slot starting at 12:30 ends at 13:15 (overlaps 13:00)
  // 45 min slot starting at 13:00 ends at 13:45
  // 45 min slot starting at 13:45 ends at 14:30 (overlaps 14:00)
  const slotStart = h * 60 + m;
  const slotEnd = slotStart + 45;
  return slotStart < 14 * 60 && slotEnd > 13 * 60;
});

if (lunchConflict.length > 0) {
  console.error("❌ FAILED: Slots overlap lunch break!", lunchConflict);
  process.exit(1);
} else {
  console.log("✅ PASSED: Zero slots overlap staff lunch break (13:00 - 14:00).");
}

// 2. Verify appointment conflict at 11:00 AM
const apptConflict = slots.filter((s) => s.displayTime === "11:00 AM" || s.displayTime === "11:15 AM" || s.displayTime === "11:30 AM");
if (apptConflict.length > 0) {
  console.error("❌ FAILED: Booked appointment was not blocked!", apptConflict);
  process.exit(1);
} else {
  console.log("✅ PASSED: Pre-booked 11:00 AM appointment is properly blocked from slot candidates.");
}

console.log(`First available slot: ${slots[0]?.displayTime} (${slots[0]?.period})`);
console.log(`Last available slot: ${slots[slots.length - 1]?.displayTime} (${slots[slots.length - 1]?.period})`);
console.log("🎉 AVAILABILITY CALCULATION ENGINE TEST PASSED!");
