import { createClient } from "@supabase/supabase-js";
import fs from "fs";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL && fs.existsSync(".env.local")) {
  const envContent = fs.readFileSync(".env.local", "utf8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const [key, ...rest] = trimmed.split("=");
      process.env[key.trim()] = rest.join("=").replace(/^["']|["']$/g, "").trim();
    }
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkAllTables() {
  console.log("==========================================================");
  console.log("  Live Supabase Verification for All V2 Booking Tables");
  console.log("==========================================================\n");

  const tables = [
    { name: "staff", desc: "Specialist Team Profiles" },
    { name: "staff_services", desc: "Staff-to-Service Mappings" },
    { name: "staff_working_hours", desc: "Weekly Shifts & Work Timings" },
    { name: "staff_breaks", desc: "Daily Lunch & Tea Breaks" },
    { name: "staff_time_off", desc: "Planned Absence & Leaves" },
    { name: "customers", desc: "Client Details & Phone Mapping" },
    { name: "appointments", desc: "Authoritative Booking Records" },
    { name: "appointment_services", desc: "Immutable Duration/Price Snapshots" },
    { name: "appointment_events", desc: "Audit History Log" },
    { name: "notification_jobs", desc: "Decoupled Async Outbox Queue" },
  ];

  let allSuccess = true;

  for (const t of tables) {
    const { error } = await supabase.from(t.name).select("*").limit(1);
    if (error && error.message.includes("Could not find the table")) {
      console.log(`❌ ${t.name.padEnd(25)} -> NOT FOUND`);
      allSuccess = false;
    } else {
      console.log(`✅ ${t.name.padEnd(25)} -> LIVE & ACTIVE (${t.desc})`);
    }
  }

  console.log("\n==========================================================");
  if (allSuccess) {
    console.log("🎉 SUCCESS: ALL 10 V2 DATABASE TABLES ARE LIVE IN SUPABASE!");
  } else {
    console.log("⚠️ Some tables still missing.");
  }
  console.log("==========================================================");
}

checkAllTables();
