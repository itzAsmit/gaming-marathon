-- Create seasons table for managing custom seasons
CREATE TABLE IF NOT EXISTS public.seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on seasons table
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Anyone can view seasons" ON public.seasons
  FOR SELECT USING (true);

-- Create policy for authenticated admin write access
CREATE POLICY "Admin can modify seasons" ON public.seasons
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Create season_player_scores table for tracking individual player scores per season
CREATE TABLE IF NOT EXISTS public.season_player_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season INTEGER NOT NULL,
  player_id TEXT NOT NULL REFERENCES public.players(player_id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(season, player_id)
);

-- Enable RLS on season_player_scores table
ALTER TABLE public.season_player_scores ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Anyone can view season player scores" ON public.season_player_scores
  FOR SELECT USING (true);

-- Create policy for authenticated admin write access
CREATE POLICY "Admin can modify season player scores" ON public.season_player_scores
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Create indexes for common queries
CREATE INDEX idx_season_player_scores_season ON public.season_player_scores(season);
CREATE INDEX idx_season_player_scores_player_id ON public.season_player_scores(player_id);
CREATE INDEX idx_seasons_number ON public.seasons(number);
