/**
 * V2 Automated Concurrency & Double-Booking Prevention Test
 * Task: V2-12 (Authorizing PRD: PRD-V2.md §5.4, §8)
 *
 * Verifies that when 20 concurrent customers attempt to book the exact same specialist
 * and slot time simultaneously:
 * 1. Exactly ONE request succeeds (HTTP 200/201).
 * 2. Exactly NINETEEN requests are rejected with HTTP 409 Conflict (SLOT_ALREADY_TAKEN).
 * 3. Zero double-bookings occur.
 * 4. Also tests idempotency key replay protection.
 */

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";
const CONCURRENCY_COUNT = 20;

async function runConcurrencyTest() {
  console.log("==================================================================");
  console.log("  V2 Concurrency Test: 20 Parallel Bookings for Same Slot");
  console.log("==================================================================\n");

  // Pick a fresh unique slot time in the future
  const randomHourOffset = 72 + Math.floor(Math.random() * 200) + 1;
  const futureDate = new Date(Date.now() + randomHourOffset * 60 * 60 * 1000);
  futureDate.setMinutes(Math.floor(Math.random() * 4) * 15, 0, 0);
  const targetSlotTime = futureDate.toISOString();
  const targetStaffId = "staff-specialist-priya";

  console.log(`[Config] Target Slot Time: ${targetSlotTime}`);
  console.log(`[Config] Target Staff ID : ${targetStaffId}`);
  console.log(`[Config] Concurrent Users: ${CONCURRENCY_COUNT}`);
  console.log(`[Config] Endpoint        : ${BASE_URL}/api/booking\n`);
  console.log("-> Dispatching 20 parallel requests simultaneously via Promise.all...\n");

  const startTime = Date.now();

  const promises = Array.from({ length: CONCURRENCY_COUNT }, (_, i) => {
    const clientIndex = i + 1;
    const clientPhone = `987654${String(1000 + i).slice(1)}`;
    const clientIp = `192.168.10.${10 + i}`;

    return fetch(`${BASE_URL}/api/booking`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": clientIp,
      },
      body: JSON.stringify({
        serviceName: "Royal Beard Grooming & Styling",
        staffId: targetStaffId,
        slotTime: targetSlotTime,
        customerName: `Concurrent Test User ${clientIndex}`,
        customerPhone: clientPhone,
        customerEmail: `testuser${clientIndex}@example.com`,
      }),
    })
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        return {
          clientIndex,
          status: res.status,
          success: res.ok,
          body,
        };
      })
      .catch((err) => {
        return {
          clientIndex,
          status: 0,
          success: false,
          error: err.message,
        };
      });
  });

  const results = await Promise.all(promises);
  const durationMs = Date.now() - startTime;

  console.log(`-> All ${CONCURRENCY_COUNT} requests completed in ${durationMs}ms.\n`);

  let successCount = 0;
  let conflictCount = 0;
  let errorCount = 0;
  let winningBookingRef = null;

  for (const r of results) {
    if (r.status === 200 || r.status === 201) {
      successCount++;
      winningBookingRef = r.body?.bookingReference;
      console.log(`  [✓ SUCCESS] Client #${r.clientIndex} WON the slot! Ref: ${winningBookingRef}`);
    } else if (r.status === 409) {
      conflictCount++;
    } else {
      errorCount++;
      console.log(`  [✗ UNEXPECTED] Client #${r.clientIndex} received HTTP ${r.status}:`, r.body || r.error);
    }
  }

  console.log("\n==================================================================");
  console.log("  Results Breakdown:");
  console.log(`  - 200 OK (Booked Successfully) : ${successCount}`);
  console.log(`  - 409 Conflict (Slot Taken)     : ${conflictCount}`);
  console.log(`  - Other Errors / Failures       : ${errorCount}`);
  console.log("==================================================================\n");

  let testPassed = true;

  if (successCount === 1) {
    console.log("✓ CHECK 1 PASSED: Exactly 1 reservation succeeded.");
  } else {
    console.error(`✗ CHECK 1 FAILED: Expected exactly 1 success, got ${successCount}.`);
    testPassed = false;
  }

  if (conflictCount === CONCURRENCY_COUNT - 1) {
    console.log(`✓ CHECK 2 PASSED: Exactly ${CONCURRENCY_COUNT - 1} requests rejected with 409 Conflict.`);
  } else {
    console.error(`✗ CHECK 2 FAILED: Expected ${CONCURRENCY_COUNT - 1} 409 conflicts, got ${conflictCount}.`);
    testPassed = false;
  }

  if (errorCount === 0) {
    console.log("✓ CHECK 3 PASSED: Zero unexpected crashes or 500 errors.");
  } else {
    console.error(`✗ CHECK 3 FAILED: ${errorCount} requests failed unexpectedly.`);
    testPassed = false;
  }

  // Idempotency Test
  console.log("\n--- Testing Idempotency Key Protection ---");
  const idempotencyKey = `idem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const idemSlotTime = new Date(Date.now() + 96 * 60 * 60 * 1000).toISOString();

  const req1 = await fetch(`${BASE_URL}/api/booking`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.0.99" },
    body: JSON.stringify({
      serviceName: "Idempotency Test Service",
      staffId: "staff-idem-test",
      slotTime: idemSlotTime,
      customerName: "Idempotent User",
      customerPhone: "9876540001",
      idempotencyKey,
    }),
  });
  const data1 = await req1.json();

  const req2 = await fetch(`${BASE_URL}/api/booking`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.0.99" },
    body: JSON.stringify({
      serviceName: "Idempotency Test Service",
      staffId: "staff-idem-test",
      slotTime: idemSlotTime,
      customerName: "Idempotent User",
      customerPhone: "9876540001",
      idempotencyKey,
    }),
  });
  const data2 = await req2.json();

  if (
    data1.bookingReference &&
    data1.bookingReference === data2.bookingReference &&
    req2.status === 200
  ) {
    console.log(`✓ CHECK 4 PASSED: Idempotency key returned identical booking ref (${data1.bookingReference}).`);
  } else {
    console.error("✗ CHECK 4 FAILED: Idempotency replay did not match original reference:", { data1, data2 });
    testPassed = false;
  }

  console.log("\n==================================================================");
  if (testPassed) {
    console.log("  >>> ALL CONCURRENCY & DOUBLE-BOOKING CHECKS PASSED (100%) <<<");
    console.log("==================================================================\n");
    process.exit(0);
  } else {
    console.error("  >>> CONCURRENCY VERIFICATION FAILED <<<");
    console.log("==================================================================\n");
    process.exit(1);
  }
}

runConcurrencyTest();
