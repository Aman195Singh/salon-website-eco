import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

// In-memory fallback recruitment pipeline for dev
let dynamicRecruitment = [
  {
    id: "rec-1",
    full_name: "Kavita Verma",
    phone: "9876500010",
    email: "kavita.hair@example.com",
    role_applied: "Senior Stylist",
    experience_years: 6.5,
    expected_salary_paise: 2800000, // ₹28,000
    status: "interviewing",
    interview_date: "2026-10-28T11:00:00.000Z",
    portfolio_link: "https://instagram.com/kavita_stylist_sample",
    notes: "Specializes in creative color & bridal updos. Trade test scheduled for Tuesday.",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "rec-2",
    full_name: "Rahul Joshi",
    phone: "9876500011",
    email: "rahul.barber@example.com",
    role_applied: "Barber & Stylist",
    experience_years: 3.0,
    expected_salary_paise: 2000000, // ₹20,000
    status: "offered",
    interview_date: "2026-10-24T14:00:00.000Z",
    portfolio_link: "https://instagram.com/rahul_barber_sample",
    notes: "Passed hair cut test with 9/10. Offer letter sent for ₹20k + 10% commission.",
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "rec-3",
    full_name: "Sneha Nair",
    phone: "9876500012",
    email: "sneha.nails@example.com",
    role_applied: "Nail Artist & Esthetician",
    experience_years: 2.5,
    expected_salary_paise: 1800000, // ₹18,000
    status: "applied",
    interview_date: null,
    portfolio_link: "https://instagram.com/sneha_nailcraft_sample",
    notes: "Strong gel extension and nail art portfolio. Needs initial phone screening.",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

/**
 * GET /api/staff/hr/recruitment
 * Returns the hiring & applicant pipeline
 */
export async function GET() {
  try {
    try {
      const { data, error } = await supabaseServer
        .from("staff_recruitment")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        return NextResponse.json({ success: true, candidates: data });
      }
    } catch (dbErr) {
      console.warn("[Recruitment DB Note]", dbErr?.message);
    }

    return NextResponse.json({ success: true, candidates: dynamicRecruitment });
  } catch (error) {
    console.error("[Recruitment GET Error]", error);
    return NextResponse.json({ error: "Failed to fetch candidate pipeline." }, { status: 500 });
  }
}

/**
 * POST /api/staff/hr/recruitment
 * Creates or updates an applicant's stage, interview schedule, and evaluation notes
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      id,
      fullName,
      phone,
      email,
      roleApplied,
      experienceYears,
      expectedSalaryPaise,
      status,
      interviewDate,
      portfolioLink,
      notes,
    } = body;

    if (!fullName || !phone) {
      return NextResponse.json({ error: "Candidate full name and phone number are required." }, { status: 400 });
    }

    const cleanName = fullName.trim();
    const cleanPhone = phone.trim();
    const cleanStatus = status || "applied";
    const cleanRole = roleApplied?.trim() || "Stylist";
    const cleanExp = Math.max(0, parseFloat(experienceYears) || 0);
    const cleanSalary = Math.max(0, parseInt(expectedSalaryPaise, 10) || 0);

    // 1. Supabase update or insert
    if (id) {
      try {
        await supabaseServer
          .from("staff_recruitment")
          .update({
            full_name: cleanName,
            phone: cleanPhone,
            email: email?.trim().toLowerCase() || "",
            role_applied: cleanRole,
            experience_years: cleanExp,
            expected_salary_paise: cleanSalary,
            status: cleanStatus,
            interview_date: interviewDate || null,
            portfolio_link: portfolioLink?.trim() || "",
            notes: notes?.trim() || "",
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);
      } catch (dbErr) {
        console.warn("[Recruitment Update DB Note]", dbErr?.message);
      }

      const idx = dynamicRecruitment.findIndex((r) => r.id === id);
      if (idx !== -1) {
        dynamicRecruitment[idx] = {
          ...dynamicRecruitment[idx],
          full_name: cleanName,
          phone: cleanPhone,
          email: email?.trim().toLowerCase() || "",
          role_applied: cleanRole,
          experience_years: cleanExp,
          expected_salary_paise: cleanSalary,
          status: cleanStatus,
          interview_date: interviewDate || null,
          portfolio_link: portfolioLink?.trim() || "",
          notes: notes?.trim() || "",
        };
        return NextResponse.json({
          success: true,
          message: "Candidate updated successfully.",
          candidate: dynamicRecruitment[idx],
        });
      }
    }

    // New candidate insert
    const newId = `rec-${Date.now()}`;
    const newRecord = {
      id: newId,
      full_name: cleanName,
      phone: cleanPhone,
      email: email?.trim().toLowerCase() || "",
      role_applied: cleanRole,
      experience_years: cleanExp,
      expected_salary_paise: cleanSalary,
      status: cleanStatus,
      interview_date: interviewDate || null,
      portfolio_link: portfolioLink?.trim() || "",
      notes: notes?.trim() || "",
      created_at: new Date().toISOString(),
    };

    try {
      await supabaseServer.from("staff_recruitment").insert(newRecord);
    } catch (dbErr) {
      console.warn("[Recruitment Insert DB Note]", dbErr?.message);
    }

    dynamicRecruitment.unshift(newRecord);

    return NextResponse.json({
      success: true,
      message: "Candidate added to recruitment pipeline.",
      candidate: newRecord,
    });
  } catch (error) {
    console.error("[Recruitment POST Error]", error);
    return NextResponse.json({ error: "Failed to process candidate application." }, { status: 500 });
  }
}

/**
 * DELETE /api/staff/hr/recruitment?id=...
 * Archives/removes a candidate from the recruitment pipeline
 */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Candidate ID is required." }, { status: 400 });
    }

    try {
      await supabaseServer.from("staff_recruitment").delete().eq("id", id);
    } catch (dbErr) {
      console.warn("[Recruitment Delete DB Note]", dbErr?.message);
    }

    dynamicRecruitment = dynamicRecruitment.filter((r) => r.id !== id);

    return NextResponse.json({ success: true, message: "Candidate removed from pipeline." });
  } catch (error) {
    console.error("[Recruitment DELETE Error]", error);
    return NextResponse.json({ error: "Failed to delete candidate." }, { status: 500 });
  }
}
