
-- Create players table
CREATE TABLE public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  portrait_url TEXT,
  instagram TEXT,
  twitter TEXT,
  linkedin TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create games table
CREATE TABLE public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  video_url TEXT,
  rules TEXT,
  game_date DATE,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create player_game_stats table
CREATE TABLE public.player_game_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
  rank INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(player_id, game_id)
);

-- Create leaderboard table
CREATE TABLE public.leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE UNIQUE NOT NULL,
  games_played INTEGER NOT NULL DEFAULT 0,
  events_completed INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  seconds INTEGER NOT NULL DEFAULT 0,
  thirds INTEGER NOT NULL DEFAULT 0,
  points INTEGER NOT NULL DEFAULT 0,
  rank INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create items table (static list of special items)
CREATE TABLE public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create player_items table
CREATE TABLE public.player_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES public.items(id) ON DELETE CASCADE NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(player_id, item_id)
);

-- Create player_proficiencies table
CREATE TABLE public.player_proficiencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,
  game_name TEXT NOT NULL,
  proficiency_percent INTEGER NOT NULL DEFAULT 0 CHECK (proficiency_percent >= 0 AND proficiency_percent <= 100),
  UNIQUE(player_id, game_name)
);

-- Create activity_logs table
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  target TEXT,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create hall_of_fame table
CREATE TABLE public.hall_of_fame (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season INTEGER NOT NULL,
  rank INTEGER NOT NULL CHECK (rank IN (1, 2, 3)),
  player_id UUID REFERENCES public.players(id) ON DELETE SET NULL,
  UNIQUE(season, rank)
);

-- Enable RLS on all tables
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_game_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_proficiencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hall_of_fame ENABLE ROW LEVEL SECURITY;

-- Public read policies (anyone can view)
CREATE POLICY "Anyone can view players" ON public.players FOR SELECT USING (true);
CREATE POLICY "Anyone can view games" ON public.games FOR SELECT USING (true);
CREATE POLICY "Anyone can view player_game_stats" ON public.player_game_stats FOR SELECT USING (true);
CREATE POLICY "Anyone can view leaderboard" ON public.leaderboard FOR SELECT USING (true);
CREATE POLICY "Anyone can view items" ON public.items FOR SELECT USING (true);
CREATE POLICY "Anyone can view player_items" ON public.player_items FOR SELECT USING (true);
CREATE POLICY "Anyone can view player_proficiencies" ON public.player_proficiencies FOR SELECT USING (true);
CREATE POLICY "Anyone can view activity_logs" ON public.activity_logs FOR SELECT USING (true);
CREATE POLICY "Anyone can view hall_of_fame" ON public.hall_of_fame FOR SELECT USING (true);

-- Admin write policies (authenticated users)
CREATE POLICY "Authenticated can insert players" ON public.players FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update players" ON public.players FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete players" ON public.players FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated can insert games" ON public.games FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update games" ON public.games FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete games" ON public.games FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated can insert player_game_stats" ON public.player_game_stats FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update player_game_stats" ON public.player_game_stats FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete player_game_stats" ON public.player_game_stats FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated can insert leaderboard" ON public.leaderboard FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update leaderboard" ON public.leaderboard FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete leaderboard" ON public.leaderboard FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated can insert items" ON public.items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update items" ON public.items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete items" ON public.items FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated can insert player_items" ON public.player_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update player_items" ON public.player_items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete player_items" ON public.player_items FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated can insert player_proficiencies" ON public.player_proficiencies FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update player_proficiencies" ON public.player_proficiencies FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete player_proficiencies" ON public.player_proficiencies FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated can insert activity_logs" ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can insert hall_of_fame" ON public.hall_of_fame FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update hall_of_fame" ON public.hall_of_fame FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete hall_of_fame" ON public.hall_of_fame FOR DELETE TO authenticated USING (true);

-- Insert default special items
INSERT INTO public.items (name, description) VALUES
  ('Dagger', 'A sharp blade that eliminates one player from an event — swift and lethal.'),
  ('Shield', 'Protects the holder from being eliminated or penalized in one round.'),
  ('Mirror', 'Reflects any negative item or action back to the sender.'),
  ('Red Flag', 'Marks a player for suspicion — others may vote them out.'),
  ('VISA', 'Grants free entry to any event without using a slot.'),
  ('Immunity Seal', 'Absolute immunity from elimination for one event.');

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.leaderboard;
ALTER PUBLICATION supabase_realtime ADD TABLE public.player_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.games;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;
