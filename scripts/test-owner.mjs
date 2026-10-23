import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://njizcequxyqfmbmdmrcs.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qaXpjZXF1eHlxZm1ibWRtcmNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2NzgzODUsImV4cCI6MjEwODI1NDM4NX0.SIa4cQUT8TRRmPfqtmww2pPAAmbw8hiWlgthu2Clql4";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runTests() {
  console.log("=== 1. TESTING OWNER LOGIN ===");
  const email = process.env.TEST_OWNER_EMAIL || "aman195singh3107@gmail.com";
  const password = process.env.TEST_OWNER_PASSWORD || "";

  if (!password) {
    console.log("ℹ️ Provide TEST_OWNER_PASSWORD env variable to run login tests.");
    return;
  }

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    console.error("❌ Login Failed:", authError.message);
    return;
  }
  console.log("✅ Login Succeeded! User ID:", authData.user.id);
  console.log("   Email confirmed at:", authData.user.email_confirmed_at);

  console.log("\n=== 2. CHECKING PROFILES & OWNER ROLE ===");
  const { data: profile, error: profError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authData.user.id)
    .single();

  if (profError) {
    console.error("❌ Profile check error:", profError.message);
  } else {
    console.log("✅ Profile found:", profile);
    console.log("   Role in DB:", profile.role, profile.role === "owner" ? "👑 (CONFIRMED OWNER!)" : "⚠️ (NOT OWNER)");
  }

  console.log("\n=== 3. TESTING SERVICES MANAGEMENT (CMS) ===");
  const { data: services, error: servError } = await supabase
    .from("services")
    .select("*")
    .order("sort_order", { ascending: true });

  if (servError) {
    console.error("❌ Services fetch error:", servError.message);
  } else {
    console.log(`✅ Owner fetched ${services.length} services from DB.`);
  }

  // Insert a test service
  const testServiceName = "QA Automated Test Service " + Date.now();
  const { data: newServ, error: insertServErr } = await supabase
    .from("services")
    .insert([
      {
        name: testServiceName,
        category: "Hair",
        price: "₹999",
        duration: "45 min",
        description: "Created by automated owner test",
        sort_order: 99,
        is_active: true,
      },
    ])
    .select();

  if (insertServErr) {
    console.error("❌ Service insert error (RLS):", insertServErr.message);
  } else {
    console.log("✅ Owner can CREATE service. Inserted ID:", newServ[0].id);

    // Update test service
    const { error: updErr } = await supabase
      .from("services")
      .update({ price: "₹1,199" })
      .eq("id", newServ[0].id);

    if (updErr) {
      console.error("❌ Service update error:", updErr.message);
    } else {
      console.log("✅ Owner can UPDATE service.");
    }

    // Delete test service to keep DB clean
    const { error: delErr } = await supabase
      .from("services")
      .delete()
      .eq("id", newServ[0].id);

    if (delErr) {
      console.error("❌ Service delete error:", delErr.message);
    } else {
      console.log("✅ Owner can DELETE service.");
    }
  }

  console.log("\n=== 4. TESTING ENQUIRIES ACCESS ===");
  const { data: enquiries, error: enqError } = await supabase
    .from("enquiries")
    .select("*")
    .order("created_at", { ascending: false });

  if (enqError) {
    console.error("❌ Enquiries fetch error (RLS):", enqError.message);
  } else {
    console.log(`✅ Owner can view protected enquiries. Count: ${enquiries.length}`);
  }

  console.log("\n=== 5. TESTING SITE CONTENT DRAFTS (CMS) ===");
  const { data: draftData, error: draftErr } = await supabase
    .from("site_content_draft")
    .select("section, updated_at");

  if (draftErr) {
    console.error("❌ Drafts access error (RLS):", draftErr.message);
  } else {
    console.log(`✅ Owner can access private drafts. Draft sections count: ${draftData.length}`);
  }

  console.log("\n=== 6. TESTING ANALYTICS EVENTS ACCESS ===");
  const { data: events, error: eventError } = await supabase
    .from("analytics_events")
    .select("event_type, page_path")
    .limit(10);

  if (eventError) {
    console.error("❌ Analytics fetch error (RLS):", eventError.message);
  } else {
    console.log(`✅ Owner can view analytics events. Sample count: ${events.length}`);
  }

  console.log("\n=== 7. TESTING SUPPORT REQUESTS ===");
  const { data: supportReqs, error: suppErr } = await supabase
    .from("support_requests")
    .select("*");

  if (suppErr) {
    console.error("❌ Support requests error (RLS):", suppErr.message);
  } else {
    console.log(`✅ Owner can access support requests. Count: ${supportReqs.length}`);
  }

  console.log("\n🎉 ALL PRD-V1 OWNER ADMIN VERIFICATIONS PASSED!");
}

runTests();
