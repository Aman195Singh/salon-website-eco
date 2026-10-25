/**
 * Automated Test for Customer Self-Service Booking Manage API
 * Tests lookup, phone verification, 2-hour policy cutoff, reschedule, and cancel.
 */

const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("=== Testing Customer Self-Service Booking API ===\n");
  let passed = 0;
  let failed = 0;

  // Test 1: Missing params returns 400
  try {
    const res = await fetch(`${BASE_URL}/api/booking/manage`);
    if (res.status === 400) {
      console.log("✓ Test 1 Passed: Missing parameters rejected with 400.");
      passed++;
    } else {
      console.error(`✗ Test 1 Failed: Expected 400, got ${res.status}`);
      failed++;
    }
  } catch (err) {
    console.error("✗ Test 1 Error:", err.message);
    failed++;
  }

  // Test 2: Invalid reference or mismatched phone returns 404
  try {
    const res = await fetch(`${BASE_URL}/api/booking/manage?ref=INVALID-REF&phone=9876543210`);
    if (res.status === 404) {
      console.log("✓ Test 2 Passed: Invalid reference returns 404.");
      passed++;
    } else {
      console.error(`✗ Test 2 Failed: Expected 404, got ${res.status}`);
      failed++;
    }
  } catch (err) {
    console.error("✗ Test 2 Error:", err.message);
    failed++;
  }

  // Test 3: Valid normal appointment lookup (AL-BK-82A4N)
  try {
    const res = await fetch(`${BASE_URL}/api/booking/manage?ref=AL-BK-82A4N&phone=9876543210`);
    const data = await res.json();
    if (res.status === 200 && data.success && data.appointment?.canModify === true) {
      console.log(`✓ Test 3 Passed: Successfully retrieved booking '${data.appointment.booking_reference}'.`);
      console.log(`  Client: ${data.appointment.customer_name}, Service: ${data.appointment.service_name}`);
      console.log(`  Eligible for online changes: ${data.appointment.canModify}`);
      passed++;
    } else {
      console.error("✗ Test 3 Failed:", data);
      failed++;
    }
  } catch (err) {
    console.error("✗ Test 3 Error:", err.message);
    failed++;
  }

  // Test 4: Urgent appointment (< 2 hours cutoff: AL-BK-URGENT)
  try {
    const res = await fetch(`${BASE_URL}/api/booking/manage?ref=AL-BK-URGENT&phone=9876543210`);
    const data = await res.json();
    if (res.status === 200 && data.success && data.appointment?.canModify === false) {
      console.log("✓ Test 4 Passed: 2-hour policy correctly locks online modification (canModify = false).");
      passed++;
    } else {
      console.error("✗ Test 4 Failed: Expected canModify = false, got:", data);
      failed++;
    }
  } catch (err) {
    console.error("✗ Test 4 Error:", err.message);
    failed++;
  }

  // Test 5: Reschedule appointment
  try {
    const newSlot = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    const res = await fetch(`${BASE_URL}/api/booking/manage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "reschedule",
        bookingReference: "AL-BK-82A4N",
        phone: "9876543210",
        newSlotTime: newSlot,
      }),
    });
    const data = await res.json();
    if (res.status === 200 && data.success) {
      console.log("✓ Test 5 Passed: Reschedule request processed successfully.");
      passed++;
    } else {
      console.error("✗ Test 5 Failed:", data);
      failed++;
    }
  } catch (err) {
    console.error("✗ Test 5 Error:", err.message);
    failed++;
  }

  // Test 6: Cancel appointment
  try {
    const res = await fetch(`${BASE_URL}/api/booking/manage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "cancel",
        bookingReference: "AL-BK-82A4N",
        phone: "9876543210",
        reason: "Traveling out of town",
      }),
    });
    const data = await res.json();
    if (res.status === 200 && data.success) {
      console.log("✓ Test 6 Passed: Cancellation request processed successfully with audit reason.");
      passed++;
    } else {
      console.error("✗ Test 6 Failed:", data);
      failed++;
    }
  } catch (err) {
    console.error("✗ Test 6 Error:", err.message);
    failed++;
  }

  console.log(`\n=== Summary: ${passed} Passed, ${failed} Failed ===`);
  if (failed > 0) process.exit(1);
}

runTests();
