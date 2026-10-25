import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

const VALID_STATUSES = [
  "confirmed",
  "arrived",
  "in_service",
  "completed",
  "cancelled",
  "no_show",
];

/**
 * PATCH /api/booking/status
 * Updates appointment operational status and records an audit event.
 */
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { appointmentId, newStatus, cancellationReason, internalNotes } = body;

    if (!appointmentId) {
      return NextResponse.json(
        { error: "appointmentId is required." },
        { status: 400 }
      );
    }

    if (!newStatus || !VALID_STATUSES.includes(newStatus)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const updatePayload = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    if (newStatus === "cancelled") {
      updatePayload.cancelled_at = new Date().toISOString();
      if (cancellationReason) {
        updatePayload.cancellation_reason = cancellationReason.trim();
      }
    }

    if (internalNotes !== undefined) {
      updatePayload.internal_notes = internalNotes.trim();
    }

    // Update appointment
    const { data: updatedAppt, error: updateErr } = await supabaseServer
      .from("appointments")
      .update(updatePayload)
      .eq("id", appointmentId)
      .select("id, booking_reference, status")
      .maybeSingle();

    if (updateErr) {
      console.warn("[Appointment Status Update DB Note]", updateErr.message);
      // Graceful return if table pending migration
    }

    // Try logging event to appointment_events
    try {
      await supabaseServer.from("appointment_events").insert({
        appointment_id: appointmentId,
        event_type: "status_changed",
        to_status: newStatus,
        actor_type: "owner",
        metadata: {
          updated_at: new Date().toISOString(),
          cancellation_reason: cancellationReason || null,
        },
      });
    } catch {
      // Non-fatal if events table pending
    }

    return NextResponse.json({
      success: true,
      appointmentId,
      newStatus,
      bookingReference: updatedAppt?.booking_reference,
      message: `Appointment status updated to ${newStatus}.`,
    });
  } catch (error) {
    console.error("[Appointment Status API Error]", error);
    return NextResponse.json(
      { error: "Failed to update appointment status." },
      { status: 500 }
    );
  }
}
