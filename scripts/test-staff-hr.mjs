// Automated QA Test Suite for Staff HR, Attendance, Payroll, Recruitment & Exit Management
const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("==================================================================");
  console.log("   V2 SUITE: SALON STAFF HR, ATTENDANCE & PAYROLL VERIFICATION    ");
  console.log("==================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Test Staff Directory with HR Fields
  console.log("--- 1. Testing Staff Directory with HR Profiles ---");
  const staffRes = await fetch(`${BASE_URL}/api/staff`);
  const staffData = await staffRes.json();
  assert(staffData.success === true, "GET /api/staff returns success");
  assert(Array.isArray(staffData.staff) && staffData.staff.length > 0, "Staff array has members");
  const firstStaff = staffData.staff[0];
  assert(firstStaff.employment_status === "active", "First staff has employment_status = 'active'");
  assert(typeof firstStaff.base_salary_paise === "number" && firstStaff.base_salary_paise > 0, "Staff has base_salary_paise");
  assert(typeof firstStaff.commission_percentage === "number", "Staff has commission_percentage");

  // 2. Test Attendance System
  console.log("\n--- 2. Testing Daily Attendance System ---");
  const today = new Date().toISOString().split("T")[0];
  const markRes = await fetch(`${BASE_URL}/api/staff/hr/attendance`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      staffId: firstStaff.id,
      workDate: today,
      status: "present",
      checkInTime: "09:50",
      checkOutTime: "20:00",
      notes: "Arrived early for VIP client booking",
    }),
  });
  const markData = await markRes.json();
  assert(markData.success === true, "POST /api/staff/hr/attendance records present status");
  assert(markData.record?.status === "present", "Record status verified as 'present'");

  const getAttRes = await fetch(`${BASE_URL}/api/staff/hr/attendance?date=${today}`);
  const getAttData = await getAttRes.json();
  assert(getAttData.success === true, "GET /api/staff/hr/attendance returns records for today");
  assert(getAttData.records?.some((r) => r.staff_id === firstStaff.id), "Attendance list includes marked staff");

  // 3. Test Payroll & Commission Calculation
  console.log("\n--- 3. Testing Salary, Commission & Payroll System ---");
  const currentMonth = new Date().toISOString().substring(0, 7);
  const payRes = await fetch(`${BASE_URL}/api/staff/hr/payroll?month=${currentMonth}`);
  const payData = await payRes.json();
  assert(payData.success === true, "GET /api/staff/hr/payroll returns records");
  assert(payData.records?.length > 0, "Payroll records present for current month");

  const savePayRes = await fetch(`${BASE_URL}/api/staff/hr/payroll`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      staffId: firstStaff.id,
      payPeriod: currentMonth,
      baseSalaryPaise: 2500000,
      commissionPaise: 500000,
      bonusPaise: 200000,
      deductionsPaise: 0,
      paymentStatus: "paid",
      paymentMethod: "bank_transfer",
      notes: "Diwali festival bonus added",
    }),
  });
  const savePayData = await savePayRes.json();
  assert(savePayData.success === true, "POST /api/staff/hr/payroll updates payment to paid");
  assert(savePayData.record?.net_payout_paise === 3200000, "Net payout correctly calculated (25k + 5k + 2k = 32k)");

  // 4. Test Recruitment Pipeline
  console.log("\n--- 4. Testing Hiring & Recruitment Pipeline ---");
  const addCandRes = await fetch(`${BASE_URL}/api/staff/hr/recruitment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: "Pooja Hegde",
      phone: "9876540099",
      email: "pooja.stylist@example.com",
      roleApplied: "Creative Color Specialist",
      experienceYears: 4.5,
      expectedSalaryPaise: 2600000,
      status: "applied",
      notes: "Experienced in balayage and highlights",
    }),
  });
  const addCandData = await addCandRes.json();
  assert(addCandData.success === true, "POST /api/staff/hr/recruitment creates candidate");
  const candId = addCandData.candidate?.id;

  const moveCandRes = await fetch(`${BASE_URL}/api/staff/hr/recruitment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: candId,
      fullName: "Pooja Hegde",
      phone: "9876540099",
      status: "interviewing",
      interviewDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      notes: "Trade test scheduled",
    }),
  });
  const moveCandData = await moveCandRes.json();
  assert(moveCandData.success === true, "Candidate stage moved to 'interviewing'");

  const delCandRes = await fetch(`${BASE_URL}/api/staff/hr/recruitment?id=${candId}`, { method: "DELETE" });
  const delCandData = await delCandRes.json();
  assert(delCandData.success === true, "DELETE /api/staff/hr/recruitment archives candidate");

  // 5. Test Staff Exit / Resignation / Termination
  console.log("\n--- 5. Testing Exit & Attrition Management ---");
  const exitRes = await fetch(`${BASE_URL}/api/staff/hr/exit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      staffId: "staff-3",
      exitType: "resigned",
      exitDate: today,
      exitReason: "Relocating to another city",
      exitNotes: "Scissors and salon apron returned in good condition",
    }),
  });
  const exitData = await exitRes.json();
  assert(exitData.success === true, "POST /api/staff/hr/exit processes resignation");
  assert(exitData.exitDetails?.employment_status === "resigned", "Exit status confirmed as 'resigned'");

  console.log("\n==================================================================");
  console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
