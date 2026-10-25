import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

// In-memory fallback attendance records for dev / test
let dynamicAttendance = [
  {
    id: "att-1",
    staff_id: "staff-1",
    work_date: new Date().toISOString().split("T")[0],
    check_in_time: "09:55",
    check_out_time: "19:05",
    status: "present",
    notes: "On time, client rush handled",
  },
  {
    id: "att-2",
    staff_id: "staff-2",
    work_date: new Date().toISOString().split("T")[0],
    check_in_time: "10:15",
    check_out_time: "19:00",
    status: "late",
    notes: "15 min late due to transit",
  },
  {
    id: "att-3",
    staff_id: "staff-3",
    work_date: new Date().toISOString().split("T")[0],
    check_in_time: "11:00",
    check_out_time: "20:00",
    status: "present",
    notes: "Regular shift",
  },
];

/**
 * GET /api/staff/hr/attendance?date=YYYY-MM-DD
 * Returns attendance for all staff on the specified date
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetDate = searchParams.get("date") || new Date().toISOString().split("T")[0];

    try {
      const { data, error } = await supabaseServer
        .from("staff_attendance")
        .select(`
          id,
          staff_id,
          work_date,
          check_in_time,
          check_out_time,
          status,
          notes,
          staff (id, display_name, full_name, role)
        `)
        .eq("work_date", targetDate);

      if (!error && Array.isArray(data) && data.length > 0) {
        return NextResponse.json({ success: true, date: targetDate, records: data });
      }
    } catch (dbErr) {
      console.warn("[Attendance DB Note]", dbErr?.message);
    }

    // In-memory fallback filtered by date
    const filtered = dynamicAttendance.filter((a) => a.work_date === targetDate);
    return NextResponse.json({
      success: true,
      date: targetDate,
      records: filtered.length > 0 ? filtered : dynamicAttendance,
    });
  } catch (error) {
    console.error("[Attendance GET Error]", error);
    return NextResponse.json({ error: "Failed to fetch attendance records." }, { status: 500 });
  }
}

/**
 * POST /api/staff/hr/attendance
 * Upserts daily attendance status, in/out times, and notes for a staff specialist
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { staffId, workDate, status, checkInTime, checkOutTime, notes } = body;

    if (!staffId) {
      return NextResponse.json({ error: "Staff ID is required." }, { status: 400 });
    }

    const cleanDate = workDate || new Date().toISOString().split("T")[0];
    const cleanStatus = status || "present";
    const validStatuses = ["present", "absent", "half_day", "late", "on_leave"];
    if (!validStatuses.includes(cleanStatus)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    // 1. Supabase upsert
    try {
      const { error } = await supabaseServer
        .from("staff_attendance")
        .upsert(
          {
            staff_id: staffId,
            work_date: cleanDate,
            status: cleanStatus,
            check_in_time: checkInTime || null,
            check_out_time: checkOutTime || null,
            notes: notes?.trim() || "",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "staff_id,work_date" }
        );

      if (error) {
        console.warn("[Attendance Upsert DB Note]", error.message);
      }
    } catch (dbErr) {
      console.warn("[Attendance Upsert Exception]", dbErr?.message);
    }

    // 2. In-memory update
    const existingIndex = dynamicAttendance.findIndex(
      (a) => a.staff_id === staffId && a.work_date === cleanDate
    );

    const updatedRecord = {
      id: existingIndex !== -1 ? dynamicAttendance[existingIndex].id : `att-${Date.now()}`,
      staff_id: staffId,
      work_date: cleanDate,
      status: cleanStatus,
      check_in_time: checkInTime || null,
      check_out_time: checkOutTime || null,
      notes: notes?.trim() || "",
    };

    if (existingIndex !== -1) {
      dynamicAttendance[existingIndex] = updatedRecord;
    } else {
      dynamicAttendance.push(updatedRecord);
    }

    return NextResponse.json({
      success: true,
      message: "Attendance recorded successfully.",
      record: updatedRecord,
    });
  } catch (error) {
    console.error("[Attendance POST Error]", error);
    return NextResponse.json({ error: "Failed to record attendance." }, { status: 500 });
  }
}
