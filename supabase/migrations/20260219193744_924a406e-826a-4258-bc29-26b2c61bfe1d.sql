
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('players', 'players', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('games', 'games', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('videos', 'videos', true) ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public can view players bucket" ON storage.objects FOR SELECT USING (bucket_id = 'players');
CREATE POLICY "Authenticated can upload to players bucket" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'players');
CREATE POLICY "Authenticated can update players bucket" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'players');

CREATE POLICY "Public can view games bucket" ON storage.objects FOR SELECT USING (bucket_id = 'games');
CREATE POLICY "Authenticated can upload to games bucket" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'games');

CREATE POLICY "Public can view videos bucket" ON storage.objects FOR SELECT USING (bucket_id = 'videos');
CREATE POLICY "Authenticated can upload to videos bucket" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'videos');
