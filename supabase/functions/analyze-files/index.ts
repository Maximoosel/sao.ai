import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { files } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const fileList = files.map((f: any) => 
      `- "${f.name}" (${f.size}, last opened: ${f.lastOpened}, path: ${f.path})`
    ).join("\n");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a file relevance analyzer. For each file, assign a "Keep Priority" score from 0-100 where:
- 100 = Essential, definitely keep
- 70-99 = Likely useful, probably keep
- 40-69 = Questionable relevance
- 1-39 = Low priority, safe to remove
- 0 = Clearly outdated/useless

Consider: file age, name patterns (old dates, "final-v2", outdated years), file type, path location, and whether the file seems like a temporary download, old backup, or outdated document.

You MUST respond using the analyze_files function tool.`
          },
          {
            role: "user",
            content: `Analyze these files and score their Keep Priority:\n${fileList}`
          }
        ],
        tools: [
          {
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
                        reason: { type: "string", description: "Brief reason, max 10 words" },
                        tag: { type: "string", enum: ["essential", "useful", "questionable", "low-priority", "safe-to-remove"] }
                      },
                      required: ["fileName", "keepPriority", "reason", "tag"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["analyses"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "analyze_files" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(parsed), {
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
