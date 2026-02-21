DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Authenticated can update games bucket'
  ) THEN
    CREATE POLICY "Authenticated can update games bucket"
      ON storage.objects
      FOR UPDATE
      TO authenticated
      USING (bucket_id = 'games')
      WITH CHECK (bucket_id = 'games');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Authenticated can update videos bucket'
  ) THEN
    CREATE POLICY "Authenticated can update videos bucket"
      ON storage.objects
      FOR UPDATE
      TO authenticated
      USING (bucket_id = 'videos')
      WITH CHECK (bucket_id = 'videos');
  END IF;
END
$$;
