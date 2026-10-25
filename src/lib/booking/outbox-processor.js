/**
 * Notification Outbox Processor & Automation Stub
 * Authorizing PRD: PRD-V2.md §8 (Transactional Notification Outbox)
 *
 * Rules:
 * - Decouples communication delivery from booking creation.
 * - Retries failed messages with exponential backoff.
 * - Caps attempts at 3 before dead-lettering.
 * - Formats localized IST dates and times in messages.
 * - Works with live Supabase database or in-memory fallback.
 */

import { supabaseServer } from "@/lib/supabase-server";

export const MAX_RETRY_ATTEMPTS = 3;
export const BACKOFF_DELAYS_MINUTES = [1, 5, 15]; // Retry 1: +1m, Retry 2: +5m, Retry 3: +15m

// In-memory fallback outbox store for local development/offline testing
const inMemoryOutbox = [];

/**
 * Format IST DateTime for message copy
 */
export function formatISTTimeForMessage(isoString) {
  try {
    const d = new Date(isoString);
    const dateStr = d.toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const timeStr = d.toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
    });
    return { dateStr, timeStr, full: `${dateStr} at ${timeStr}` };
  } catch {
    return { dateStr: isoString, timeStr: "", full: isoString };
  }
}

/**
 * Render message template by template key and channel
 */
export function renderNotificationTemplate(templateKey, channel, payload = {}) {
  const {
    customerName = "Valued Guest",
    serviceName = "Salon Service",
    bookingReference = "AL-BK-XXXXX",
    startsAt = "",
    reason = "Schedule update",
    specialistName = "Specialist",
  } = payload;

  const { full: formattedTime } = startsAt ? formatISTTimeForMessage(startsAt) : { full: "your scheduled time" };

  switch (templateKey) {
    case "booking_confirmation":
      if (channel === "whatsapp") {
        return (
          `✨ *Appointment Confirmed!*\n\n` +
          `Hello ${customerName},\n` +
          `Your appointment for *${serviceName}* with *${specialistName}* is confirmed for *${formattedTime}*.\n\n` +
          `🔖 Booking Reference: *${bookingReference}*\n` +
          `📍 Location: Salon Luxury Lounge, City Center\n\n` +
          `Need to change or cancel? Manage your booking anytime at:\n` +
          `https://salon-website-eco.vercel.app/book/manage?ref=${bookingReference}\n\n` +
          `We look forward to pampering you!`
        );
      }
      if (channel === "sms") {
        return `Salon: Confirmed ${serviceName} on ${formattedTime}. Ref: ${bookingReference}. Need changes: /book/manage?ref=${bookingReference}`;
      }
      return {
        subject: `Appointment Confirmed: ${serviceName} (${bookingReference})`,
        text: `Hello ${customerName}, your appointment for ${serviceName} is confirmed for ${formattedTime}. Reference: ${bookingReference}.`,
      };

    case "booking_rescheduled":
      if (channel === "whatsapp") {
        return (
          `🔄 *Appointment Rescheduled*\n\n` +
          `Hello ${customerName},\n` +
          `Your appointment for *${serviceName}* has been rescheduled to *${formattedTime}*.\n\n` +
          `🔖 Booking Reference: *${bookingReference}*\n\n` +
          `Manage your booking: https://salon-website-eco.vercel.app/book/manage?ref=${bookingReference}`
        );
      }
      return `Salon: Rescheduled to ${formattedTime} (${serviceName}). Ref: ${bookingReference}.`;

    case "booking_cancelled":
      if (channel === "whatsapp") {
        return (
          `❌ *Appointment Cancelled*\n\n` +
          `Hello ${customerName},\n` +
          `Your appointment for *${serviceName}* (Ref: *${bookingReference}*) has been cancelled.\n` +
          `Note: ${reason}\n\n` +
          `We hope to welcome you back soon! Book anytime at: /book`
        );
      }
      return `Salon: Your appointment ${bookingReference} (${serviceName}) has been cancelled.`;

    case "appointment_reminder":
      if (channel === "whatsapp") {
        return (
          `⏰ *Upcoming Appointment Reminder*\n\n` +
          `Hello ${customerName},\n` +
          `Friendly reminder that your *${serviceName}* appointment is today at *${formattedTime}*.\n\n` +
          `Ref: *${bookingReference}*. See you soon!`
        );
      }
      return `Salon Reminder: Your appointment for ${serviceName} is today at ${formattedTime}. Ref: ${bookingReference}`;

    default:
      return `Notification from Salon for booking ${bookingReference}.`;
  }
}

/**
 * Dispatch message via provider stub
 * (In production, replace with Twilio / WhatsApp Cloud API / Resend call)
 */
export async function dispatchNotificationStub(job) {
  const content = renderNotificationTemplate(job.template_key, job.channel, job.payload);
  const recipient = job.recipient;

  // Simulate network dispatch
  const messageId = `stub_msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  // For testing failure simulation
  if (job.payload?._simulate_failure === true) {
    throw new Error("Simulated Gateway Timeout (504 Gateway Unavailable)");
  }

  return {
    success: true,
    messageId,
    recipient,
    channel: job.channel,
    content: typeof content === "string" ? content : content.text,
    deliveredAt: new Date().toISOString(),
  };
}

/**
 * Enqueue a notification job in the transactional outbox
 */
export async function enqueueNotificationJob({
  appointmentId,
  channel = "whatsapp",
  templateKey = "booking_confirmation",
  recipient,
  payload = {},
  scheduledFor = null,
}) {
  const newJob = {
    id: `job-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    appointment_id: appointmentId,
    channel,
    template_key: templateKey,
    recipient,
    payload,
    status: "pending",
    attempts: 0,
    error_message: null,
    scheduled_for: scheduledFor || new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabaseServer
      .from("notification_jobs")
      .insert({
        appointment_id: appointmentId,
        channel,
        template_key: templateKey,
        recipient,
        payload,
        status: "pending",
        scheduled_for: scheduledFor || new Date().toISOString(),
      })
      .select("id")
      .maybeSingle();

    if (!error && data?.id) {
      newJob.id = data.id;
    }
  } catch (err) {
    console.warn("[Outbox Enqueue DB Note]", err?.message);
  }

  // Also maintain in-memory outbox for instant verification
  inMemoryOutbox.unshift(newJob);
  return newJob;
}

/**
 * Process pending notification jobs in the outbox
 */
export async function processNotificationOutbox(limit = 10) {
  const processed = [];
  const now = new Date();

  // 1. Try fetching pending jobs from Supabase
  let dbJobs = [];
  try {
    const { data, error } = await supabaseServer
      .from("notification_jobs")
      .select("*")
      .in("status", ["pending", "failed"])
      .lte("scheduled_for", now.toISOString())
      .lt("attempts", MAX_RETRY_ATTEMPTS)
      .order("scheduled_for", { ascending: true })
      .limit(limit);

    if (!error && Array.isArray(data)) {
      dbJobs = data;
    }
  } catch (err) {
    console.warn("[Outbox Process DB Note]", err?.message);
  }

  // 2. Fall back to / combine with in-memory pending jobs
  const pendingMemoryJobs = inMemoryOutbox
    .filter(
      (j) =>
        (j.status === "pending" || j.status === "failed") &&
        new Date(j.scheduled_for) <= now &&
        j.attempts < MAX_RETRY_ATTEMPTS
    )
    .slice(0, limit);

  const jobsToProcess = dbJobs.length > 0 ? dbJobs : pendingMemoryJobs;

  for (const job of jobsToProcess) {
    const attempts = (job.attempts || 0) + 1;

    try {
      // Mark as processing
      job.status = "processing";

      const dispatchResult = await dispatchNotificationStub(job);

      // On Success
      job.status = "sent";
      job.attempts = attempts;
      job.error_message = null;
      job.processed_at = new Date().toISOString();

      try {
        await supabaseServer
          .from("notification_jobs")
          .update({
            status: "sent",
            attempts,
            error_message: null,
            processed_at: job.processed_at,
          })
          .eq("id", job.id);
      } catch {}

      processed.push({
        id: job.id,
        status: "sent",
        recipient: job.recipient,
        channel: job.channel,
        template: job.template_key,
        messageId: dispatchResult.messageId,
      });
    } catch (dispatchErr) {
      // On Failure: calculate exponential backoff
      const isDeadLetter = attempts >= MAX_RETRY_ATTEMPTS;
      const nextDelayMinutes = BACKOFF_DELAYS_MINUTES[attempts - 1] || 15;
      const nextScheduled = new Date(Date.now() + nextDelayMinutes * 60 * 1000).toISOString();

      job.status = isDeadLetter ? "dead_letter" : "failed";
      job.attempts = attempts;
      job.error_message = dispatchErr.message;
      job.scheduled_for = nextScheduled;

      try {
        await supabaseServer
          .from("notification_jobs")
          .update({
            status: job.status,
            attempts,
            error_message: job.error_message,
            scheduled_for: job.scheduled_for,
          })
          .eq("id", job.id);
      } catch {}

      processed.push({
        id: job.id,
        status: job.status,
        recipient: job.recipient,
        channel: job.channel,
        attempts,
        error: dispatchErr.message,
        retryScheduledFor: isDeadLetter ? null : nextScheduled,
      });
    }
  }

  return {
    processedCount: processed.length,
    jobs: processed,
  };
}

/**
 * Get recent outbox jobs for dashboard / audit inspection
 */
export async function getOutboxJobs(limit = 20) {
  try {
    const { data, error } = await supabaseServer
      .from("notification_jobs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (!error && data && data.length > 0) {
      return data;
    }
  } catch {}

  return inMemoryOutbox.slice(0, limit);
}
