INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('installers', 'installers', true, 314572800, ARRAY['application/octet-stream', 'application/x-apple-diskimage', 'application/zip']);

CREATE POLICY "Allow public read access on installers" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'installers');

CREATE POLICY "Allow admin upload to installers" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'installers');