import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

/**
 * POST /api/enquiry
 * Accepts contact form submissions from the public Contact page.
 * Saves to the Supabase 'enquiries' table.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, phone, email, message } = body;

    // Server-side validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }
    if ((!phone || phone.trim().length === 0) && (!email || email.trim().length === 0)) {
      return NextResponse.json({ error: "Please provide a phone number or email." }, { status: 400 });
    }
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email format." }, { status: 400 });
    }
    // Limit lengths
    if (name.length > 200 || (phone && phone.length > 30) || (email && email.length > 200) || message.length > 5000) {
      return NextResponse.json({ error: "Input too long." }, { status: 400 });
    }

    // Save to Supabase
    const { error } = await supabaseServer.from("enquiries").insert({
      name: name.trim(),
      phone: phone?.trim() || null,
      email: email?.trim() || null,
      message: message.trim(),
      status: "New",
    });

    if (error) {
      console.error("[Enquiry Error]", error);
      return NextResponse.json({ error: "Failed to save enquiry." }, { status: 500 });
    }

    // Also log as analytics event
    await supabaseServer.from("analytics_events").insert({
      event_type: "enquiry_submit",
      page_path: "/contact",
    });

    return NextResponse.json({ success: true, message: "Enquiry submitted successfully." });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
