import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import {
  generateStaffSlotsForDate,
  getDefaultSalonSchedule,
  formatToISTDateString,
} from "@/lib/booking/availability";

/**
 * GET /api/booking/availability
 * Query parameters:
 * - serviceId: UUID of service
 * - date: YYYY-MM-DD string
 * - staffId: (optional) UUID of specific staff specialist
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get("serviceId");
    const dateStr = searchParams.get("date");
    const staffId = searchParams.get("staffId");

    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return NextResponse.json(
        { error: "Invalid date format. Expected YYYY-MM-DD." },
        { status: 400 }
      );
    }

    // Default duration
    let durationMinutes = 30;

    // 1. Fetch service details if serviceId is provided
    if (serviceId) {
      const { data: service } = await supabaseServer
        .from("services")
        .select("id, name, duration, duration_minutes, is_active")
        .eq("id", serviceId)
        .maybeSingle();

      if (service) {
        if (service.duration_minutes) {
          durationMinutes = service.duration_minutes;
        } else if (service.duration) {
          const match = service.duration.match(/\d+/);
          if (match) durationMinutes = parseInt(match[0], 10);
        }
      }
    }

    // 2. Fetch staff schedule or use default fallback schedule
    let schedule = getDefaultSalonSchedule();
    let existingAppointments = [];
    let staffBreaks = schedule.breaks;
    let staffTimeOff = [];

    // Attempt to query live Supabase tables (handles case where tables are created or pending)
    try {
      // Query working hours if staffId specified
      if (staffId && staffId !== "any") {
        const targetDateObj = new Date(`${dateStr}T12:00:00+05:30`);
        const dayOfWeek = targetDateObj.getDay();

        const { data: wh } = await supabaseServer
          .from("staff_working_hours")
          .select("start_time, end_time, is_active")
          .eq("staff_id", staffId)
          .eq("day_of_week", dayOfWeek)
          .eq("is_active", true)
          .maybeSingle();

        if (wh) {
          schedule.workingHours = wh;
        }

        // Fetch breaks
        const { data: breaksData } = await supabaseServer
          .from("staff_breaks")
          .select("start_time, end_time, label")
          .eq("staff_id", staffId)
          .eq("day_of_week", dayOfWeek);

        if (breaksData && breaksData.length > 0) {
          staffBreaks = breaksData;
        }

        // Fetch time off
        const { data: toData } = await supabaseServer
          .from("staff_time_off")
          .select("starts_at, ends_at")
          .eq("staff_id", staffId);

        if (toData) {
          staffTimeOff = toData;
        }
      }

      // Fetch appointments for this date
      const dayStartIso = `${dateStr}T00:00:00+05:30`;
      const dayEndIso = `${dateStr}T23:59:59+05:30`;

      let apptQuery = supabaseServer
        .from("appointments")
        .select("starts_at, ends_at, status, staff_id")
        .gte("starts_at", dayStartIso)
        .lte("starts_at", dayEndIso);

      if (staffId && staffId !== "any") {
        apptQuery = apptQuery.eq("staff_id", staffId);
      }

      const { data: appts } = await apptQuery;
      if (appts) {
        existingAppointments = appts;
      }
    } catch (dbErr) {
      // Graceful fallback to default salon operating hours
      console.warn("[Availability API] Falling back to default salon hours:", dbErr?.message);
    }

    // 3. Calculate candidate slots
    const slots = generateStaffSlotsForDate({
      targetDateStr: dateStr,
      durationMinutes,
      workingHours: schedule.workingHours,
      breaks: staffBreaks,
      timeOff: staffTimeOff,
      existingAppointments,
      now: new Date(),
    });

    return NextResponse.json({
      success: true,
      date: dateStr,
      durationMinutes,
      totalSlots: slots.length,
      slots,
    });
  } catch (error) {
    console.error("[Availability API Error]", error);
    return NextResponse.json(
      { error: "Failed to calculate slot availability." },
      { status: 500 }
    );
  }
}
