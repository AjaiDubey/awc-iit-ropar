-- ==========================================================================
-- AWC IIT ROPAR — Supabase PostgreSQL Schema & Security Script
-- Paste this script into your Supabase SQL Editor (https://supabase.com)
-- Total Setup Time: 1 minute (Free Tier Compatible)
-- ==========================================================================

-- 1. Create Animals & Birds Table
CREATE TABLE IF NOT EXISTS public.animals (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('dog', 'cat', 'bird')),
    name TEXT NOT NULL,
    photo_url TEXT,
    approx_age TEXT,
    permanent_location TEXT NOT NULL,
    avg_behavior TEXT,
    vaccination_status TEXT DEFAULT 'Pending / Needs Vax',
    sterilization_status TEXT DEFAULT 'Not Sterilized',
    speciality TEXT,
    species TEXT,
    is_approved BOOLEAN DEFAULT FALSE,
    reported_by TEXT DEFAULT 'Campus Visitor',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS) for Hacker-Proof Protection
ALTER TABLE public.animals ENABLE ROW LEVEL SECURITY;

-- Policy A: Anyone can READ approved animals & birds (Public Visitors)
CREATE POLICY "Public visitors can view approved animals"
ON public.animals
FOR SELECT
USING (is_approved = true);

-- Policy B: Anyone can submit new animal reports (unapproved by default)
CREATE POLICY "Public visitors can submit unapproved reports"
ON public.animals
FOR INSERT
WITH CHECK (is_approved = false);

-- Policy C: Only Authenticated Admin can approve, edit, or update records
CREATE POLICY "Admin full access to update"
ON public.animals
FOR UPDATE
USING (auth.role() = 'authenticated');

-- Policy D: Only Authenticated Admin can delete records
CREATE POLICY "Admin full access to delete"
ON public.animals
FOR DELETE
USING (auth.role() = 'authenticated');

-- 3. Insert Initial Demo Campus Animals & Birds
INSERT INTO public.animals (id, type, name, photo_url, approx_age, permanent_location, avg_behavior, vaccination_status, sterilization_status, speciality, species, is_approved)
VALUES 
('dog-1', 'dog', 'Sheru', 'images/dog-card.jpg', '3.5 Years', 'Near Main Gate & Security Post', 'Friendly & Welcoming to all students', 'Vaccinated (Up-to-date)', 'Sterilized', 'Greets students arriving at campus & loves treats!', 'Indian Pariah Dog', true),
('dog-2', 'dog', 'Bruno', 'images/dog-card.jpg', '2 Years', 'Behind Utility Block & Dining Hall', 'Gentle, Playful & Quiet', 'Vaccinated (Up-to-date)', 'Sterilized', 'Accompanies students during night walks', 'Mix Breed', true),
('cat-1', 'cat', 'Luna', 'images/cat-card.jpg', '1.5 Years', 'Library Lawn & Senate Quadrangle', 'Curious, Calm & Loves napping in sun', 'Vaccinated (Up-to-date)', 'Sterilized', 'Enjoys resting near quiet reading areas', 'Domestic Shorthair Cat', true),
('bird-1', 'bird', 'Indian Peafowl (Mayura)', 'images/bird-card.jpg', 'Campus Wild Bird', 'Central Lawn & Herbal Garden', 'Majestic & Peaceful', 'Wild Campus Species', 'N/A (Wild Bird)', 'Beautiful courtship dances during monsoon season', 'Indian Peafowl (Pavo cristatus)', true),
('bird-2', 'bird', 'Rose-ringed Parakeet', 'images/bird-card.jpg', 'Campus Wild Bird', 'Old Neem & Banyan Trees near Hostels', 'Active & Social Chatterbox', 'Wild Campus Species', 'N/A (Wild Bird)', 'Flocks in colorful groups near canopy trees', 'Psittacula krameri', true)
ON CONFLICT (id) DO NOTHING;
