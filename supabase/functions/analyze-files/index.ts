import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TOOL_SCHEMA = {
  type: "function",
  function: {
    name: "analyze_files",
    description: "Return relevance analysis for each file",
    parameters: {
      type: "object",
      properties: {
        analyses: {
          type: "array",
          items: {
            type: "object",
            properties: {
              fileName: { type: "string" },
              keepPriority: { type: "number", description: "0-100 score" },
              confidence: { type: "number", description: "0-100 confidence" },
              reason: { type: "string", description: "Brief reason, max 8 words" },
              tag: { type: "string", enum: ["essential", "useful", "questionable", "low-priority", "safe-to-remove"] }
            },
            required: ["fileName", "keepPriority", "confidence", "reason", "tag"],
            additionalProperties: false
          }
        }
      },
      required: ["analyses"],
      additionalProperties: false
    }
  }
};

const SYSTEM_PROMPT = `You are a fast file relevance scorer for macOS cleanup. Score each file's "Keep Priority" (0-100) and "Confidence" (0-100).

Keep Priority: 100=essential system/app file, 70-99=active/recent, 40-69=questionable, 1-39=low priority, 0=junk.
Confidence: 90-100=very certain, 60-89=fairly certain, 0-59=uncertain.

Key signals:
- .dmg/.pkg = installers, usually removable after install
- ~/Downloads = temporary, ~/Documents/Projects = active
- "Screenshot", "final-v2-copy" = disposable/duplicate
- Not opened 6+ months = usually safe to remove
- Large + old = high-value cleanup target

Be concise in reasons (max 8 words). You MUST use the analyze_files tool.`;

function buildFileList(files: any[]) {
  return files.map((f: any) => {
    const parts = [`"${f.name}"`, f.size, f.lastOpened, f.path];
    if (f.extension) parts.push(f.extension);
    if (f.parentDir) parts.push(f.parentDir);
    if (f.daysSinceOpened !== undefined) parts.push(`${f.daysSinceOpened}d ago`);
    return parts.join("|");
  }).join("\n");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { files } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const fileList = buildFileList(files);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Score these ${files.length} files:\n${fileList}` }
        ],
        tools: [TOOL_SCHEMA],
        tool_choice: { type: "function", function: { name: "analyze_files" } }
      }),
    });

    if (!response.ok) {
      const status = response.status;
      const text = await response.text();
      console.error("AI error:", status, text);
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify({ analyses: result.analyses }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "No analysis returned" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-files error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
