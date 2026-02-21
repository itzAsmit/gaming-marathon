ALTER TABLE public.games
ADD COLUMN IF NOT EXISTS game_datetime TIMESTAMP WITH TIME ZONE;

UPDATE public.games
SET game_datetime = CASE
  WHEN game_date IS NULL THEN NULL
  WHEN game_time IS NULL OR btrim(game_time) = '' THEN (game_date::timestamp AT TIME ZONE 'UTC')
  WHEN upper(btrim(game_time)) ~ '^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$'
    THEN (
      to_timestamp(
        to_char(game_date, 'YYYY-MM-DD') || ' ' || regexp_replace(upper(btrim(game_time)), '\s*(AM|PM)$', ' \1'),
        'YYYY-MM-DD HH12:MI AM'
      )
    )
  ELSE (game_date::timestamp AT TIME ZONE 'UTC')
END
WHERE game_datetime IS NULL;
