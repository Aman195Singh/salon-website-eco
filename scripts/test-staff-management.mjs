/**
 * V2 Automated Staff Working Hours & Shift Management Test
 * Task: V2-18 (Authorizing PRD: PRD-V2.md §2.3, §5.1, §5.2)
 *
 * Verifies:
 * 1. Fetching staff directory with working hours, breaks, and time-off.
 * 2. Creating a new specialist profile.
 * 3. Updating weekly shifts and lunch break windows.
 * 4. Scheduling planned time-off / leave.
 * 5. Deleting scheduled time-off.
 */

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

async function runStaffManagementTests() {
  console.log("==================================================================");
  console.log("  V2 Staff Working Hours & Shift Management Test Suite");
  console.log("==================================================================\n");

  let passed = 0;
  let failed = 0;

  let createdStaffId = null;
  let createdLeaveId = null;

  // Test 1: Fetch Staff Directory
  try {
    const res = await fetch(`${BASE_URL}/api/staff`);
    const data = await res.json();
    if (res.status === 200 && data.success && Array.isArray(data.staff) && data.staff.length >= 3) {
      console.log(`✓ Test 1 Passed: Successfully loaded ${data.staff.length} salon specialists.`);
      console.log(`  First Specialist: ${data.staff[0].display_name} (${data.staff[0].role})`);
      passed++;
    } else {
      console.error("✗ Test 1 Failed:", data);
      failed++;
    }
  } catch (err) {
    console.error("✗ Test 1 Error:", err.message);
    failed++;
  }

  // Test 2: Add New Specialist
  try {
    const res = await fetch(`${BASE_URL}/api/staff`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: "Karan Mehra",
        fullName: "Karan Mehra",
        role: "senior_stylist",
        phone: "9811223344",
        email: "karan@example.com",
        bio: "Specialist in modern texture cuts and beard artistry.",
        isActive: true,
      }),
    });
    const data = await res.json();
    if (res.status === 200 && data.success && data.staffMember?.id) {
      createdStaffId = data.staffMember.id;
      console.log(`✓ Test 2 Passed: Added specialist '${data.staffMember.display_name}' (ID: ${createdStaffId}).`);
      passed++;
    } else {
      console.error("✗ Test 2 Failed:", data);
      failed++;
    }
  } catch (err) {
    console.error("✗ Test 2 Error:", err.message);
    failed++;
  }

  // Test 3: Update Weekly Shifts & Lunch Breaks
  try {
    const targetStaffId = createdStaffId || "staff-1";
    const res = await fetch(`${BASE_URL}/api/staff/schedule`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        staffId: targetStaffId,
        workingHours: [
          { day_of_week: 1, start_time: "09:30", end_time: "19:30", is_active: true },
          { day_of_week: 2, start_time: "09:30", end_time: "19:30", is_active: true },
          { day_of_week: 3, start_time: "09:30", end_time: "19:30", is_active: true },
          { day_of_week: 4, start_time: "09:30", end_time: "19:30", is_active: true },
          { day_of_week: 5, start_time: "09:30", end_time: "19:30", is_active: true },
          { day_of_week: 6, start_time: "10:00", end_time: "21:00", is_active: true },
          { day_of_week: 0, start_time: "11:00", end_time: "17:00", is_active: false },
        ],
        breaks: [
          { day_of_week: 1, start_time: "13:30", end_time: "14:30", label: "Lunch Break" },
          { day_of_week: 2, start_time: "13:30", end_time: "14:30", label: "Lunch Break" },
          { day_of_week: 3, start_time: "13:30", end_time: "14:30", label: "Lunch Break" },
          { day_of_week: 4, start_time: "13:30", end_time: "14:30", label: "Lunch Break" },
          { day_of_week: 5, start_time: "13:30", end_time: "14:30", label: "Lunch Break" },
          { day_of_week: 6, start_time: "14:00", end_time: "15:00", label: "Lunch Break" },
        ],
      }),
    });
    const data = await res.json();
    if (res.status === 200 && data.success) {
      console.log(`✓ Test 3 Passed: Updated 7-day shifts & lunch breaks for staff '${targetStaffId}'.`);
      passed++;
    } else {
      console.error("✗ Test 3 Failed:", data);
      failed++;
    }
  } catch (err) {
    console.error("✗ Test 3 Error:", err.message);
    failed++;
  }

  // Test 4: Schedule Planned Leave / Absence
  try {
    const targetStaffId = createdStaffId || "staff-1";
    const startsAt = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();
    const endsAt = new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString();

    const res = await fetch(`${BASE_URL}/api/staff/time-off`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        staffId: targetStaffId,
        startsAt,
        endsAt,
        reason: "Professional Hair Styling Workshop",
      }),
    });
    const data = await res.json();
    if (res.status === 200 && data.success && data.timeOff?.id) {
      createdLeaveId = data.timeOff.id;
      console.log(`✓ Test 4 Passed: Scheduled time-off (ID: ${createdLeaveId}) for '${targetStaffId}'.`);
      passed++;
    } else {
      console.error("✗ Test 4 Failed:", data);
      failed++;
    }
  } catch (err) {
    console.error("✗ Test 4 Error:", err.message);
    failed++;
  }

  // Test 5: Delete / Remove Scheduled Leave
  try {
    const res = await fetch(`${BASE_URL}/api/staff/time-off?id=${createdLeaveId}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (res.status === 200 && data.success) {
      console.log(`✓ Test 5 Passed: Successfully removed scheduled time-off.`);
      passed++;
    } else {
      console.error("✗ Test 5 Failed:", data);
      failed++;
    }
  } catch (err) {
    console.error("✗ Test 5 Error:", err.message);
    failed++;
  }

  console.log("\n==================================================================");
  console.log(`  Summary: ${passed} Passed, ${failed} Failed`);
  console.log("==================================================================\n");

  if (failed > 0) process.exit(1);
}

runStaffManagementTests();
