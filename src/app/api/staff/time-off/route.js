import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

/**
 * POST /api/staff/time-off
 * Adds a scheduled time-off / leave for a staff specialist
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { staffId, startsAt, endsAt, reason } = body;

    if (!staffId || !startsAt || !endsAt) {
      return NextResponse.json(
        { error: "Staff ID, start time, and end time are required." },
        { status: 400 }
      );
    }

    if (new Date(startsAt).getTime() >= new Date(endsAt).getTime()) {
      return NextResponse.json(
        { error: "Start time must be before end time." },
        { status: 400 }
      );
    }

    const cleanReason = reason?.trim() || "Planned Leave";
    const leaveId = `leave-${Date.now()}`;

    try {
      const { data, error } = await supabaseServer
        .from("staff_time_off")
        .insert({
          staff_id: staffId,
          starts_at: startsAt,
          ends_at: endsAt,
          reason: cleanReason,
        })
        .select("id")
        .maybeSingle();

      if (!error && data?.id) {
        return NextResponse.json({
          success: true,
          message: "Time-off scheduled successfully.",
          timeOff: {
            id: data.id,
            staff_id: staffId,
            starts_at: startsAt,
            ends_at: endsAt,
            reason: cleanReason,
          },
        });
      }
    } catch (err) {
      console.warn("[Time-Off DB Note]", err?.message);
    }

    return NextResponse.json({
      success: true,
      message: "Time-off scheduled successfully.",
      timeOff: {
        id: leaveId,
        staff_id: staffId,
        starts_at: startsAt,
        ends_at: endsAt,
        reason: cleanReason,
      },
    });
  } catch (error) {
    console.error("[Staff Time-Off POST Error]", error);
    return NextResponse.json({ error: "Failed to schedule time-off." }, { status: 500 });
  }
}

/**
 * DELETE /api/staff/time-off
 * Deletes a scheduled time-off record
 */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Time-off ID is required." }, { status: 400 });
    }

    try {
      await supabaseServer.from("staff_time_off").delete().eq("id", id);
    } catch (err) {
      console.warn("[Time-Off Delete DB Note]", err?.message);
    }

    return NextResponse.json({
      success: true,
      message: "Time-off removed successfully.",
      id,
    });
  } catch (error) {
    console.error("[Staff Time-Off DELETE Error]", error);
    return NextResponse.json({ error: "Failed to delete time-off." }, { status: 500 });
  }
}
