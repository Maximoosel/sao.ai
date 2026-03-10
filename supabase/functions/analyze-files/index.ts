import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
              confidence: { type: "number", description: "0-100 confidence in the score" },
              reason: { type: "string", description: "Brief reason, max 10 words" },
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

function buildSystemPrompt(pass: 1 | 2) {
  const base = `You are a file relevance analyzer for macOS. For each file, assign a "Keep Priority" score (0-100) and a "Confidence" score (0-100).

Keep Priority:
- 100 = Essential system/app file, definitely keep
- 70-99 = Active project files, recent documents, likely useful
- 40-69 = Questionable — old but potentially useful
- 1-39 = Low priority, safe to remove (old downloads, outdated installers, temp files)
- 0 = Clearly junk (cache, duplicate installers, years-old screenshots)

Confidence (how sure you are about the score):
- 90-100 = Very certain (clear indicators like file age, known junk patterns)
- 60-89 = Fairly certain (reasonable inference from name/path)
- 0-59 = Uncertain (ambiguous file, could go either way)

IMPORTANT context clues:
- File extension reveals type: .dmg/.pkg = installers (usually safe to remove after install)
- Path reveals purpose: ~/Downloads = likely temporary, ~/Documents/Projects = likely active
- Name patterns: "Screenshot 202X" = likely disposable, "final-v2-copy" = likely duplicate
- Age: Files not opened in 6+ months are usually safe to remove
- Size: Large files (>1GB) that are old are high-value cleanup targets
- Creation vs last-opened gap: Created long ago + never reopened = forgotten file`;

  if (pass === 2) {
    return base + `\n\nThis is a SECOND-PASS verification. You are reviewing scores from a first pass. Be critical and re-evaluate each file independently. If you disagree with what seems like a typical first-pass score, adjust accordingly. Focus especially on edge cases.`;
  }
  return base + `\n\nYou MUST respond using the analyze_files function tool.`;
}

function buildFileList(files: any[]) {
  return files.map((f: any) => {
    const parts = [
      `"${f.name}"`,
      `size: ${f.size}`,
      `last opened: ${f.lastOpened}`,
      `path: ${f.path}`,
    ];
    if (f.extension) parts.push(`ext: ${f.extension}`);
    if (f.createdAt) parts.push(`created: ${f.createdAt}`);
    if (f.fileType) parts.push(`type: ${f.fileType}`);
    if (f.parentDir) parts.push(`folder: ${f.parentDir}`);
    if (f.daysSinceOpened !== undefined) parts.push(`days since opened: ${f.daysSinceOpened}`);
    return `- ${parts.join(", ")}`;
  }).join("\n");
}

async function runAnalysisPass(files: any[], pass: 1 | 2, apiKey: string) {
  const fileList = buildFileList(files);

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: pass === 1 ? "google/gemini-3-flash-preview" : "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: buildSystemPrompt(pass) },
        { role: "user", content: `Analyze these ${files.length} files and score their Keep Priority:\n${fileList}` }
      ],
      tools: [TOOL_SCHEMA],
      tool_choice: { type: "function", function: { name: "analyze_files" } }
    }),
  });

  if (!response.ok) {
    const status = response.status;
    const text = await response.text();
    console.error(`Pass ${pass} AI error:`, status, text);
    return { error: status, text };
  }

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  if (toolCall?.function?.arguments) {
    return JSON.parse(toolCall.function.arguments);
  }
  return null;
}

function mergeResults(pass1: any[], pass2: any[]) {
  const pass2Map = new Map(pass2.map((a: any) => [a.fileName, a]));

  return pass1.map((a1: any) => {
    const a2 = pass2Map.get(a1.fileName);
    if (!a2) return a1;

    const scoreDiff = Math.abs(a1.keepPriority - a2.keepPriority);
    const avgScore = Math.round((a1.keepPriority + a2.keepPriority) / 2);
    const avgConfidence = Math.round((a1.confidence + a2.confidence) / 2);

    // If passes disagree significantly, lower confidence
    const disagreementPenalty = scoreDiff > 20 ? Math.min(30, scoreDiff) : 0;
    const finalConfidence = Math.max(10, avgConfidence - disagreementPenalty);

    // Pick tag from the pass with higher confidence
    const tag = a1.confidence >= a2.confidence ? a1.tag : a2.tag;
    const reason = a1.confidence >= a2.confidence ? a1.reason : a2.reason;

    return {
      fileName: a1.fileName,
      keepPriority: avgScore,
      confidence: finalConfidence,
      reason: scoreDiff > 20 ? `${reason} (scores varied)` : reason,
      tag,
    };
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { files } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Pass 1
    const result1 = await runAnalysisPass(files, 1, LOVABLE_API_KEY);
    if (result1?.error) {
      const status = result1.error;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!result1?.analyses) {
      return new Response(JSON.stringify({ error: "No analysis returned from pass 1" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Pass 2 — verification
    const result2 = await runAnalysisPass(files, 2, LOVABLE_API_KEY);
    
    let finalAnalyses;
    if (result2?.analyses) {
      finalAnalyses = mergeResults(result1.analyses, result2.analyses);
    } else {
      // If pass 2 fails, use pass 1 results with lower confidence
      console.warn("Pass 2 failed, using pass 1 only");
      finalAnalyses = result1.analyses.map((a: any) => ({
        ...a,
        confidence: Math.max(10, (a.confidence || 50) - 15),
        reason: a.reason + " (single-pass)",
      }));
    }

    return new Response(JSON.stringify({ analyses: finalAnalyses }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-files error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});