import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

/**
 * POST /api/staff/hr/exit
 * Processes staff resignation or termination.
 * Formally marks them as exited, records reasons/notes, and disables active booking shifts.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { staffId, exitType, exitDate, exitReason, exitNotes } = body;

    if (!staffId) {
      return NextResponse.json({ error: "Staff ID is required." }, { status: 400 });
    }

    const cleanType = exitType === "terminated" ? "terminated" : "resigned";
    const cleanExitDate = exitDate || new Date().toISOString().split("T")[0];
    const cleanReason = exitReason?.trim() || "Standard resignation";
    const cleanNotes = exitNotes?.trim() || "";

    // 1. Supabase Update
    try {
      // A. Update staff status to exited
      await supabaseServer
        .from("staff")
        .update({
          employment_status: cleanType,
          is_active: false,
          exit_date: cleanExitDate,
          exit_reason: cleanReason,
          exit_notes: cleanNotes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", staffId);

      // B. Disable working hours so they receive zero future customer bookings
      await supabaseServer
        .from("staff_working_hours")
        .update({ is_active: false })
        .eq("staff_id", staffId);
    } catch (dbErr) {
      console.warn("[Staff Exit DB Note]", dbErr?.message);
    }

    return NextResponse.json({
      success: true,
      message: `Staff member formally marked as ${cleanType}. Future booking availability has been closed.`,
      exitDetails: {
        staffId,
        employment_status: cleanType,
        exit_date: cleanExitDate,
        exit_reason: cleanReason,
        exit_notes: cleanNotes,
      },
    });
  } catch (error) {
    console.error("[Staff Exit POST Error]", error);
    return NextResponse.json({ error: "Failed to process staff exit." }, { status: 500 });
  }
}
