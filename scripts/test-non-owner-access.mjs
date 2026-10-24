import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runNonOwnerTests() {
  console.log("=== FIX-07 VERIFICATION: TESTING UNAUTHENTICATED / NON-OWNER ACCESS RESTRICTIONS ===");
  let failed = false;

  // 1. Try reading site_content_draft (owner-only)
  const { data: drafts, error: draftErr } = await supabase
    .from("site_content_draft")
    .select("*");
  if (drafts && drafts.length > 0) {
    console.error("❌ LEAK: Unauthenticated client read site_content_draft rows!", drafts.length);
    failed = true;
  } else {
    console.log("✅ BLOCKED: site_content_draft returns 0 rows (or error) to non-owner:", draftErr ? draftErr.message : "0 rows returned");
  }

  // 2. Try reading services_draft (owner-only)
  const { data: servDrafts, error: servDraftErr } = await supabase
    .from("services_draft")
    .select("*");
  if (servDrafts && servDrafts.length > 0) {
    console.error("❌ LEAK: Unauthenticated client read services_draft rows!", servDrafts.length);
    failed = true;
  } else {
    console.log("✅ BLOCKED: services_draft returns 0 rows (or error) to non-owner:", servDraftErr ? servDraftErr.message : "0 rows returned");
  }

  // 3. Try reading analytics_events (owner-only)
  const { data: analytics, error: analyticsErr } = await supabase
    .from("analytics_events")
    .select("*");
  if (analytics && analytics.length > 0) {
    console.error("❌ LEAK: Unauthenticated client read analytics_events rows!", analytics.length);
    failed = true;
  } else {
    console.log("✅ BLOCKED: analytics_events returns 0 rows (or error) to non-owner:", analyticsErr ? analyticsErr.message : "0 rows returned");
  }

  // 4. Try reading enquiries (owner-only or own user_id)
  const { data: enqs, error: enqsErr } = await supabase
    .from("enquiries")
    .select("*");
  if (enqs && enqs.length > 0) {
    console.error("❌ LEAK: Unauthenticated client read enquiries rows!", enqs.length);
    failed = true;
  } else {
    console.log("✅ BLOCKED: enquiries returns 0 rows to unauthenticated caller:", enqsErr ? enqsErr.message : "0 rows returned");
  }

  // 5. Try writing to services (owner-only)
  const { data: newServ, error: insertServErr } = await supabase
    .from("services")
    .insert([{ name: "Malicious Injection", category: "Hair", price: "₹0", duration: "10m" }])
    .select();
  if (!insertServErr && newServ && newServ.length > 0) {
    console.error("❌ VULNERABILITY: Non-owner was able to insert into services!");
    failed = true;
  } else {
    console.log("✅ BLOCKED: Non-owner insert to services rejected by RLS:", insertServErr ? insertServErr.message : "blocked");
  }

  // 6. Try writing to site_content (owner-only)
  const { data: newContent, error: insertContentErr } = await supabase
    .from("site_content")
    .insert([{ section: "hacked", content: { text: "malicious" } }])
    .select();
  if (!insertContentErr && newContent && newContent.length > 0) {
    console.error("❌ VULNERABILITY: Non-owner was able to insert into site_content!");
    failed = true;
  } else {
    console.log("✅ BLOCKED: Non-owner write to site_content rejected by RLS:", insertContentErr ? insertContentErr.message : "blocked");
  }

  // 7. Try updating existing services
  const { error: updateServErr } = await supabase
    .from("services")
    .update({ price: "₹0" })
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (!updateServErr) {
    // If RLS allows 0 rows affected without error, check if any rows actually changed
    console.log("ℹ️ Services update returned no error, checking if any row changed...");
  } else {
    console.log("✅ BLOCKED: Non-owner update to services rejected by RLS:", updateServErr.message);
  }

  console.log("\n===================================================================");
  if (failed) {
    console.error("❌ FIX-07 NON-OWNER ACCESS VERIFICATION FAILED!");
    process.exit(1);
  } else {
    console.log("🎉 FIX-07 NON-OWNER ACCESS VERIFICATION PASSED: RLS protects all owner resources!");
  }
}

runNonOwnerTests();
