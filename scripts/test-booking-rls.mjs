import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Load .env.local if not already in process.env
if (!process.env.NEXT_PUBLIC_SUPABASE_URL && fs.existsSync(".env.local")) {
  const envContent = fs.readFileSync(".env.local", "utf8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const [key, ...rest] = trimmed.split("=");
      const val = rest.join("=").replace(/^["']|["']$/g, "").trim();
      process.env[key.trim()] = val;
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runBookingRlsTests() {
  console.log("=== V2-06 VERIFICATION: TESTING BOOKING TABLES ROW LEVEL SECURITY ===");
  let failed = false;

  // 1. Try reading appointments directly as unauthenticated client (must return 0 rows or error)
  const { data: appts, error: apptErr } = await supabase.from("appointments").select("*");
  if (appts && appts.length > 0) {
    console.error("❌ LEAK: Unauthenticated client read appointments rows!", appts.length);
    failed = true;
  } else {
    console.log("✅ BLOCKED: appointments returns 0 rows (or error) to unauthenticated caller:", apptErr ? apptErr.message : "0 rows returned");
  }

  // 2. Try reading notification_jobs (outbox must be completely private)
  const { data: outbox, error: outboxErr } = await supabase.from("notification_jobs").select("*");
  if (outbox && outbox.length > 0) {
    console.error("❌ LEAK: Unauthenticated client read notification_jobs outbox rows!", outbox.length);
    failed = true;
  } else {
    console.log("✅ BLOCKED: notification_jobs returns 0 rows to unauthenticated caller:", outboxErr ? outboxErr.message : "0 rows returned");
  }

  // 3. Try reading appointment_events (audit trail must be private)
  const { data: events, error: eventErr } = await supabase.from("appointment_events").select("*");
  if (events && events.length > 0) {
    console.error("❌ LEAK: Unauthenticated client read appointment_events rows!", events.length);
    failed = true;
  } else {
    console.log("✅ BLOCKED: appointment_events returns 0 rows to unauthenticated caller:", eventErr ? eventErr.message : "0 rows returned");
  }

  // 4. Try reading customers (must be private)
  const { data: customers, error: custErr } = await supabase.from("customers").select("*");
  if (customers && customers.length > 0) {
    console.error("❌ LEAK: Unauthenticated client read customers rows!", customers.length);
    failed = true;
  } else {
    console.log("✅ BLOCKED: customers returns 0 rows to unauthenticated caller:", custErr ? custErr.message : "0 rows returned");
  }

  // 5. Try inserting into appointments directly bypassing server API (must be blocked)
  const { error: insertErr } = await supabase.from("appointments").insert({
    booking_reference: "TEST-LEAK-9999",
    customer_id: "00000000-0000-0000-0000-000000000000",
    staff_id: "00000000-0000-0000-0000-000000000000",
    starts_at: new Date().toISOString(),
    ends_at: new Date(Date.now() + 30 * 60000).toISOString(),
    status: "confirmed",
  });
  if (!insertErr) {
    console.error("❌ LEAK: Direct unauthenticated INSERT into appointments succeeded!");
    failed = true;
  } else {
    console.log("✅ BLOCKED: Direct unauthenticated INSERT into appointments prevented:", insertErr.message);
  }

  // 6. Check active staff visibility (must be readable for booking UI)
  const { data: staffList, error: staffErr } = await supabase.from("staff").select("id, display_name, role").eq("is_active", true);
  if (staffErr) {
    console.log("ℹ️ Staff table note:", staffErr.message);
  } else {
    console.log(`✅ READABLE: Active staff public query returned ${staffList?.length || 0} active specialists`);
  }

  console.log("=====================================================================");
  if (failed) {
    console.error("❌ SOME BOOKING RLS CHECKS FAILED! Check Supabase SQL Editor and apply sql/v2-03-booking-rls-policies.sql.");
    process.exit(1);
  } else {
    console.log("🎉 ALL BOOKING RLS SECURITY POLICIES VERIFIED SAFELY.");
  }
}

runBookingRlsTests().catch((err) => {
  console.error("Unexpected test error:", err);
  process.exit(1);
});
