import { NextResponse } from "next/server";

/**
 * POST /api/auth/login
 * Placeholder login endpoint.
 * TODO: Replace with Supabase Auth in Phase 4.
 */
export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    // TODO: Integrate Supabase Auth
    // For now, return an error indicating auth is not yet configured
    return NextResponse.json(
      { error: "Authentication is not yet configured. Please set up Supabase first." },
      { status: 503 }
    );
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
