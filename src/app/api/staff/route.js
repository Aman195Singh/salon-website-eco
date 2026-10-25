import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

// Sample fallback staff for instant preview before database migrations
const SAMPLE_STAFF = [
  {
    id: "staff-1",
    display_name: "Priya Sharma",
    full_name: "Priya Sharma",
    role: "senior_stylist",
    title: "Master Hair & Color Specialist",
    phone: "9876543210",
    email: "priya@example.com",
    bio: "Over 8 years experience in precision hair craft, balayage, and restorative therapies.",
    is_active: true,
    display_order: 1,
    employment_status: "active",
    joining_date: "2024-03-15",
    base_salary_paise: 2500000, // ₹25,000
    commission_percentage: 15.0,
    salary_type: "base_plus_commission",
    specializations: ["Balayage", "Keratin", "Precision Cuts"],
    emergency_contact_name: "Ramesh Sharma (Spouse)",
    emergency_contact_phone: "9876500001",
    id_proof_type: "Aadhaar",
    id_proof_number: "XXXX-XXXX-8901",
    working_hours: [
      { day_of_week: 1, start_time: "10:00", end_time: "20:00", is_active: true }, // Mon
      { day_of_week: 2, start_time: "10:00", end_time: "20:00", is_active: true }, // Tue
      { day_of_week: 3, start_time: "10:00", end_time: "20:00", is_active: true }, // Wed
      { day_of_week: 4, start_time: "10:00", end_time: "20:00", is_active: true }, // Thu
      { day_of_week: 5, start_time: "10:00", end_time: "20:00", is_active: true }, // Fri
      { day_of_week: 6, start_time: "10:00", end_time: "20:00", is_active: true }, // Sat
      { day_of_week: 0, start_time: "11:00", end_time: "18:00", is_active: false }, // Sun (Off)
    ],
    breaks: [
      { day_of_week: 1, start_time: "13:00", end_time: "14:00", label: "Lunch Break" },
      { day_of_week: 2, start_time: "13:00", end_time: "14:00", label: "Lunch Break" },
      { day_of_week: 3, start_time: "13:00", end_time: "14:00", label: "Lunch Break" },
      { day_of_week: 4, start_time: "13:00", end_time: "14:00", label: "Lunch Break" },
      { day_of_week: 5, start_time: "13:00", end_time: "14:00", label: "Lunch Break" },
      { day_of_week: 6, start_time: "13:00", end_time: "14:00", label: "Lunch Break" },
    ],
    time_off: [
      {
        id: "leave-sample-1",
        starts_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        ends_at: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
        reason: "Personal Leave",
      },
    ],
  },
  {
    id: "staff-2",
    display_name: "Ananya Patel",
    full_name: "Ananya Patel",
    role: "stylist",
    title: "Skin & Spa Aesthetician",
    phone: "9876543211",
    email: "ananya@example.com",
    bio: "Certified dermal aesthetician specializing in luxury facials, micro-treatments, and bridal glow.",
    is_active: true,
    display_order: 2,
    employment_status: "active",
    joining_date: "2024-06-01",
    base_salary_paise: 2200000, // ₹22,000
    commission_percentage: 12.0,
    salary_type: "base_plus_commission",
    specializations: ["Hydra Facial", "Bridal Glow", "Skin Therapy"],
    emergency_contact_name: "Meena Patel (Mother)",
    emergency_contact_phone: "9876500002",
    id_proof_type: "PAN Card",
    id_proof_number: "ABCDE1234F",
    working_hours: [
      { day_of_week: 1, start_time: "10:00", end_time: "19:00", is_active: false }, // Mon (Off)
      { day_of_week: 2, start_time: "10:00", end_time: "19:00", is_active: true },
      { day_of_week: 3, start_time: "10:00", end_time: "19:00", is_active: true },
      { day_of_week: 4, start_time: "10:00", end_time: "19:00", is_active: true },
      { day_of_week: 5, start_time: "10:00", end_time: "19:00", is_active: true },
      { day_of_week: 6, start_time: "10:00", end_time: "19:00", is_active: true },
      { day_of_week: 0, start_time: "11:00", end_time: "18:00", is_active: true },
    ],
    breaks: [
      { day_of_week: 2, start_time: "13:30", end_time: "14:30", label: "Lunch Break" },
      { day_of_week: 3, start_time: "13:30", end_time: "14:30", label: "Lunch Break" },
      { day_of_week: 4, start_time: "13:30", end_time: "14:30", label: "Lunch Break" },
      { day_of_week: 5, start_time: "13:30", end_time: "14:30", label: "Lunch Break" },
      { day_of_week: 6, start_time: "13:30", end_time: "14:30", label: "Lunch Break" },
    ],
    time_off: [],
  },
  {
    id: "staff-3",
    display_name: "Vikram Malhotra",
    full_name: "Vikram Malhotra",
    role: "stylist",
    title: "Senior Barber & Stylist",
    phone: "9876543212",
    email: "vikram@example.com",
    bio: "Expert in bespoke men's grooming, classic fades, and luxury beard treatments.",
    is_active: true,
    display_order: 3,
    employment_status: "active",
    joining_date: "2024-08-10",
    base_salary_paise: 2000000, // ₹20,000
    commission_percentage: 10.0,
    salary_type: "base_plus_commission",
    specializations: ["Beard Sculpting", "Classic Fades", "Hot Towel Shave"],
    emergency_contact_name: "Karan Malhotra (Brother)",
    emergency_contact_phone: "9876500003",
    id_proof_type: "Aadhaar",
    id_proof_number: "XXXX-XXXX-4567",
    working_hours: [
      { day_of_week: 1, start_time: "11:00", end_time: "20:00", is_active: true },
      { day_of_week: 2, start_time: "11:00", end_time: "20:00", is_active: true },
      { day_of_week: 3, start_time: "11:00", end_time: "20:00", is_active: false }, // Wed (Off)
      { day_of_week: 4, start_time: "11:00", end_time: "20:00", is_active: true },
      { day_of_week: 5, start_time: "11:00", end_time: "20:00", is_active: true },
      { day_of_week: 6, start_time: "11:00", end_time: "20:00", is_active: true },
      { day_of_week: 0, start_time: "11:00", end_time: "18:00", is_active: true },
    ],
    breaks: [
      { day_of_week: 1, start_time: "14:00", end_time: "15:00", label: "Lunch Break" },
      { day_of_week: 2, start_time: "14:00", end_time: "15:00", label: "Lunch Break" },
      { day_of_week: 4, start_time: "14:00", end_time: "15:00", label: "Lunch Break" },
      { day_of_week: 5, start_time: "14:00", end_time: "15:00", label: "Lunch Break" },
      { day_of_week: 6, start_time: "14:00", end_time: "15:00", label: "Lunch Break" },
    ],
    time_off: [],
  },
];

// In-memory staff storage for active mutations in dev
let dynamicStaff = [...SAMPLE_STAFF];

/**
 * GET /api/staff
 * Returns all staff specialists with working hours, breaks, and time-off
 */
export async function GET() {
  try {
    // 1. Try Supabase query
    try {
      const { data: dbStaff, error: staffErr } = await supabaseServer
        .from("staff")
        .select(`
          id,
          display_name,
          full_name,
          role,
          bio,
          phone,
          email,
          avatar_url,
          is_active,
          display_order,
          employment_status,
          joining_date,
          exit_date,
          exit_reason,
          exit_notes,
          base_salary_paise,
          commission_percentage,
          salary_type,
          emergency_contact_name,
          emergency_contact_phone,
          id_proof_type,
          id_proof_number,
          specializations,
          notes,
          staff_working_hours (id, day_of_week, start_time, end_time, is_active),
          staff_breaks (id, day_of_week, start_time, end_time, label),
          staff_time_off (id, starts_at, ends_at, reason)
        `)
        .order("display_order", { ascending: true });

      if (!staffErr && Array.isArray(dbStaff) && dbStaff.length > 0) {
        const mapped = dbStaff.map((s) => ({
          ...s,
          working_hours: s.staff_working_hours || [],
          breaks: s.staff_breaks || [],
          time_off: s.staff_time_off || [],
        }));
        return NextResponse.json({ success: true, staff: mapped });
      }
    } catch (err) {
      console.warn("[Staff DB Note]", err?.message);
    }

    // 2. Return fallback/dynamic staff
    return NextResponse.json({ success: true, staff: dynamicStaff });
  } catch (error) {
    console.error("[Staff API GET Error]", error);
    return NextResponse.json({ error: "Failed to fetch staff directory." }, { status: 500 });
  }
}

/**
 * POST /api/staff
 * Creates or updates a staff member
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      id,
      displayName,
      fullName,
      role,
      phone,
      email,
      bio,
      isActive,
      employmentStatus,
      joiningDate,
      baseSalaryPaise,
      commissionPercentage,
      salaryType,
      emergencyContactName,
      emergencyContactPhone,
      idProofType,
      idProofNumber,
      specializations,
      notes,
    } = body;

    if (!displayName || typeof displayName !== "string" || displayName.trim().length === 0) {
      return NextResponse.json({ error: "Display name is required." }, { status: 400 });
    }

    const cleanDisplayName = displayName.trim();
    const cleanFullName = (fullName || cleanDisplayName).trim();
    const cleanRole = role || "stylist";
    const cleanPhone = phone?.trim() || "";
    const cleanEmail = email?.trim().toLowerCase() || "";
    const cleanBio = bio?.trim() || "";
    const cleanIsActive = isActive !== undefined ? Boolean(isActive) : true;
    const cleanEmploymentStatus = employmentStatus || "active";
    const cleanJoiningDate = joiningDate || new Date().toISOString().split("T")[0];
    const cleanBaseSalary = Math.max(0, parseInt(baseSalaryPaise, 10) || 0);
    const cleanCommission = Math.max(0, parseFloat(commissionPercentage) || 0.0);
    const cleanSalaryType = salaryType || "base_plus_commission";
    const cleanEmergencyName = emergencyContactName?.trim() || "";
    const cleanEmergencyPhone = emergencyContactPhone?.trim() || "";
    const cleanIdType = idProofType?.trim() || "";
    const cleanIdNumber = idProofNumber?.trim() || "";
    const cleanSpecs = Array.isArray(specializations) ? specializations : [];
    const cleanNotes = notes?.trim() || "";

    // Check if updating existing staff
    if (id) {
      try {
        await supabaseServer
          .from("staff")
          .update({
            display_name: cleanDisplayName,
            full_name: cleanFullName,
            role: cleanRole,
            phone: cleanPhone || null,
            email: cleanEmail || null,
            bio: cleanBio,
            is_active: cleanIsActive,
            employment_status: cleanEmploymentStatus,
            joining_date: cleanJoiningDate,
            base_salary_paise: cleanBaseSalary,
            commission_percentage: cleanCommission,
            salary_type: cleanSalaryType,
            emergency_contact_name: cleanEmergencyName,
            emergency_contact_phone: cleanEmergencyPhone,
            id_proof_type: cleanIdType,
            id_proof_number: cleanIdNumber,
            specializations: cleanSpecs,
            notes: cleanNotes,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);
      } catch (err) {
        console.warn("[Staff Update DB Note]", err?.message);
      }

      // Update in-memory
      const idx = dynamicStaff.findIndex((s) => s.id === id);
      if (idx !== -1) {
        dynamicStaff[idx] = {
          ...dynamicStaff[idx],
          display_name: cleanDisplayName,
          full_name: cleanFullName,
          role: cleanRole,
          phone: cleanPhone,
          email: cleanEmail,
          bio: cleanBio,
          is_active: cleanIsActive,
          employment_status: cleanEmploymentStatus,
          joining_date: cleanJoiningDate,
          base_salary_paise: cleanBaseSalary,
          commission_percentage: cleanCommission,
          salary_type: cleanSalaryType,
          emergency_contact_name: cleanEmergencyName,
          emergency_contact_phone: cleanEmergencyPhone,
          id_proof_type: cleanIdType,
          id_proof_number: cleanIdNumber,
          specializations: cleanSpecs,
          notes: cleanNotes,
        };
        return NextResponse.json({
          success: true,
          message: "Staff profile updated.",
          staffMember: dynamicStaff[idx],
        });
      }
    }

    // Create new staff
    const newId = `staff-${Date.now()}`;
    const defaultWorkingHours = [
      { day_of_week: 1, start_time: "10:00", end_time: "20:00", is_active: true },
      { day_of_week: 2, start_time: "10:00", end_time: "20:00", is_active: true },
      { day_of_week: 3, start_time: "10:00", end_time: "20:00", is_active: true },
      { day_of_week: 4, start_time: "10:00", end_time: "20:00", is_active: true },
      { day_of_week: 5, start_time: "10:00", end_time: "20:00", is_active: true },
      { day_of_week: 6, start_time: "10:00", end_time: "20:00", is_active: true },
      { day_of_week: 0, start_time: "11:00", end_time: "18:00", is_active: false },
    ];
    const defaultBreaks = [
      { day_of_week: 1, start_time: "13:00", end_time: "14:00", label: "Lunch Break" },
      { day_of_week: 2, start_time: "13:00", end_time: "14:00", label: "Lunch Break" },
      { day_of_week: 3, start_time: "13:00", end_time: "14:00", label: "Lunch Break" },
      { day_of_week: 4, start_time: "13:00", end_time: "14:00", label: "Lunch Break" },
      { day_of_week: 5, start_time: "13:00", end_time: "14:00", label: "Lunch Break" },
      { day_of_week: 6, start_time: "13:00", end_time: "14:00", label: "Lunch Break" },
    ];

    try {
      const { data: dbCreated, error: createErr } = await supabaseServer
        .from("staff")
        .insert({
          display_name: cleanDisplayName,
          full_name: cleanFullName,
          role: cleanRole,
          phone: cleanPhone || null,
          email: cleanEmail || null,
          bio: cleanBio,
          is_active: cleanIsActive,
          display_order: dynamicStaff.length + 1,
          employment_status: cleanEmploymentStatus,
          joining_date: cleanJoiningDate,
          base_salary_paise: cleanBaseSalary,
          commission_percentage: cleanCommission,
          salary_type: cleanSalaryType,
          emergency_contact_name: cleanEmergencyName,
          emergency_contact_phone: cleanEmergencyPhone,
          id_proof_type: cleanIdType,
          id_proof_number: cleanIdNumber,
          specializations: cleanSpecs,
          notes: cleanNotes,
        })
        .select("id")
        .maybeSingle();

      if (!createErr && dbCreated?.id) {
        // Insert default working hours
        for (const wh of defaultWorkingHours) {
          await supabaseServer.from("staff_working_hours").insert({
            staff_id: dbCreated.id,
            day_of_week: wh.day_of_week,
            start_time: wh.start_time,
            end_time: wh.end_time,
            is_active: wh.is_active,
          });
        }
      }
    } catch (err) {
      console.warn("[Staff Insert DB Note]", err?.message);
    }

    const newStaffMember = {
      id: newId,
      display_name: cleanDisplayName,
      full_name: cleanFullName,
      role: cleanRole,
      title: cleanRole === "senior_stylist" ? "Senior Specialist" : "Stylist",
      phone: cleanPhone,
      email: cleanEmail,
      bio: cleanBio,
      is_active: cleanIsActive,
      display_order: dynamicStaff.length + 1,
      employment_status: cleanEmploymentStatus,
      joining_date: cleanJoiningDate,
      base_salary_paise: cleanBaseSalary,
      commission_percentage: cleanCommission,
      salary_type: cleanSalaryType,
      emergency_contact_name: cleanEmergencyName,
      emergency_contact_phone: cleanEmergencyPhone,
      id_proof_type: cleanIdType,
      id_proof_number: cleanIdNumber,
      specializations: cleanSpecs,
      notes: cleanNotes,
      working_hours: defaultWorkingHours,
      breaks: defaultBreaks,
      time_off: [],
    };

    dynamicStaff.push(newStaffMember);

    return NextResponse.json({
      success: true,
      message: "Staff member added successfully.",
      staffMember: newStaffMember,
    });
  } catch (error) {
    console.error("[Staff API POST Error]", error);
    return NextResponse.json({ error: "Failed to save staff member." }, { status: 500 });
  }
}
