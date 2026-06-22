-- Lock admin writes to explicit admin users instead of every authenticated user.

CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = auth.uid()
  );
$$;

DO $$
DECLARE
  table_name TEXT;
  table_names TEXT[] := ARRAY[
    'players',
    'games',
    'player_game_stats',
    'leaderboard',
    'items',
    'player_items',
    'player_proficiencies',
    'activity_logs',
    'hall_of_fame',
    'seasons',
    'season_player_scores'
  ];
BEGIN
  FOREACH table_name IN ARRAY table_names LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Authenticated can insert %s" ON public.%I', table_name, table_name);
    EXECUTE format('DROP POLICY IF EXISTS "Authenticated can update %s" ON public.%I', table_name, table_name);
    EXECUTE format('DROP POLICY IF EXISTS "Authenticated can delete %s" ON public.%I', table_name, table_name);
  END LOOP;

  DROP POLICY IF EXISTS "Admin can modify seasons" ON public.seasons;
  DROP POLICY IF EXISTS "Admin can modify season player scores" ON public.season_player_scores;
END
$$;

CREATE POLICY "Admins can insert players" ON public.players FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update players" ON public.players FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete players" ON public.players FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "Admins can insert games" ON public.games FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update games" ON public.games FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete games" ON public.games FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "Admins can insert player_game_stats" ON public.player_game_stats FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update player_game_stats" ON public.player_game_stats FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete player_game_stats" ON public.player_game_stats FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "Admins can insert leaderboard" ON public.leaderboard FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update leaderboard" ON public.leaderboard FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete leaderboard" ON public.leaderboard FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "Admins can insert items" ON public.items FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update items" ON public.items FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete items" ON public.items FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "Admins can insert player_items" ON public.player_items FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update player_items" ON public.player_items FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete player_items" ON public.player_items FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "Admins can insert player_proficiencies" ON public.player_proficiencies FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update player_proficiencies" ON public.player_proficiencies FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete player_proficiencies" ON public.player_proficiencies FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "Admins can insert activity_logs" ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Anyone can view activity_logs" ON public.activity_logs;
CREATE POLICY "Admins can view activity_logs" ON public.activity_logs FOR SELECT TO authenticated USING (public.is_admin());

CREATE POLICY "Admins can insert hall_of_fame" ON public.hall_of_fame FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update hall_of_fame" ON public.hall_of_fame FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete hall_of_fame" ON public.hall_of_fame FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "Admins can modify seasons" ON public.seasons
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can modify season player scores" ON public.season_player_scores
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Authenticated can upload to players bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update players bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload to games bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update games bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload to videos bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update videos bucket" ON storage.objects;

CREATE POLICY "Admins can upload to players bucket" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'players' AND public.is_admin());

CREATE POLICY "Admins can update players bucket" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'players' AND public.is_admin())
  WITH CHECK (bucket_id = 'players' AND public.is_admin());

CREATE POLICY "Admins can upload to games bucket" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'games' AND public.is_admin());

CREATE POLICY "Admins can update games bucket" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'games' AND public.is_admin())
  WITH CHECK (bucket_id = 'games' AND public.is_admin());

CREATE POLICY "Admins can upload to videos bucket" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'videos' AND public.is_admin());

CREATE POLICY "Admins can update videos bucket" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'videos' AND public.is_admin())
  WITH CHECK (bucket_id = 'videos' AND public.is_admin());
