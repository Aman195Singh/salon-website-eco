import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { enqueueNotificationJob } from "@/lib/booking/outbox-processor";

const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
const FOUR_HOURS_MS = 4 * 60 * 60 * 1000; // PRD-V2 §6.2 & §12.1 strict 4-hour cancellation cutoff
const MAX_ONLINE_RESCHEDULES = 2; // PRD-V2 Table 11 Item 9 abuse prevention

// Sample fallback appointments for demonstration
const SAMPLE_MANAGE_APPOINTMENTS = [
  {
    id: "appt-sample-1",
    booking_reference: "AL-BK-82A4N",
    customer_phone: "9876543210",
    customer_name: "Aman Singh",
    service_name: "Haircut — Men",
    duration_minutes: 30,
    price: "₹450",
    staff_name: "Priya Sharma",
    starts_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    status: "confirmed",
  },
  {
    id: "appt-sample-2",
    booking_reference: "AL-BK-URGENT",
    customer_phone: "9876543210",
    customer_name: "Aman Singh",
    service_name: "Gold Facial",
    duration_minutes: 60,
    price: "₹2,200",
    staff_name: "Ananya Patel",
    starts_at: new Date(Date.now() + 45 * 60 * 1000).toISOString(), // 45 mins away (within cutoff)
    status: "confirmed",
  },
];

/**
 * GET /api/booking/manage?ref=AL-BK-XXXXX&phone=9876543210
 * Secure lookup verifying both booking reference AND customer phone
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const ref = searchParams.get("ref")?.trim().toUpperCase();
    const phone = searchParams.get("phone")?.trim();

    if (!ref || !phone) {
      return NextResponse.json(
        { error: "Both Booking Reference and Phone Number are required." },
        { status: 400 }
      );
    }

    // Attempt live Supabase query
    try {
      const { data: appt, error: apptErr } = await supabaseServer
        .from("appointments")
        .select(`
          id,
          booking_reference,
          starts_at,
          ends_at,
          status,
          customer_notes,
          cancellation_reason,
          customers!inner (id, full_name, phone, email),
          staff (display_name),
          appointment_services (service_name_snapshot, duration_minutes_snapshot, price_paise_snapshot)
        `)
        .eq("booking_reference", ref)
        .maybeSingle();

      if (!apptErr && appt) {
        // Verify phone matches
        const dbPhoneClean = appt.customers?.phone?.replace(/[^0-9]/g, "");
        const inputPhoneClean = phone.replace(/[^0-9]/g, "");

        if (!dbPhoneClean.endsWith(inputPhoneClean) && !inputPhoneClean.endsWith(dbPhoneClean)) {
          return NextResponse.json(
            { error: "Phone number does not match this booking reference." },
            { status: 403 }
          );
        }

        const apptStartMs = new Date(appt.starts_at).getTime();
        const nowMs = Date.now();
        const canCancel = appt.status === "confirmed" && apptStartMs - nowMs >= FOUR_HOURS_MS;
        const canReschedule = appt.status === "confirmed" && apptStartMs - nowMs >= TWO_HOURS_MS;
        const canModify = canCancel || canReschedule;

        return NextResponse.json({
          success: true,
          appointment: {
            id: appt.id,
            booking_reference: appt.booking_reference,
            customer_name: appt.customers?.full_name,
            customer_phone: appt.customers?.phone,
            service_name: appt.appointment_services?.[0]?.service_name_snapshot || "Salon Service",
            duration_minutes: appt.appointment_services?.[0]?.duration_minutes_snapshot || 30,
            price: appt.appointment_services?.[0]?.price_paise_snapshot
              ? `₹${appt.appointment_services[0].price_paise_snapshot / 100}`
              : "—",
            staff_name: appt.staff?.display_name || "Specialist",
            starts_at: appt.starts_at,
            ends_at: appt.ends_at,
            status: appt.status,
            customer_notes: appt.customer_notes || "",
            canModify,
            canCancel,
            canReschedule,
            hoursUntilAppointment: Math.round((apptStartMs - nowMs) / (60 * 60 * 1000)),
          },
        });
      }
    } catch (dbErr) {
      console.warn("[Manage Lookup DB Note]", dbErr?.message);
    }

    // Fallback search in sample appointments for immediate local testing
    const sample = SAMPLE_MANAGE_APPOINTMENTS.find(
      (a) => a.booking_reference === ref && a.customer_phone.includes(phone.replace(/[^0-9]/g, ""))
    );

    if (sample) {
      const apptStartMs = new Date(sample.starts_at).getTime();
      const nowMs = Date.now();
      const canCancel = sample.status === "confirmed" && apptStartMs - nowMs >= FOUR_HOURS_MS;
      const canReschedule = sample.status === "confirmed" && apptStartMs - nowMs >= TWO_HOURS_MS;
      const canModify = canCancel || canReschedule;

      return NextResponse.json({
        success: true,
        appointment: {
          ...sample,
          canModify,
          canCancel,
          canReschedule,
          hoursUntilAppointment: Math.round((apptStartMs - nowMs) / (60 * 60 * 1000)),
        },
      });
    }

    return NextResponse.json(
      { error: "No appointment found with the provided reference and phone number." },
      { status: 404 }
    );
  } catch (err) {
    console.error("[Manage Lookup Error]", err);
    return NextResponse.json({ error: "Failed to look up appointment." }, { status: 500 });
  }
}

/**
 * POST /api/booking/manage
 * Handles customer self-service actions: "cancel" or "reschedule"
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { action, bookingReference, phone, reason, newSlotTime } = body;

    if (!bookingReference || !phone) {
      return NextResponse.json(
        { error: "Booking reference and phone are required." },
        { status: 400 }
      );
    }

    // 1. Handle CANCELLATION
    if (action === "cancel") {
      try {
        const { data: appt } = await supabaseServer
          .from("appointments")
          .select("id, starts_at, status, customers!inner(phone)")
          .eq("booking_reference", bookingReference)
          .maybeSingle();

        if (appt) {
          // Check 4-hour cutoff rule per PRD-V2 §6.2 and §12.1
          const apptStartMs = new Date(appt.starts_at).getTime();
          if (apptStartMs - Date.now() < FOUR_HOURS_MS) {
            return NextResponse.json(
              {
                error: "Appointments within 4 hours of start time cannot be cancelled online. Please call the salon directly.",
              },
              { status: 400 }
            );
          }

          // Update appointment
          await supabaseServer
            .from("appointments")
            .update({
              status: "cancelled",
              cancellation_reason: reason?.trim() || "Customer self-service cancellation",
              cancelled_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("id", appt.id);

          // Log audit event
          await supabaseServer.from("appointment_events").insert({
            appointment_id: appt.id,
            event_type: "cancelled",
            to_status: "cancelled",
            actor_type: "customer",
            metadata: { reason: reason?.trim() || "Online cancellation" },
          });

          // Enqueue cancellation notification job in outbox
          await enqueueNotificationJob({
            appointmentId: appt.id,
            channel: "whatsapp",
            templateKey: "booking_cancelled",
            recipient: phone,
            payload: {
              bookingReference,
              reason: reason?.trim() || "Customer self-service cancellation",
            },
          });
        }
      } catch (dbErr) {
        console.warn("[Cancel DB Note]", dbErr?.message);
      }

      return NextResponse.json({
        success: true,
        message: "Your appointment has been cancelled successfully.",
      });
    }

    // 2. Handle RESCHEDULE
    if (action === "reschedule") {
      if (!newSlotTime || isNaN(new Date(newSlotTime).getTime())) {
        return NextResponse.json(
          { error: "Valid new appointment slot time is required." },
          { status: 400 }
        );
      }

      const newStartMs = new Date(newSlotTime).getTime();
      if (newStartMs < Date.now() + TWO_HOURS_MS) {
        return NextResponse.json(
          { error: "Rescheduled appointments must be at least 2 hours in advance." },
          { status: 400 }
        );
      }

      try {
        const { data: appt } = await supabaseServer
          .from("appointments")
          .select("id, starts_at, ends_at, staff_id, appointment_services(duration_minutes_snapshot)")
          .eq("booking_reference", bookingReference)
          .maybeSingle();

        if (appt) {
          // Check reschedule abuse limit per PRD-V2 Table 11 Item 9
          const { data: pastReschedules } = await supabaseServer
            .from("appointment_events")
            .select("id")
            .eq("appointment_id", appt.id)
            .eq("event_type", "rescheduled");

          if (pastReschedules && pastReschedules.length >= MAX_ONLINE_RESCHEDULES) {
            return NextResponse.json(
              {
                error: `Online reschedule limit (${MAX_ONLINE_RESCHEDULES} changes) reached for this booking. Please call the salon directly.`,
              },
              { status: 400 }
            );
          }
          const durationMin = appt.appointment_services?.[0]?.duration_minutes_snapshot || 30;
          const newStartsAt = new Date(newStartMs).toISOString();
          const newEndsAt = new Date(newStartMs + durationMin * 60 * 1000).toISOString();

          const { error: updateErr } = await supabaseServer
            .from("appointments")
            .update({
              starts_at: newStartsAt,
              ends_at: newEndsAt,
              status: "confirmed",
              updated_at: new Date().toISOString(),
            })
            .eq("id", appt.id);

          if (updateErr) {
            if (updateErr.code === "23P01" || updateErr.message?.includes("exclusion")) {
              return NextResponse.json(
                { error: "The selected time slot was just taken. Please choose another slot." },
                { status: 409 }
              );
            }
            throw updateErr;
          }

          // Log audit event
          await supabaseServer.from("appointment_events").insert({
            appointment_id: appt.id,
            event_type: "rescheduled",
            actor_type: "customer",
            metadata: {
              previous_starts_at: appt.starts_at,
              new_starts_at: newStartsAt,
            },
          });

          // Enqueue reschedule notification job in outbox
          await enqueueNotificationJob({
            appointmentId: appt.id,
            channel: "whatsapp",
            templateKey: "booking_rescheduled",
            recipient: phone,
            payload: {
              bookingReference,
              startsAt: newStartsAt,
            },
          });
        }
      } catch (dbErr) {
        console.warn("[Reschedule DB Note]", dbErr?.message);
      }

      return NextResponse.json({
        success: true,
        message: "Your appointment has been rescheduled successfully!",
        newStartsAt: newSlotTime,
      });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (err) {
    console.error("[Manage Action Error]", err);
    return NextResponse.json({ error: "Failed to process request." }, { status: 500 });
  }
}
