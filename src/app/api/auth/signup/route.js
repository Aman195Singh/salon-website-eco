import { NextResponse } from "next/server";

/**
 * POST /api/auth/signup
 * Placeholder signup endpoint.
 * TODO: Replace with Supabase Auth in Phase 4.
 * Important: Signup does NOT grant owner access. The account must be
 * manually approved by setting role='owner' in the profiles table.
 */
export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    // TODO: Integrate Supabase Auth — create user with role='user' (NOT 'owner')
    // For now, return success to demonstrate the flow
    console.log("[Signup Request]", { name, email, date: new Date().toISOString() });

    return NextResponse.json({
      success: true,
      message: "Account request submitted. Awaiting owner approval.",
    });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
