import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { url, filename } = await req.json();
    if (!url || !filename) throw new Error("url and filename required");

    console.log(`Downloading ${filename} from ${url}...`);
    const response = await fetch(url, { redirect: "follow" });
    if (!response.ok) throw new Error(`Failed to download: ${response.status}`);

    const blob = await response.blob();
    console.log(`Downloaded ${blob.size} bytes, uploading to storage...`);

    const { error } = await supabase.storage
      .from("installers")
      .upload(filename, blob, {
        contentType: "application/octet-stream",
        upsert: true,
      });

    if (error) throw error;

    const publicUrl = `${Deno.env.get("SUPABASE_URL")}/storage/v1/object/public/installers/${filename}`;
    return new Response(JSON.stringify({ success: true, url: publicUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});