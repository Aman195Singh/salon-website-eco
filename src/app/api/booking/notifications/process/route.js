import { NextResponse } from "next/server";
import { processNotificationOutbox } from "@/lib/booking/outbox-processor";

/**
 * POST /api/booking/notifications/process
 * Triggers batch processing of pending outbox notification jobs
 * Can be triggered via Cron, serverless trigger, or dashboard action.
 */
export async function POST(request) {
  try {
    let limit = 10;
    try {
      const body = await request.json().catch(() => ({}));
      if (body.limit && Number.isInteger(body.limit)) {
        limit = Math.min(Math.max(body.limit, 1), 50);
      }
    } catch {}

    const result = await processNotificationOutbox(limit);

    return NextResponse.json({
      success: true,
      message: `Processed ${result.processedCount} notification outbox job(s).`,
      processedCount: result.processedCount,
      jobs: result.jobs,
    });
  } catch (err) {
    console.error("[Outbox Process API Error]", err);
    return NextResponse.json({ error: "Failed to process notification outbox." }, { status: 500 });
  }
}
