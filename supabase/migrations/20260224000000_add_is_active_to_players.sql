-- Add is_active column to players table
ALTER TABLE public.players 
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;

-- Add comment
COMMENT ON COLUMN public.players.is_active IS 'Indicates if player is currently active in the marathon. Inactive players cannot be assigned to leaderboard or game rankings.';
