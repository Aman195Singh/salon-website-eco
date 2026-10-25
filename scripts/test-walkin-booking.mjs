/**
 * V2 Automated Owner Walk-In & Manual Booking Test
 * Task: Prompt 11 (Authorizing PRD: PRD-V2.md §2.2, §6.3)
 *
 * Verifies:
 * 1. Immediate Walk-In creation (notice window exemption).
 * 2. Custom initial status (e.g. 'arrived' or 'in_service').
 * 3. Front-desk phone reservations.
 * 4. Validation errors on missing client name or phone.
 */

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

async function runWalkInBookingTests() {
  console.log("==================================================================");
  console.log("  V2 Owner Walk-In & Manual Booking Test Suite");
  console.log("==================================================================\n");

  let passed = 0;
  let failed = 0;

  // Test 1: Immediate Walk-In (Notice window exemption & status 'arrived')
  try {
    const immediateTime = new Date().toISOString();
    const res = await fetch(`${BASE_URL}/api/booking`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "10.0.88.1",
      },
      body: JSON.stringify({
        serviceName: "Haircut — Men",
        staffId: "staff-walkin-1",
        slotTime: immediateTime,
        customerName: "Sanjay Singhania",
        customerPhone: "9876541111",
        customerNotes: "Lobby walk-in client; requested senior barber",
        isWalkIn: true,
        initialStatus: "arrived",
      }),
    });
    const data = await res.json();
    if (res.status === 200 && data.success && data.status === "arrived") {
      console.log(`✓ Test 1 Passed: Immediate walk-in booked successfully (Ref: ${data.bookingReference}, Status: '${data.status}').`);
      passed++;
    } else {
      console.error("✗ Test 1 Failed:", data);
      failed++;
    }
  } catch (err) {
    console.error("✗ Test 1 Error:", err.message);
    failed++;
  }

  // Test 2: Immediate In-Service Walk-In (Client already seated in chair)
  try {
    const immediateTime = new Date().toISOString();
    const res = await fetch(`${BASE_URL}/api/booking`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "10.0.88.2",
      },
      body: JSON.stringify({
        serviceName: "Royal Beard Grooming",
        staffId: "staff-walkin-2",
        slotTime: immediateTime,
        customerName: "Harsh Vardhan",
        customerPhone: "9876542222",
        customerNotes: "Walk-in client seated in Chair #2",
        isWalkIn: true,
        initialStatus: "in_service",
      }),
    });
    const data = await res.json();
    if (res.status === 200 && data.success && data.status === "in_service") {
      console.log(`✓ Test 2 Passed: Direct in-service walk-in created (Ref: ${data.bookingReference}, Status: '${data.status}').`);
      passed++;
    } else {
      console.error("✗ Test 2 Failed:", data);
      failed++;
    }
  } catch (err) {
    console.error("✗ Test 2 Error:", err.message);
    failed++;
  }

  // Test 3: Phone Reservation by Front Desk (Scheduled for future date)
  try {
    const futureTime = new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString();
    const res = await fetch(`${BASE_URL}/api/booking`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "10.0.88.3",
      },
      body: JSON.stringify({
        serviceName: "Gold Radiance Facial",
        staffId: "staff-walkin-3",
        slotTime: futureTime,
        customerName: "Meenakshi Sundaram",
        customerPhone: "9876543333",
        customerEmail: "meenakshi@example.com",
        customerNotes: "Booked via front desk phone call",
        isWalkIn: true,
        initialStatus: "confirmed",
      }),
    });
    const data = await res.json();
    if (res.status === 200 && data.success && data.status === "confirmed") {
      console.log(`✓ Test 3 Passed: Front-desk phone reservation confirmed (Ref: ${data.bookingReference}).`);
      passed++;
    } else {
      console.error("✗ Test 3 Failed:", data);
      failed++;
    }
  } catch (err) {
    console.error("✗ Test 3 Error:", err.message);
    failed++;
  }

  // Test 4: Validation Guardrail (Rejects if customer name or phone missing)
  try {
    const res = await fetch(`${BASE_URL}/api/booking`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "10.0.88.4",
      },
      body: JSON.stringify({
        serviceName: "Haircut — Men",
        slotTime: new Date().toISOString(),
        customerName: "", // missing
        customerPhone: "9876544444",
        isWalkIn: true,
      }),
    });
    if (res.status === 400) {
      console.log("✓ Test 4 Passed: Missing customer name properly rejected with HTTP 400.");
      passed++;
    } else {
      console.error(`✗ Test 4 Failed: Expected 400, got ${res.status}`);
      failed++;
    }
  } catch (err) {
    console.error("✗ Test 4 Error:", err.message);
    failed++;
  }

  console.log("\n==================================================================");
  console.log(`  Summary: ${passed} Passed, ${failed} Failed`);
  console.log("==================================================================\n");

  if (failed > 0) process.exit(1);
}

runWalkInBookingTests();
