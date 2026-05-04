-- Add season field to games table
ALTER TABLE public.games
ADD COLUMN IF NOT EXISTS season INTEGER DEFAULT 1;

-- Create a seasonal_stats view to aggregate player scores by season
CREATE OR REPLACE VIEW seasonal_player_stats AS
SELECT 
  pgs.player_id,
  g.season,
  p.name,
  p.player_id as player_code,
  COUNT(*) as games_played,
  COUNT(CASE WHEN pgs.rank = 1 THEN 1 END) as wins,
  COUNT(CASE WHEN pgs.rank = 2 THEN 1 END) as seconds,
  COUNT(CASE WHEN pgs.rank = 3 THEN 1 END) as thirds,
  COALESCE(SUM(pgs.points), 0) as total_points,
  RANK() OVER (PARTITION BY g.season ORDER BY COALESCE(SUM(pgs.points), 0) DESC) as season_rank
FROM player_game_stats pgs
JOIN games g ON pgs.game_id = g.id
JOIN players p ON pgs.player_id = p.id
GROUP BY pgs.player_id, g.season, p.name, p.player_id;
