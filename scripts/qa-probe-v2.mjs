/**
 * QA Probe — V2 Booking APIs (security, validation, truthfulness)
 *
 * SAFE: targets the LOCAL dev server only (default http://localhost:3000).
 * It sends NO auth cookies/tokens, i.e. it behaves like an anonymous visitor.
 * Synthetic data is tagged "QA-PROBE". Never point this at production.
 *
 * Each check prints PASS when the app behaves SECURELY / CORRECTLY,
 * and FAIL when the app behaves insecurely or reports false success.
 *
 * Usage: node scripts/qa-probe-v2.mjs
 */

const BASE = process.env.TEST_BASE_URL || "http://localhost:3000";
if (!/localhost|127\.0\.0\.1/.test(BASE)) {
  console.error("Refusing to run against a non-local URL:", BASE);
  process.exit(1);
}

const results = [];
function record(id, title, pass, detail) {
  results.push({ id, title, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  ${id}  ${title}\n      -> ${detail}`);
}

async function call(method, path, body, headers = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...headers },
    body: body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body),
  });
  let json = null;
  try {
    json = await res.json();
  } catch {
    /* non-JSON */
  }
  return { status: res.status, json };
}

const RANDOM_UUID = "00000000-0000-4000-8000-000000000000";
const inDays = (d, h = 11) => {
  const t = new Date(Date.now() + d * 86400000);
  t.setUTCHours(h - 5, 30, 0, 0); // h:00 IST approx
  return t.toISOString();
};
let ipCounter = 50;
const freshIp = () => ({ "x-forwarded-for": `10.99.0.${ipCounter++}` });

async function main() {
  console.log(`=== QA Probe against ${BASE} (anonymous) ===\n`);

  // QA-SEC-01: outbox jobs (phones/names) readable anonymously?
  {
    const r = await call("GET", "/api/booking/notifications?limit=50");
    const jobs = r.json?.jobs || [];
    const leaks = jobs.filter((j) => j.recipient).length;
    record(
      "QA-SEC-01",
      "Anonymous user cannot read notification outbox (contains phones/names)",
      !(r.status === 200 && leaks > 0),
      `status=${r.status}, jobs returned=${jobs.length}, jobs with recipient field=${leaks}`
    );
  }

  // QA-SEC-02: anonymous status change
  {
    const r = await call("PATCH", "/api/booking/status", { appointmentId: RANDOM_UUID, newStatus: "cancelled" });
    record(
      "QA-SEC-02",
      "Anonymous user cannot change appointment status",
      !(r.status === 200 && r.json?.success),
      `status=${r.status}, success=${r.json?.success}`
    );
  }

  // QA-FUNC-01: invalid state transition accepted?
  {
    const r = await call("PATCH", "/api/booking/status", { appointmentId: RANDOM_UUID, newStatus: "confirmed" });
    record(
      "QA-FUNC-01",
      "Status API rejects updates to a non-existent appointment (no false success)",
      !(r.status === 200 && r.json?.success),
      `status=${r.status}, message=${r.json?.message || r.json?.error}`
    );
  }

  // QA-SEC-03: anonymous staff creation
  {
    const r = await call("POST", "/api/staff", { displayName: "QA-PROBE Fake Stylist" });
    const list = await call("GET", "/api/staff");
    const visible = (list.json?.staff || []).some((s) => s.display_name === "QA-PROBE Fake Stylist");
    record(
      "QA-SEC-03",
      "Anonymous user cannot create staff that then appears publicly",
      !(r.status === 200 && r.json?.success),
      `create status=${r.status}, success=${r.json?.success}, visible in public GET /api/staff=${visible}`
    );
  }

  // QA-SEC-04: public booking abusing walk-in flag to bypass notice window + set status
  {
    const r = await call(
      "POST",
      "/api/booking",
      {
        customerName: "QA-PROBE Walkin Abuse",
        customerPhone: "9000000001",
        slotTime: new Date(Date.now() - 3 * 3600000).toISOString(),
        isWalkIn: true,
        initialStatus: "in_service",
      },
      freshIp()
    );
    record(
      "QA-SEC-04",
      "Public caller cannot use isWalkIn to book in the past / set in_service",
      !(r.status === 200 && r.json?.success),
      `status=${r.status}, success=${r.json?.success}, returnedStatus=${r.json?.status}`
    );
  }

  // QA-FUNC-02: booking beyond 30-day window
  {
    const r = await call(
      "POST",
      "/api/booking",
      { customerName: "QA-PROBE Far Future", customerPhone: "9000000002", slotTime: inDays(200) },
      freshIp()
    );
    record(
      "QA-FUNC-02",
      "Booking more than 30 days ahead is rejected (PRD §7.7)",
      !(r.status === 200 && r.json?.success),
      `status=${r.status}, success=${r.json?.success}`
    );
  }

  // QA-FUNC-03: excessively long name
  {
    const r = await call(
      "POST",
      "/api/booking",
      { customerName: "Q".repeat(5000), customerPhone: "9000000003", slotTime: inDays(5) },
      freshIp()
    );
    record(
      "QA-FUNC-03",
      "Excessively long customer name (5000 chars) is rejected",
      !(r.status === 200 && r.json?.success),
      `status=${r.status}, success=${r.json?.success}`
    );
  }

  // QA-FUNC-04: phone with letters
  {
    const r = await call(
      "POST",
      "/api/booking",
      { customerName: "QA-PROBE Bad Phone", customerPhone: "abcdefghij", slotTime: inDays(5, 12) },
      freshIp()
    );
    record(
      "QA-FUNC-04",
      "Non-numeric phone number is rejected (PRD edge case 19)",
      !(r.status === 200 && r.json?.success),
      `status=${r.status}, success=${r.json?.success}`
    );
  }

  // QA-FUNC-05: malformed JSON
  {
    const r = await call("POST", "/api/booking", "{not json", freshIp());
    record(
      "QA-FUNC-05",
      "Malformed JSON returns 400 (not 500)",
      r.status === 400,
      `status=${r.status}`
    );
  }

  // QA-DATA-01: does a "confirmed" public booking become visible to manage lookup?
  {
    const phone = "9000000099";
    const r = await call(
      "POST",
      "/api/booking",
      { customerName: "QA-PROBE Persist", customerPhone: phone, slotTime: inDays(6, 15) },
      freshIp()
    );
    const ref = r.json?.bookingReference;
    const look = ref ? await call("GET", `/api/booking/manage?ref=${ref}&phone=${phone}`) : { status: "n/a" };
    record(
      "QA-DATA-01",
      "A booking reported as confirmed can be found again via /book/manage",
      !(r.json?.success && look.status === 404),
      `create status=${r.status} ref=${ref}; lookup status=${look.status}`
    );
  }

  // QA-SEC-05: cancel with WRONG phone / non-existent reference
  {
    const r = await call("POST", "/api/booking/manage", {
      action: "cancel",
      bookingReference: "AL-BK-QAXXX",
      phone: "1111111111",
    });
    record(
      "QA-SEC-05",
      "Cancelling a non-existent booking / wrong phone does NOT report success",
      !(r.status === 200 && r.json?.success),
      `status=${r.status}, success=${r.json?.success}, message=${r.json?.message || r.json?.error}`
    );
  }

  // QA-SEC-06: reschedule a non-existent booking
  {
    const r = await call("POST", "/api/booking/manage", {
      action: "reschedule",
      bookingReference: "AL-BK-QAXXX",
      phone: "1111111111",
      newSlotTime: inDays(7),
    });
    record(
      "QA-SEC-06",
      "Rescheduling a non-existent booking does NOT report success",
      !(r.status === 200 && r.json?.success),
      `status=${r.status}, success=${r.json?.success}`
    );
  }

  // QA-FUNC-06: staff schedule endpoint exists for /staff/appointments
  {
    const r = await call("GET", "/api/booking?staffId=staff-1&date=2026-10-26");
    record(
      "QA-FUNC-06",
      "Endpoint used by /staff/appointments (GET /api/booking) exists",
      r.status !== 405,
      `status=${r.status}`
    );
  }

  // QA-FUNC-07: availability beyond 30 days
  {
    const far = new Date(Date.now() + 120 * 86400000).toISOString().slice(0, 10);
    const r = await call("GET", `/api/booking/availability?date=${far}`);
    record(
      "QA-FUNC-07",
      "Availability returns no slots beyond the 30-day advance window",
      !((r.json?.totalSlots || 0) > 0),
      `date=${far}, status=${r.status}, totalSlots=${r.json?.totalSlots}`
    );
  }

  // QA-FUNC-08: anonymous outbox processing trigger
  {
    const r = await call("POST", "/api/booking/notifications/process", {});
    record(
      "QA-SEC-07",
      "Anonymous user cannot trigger outbox processing",
      !(r.status === 200),
      `status=${r.status}`
    );
  }

  const failed = results.filter((x) => !x.pass).length;
  console.log(`\n=== Summary: ${results.length - failed} PASS, ${failed} FAIL (of ${results.length}) ===`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error("Probe crashed:", e.message);
  process.exit(2);
});
