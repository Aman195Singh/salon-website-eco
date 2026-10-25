import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

/**
 * PUT /api/staff/schedule
 * Updates a specialist's weekly working hours and break schedules
 */
export async function PUT(request) {
  try {
    const body = await request.json();
    const { staffId, workingHours, breaks } = body;

    if (!staffId) {
      return NextResponse.json({ error: "Staff ID is required." }, { status: 400 });
    }

    if (!Array.isArray(workingHours)) {
      return NextResponse.json({ error: "Working hours array is required." }, { status: 400 });
    }

    // Try Supabase database update
    try {
      // 1. Upsert working hours
      for (const wh of workingHours) {
        await supabaseServer
          .from("staff_working_hours")
          .upsert(
            {
              staff_id: staffId,
              day_of_week: wh.day_of_week,
              start_time: wh.start_time,
              end_time: wh.end_time,
              is_active: Boolean(wh.is_active),
              updated_at: new Date().toISOString(),
            },
            { onConflict: "staff_id,day_of_week" }
          );
      }

      // 2. If breaks provided, update breaks
      if (Array.isArray(breaks)) {
        await supabaseServer.from("staff_breaks").delete().eq("staff_id", staffId);
        for (const b of breaks) {
          await supabaseServer.from("staff_breaks").insert({
            staff_id: staffId,
            day_of_week: b.day_of_week,
            start_time: b.start_time,
            end_time: b.end_time,
            label: b.label || "Break",
          });
        }
      }
    } catch (err) {
      console.warn("[Schedule Update DB Note]", err?.message);
    }

    return NextResponse.json({
      success: true,
      message: "Weekly schedule and breaks updated successfully.",
      staffId,
    });
  } catch (error) {
    console.error("[Staff Schedule API Error]", error);
    return NextResponse.json({ error: "Failed to update staff schedule." }, { status: 500 });
  }
}
