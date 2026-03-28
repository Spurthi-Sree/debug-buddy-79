import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, language } = await req.json();

    if (!code || !language) {
      return new Response(
        JSON.stringify({ error: "Missing code or language" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert programming debugger and teacher. The user selected "${language}" as their language.

Analyze the provided code thoroughly. Your tasks:
1. Detect the actual language of the code. If it differs from "${language}", note the mismatch.
2. Find ALL errors: syntax errors, runtime errors, and logical errors.
3. Provide a fully corrected version of the code that fixes ALL errors at once.
4. Explain like a patient teacher explaining to a complete beginner.

You MUST respond using the "report_debug_results" tool.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Selected language: ${language}\n\nCode to debug:\n\`\`\`\n${code}\n\`\`\`` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "report_debug_results",
              description: "Report debugging analysis results",
              parameters: {
                type: "object",
                properties: {
                  error: {
                    type: "string",
                    description: "List all errors found (syntax, runtime, logical). If language mismatch, include that. If no errors, say 'No errors found'.",
                  },
                  explanation: {
                    type: "string",
                    description: "Beginner-friendly explanation of what went wrong and why the code fails. Mention language mismatch if detected.",
                  },
                  reason: {
                    type: "string",
                    description: "The root cause of each error, explained simply.",
                  },
                  learning_tip: {
                    type: "string",
                    description: "Practical learning tips to avoid these errors in the future, like a teacher would give.",
                  },
                  suggested_fix: {
                    type: "string",
                    description: "The complete corrected code with ALL errors fixed. For Python: fully working code. For Java/C: best-effort corrected code.",
                  },
                },
                required: ["error", "explanation", "reason", "learning_tip", "suggested_fix"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "report_debug_results" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error("AI analysis failed");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      throw new Error("No tool call in AI response");
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("debug-code error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
