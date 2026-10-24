-- ============================================
-- Salon Website V1 — Database Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================

-- 1. PROFILES TABLE
-- Linked to Supabase Auth users. Stores role and display name.
-- role = 'user' (default, no dashboard access) or 'owner' (full dashboard access)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'owner')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'user'  -- NEVER auto-grant owner
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. SITE CONTENT (Published)
-- Stores the live/published salon info shown on public pages
CREATE TABLE IF NOT EXISTS site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL UNIQUE,  -- 'home', 'about', 'contact', 'general'
  content JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);

-- 3. SITE CONTENT DRAFTS
-- Stores unpublished edits — never shown on public pages
CREATE TABLE IF NOT EXISTS site_content_draft (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL UNIQUE,
  content JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);

-- 4. SERVICES (Published)
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price TEXT DEFAULT '',
  duration TEXT DEFAULT '',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SERVICES DRAFT
CREATE TABLE IF NOT EXISTS services_draft (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price TEXT DEFAULT '',
  duration TEXT DEFAULT '',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. GALLERY IMAGES
CREATE TABLE IF NOT EXISTS gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  caption TEXT DEFAULT '',
  alt_text TEXT DEFAULT '',
  sort_order INT DEFAULT 0,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ENQUIRIES
CREATE TABLE IF NOT EXISTS enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
  phone TEXT CHECK (phone IS NULL OR char_length(phone) <= 30),
  email TEXT CHECK (email IS NULL OR char_length(email) <= 200),
  message TEXT NOT NULL CHECK (char_length(message) BETWEEN 1 AND 5000),
  status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'In Progress', 'Resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ANALYTICS EVENTS
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN ('page_view', 'cta_click', 'enquiry_submit')),
  page_path TEXT CHECK (page_path IS NULL OR char_length(page_path) <= 500),
  referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. SUPPORT REQUESTS
CREATE TABLE IF NOT EXISTS support_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  request_type TEXT DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'In Progress', 'Resolved')),
  submitted_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. FAQ ITEMS (for chatbot)
CREATE TABLE IF NOT EXISTS faq_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content_draft ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE services_draft ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is owner (SECURITY DEFINER avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'owner'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Prevent normal users from escalating their own role to 'owner'
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

-- PROFILES: Users can read their own profile; owners can read all
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Owners can read all profiles" ON profiles
  FOR SELECT USING (public.is_owner());
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- SITE CONTENT (Published): Anyone can read (public pages)
CREATE POLICY "Anyone can read published content" ON site_content
  FOR SELECT USING (true);
CREATE POLICY "Owners can manage published content" ON site_content
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- SITE CONTENT DRAFT: Only owners
CREATE POLICY "Only owners can access drafts" ON site_content_draft
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- SERVICES (Published): Anyone can read
CREATE POLICY "Anyone can read services" ON services
  FOR SELECT USING (true);
CREATE POLICY "Owners can manage services" ON services
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- SERVICES DRAFT: Only owners
CREATE POLICY "Only owners can access service drafts" ON services_draft
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- GALLERY: Public can read published; owners can manage all
CREATE POLICY "Anyone can read published gallery" ON gallery_images
  FOR SELECT USING (is_published = true);
CREATE POLICY "Owners can manage gallery" ON gallery_images
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- ENQUIRIES: Anyone can insert (contact form); owners can read/update; customers can read own
CREATE POLICY "Anyone can submit enquiry" ON enquiries
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Only owners can view enquiries" ON enquiries
  FOR SELECT USING (public.is_owner());
CREATE POLICY "Customers can view own enquiries" ON enquiries
  FOR SELECT USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR
    (email IS NOT NULL AND lower(email) = lower(auth.jwt() ->> 'email'))
  );
CREATE POLICY "Only owners can update enquiries" ON enquiries
  FOR UPDATE USING (public.is_owner());

-- ANALYTICS: Anyone can insert; only owners can read
CREATE POLICY "Anyone can log analytics" ON analytics_events
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Only owners can view analytics" ON analytics_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- SUPPORT REQUESTS: Authenticated users can insert; owners can read all
CREATE POLICY "Authenticated can submit support" ON support_requests
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND submitted_by = auth.uid());
CREATE POLICY "Owners can view all support requests" ON support_requests
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
  );
CREATE POLICY "Users can view own support requests" ON support_requests
  FOR SELECT USING (submitted_by = auth.uid());
CREATE POLICY "Owners can update support requests" ON support_requests
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- FAQ: Anyone can read active items; owners can manage
CREATE POLICY "Anyone can read active FAQs" ON faq_items
  FOR SELECT USING (is_active = true);
CREATE POLICY "Owners can manage FAQs" ON faq_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
  );


-- ============================================
-- SEED DATA — Default salon content & FAQs
-- ============================================

-- Default published content (placeholder)
INSERT INTO site_content (section, content) VALUES
  ('general', '{"salonName": "Salon", "tagline": "Premium Unisex Salon", "logo": "", "phone": "+91 XXXXX XXXXX", "whatsapp": "+91 XXXXX XXXXX", "email": "hello@salon.com", "address": "123 Main Street, City, State — 000000", "mapLink": "#", "instagram": "#", "facebook": "#", "youtube": "#", "hours": [{"day": "Monday – Saturday", "time": "10:00 AM – 8:00 PM"}, {"day": "Sunday", "time": "11:00 AM – 6:00 PM"}]}'),
  ('home', '{"heroTagline": "Premium Unisex Salon", "heroTitle": "Where Style Meets", "heroAccent": "Elegance", "heroDescription": "Experience the art of grooming and beauty. Expert stylists, premium products, and a welcoming atmosphere for men and women.", "heroCta": "Book Your Visit", "heroCtaSecondary": "Explore Services"}'),
  ('about', '{"title": "Our Story", "description": "A passion for beauty, a commitment to excellence, and years of experience — that is what defines us.", "storyParagraphs": ["We started with a simple belief: everyone deserves access to quality grooming and beauty services in a clean, comfortable, and welcoming environment.", "Our team of skilled professionals brings years of experience across hair styling, skin care, makeup artistry, and grooming — serving both men and women with equal dedication.", "From a classic haircut to a complete bridal makeover, we treat every service as an opportunity to make someone feel confident and beautiful."]}'),
  ('contact', '{"title": "Get in Touch", "description": "Have a question or want to book a visit? We would love to hear from you."}')
ON CONFLICT (section) DO NOTHING;

-- Default FAQs for chatbot
INSERT INTO faq_items (question, answer, category, sort_order) VALUES
  ('What are your opening hours?', 'We are open Monday to Saturday from 10:00 AM to 8:00 PM, and Sunday from 11:00 AM to 6:00 PM.', 'general', 1),
  ('Where is the salon located?', 'We are located at 123 Main Street, City, State. You can find us on Google Maps using the link on our Contact page.', 'location', 2),
  ('Do I need an appointment?', 'Walk-ins are welcome! However, we recommend calling ahead during weekends and holidays to avoid waiting.', 'general', 3),
  ('What services do you offer?', 'We offer a full range of services including haircuts, styling, colouring, facials, bridal makeup, grooming, manicure, pedicure, and more. Check our Services page for the full list.', 'services', 4),
  ('Do you offer services for both men and women?', 'Yes! We are a unisex salon and welcome clients of all genders.', 'general', 5),
  ('What products do you use?', 'We use only premium, trusted brands to ensure the best results and safety for our clients.', 'general', 6),
  ('How can I contact you?', 'You can call us, send a WhatsApp message, email us, or fill out the contact form on our website. All details are on the Contact page.', 'contact', 7),
  ('Do you offer bridal packages?', 'Yes, we offer complete bridal makeup and styling packages. Please contact us for pricing and availability.', 'services', 8)
ON CONFLICT DO NOTHING;

-- Default services (placeholder prices)
INSERT INTO services (category, name, description, price, duration, sort_order) VALUES
  ('Hair', 'Haircut — Men', 'Precision cut tailored to your face shape and style preference.', '₹XXX', '30 min', 1),
  ('Hair', 'Haircut — Women', 'Expert cut, blow dry, and styling for all hair lengths.', '₹XXX', '45 min', 2),
  ('Hair', 'Hair Colour', 'Global, highlights, or balayage with premium ammonia-free colours.', '₹XXX', '60–90 min', 3),
  ('Hair', 'Hair Spa', 'Deep conditioning treatment for nourished, shiny hair.', '₹XXX', '45 min', 4),
  ('Hair', 'Keratin Treatment', 'Smooth, frizz-free hair that lasts weeks.', '₹XXX', '120 min', 5),
  ('Skin & Face', 'Classic Facial', 'Deep cleansing, exfoliation, and hydration for fresh, glowing skin.', '₹XXX', '45 min', 6),
  ('Skin & Face', 'Gold Facial', 'Premium gold-infused facial for radiance and anti-ageing benefits.', '₹XXX', '60 min', 7),
  ('Skin & Face', 'De-Tan Treatment', 'Remove sun tan and restore even skin tone.', '₹XXX', '30 min', 8),
  ('Skin & Face', 'Clean-Up', 'Quick, effective deep-pore cleansing for fresh skin.', '₹XXX', '30 min', 9),
  ('Makeup', 'Party Makeup', 'Glamorous look for parties, dinners, and special events.', '₹XXX', '60 min', 10),
  ('Makeup', 'Bridal Makeup', 'Complete bridal look with premium products and accessories.', '₹XXX', '90–120 min', 11),
  ('Makeup', 'Engagement Makeup', 'Elegant, photo-ready look for your engagement ceremony.', '₹XXX', '75 min', 12),
  ('Grooming', 'Beard Trim & Shape', 'Precise shaping and trimming for a clean, polished beard.', '₹XXX', '20 min', 13),
  ('Grooming', 'Clean Shave', 'Smooth clean shave with hot towel and soothing aftershave.', '₹XXX', '20 min', 14),
  ('Grooming', 'Head Massage', 'Relaxing oil head massage to relieve stress and promote hair health.', '₹XXX', '15 min', 15),
  ('Nails', 'Manicure', 'Nail shaping, cuticle care, massage, and polish.', '₹XXX', '30 min', 16),
  ('Nails', 'Pedicure', 'Complete foot care with scrub, massage, and polish.', '₹XXX', '40 min', 17),
  ('Nails', 'Nail Art', 'Creative nail designs and gel extensions.', '₹XXX', '30 min', 18);
