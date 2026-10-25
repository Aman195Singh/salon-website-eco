import { NextResponse } from "next/server";
import { getOutboxJobs, enqueueNotificationJob } from "@/lib/booking/outbox-processor";

/**
 * GET /api/booking/notifications
 * Returns outbox jobs and queue summary
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const jobs = await getOutboxJobs(limit);

    // Calculate queue metrics
    const metrics = {
      total: jobs.length,
      pending: jobs.filter((j) => j.status === "pending").length,
      sent: jobs.filter((j) => j.status === "sent").length,
      failed: jobs.filter((j) => j.status === "failed").length,
      dead_letter: jobs.filter((j) => j.status === "dead_letter").length,
    };

    return NextResponse.json({
      success: true,
      metrics,
      jobs,
    });
  } catch (err) {
    console.error("[Notifications API GET Error]", err);
    return NextResponse.json({ error: "Failed to fetch notification outbox." }, { status: 500 });
  }
}

/**
 * POST /api/booking/notifications
 * Enqueues a notification job
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { appointmentId, channel, templateKey, recipient, payload } = body;

    if (!recipient) {
      return NextResponse.json({ error: "Recipient phone or email is required." }, { status: 400 });
    }

    const job = await enqueueNotificationJob({
      appointmentId: appointmentId || "appt-adhoc",
      channel: channel || "whatsapp",
      templateKey: templateKey || "booking_confirmation",
      recipient,
      payload: payload || {},
    });

    return NextResponse.json({
      success: true,
      message: "Notification job enqueued in outbox.",
      job,
    });
  } catch (err) {
    console.error("[Notifications API POST Error]", err);
    return NextResponse.json({ error: "Failed to enqueue notification." }, { status: 500 });
  }
}
