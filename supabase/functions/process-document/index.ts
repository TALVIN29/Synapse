import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ── Utility: Extract raw text from a stored file ──────────────────────
async function extractText(supabase: any, filePath: string): Promise<string> {
  const { data, error } = await supabase.storage.from('documents').download(filePath)
  if (error) throw new Error(`Storage download failed: ${error.message}`)
  return await data.text()
}

// ── Sub-workflow 3 & 4: The AXELO Extraction Engine (LLM-Ready) ────────────────────────
function generateStateMachine(text: string, sourceName: string) {
  const paragraphs = text.split('\n\n').filter(p => p.length > 50);
  
  // AXELO Era-Detection Node
  const yearMatches = text.match(/\b(18|19|20)\d{2}\b/g) || [];
  const avgYear = yearMatches.length > 0 ? Math.round(yearMatches.reduce((a, b) => a + parseInt(b), 0) / yearMatches.length) : 0;
  const era = avgYear >= 1939 && avgYear <= 1945 ? "🪖 World War II Era" : (avgYear > 1945 && avgYear < 1963 ? "📜 Pre-Independence Era" : "🏛️ Historical Era");

  // Semantic Weighting
  const weightedParas = paragraphs.map(p => {
    const dates = (p.match(/\b(18|19|20)\d{2}\b/g) || []).length * 5;
    const nouns = (p.match(/[A-Z][a-z]+/g) || []).length * 2;
    const themes = (p.match(/perang|jepun|nasionalisme|politik|ekonomi/gi) || []).length * 4;
    return { text: p, weight: dates + nouns + themes };
  }).sort((a, b) => b.weight - a.weight).slice(0, 10);

  const keyConcepts = weightedParas.map((p, i) => {
    const yearMatch = p.text.match(/\b(18|19|20)\d{2}\b/);
    const nameMatch = p.text.match(/[A-Z][a-z]+ [A-Z][a-z]+/);
    const themeMatch = p.text.match(/perang|jepun|nasionalisme|politik|ekonomi/i);
    return { 
      id: i + 1,
      year: yearMatch ? yearMatch[0] : 'N/A',
      name: nameMatch ? nameMatch[0] : 'Historical Factor',
      theme: themeMatch ? themeMatch[0].toUpperCase() : 'GENERAL HISTORY',
      snippet: p.text.substring(0, 100).trim().replace(/[*#]/g, '')
    };
  });

  const questions = keyConcepts.map(c => ({
    id: c.id,
    keyword: c.year !== 'N/A' ? c.year : c.name,
    question: `[${c.theme}] Explain the impact of ${c.year !== 'N/A' ? 'the year ' + c.year : c.name} on the chapter theme: "${c.snippet}..."`,
    answer: `The syllabus identifies ${c.year !== 'N/A' ? c.year : c.name} as a pivot for ${c.theme} development: ${c.snippet}.`
  }));

  const hints = keyConcepts.map(c => ({
    questionId: c.id,
    socraticHint: `How does ${c.name} (from the ${c.theme} perspective) connect to the broader context of ${era}?`,
    directHint: `Look for the paragraph mentioning ${c.year !== 'N/A' ? c.year : c.name}.`
  }));

  const guided_prompts = keyConcepts.slice(0, 3).flatMap(c => [
    { questionId: c.id, type: 'recall', prompt: `What was the primary motive behind the ${c.theme} events in ${c.year}?` },
    { questionId: c.id, type: 'analyze', prompt: `How did ${c.name} change the state of ${c.theme} affairs?` }
  ]);

  const nota = [
    `# 📜 Official Lesson Plan: ${sourceName}`,
    `## 🏛️ Syllabus Executive Summary`,
    `### Classified Era: ${era}`,
    `This lesson focuses on the high-stakes historical transition period of the **${era}**.`,
    `---`,
    `## ⏳ Historical Chronology (Syllabus Nodes)`,
    keyConcepts.map(c => `- **${c.year}** [${c.theme}]: Involving ${c.name} (${c.snippet}...)`).join('\n'),
    `---`,
    `## 📝 Exercise Worksheet (Active Recall)`,
    questions.map(q => `${q.id}. ${q.question}`).join('\n\n'),
    `---`,
    `## 💡 Socratic Guide (Grounding Node)`,
    hints.map(h => `Q${h.questionId}: ${h.socraticHint}`).join('\n\n'),
    `\n\n*Governance Note: Material generated via Synapse Semantic Simulator (Stage 3 Deterministic).*`
  ].join('\n\n');

  return { questions, hints, guided_prompts, nota, tokenCost: 0 };
}

// ── Sub-workflow 6: Analyze Google Meet Transcript ────────────────────
function analyzeMeetTranscript(text: string) {
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  const totalLines = lines.length;
  const questionCount = (text.match(/\?/g) || []).length;
  
  // Participation Logic (Numerical Metric)
  const speakers = new Set(text.match(/^[A-Z][a-z]+:/gm));
  const totalSpeakers = Math.max(1, speakers.size);
  const participationBalance = Math.min(100, (totalSpeakers * 20));
  const questionDensity = (questionCount / Math.max(1, totalLines)) * 100;
  
  const compositeScore = (participationBalance * 0.4) + (questionDensity * 30);
  let tier = "Tier 3: Moderate Engagement";
  if (compositeScore > 80) tier = "Tier 1: Exemplary Engagement";
  else if (compositeScore > 60) tier = "Tier 2: Active Participation";
  else if (compositeScore < 40) tier = "Tier 4: Passive Attendance";

  return {
    minutes: `## Meeting Minutes Summary\n- Total Points: ${totalLines}\n- Questions: ${questionCount}\n- Tier: ${tier}`,
    metrics: { participationBalance, questionDensity, compositeScore },
    tier
  };
}

// ── MAIN SERVER ───────────────────────────────────────────────────────
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { filePath, workflowType, sourceName } = await req.json();

    if (workflowType === 'lesson_generation') {
      const sourceText = await extractText(supabaseClient, filePath);
      const { questions, hints, guided_prompts, nota, tokenCost } = generateStateMachine(sourceText, sourceName || "New Material");

      const { data: smData, error: smError } = await supabaseClient
        .from('state_machines')
        .insert({
          tutor_id: user.id,
          source_name: sourceName || "Untitled Material",
          questions,
          hints,
          guided_prompts,
          metadata: { nota, mode: "Deterministic_Sim" },
          token_cost: tokenCost
        })
        .select().single();

      if (smError) throw smError;

      return new Response(JSON.stringify({ stateMachineId: smData.id, nota, status: "Materials mapped via Semantic Sim." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });

    } else if (workflowType === 'meet_analysis') {
      const transcriptText = await extractText(supabaseClient, filePath);
      const { minutes, metrics, tier } = analyzeMeetTranscript(transcriptText);

      const { data: maData, error: maError } = await supabaseClient.from('meet_analyses').insert({
        tutor_id: user.id, meeting_minutes: minutes, metrics, tier
      }).select().single();

      if (maError) throw maError;
      return new Response(JSON.stringify({ minutes, tier, metrics }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    throw new Error('Invalid workflow type');

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });
  }
});
