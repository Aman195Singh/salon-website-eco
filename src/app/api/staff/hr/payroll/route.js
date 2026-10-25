import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

// In-memory fallback payroll storage for dev
let dynamicPayroll = [
  {
    id: "pay-1",
    staff_id: "staff-1",
    pay_period: "2026-10",
    base_salary_paise: 2500000, // ₹25,000
    commission_paise: 675000,   // ₹6,750 (15% on ₹45,000 services)
    bonus_paise: 150000,        // ₹1,500 festive bonus
    deductions_paise: 0,
    net_payout_paise: 3325000,  // ₹33,250
    services_count: 42,
    payment_status: "paid",
    payment_date: "2026-10-25T10:00:00.000Z",
    payment_method: "bank_transfer",
    notes: "Top performer of the month. Festive bonus included.",
  },
  {
    id: "pay-2",
    staff_id: "staff-2",
    pay_period: "2026-10",
    base_salary_paise: 2200000, // ₹22,000
    commission_paise: 480000,   // ₹4,800 (12% on ₹40,000 services)
    bonus_paise: 0,
    deductions_paise: 50000,    // ₹500 uniform deduction
    net_payout_paise: 2630000,  // ₹26,300
    services_count: 31,
    payment_status: "pending",
    payment_date: null,
    payment_method: "upi",
    notes: "Aesthetician skin treatments revenue.",
  },
  {
    id: "pay-3",
    staff_id: "staff-3",
    pay_period: "2026-10",
    base_salary_paise: 2000000, // ₹20,000
    commission_paise: 350000,   // ₹3,500 (10% on ₹35,000 services)
    bonus_paise: 50000,         // ₹500 client rating bonus
    deductions_paise: 0,
    net_payout_paise: 2400000,  // ₹24,000
    services_count: 28,
    payment_status: "pending",
    payment_date: null,
    payment_method: "bank_transfer",
    notes: "Men's grooming and beard spa.",
  },
];

/**
 * GET /api/staff/hr/payroll?month=YYYY-MM
 * Calculates and returns monthly salary + commission payout breakdown for staff
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetMonth = searchParams.get("month") || new Date().toISOString().substring(0, 7);

    try {
      const { data, error } = await supabaseServer
        .from("staff_payroll")
        .select(`
          id,
          staff_id,
          pay_period,
          base_salary_paise,
          commission_paise,
          bonus_paise,
          deductions_paise,
          net_payout_paise,
          services_count,
          payment_status,
          payment_date,
          payment_method,
          notes,
          staff (id, display_name, full_name, role)
        `)
        .eq("pay_period", targetMonth);

      if (!error && Array.isArray(data) && data.length > 0) {
        return NextResponse.json({ success: true, payPeriod: targetMonth, records: data });
      }
    } catch (dbErr) {
      console.warn("[Payroll DB Note]", dbErr?.message);
    }

    const filtered = dynamicPayroll.filter((p) => p.pay_period === targetMonth);
    return NextResponse.json({
      success: true,
      payPeriod: targetMonth,
      records: filtered.length > 0 ? filtered : dynamicPayroll,
    });
  } catch (error) {
    console.error("[Payroll GET Error]", error);
    return NextResponse.json({ error: "Failed to fetch payroll records." }, { status: 500 });
  }
}

/**
 * POST /api/staff/hr/payroll
 * Creates or updates payroll payment status, bonus, deductions, and notes
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      staffId,
      payPeriod,
      baseSalaryPaise,
      commissionPaise,
      bonusPaise,
      deductionsPaise,
      paymentStatus,
      paymentMethod,
      notes,
    } = body;

    if (!staffId || !payPeriod) {
      return NextResponse.json({ error: "Staff ID and pay period (YYYY-MM) are required." }, { status: 400 });
    }

    const cleanBase = Math.max(0, parseInt(baseSalaryPaise, 10) || 0);
    const cleanComm = Math.max(0, parseInt(commissionPaise, 10) || 0);
    const cleanBonus = Math.max(0, parseInt(bonusPaise, 10) || 0);
    const cleanDed = Math.max(0, parseInt(deductionsPaise, 10) || 0);
    const netPayout = Math.max(0, cleanBase + cleanComm + cleanBonus - cleanDed);
    const cleanStatus = paymentStatus === "paid" ? "paid" : "pending";
    const paymentDate = cleanStatus === "paid" ? new Date().toISOString() : null;

    // 1. Supabase upsert
    try {
      const { error } = await supabaseServer
        .from("staff_payroll")
        .upsert(
          {
            staff_id: staffId,
            pay_period: payPeriod,
            base_salary_paise: cleanBase,
            commission_paise: cleanComm,
            bonus_paise: cleanBonus,
            deductions_paise: cleanDed,
            net_payout_paise: netPayout,
            payment_status: cleanStatus,
            payment_date: paymentDate,
            payment_method: paymentMethod || "bank_transfer",
            notes: notes?.trim() || "",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "staff_id,pay_period" }
        );

      if (error) {
        console.warn("[Payroll Upsert DB Note]", error.message);
      }
    } catch (dbErr) {
      console.warn("[Payroll Upsert Exception]", dbErr?.message);
    }

    // 2. In-memory update
    const idx = dynamicPayroll.findIndex(
      (p) => p.staff_id === staffId && p.pay_period === payPeriod
    );

    const record = {
      id: idx !== -1 ? dynamicPayroll[idx].id : `pay-${Date.now()}`,
      staff_id: staffId,
      pay_period: payPeriod,
      base_salary_paise: cleanBase,
      commission_paise: cleanComm,
      bonus_paise: cleanBonus,
      deductions_paise: cleanDed,
      net_payout_paise: netPayout,
      services_count: idx !== -1 ? dynamicPayroll[idx].services_count : 0,
      payment_status: cleanStatus,
      payment_date: paymentDate,
      payment_method: paymentMethod || "bank_transfer",
      notes: notes?.trim() || "",
    };

    if (idx !== -1) {
      dynamicPayroll[idx] = record;
    } else {
      dynamicPayroll.push(record);
    }

    return NextResponse.json({
      success: true,
      message: "Payroll record saved successfully.",
      record,
    });
  } catch (error) {
    console.error("[Payroll POST Error]", error);
    return NextResponse.json({ error: "Failed to save payroll record." }, { status: 500 });
  }
}
