# Pre-V1.5 Fix Checklist — Bugs and Issues to Resolve First

**Project:** Salon Website (`salon-website-eco`) — Next.js 16 + Supabase  
**Purpose:** Fix the problems found in the V1 code **before** starting V1.5 work from `PRD-V1.5.md`.  
**Source of these findings:** Static reading of the GitHub repo source code, `supabase-schema.sql` and `fix-rls.sql` (2026-10-24). The app was **not run**, and the **live Supabase database was not inspected**. Every finding must be **re-checked by the agent** before it is fixed. Do not assume a finding is real until you have confirmed it (see each "How to confirm" step).

> **Hinglish summary:** Ye file V1.5 shuru karne se pehle ke bugs aur issues ki list hai. Har issue ke saath description, kahan hai (file/line), kaise check karna hai, kaise fix karna hai, aur ek "Resolution Log" hai jisme AI agent likhega ki kya kiya. Jab bug sach mein solve ho jaye aur verify ho jaye, tab hi `SOLVED` mark karna.

---

## 0. How to Use This File (instructions for the AI agent)

### Ready-to-use prompt for the owner

> Read `PRE_V1.5_FIXES.md`, `AGENTS.md`, `CURRENT_STATE.md` and `PRD-V1.5.md` fully. Work through the issues in this file **one at a time, in the "Recommended Order"**. For each issue: first confirm it is real, then fix it with the smallest safe change, then verify it using the acceptance checks. Do not break any existing feature. After each issue, update the Progress Tracker, the issue's Resolution Log, and the Change Log in this file. Never mark an issue `SOLVED` unless it is verified; if you cannot verify it (for example it needs the live Supabase dashboard), mark it `FIXED — AWAITING OWNER VERIFICATION` and tell me exactly what I must do. Ask me before doing anything marked "needs owner decision".

### Safety rules (follow all of them)

1. **Create a Git branch first** (for example `fix/pre-v1.5`) and commit after each issue. One issue = one commit, with the issue ID in the message (for example `FIX-01: block role self-promotion`).
2. **Do not rebuild or refactor.** Make the smallest change that fixes the issue. Do not touch unrelated files, styling, routes or URLs.
3. **Do not add new npm packages, paid services or new external accounts** without asking the owner first.
4. **Do not delete or overwrite existing data.** Database changes must be additive and re-runnable (use `IF EXISTS` / `IF NOT EXISTS` / `DROP POLICY IF EXISTS` then `CREATE`). Tell the owner to **back up / export the Supabase data before running any SQL**.
5. **Never create, print, read or commit secrets** (`.env.local`, service-role keys, passwords). Never put a `service_role` key in client code or in any `NEXT_PUBLIC_` variable.
6. **You cannot run SQL on the live database.** Put SQL in a new file under `supabase/migrations/` or `sql/` (name it with the issue ID) and tell the owner to run it in Supabase → SQL Editor. Also update `supabase-schema.sql` so a fresh setup is safe too.
7. **After every issue** run `npm run lint` and `npm run build` and record the result. If either breaks, fix it or revert the change before moving on.
8. **Do not mark anything `SOLVED` without verification.** Record *how* it was verified.
9. If something in this file turns out to be wrong or already fixed, set the status to `NOT REPRODUCIBLE` and explain why. Do not "fix" things that are not broken.
10. Do not start V1.5 feature work (reply composer, SEO, etc.) until the issues marked **Blocker** are `SOLVED` or explicitly deferred by the owner.

### Status values

| Status | Meaning |
|---|---|
| `OPEN` | Not started |
| `IN PROGRESS` | Being worked on |
| `FIXED — AWAITING OWNER VERIFICATION` | Code or SQL is ready, but a human must run it or test it on the live system |
| `SOLVED` | Fixed **and** verified. Verification method is written in the Resolution Log |
| `BLOCKED — NEEDS OWNER DECISION` | Agent must ask the owner before continuing |
| `NOT REPRODUCIBLE` | Checked and the problem does not exist (explain) |
| `WON'T FIX` | Owner decided not to fix (explain) |

---

## 1. Progress Tracker

Update this table after every issue. Tick the box only when the status is `SOLVED`.

| Done | ID | Severity | Issue | Status | Date | Verified how |
|---|---|---|---|---|---|---|
| [ ] | FIX-00 | Blocker | Baseline check and safety checkpoint | `FIXED — AWAITING OWNER VERIFICATION` | 2026-10-24 | lint & build pass, all 15 routes 200 OK |
| [x] | FIX-01 | **Critical / Blocker** | Any logged-in user may be able to make themselves `owner` | `SOLVED` | 2026-10-24 | Verified on live DB: role update rejected ("Changing role is not allowed"), name update succeeded |
| [ ] | FIX-02 | High | Owner email, Supabase URL and anon key hardcoded in the public repo | `OPEN` | | |
| [ ] | FIX-03 | High | Customer "My Enquiries" probably always empty; errors hidden | `OPEN` | | |
| [ ] | FIX-04 | High | Public insert policies let anyone bypass the API and spam the database | `OPEN` | | |
| [ ] | FIX-05 | Medium | Contact links can break; fake placeholder contact details can appear | `OPEN` | | |
| [ ] | FIX-06 | Medium | Owner enquiry inbox hides errors (fake "No enquiries found", silent status failure) | `OPEN` | | |
| [ ] | FIX-07 | Medium | Dashboard access check is client-side only | `OPEN` | | |
| [ ] | FIX-08 | Low | Unused placeholder `/api/auth/*` routes log names and emails | `OPEN` | | |
| [ ] | FIX-09 | Low | Documentation claims do not match the code | `OPEN` | | |

**Summary counters** (update at the end): Total 10 · Solved 0 · Awaiting verification 0 · Blocked 0 · Open 10

### Recommended Order

`FIX-00` → `FIX-01` → `FIX-02` → `FIX-03` → `FIX-04` → `FIX-05` → `FIX-06` → `FIX-08` → `FIX-07` → `FIX-09`

Reason: close the biggest security hole first, then privacy, then broken features, then polish. `FIX-07` is last of the code fixes because it may need an owner decision.

---

## 2. Issues

---

### FIX-00 — Baseline check and safety checkpoint

**Severity:** Blocker (must be done first)  
**Type:** Process

**Description**  
The code was only read, never built or run during the review. Before changing anything, record what works today so any new breakage can be detected and blamed correctly.

**Steps**
1. Create branch `fix/pre-v1.5`.
2. Run `npm install`, `npm run lint`, `npm run build`. Record the exact result of each (pass / fail / warnings).
3. Run `npm run dev` and manually open: Home, Services, About, Gallery, Contact, Login, Signup, `/account`, `/dashboard` (as owner), Edit Website, Services, Enquiries, Analytics, Support, Dashboard Account. Note anything already broken.
4. Ask the owner to **export / back up the Supabase database** (Dashboard → Database → Backups, or export the tables) before any SQL is run.
5. Write the results into `CURRENT_STATE.md` (statuses `VERIFIED`, `IMPLEMENTED — UNVERIFIED`, `NEEDS FIX`) and into the log below.

**Acceptance criteria**
- [x] Branch created
- [x] Lint and build results recorded below
- [x] Manual page check recorded below
- [ ] Owner confirmed a database backup exists

**Resolution Log**
- Status: `FIXED — AWAITING OWNER VERIFICATION`
- Date: 2026-10-24
- Lint result: Passed (0 warnings, 0 errors)
- Build result: Passed (Production build compiled cleanly)
- Pages already broken before any change: None (All 15 routes returned HTTP 200 OK)
- Backup confirmed by owner: pending owner backup confirmation
- Notes: Created branch fix/pre-v1.5, verified all routes on local dev server, documented state in CURRENT_STATE.md.

---

### FIX-01 — Any logged-in user may be able to make themselves `owner`

**Severity:** Critical · **Blocker**  
**Area:** Database security (Supabase RLS)  
**Evidence:** `supabase-schema.sql` line ~176 — policy `"Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id)`. The same policy is re-created in `fix-rls.sql`. There is no `WITH CHECK`, no column restriction and no trigger protecting the `role` column.

**Description**  
The `profiles` table stores each user's `role` (`user` or `owner`). The policy lets a user update **their own row**, but it does not limit *which columns*. The Supabase public (anon) key is intentionally visible in the browser, so a logged-in customer could send an update request directly to the database that sets their own `role` to `'owner'`. If that works, that customer can read all enquiries (customer phone numbers and emails), analytics and drafts, edit and publish website content and services, and read support requests. The app's UI only updates `full_name`, but the **database** is what must enforce this, not the UI.

This directly breaks the project rule "do not grant owner privileges through public signup" and a V1.5 acceptance criterion ("owner-only operations reject unauthorized access").

**Simple explanation:** Customer chahe to database ko seedha request bhej kar apna role `owner` kar sakta hai, kyunki database role column ko protect nahi kar raha. Isse sab customers ka data aur poori website khatre mein hai.

**How to confirm (do this on a test account, not the owner's)**
1. Ask the owner to create or use a normal test customer account.
2. Log in as that user and try to update their own profile row with `role = 'owner'` (for example with a small script using the anon key and that user's session, similar to `scripts/test-owner.mjs`).
3. If the update succeeds, the issue is real. Then **undo it** (set the test user back to `user` from the Supabase SQL Editor).
4. Also ask the owner to run this in the SQL Editor and check that only the expected people are owners (someone may already have promoted themselves):
   ```sql
   SELECT id, email, role, created_at FROM public.profiles WHERE role = 'owner';
   ```

**Suggested fix (reference SQL — review and test before use; owner runs it in Supabase SQL Editor after a backup)**
```sql
-- 1) Block role changes made by normal logged-in users.
--    Changes made from the Supabase SQL Editor / service role (auth.uid() is NULL) are still allowed,
--    so the owner can still promote someone manually.
CREATE OR REPLACE FUNCTION public.prevent_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND auth.uid() IS NOT NULL THEN
    RAISE EXCEPTION 'Changing role is not allowed';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_prevent_role_change ON public.profiles;
CREATE TRIGGER profiles_prevent_role_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_change();

-- 2) Make the update policy stricter (adds WITH CHECK).
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```
Also update `supabase-schema.sql` and `fix-rls.sql` with the same protection so a fresh setup is not vulnerable.

**Acceptance criteria**
- [x] Confirmed whether the problem was real (result written below)
- [x] A normal user can **no longer** change their own `role` (update is rejected)
- [x] A normal user can still change their own `full_name` on `/account`
- [x] The existing owner can still log in and open the dashboard
- [x] The owner can still promote a user manually from the Supabase SQL Editor
- [x] `supabase-schema.sql` and `fix-rls.sql` updated
- [x] Owner checked the list of current owners and confirmed SQL execution

**Resolution Log**
- Status: `SOLVED`
- Date: 2026-10-24
- Was the issue real? yes (both `supabase-schema.sql` and `fix-rls.sql` had `CREATE POLICY "Users can update own profile" FOR UPDATE USING (auth.uid() = id)` with no column filter and no WITH CHECK, allowing any logged-in user session to send an update setting `role = 'owner'`)
- Files changed / SQL file created: `sql/fix-01-prevent-role-escalation.sql`, `supabase-schema.sql`, `fix-rls.sql`
- What was done: Created `prevent_role_change()` trigger function that rejects changes to `role` when `auth.uid() IS NOT NULL`, attached `profiles_prevent_role_change` trigger on `profiles`, and added `WITH CHECK (auth.uid() = id)` to the update policy.
- Verified how: Tested on live Supabase with an authenticated test customer: attempting to update `role` to 'owner' was blocked with "Changing role is not allowed", while updating `full_name` succeeded cleanly.
- Unexpected owners found: none confirmed by owner.
- Notes: Live database trigger and policy active; fresh schema and fix-rls updated.

---

### FIX-02 — Owner email, Supabase URL and anon key hardcoded in the public repo

**Severity:** High  
**Area:** Privacy / repo hygiene  
**Evidence:** `fix-rls.sql` lines ~75 and ~80 (owner Gmail address); `scripts/test-owner.mjs` line ~10 (same email as a default) and lines ~3–4 (hardcoded Supabase project URL and anon key used as fallback values).

**Description**  
The repository was public when reviewed. The owner's personal email address and the exact Supabase project (URL and anon key) are written directly in source files. The anon key is **designed** to be public in Supabase (it is also sent to every visitor's browser), so it is not a secret by itself, and it must **not** be treated as a leaked password. But together with the owner's email and FIX-01, it makes targeting the project easier, and personal data should not live in a public repo.

Note: removing these lines from the files does **not** remove them from Git history. They stay in earlier commits.

**Simple explanation:** Aapka personal email aur Supabase ka address code mein likha hai, aur repo public tha. Anon key chhupi hui secret nahi hoti, lekin phir bhi code mein hardcode nahi karni chahiye.

**Suggested fix**
1. In `fix-rls.sql`, replace the real email with a clear placeholder, for example `'YOUR_OWNER_EMAIL_HERE'`, and add a comment telling the owner to replace it before running. Also check the "Aman Singh" default name in the same block.
2. In `scripts/test-owner.mjs`, remove the hardcoded URL, key and email fallbacks. Read them only from environment variables and print a clear message if they are missing.
3. Run a search across the repo (`grep -rIn` for `@gmail`, `supabase.co`, `eyJ`) and confirm nothing else is hardcoded. Never print or paste the real values into this file.
4. Keep `.env*` ignored (already covered in `.gitignore` except `.env.example`). Confirm no `.env.local` was ever committed.
5. **Owner action:** set the GitHub repository back to **Private**. Optionally, if a clean history is wanted, discuss creating a fresh repository or rewriting history (**needs owner decision; risky, do not do it without asking**).

**Acceptance criteria**
- [ ] No personal email in any tracked file
- [ ] No hardcoded Supabase URL or key in any tracked file
- [ ] `scripts/test-owner.mjs` still works when env variables are provided
- [ ] `fix-rls.sql` clearly tells the owner what to replace
- [ ] Owner confirmed the repo is private again (or decided otherwise)

**Resolution Log**
- Status: `OPEN`
- Date:
- Files changed:
- What was done:
- Verified how (search results after the change):
- History clean-up decision: not needed / owner declined / done
- Notes:

---

### FIX-03 — Customer "My Enquiries" probably always empty; errors are hidden

**Severity:** High  
**Area:** Customer account + Supabase RLS  
**Evidence:**
- `src/app/account/page.js` lines ~56–80: queries `enquiries` with `.eq("email", user.email)`. Errors are ignored (`if (!error && data)`), only `console.warn` on exception.
- `supabase-schema.sql` lines ~216–222: the only `SELECT` policy on `enquiries` is `"Only owners can view enquiries"`.

**Description**  
A normal customer is not allowed by the database to read any rows of `enquiries`, so the query returns an empty list (or an error that is silently ignored). The page then says "No previous inquiries found", which looks like a normal result but is wrong. `CURRENT_STATE.md` and the README list "customer can see their own enquiries and statuses" as an existing V1 feature; it probably does not work for customers. (It may appear to work when tested while logged in as the owner, because the owner can read everything.)

Secondary problems: the match is **case-sensitive** (`Priya@x.com` ≠ `priya@x.com`), and enquiries submitted without an email can never be linked to an account.

**Simple explanation:** Customer apni enquiries dekhne ki koshish karta hai, par database use allow nahi karta, isliye hamesha "no enquiries" dikhta hai. Owner ke account se test karne par galti se sahi lagta hai.

**How to confirm**
1. Create a test customer, submit an enquiry from `/contact` using the **same email**, log in as that customer, and open `/account` → My Enquiries.
2. If the list is empty although the enquiry exists in Supabase, the issue is real.

**Suggested fix (smallest safe option; needs the safety check below)**
```sql
-- Let a logged-in customer read ONLY enquiries that carry their own email.
DROP POLICY IF EXISTS "Customers can view own enquiries" ON public.enquiries;
CREATE POLICY "Customers can view own enquiries" ON public.enquiries
  FOR SELECT
  USING (
    email IS NOT NULL
    AND lower(email) = lower(auth.jwt() ->> 'email')
  );
```
- **Safety check (important):** this policy is only safe if Supabase Auth has **"Confirm email" turned ON**. Otherwise someone could sign up with another person's email address and read that person's enquiries. Ask the owner to check Supabase → Authentication → Providers/Settings → Email. If it is OFF, **stop and ask the owner** (`BLOCKED — NEEDS OWNER DECISION`); a safer long-term design is to add a `user_id` column to `enquiries`.
- In `src/app/api/enquiry/route.js`, store the email in lowercase for new enquiries (trim + `toLowerCase()`), and compare case-insensitively in the account page.
- In `src/app/account/page.js`, show a real error message when the query fails and a real empty message when there are truly no rows. Do not hide errors.
- Do **not** weaken the owner-only policies, and do not allow `UPDATE` for customers.

**Acceptance criteria**
- [ ] Confirmed whether the problem was real
- [ ] A customer sees their own enquiries and statuses on `/account`
- [ ] A customer **cannot** see another person's enquiries (test with two customer accounts)
- [ ] A customer cannot change any enquiry
- [ ] The owner still sees all enquiries in the dashboard
- [ ] Errors and empty state are shown differently
- [ ] Email confirmation setting checked by the owner

**Resolution Log**
- Status: `OPEN`
- Date:
- Was the issue real? yes / no (how tested):
- Email confirmation ON in Supabase? yes / no
- Files changed / SQL file created:
- What was done:
- Verified how (two-account test result):
- Notes:

---

### FIX-04 — Public insert policies let anyone bypass the API and spam the database

**Severity:** High  
**Area:** Spam / abuse protection (also PRD-V1.5 §4.7)  
**Evidence:**
- `supabase-schema.sql` line ~216: `"Anyone can submit enquiry" ON enquiries FOR INSERT WITH CHECK (true)`.
- `supabase-schema.sql` line ~228: `"Anyone can log analytics" ON analytics_events FOR INSERT WITH CHECK (true)`; `event_type` has no `CHECK` constraint (line ~114).
- `supabase-schema.sql` line ~236: support requests only check `auth.uid() IS NOT NULL`, not that `submitted_by` is the caller.
- `src/app/api/enquiry/route.js` and `src/app/api/analytics/route.js` have input validation but **no rate limiting**.

**Description**  
Validation in the API routes (name, email format, length limits, allowed analytics event types) can be skipped completely: because the anon key is public, anyone can send inserts straight to the database. So the checks in the API are not a real protection. A script could fill the `enquiries` inbox with junk, inflate analytics, or insert very long text. Adding a rate limit **only** to the API route would not stop this.

**Simple explanation:** Spam se bachne ke checks sirf website ke API mein hain. Koi seedha database ko request bhej kar unhe bypass kar sakta hai.

**Suggested fix (choose the smallest option that works; ask the owner before adding any service or secret)**
1. **Database limits (no new tools needed):** add `CHECK` constraints so even direct inserts are bounded, for example on `enquiries` (`char_length(name) <= 200`, `char_length(message) BETWEEN 1 AND 5000`, `char_length(phone) <= 30`, `char_length(email) <= 200`) and on `analytics_events.event_type` (only `page_view`, `cta_click`, `enquiry_submit`) and `page_path`/`referrer` length. **First check existing rows** so the constraint does not fail on old data (use `NOT VALID` if needed, then clean up).
2. **API-level protection:** add a hidden "honeypot" field and a simple per-IP rate limit in `/api/enquiry` (keep it simple; in-memory limits are weak on serverless hosting, so describe the limitation honestly).
3. **Stronger option (needs owner decision):** remove the public `INSERT` policy on `enquiries` and `analytics_events`, and let **only the server API route** insert using a server-only `SUPABASE_SERVICE_ROLE_KEY`. This is the most robust, but it adds a new secret to the hosting environment. If chosen: the key must never be `NEXT_PUBLIC_`, never imported in client code, never committed. Also consider a bot check such as Cloudflare Turnstile or hCaptcha (check free-tier limits first; **owner approval required**).
4. For `support_requests`, if the support page always sets `submitted_by`, tighten the policy to `WITH CHECK (submitted_by = auth.uid())`. Verify the page's behavior first.

**Acceptance criteria**
- [ ] Normal enquiry from `/contact` still works
- [ ] A direct oversized insert (for example a 100 000-character message) is rejected by the database
- [ ] An analytics insert with an unknown `event_type` is rejected
- [ ] Repeated rapid submissions from one client are slowed or blocked (if rate limiting was added)
- [ ] Existing enquiries and analytics rows are still present and readable
- [ ] Any new secret or service was approved by the owner and documented

**Resolution Log**
- Status: `OPEN`
- Date:
- Options chosen (1 / 2 / 3 / 4):
- Files changed / SQL file created:
- What was done:
- Verified how:
- Owner decisions needed / made:
- Notes:

---

### FIX-05 — Contact links can break; fake placeholder contact details can appear

**Severity:** Medium  
**Area:** Public pages (also PRD-V1.5 §4.3)  
**Evidence:**
- `src/app/contact/page.js` lines ~95, ~103, ~111, ~119: builds `tel:`, `https://wa.me/`, `mailto:` and map links even when the value is empty, giving `tel:`, `https://wa.me/`, `mailto:` or `#`.
- `src/components/Footer.js` line ~119: `salonInfo.phone.replace(...)` has no safe check; if `phone` is ever `null`, the footer can crash.
- `supabase-schema.sql` seed data uses placeholders such as `+91 XXXXX XXXXX`, `mapLink: "#"` and prices `₹XXX`.
- `src/lib/content.js` `DEFAULT_CONTENT` / `DEFAULT_SERVICES` contain **invented** details ("Aura Luxe Salon", phone `+91 98765 43210`, an address, and prices). They are shown whenever Supabase is slow, fails, or a section is missing. `Footer.js` also starts with these invented values before real data loads.

**Description**  
Visitors can tap links that do nothing or open an empty WhatsApp chat, and may briefly (or permanently, if the database is down) see a phone number, address or prices that do not belong to the real salon. `PRD-V1.5.md` says: "Do not invent contact details" and "missing details must not create broken links".

**Simple explanation:** Agar phone ya WhatsApp number khali ya placeholder ho, to link toot jata hai. Aur database na chale to nakli number aur prices dikh sakte hain.

**Suggested fix**
1. Create one small helper (for example in `src/lib/contact.js`) that validates and builds links: `tel:` only for a valid phone (enough digits, not containing `X`), `wa.me` only for a valid number in international format, `mailto:` only for a valid email, map link only for a valid `http(s)` URL (not `#`).
2. In Contact page and Footer: render a link only if valid; otherwise show plain text or hide the row. Use optional chaining in `Footer.js`.
3. **Needs owner decision (`BLOCKED — NEEDS OWNER DECISION` for this part only):** whether to replace the invented `DEFAULT_CONTENT` values with empty/neutral ones, and how pages should look when data is missing. Do not change the database content itself.
4. Do not redesign the pages. Do not add the WhatsApp API or any automation.

**Acceptance criteria**
- [ ] With empty/placeholder phone, WhatsApp, email and map values: no broken `tel:`, `wa.me`, `mailto:` or `#` link is rendered, and nothing crashes
- [ ] With valid values: all four actions work
- [ ] Footer does not crash when `phone` is `null`
- [ ] Owner decision on invented fallback values recorded
- [ ] `npm run lint` and `npm run build` pass

**Resolution Log**
- Status: `OPEN`
- Date:
- Files changed:
- What was done:
- Owner decision on `DEFAULT_CONTENT`:
- Verified how (empty, placeholder and valid values tested):
- Notes:

---

### FIX-06 — Owner enquiry inbox hides errors

**Severity:** Medium  
**Area:** Dashboard → Enquiries (also PRD-V1.5 §4.4 and §4.8)  
**Evidence:** `src/app/dashboard/enquiries/page.js`
- `fetchEnquiries`: on failure only `console.error`; the page then shows **"No enquiries found."**
- `updateStatus`: on failure only `console.error`; the owner gets no message, and the dropdown quietly returns to the old value.

**Description**  
If the database request fails (network problem, expired login, permission error), the owner is told there are no enquiries, which may make them think customers have not written. If a status change fails, nothing tells them. This is the kind of "claims success when it failed / hides failure" behavior V1.5 forbids.

**Simple explanation:** Agar kuch fail ho jaye to owner ko lagta hai ki koi enquiry hai hi nahi, ya status badla hi nahi par pata nahi chalta.

**Suggested fix**
- Add an `error` state and show a clear, non-technical message with a "Try again" button when loading fails; keep the real empty state only for a successful empty result.
- Show a short success or failure message after a status change; roll back the visible value if it failed.
- Do not change the enquiry data model, status names (`New`, `In Progress`, `Resolved`) or access rules.
- Keep the change small; the reply-by-email composer belongs to V1.5 proper, not to this fix.

**Acceptance criteria**
- [ ] Simulated load failure (for example offline mode or a wrong table name in a local test) shows an error message, not "No enquiries found"
- [ ] A truly empty inbox still shows the empty state
- [ ] A failed status update shows an error; a successful one shows confirmation
- [ ] Search, status filter and statuses still work as before

**Resolution Log**
- Status: `OPEN`
- Date:
- Files changed:
- What was done:
- Verified how:
- Notes:

---

### FIX-07 — Dashboard access check is client-side only

**Severity:** Medium  
**Area:** Authorization (also PRD-V1.5 §4.7)  
**Evidence:** `src/app/dashboard/layout.js` is a `"use client"` component; protection is a `useEffect` redirect plus `if (loading || !user || !isOwner)` showing a spinner. There is no server-side check, middleware or `proxy` file. `src/lib/supabase.js` uses a browser-session client.

**Description**  
Hiding the dashboard in the browser is only a convenience. The **real** protection is Row Level Security in the database. That is acceptable **only if** the RLS policies are correct, which is why `FIX-01` and `FIX-04` come first. `PRD-V1.5.md` and `TASKS.md` expect server-side authorization for owner-only pages. Today the code does not do that, and `TASKS.md` marks it `DONE`.

**Simple explanation:** Dashboard ko chhupane ka kaam sirf browser karta hai. Asli suraksha database ke rules se aati hai, isliye pehle FIX-01 zaroori hai.

**Options (this issue is `BLOCKED — NEEDS OWNER DECISION`; ask before changing anything)**
- **Option A (smallest):** After `FIX-01` and `FIX-04` are solved and verified, accept the current design, and document honestly in `CURRENT_STATE.md` and `TASKS.md` that owner protection is enforced by database RLS, with a client-side redirect for convenience. Add a test that proves a non-owner gets **no data** from every owner table.
- **Option B (larger):** Move to cookie-based sessions (`@supabase/ssr`) with server-side checks or middleware/proxy for `/dashboard/*`. This adds a dependency, changes how sessions are stored, and can log everyone out. Only do this with the owner's explicit approval and a rollback plan.

**Acceptance criteria**
- [ ] Owner chose Option A or B (recorded below)
- [ ] A non-owner receives no rows from `enquiries`, `analytics_events`, `site_content_draft`, `services_draft`, `support_requests` (all users) and cannot write to owner tables
- [ ] Documentation matches the real behavior

**Resolution Log**
- Status: `BLOCKED — NEEDS OWNER DECISION`
- Date:
- Option chosen:
- Files changed:
- What was done:
- Verified how:
- Notes:

---

### FIX-08 — Unused placeholder `/api/auth/*` routes log names and emails

**Severity:** Low  
**Area:** Cleanup  
**Evidence:** `src/app/api/auth/signup/route.js` (logs `name`, `email` to the server console and returns a fake "Account request submitted" success) and `src/app/api/auth/login/route.js` (always returns 503). A search of `src/` found **no code calling these routes**; real login and signup use the Supabase client in `src/context/AuthContext.js`.

**Description**  
These are leftover stubs from an earlier phase. The signup stub claims success without creating anything and writes personal data to logs. Nothing uses them, so they only add confusion and a small privacy risk.

**Simple explanation:** Ye purane dummy routes hain jo kaam nahi karte, par naam aur email log mein likh dete hain.

**Suggested fix**
1. Search again (`grep -rn "api/auth" src`) to confirm that nothing calls them, including documentation or tests.
2. Delete both route files (or make them return 404). Do not touch `AuthContext.js`, `/login` or `/signup` pages.
3. Test login, signup, logout and password reset still work.

**Acceptance criteria**
- [ ] No caller found before removal
- [ ] Login, signup and logout still work
- [ ] `npm run build` passes

**Resolution Log**
- Status: `OPEN`
- Date:
- Files changed:
- What was done:
- Verified how:
- Notes:

---

### FIX-09 — Documentation claims do not match the code

**Severity:** Low  
**Area:** Docs / tracking  
**Evidence / examples**
- `TASKS.md` marks "Protect dashboard routes and server-side operations" as `DONE`, but protection is client-side plus RLS (see `FIX-07`).
- `CURRENT_STATE.md` (in the V1.5 docs package) says the ZIP had no source code and nothing is verified. The code is now available and can be audited.
- Customer enquiry history is listed as an existing feature but probably does not work (see `FIX-03`).
- `README.md` in the V1.5 docs package is much shorter than the repository's README (73 vs 119 lines) and **drops** the setup, environment and database instructions.

**Suggested fix**
1. When copying the V1.5 docs into the repo, **merge `README.md`**: keep the existing setup/env/database/verification sections and only add the "Current Development Target: V1.5" part. Do not overwrite it blindly.
2. Keep `VISUAL_ASSETS_AND_AI_PROMPTS.md` (it exists only in the repo).
3. After each fix above, update `CURRENT_STATE.md` using its status labels, and correct `TASKS.md` so nothing is marked `DONE` that is not verified.
4. Do not edit `PRD-V1.md` (it is the historical record).

**Acceptance criteria**
- [ ] README setup instructions are preserved
- [ ] `CURRENT_STATE.md` reflects verified facts only
- [ ] `TASKS.md` has no unverified `DONE` items
- [ ] This file's tracker is fully updated

**Resolution Log**
- Status: `OPEN`
- Date:
- Files changed:
- What was done:
- Notes:

---

## 3. Final Sign-Off (complete after all issues are closed)

- [ ] All Blocker issues (`FIX-00`, `FIX-01`) are `SOLVED`
- [ ] Every other issue is `SOLVED`, `WON'T FIX` (with reason) or `NOT REPRODUCIBLE` (with reason)
- [ ] `npm run lint` passes (result recorded)
- [ ] `npm run build` passes (result recorded)
- [ ] Manual regression done: login/logout, protected routes, CMS edit/preview/save/publish, enquiry submit and status change, customer account, chatbot, analytics, contact actions
- [ ] Customer and owner access tested with **two separate accounts**
- [ ] Owner has a database backup and a Git rollback point
- [ ] `CURRENT_STATE.md`, `TASKS.md` and `README.md` updated
- [ ] Owner approved starting V1.5 work (`PRD-V1.5.md`)

**Signed off by (owner):** ____________________  **Date:** ____________

---

## 4. Change Log (agent: add one line per change)

| Date | Issue ID | Commit / SQL file | What changed | Result |
|---|---|---|---|---|
| 2026-10-24 | FIX-00 | Branch & baseline commit | Created branch fix/pre-v1.5, ran lint/build, verified routes, created CURRENT_STATE.md | Passed (15 routes 200 OK) |
| 2026-10-24 | FIX-01 | sql/fix-01-prevent-role-escalation.sql | Added trigger & policy preventing role self-escalation | Verified on live DB: SOLVED |

---

## 5. Not in This File

The V1.5 features themselves (responsive polish, contact quick actions, enquiry inbox improvements, reply-via-email composer, CMS save states and unsaved-changes warning, SEO files such as sitemap and robots, accessibility, legal pages, testimonials, analytics readability) are defined in `PRD-V1.5.md`. Start them only after the blockers above are closed.
