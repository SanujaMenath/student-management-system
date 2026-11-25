import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface CacheEntry {
  reply: string;
  timestamp: number;
}

interface KnowledgeChunk {
  content: string;
}

interface EventRow {
  title: string;
  event_date: string;
  event_time: string;
  location: string;
  status: string;
}

const CACHE_TTL_MS = 10 * 60 * 1000;
const MODEL_TIMEOUT_MS = 8000;
const responseCache = new Map<string, CacheEntry>();

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const message =
      typeof body === 'object' && body !== null && 'message' in body
        ? (body as { message?: unknown }).message
        : undefined;

    if (typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const normalizedKey = message.trim().toLowerCase();
    const cached = responseCache.get(normalizedKey);
    if (cached) {
      if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return NextResponse.json({ reply: cached.reply });
      }
      responseCache.delete(normalizedKey);
    }

    const embeddingResponse = await ai.models.embedContent({
      model: 'gemini-embedding-001',
      contents: message,
      config: {
        outputDimensionality: 768,
      },
    });

    const embedding = embeddingResponse.embeddings?.[0]?.values;
    if (!embedding) {
      return NextResponse.json(
        { error: 'Failed to generate embedding' },
        { status: 500 }
      );
    }

    // Vector search + live events
    const [knowledgeRes, eventsRes] = await Promise.all([
      supabaseAdmin.rpc('match_nursery_knowledge', {
        query_embedding: embedding,
        match_threshold: 0.35,
        match_count: 4,
      }),
      supabaseAdmin
        .from('events')
        .select('title, event_date, event_time, location, status')
        .in('status', ['Parents notified', 'Scheduled'])
        .order('event_date', { ascending: true })
        .limit(5),
    ]);

    if (knowledgeRes.error) throw knowledgeRes.error;

    const knowledgeChunks = (knowledgeRes.data ?? []) as KnowledgeChunk[];
    const knowledgeText =
      knowledgeChunks.map((c) => c.content).join('\n---\n') || '';

    const events = (eventsRes.data ?? []) as EventRow[];
    const eventsText =
      events.length > 0
        ? events
            .map(
              (e) =>
                `- ${e.title} on ${e.event_date} at ${e.event_time} (${e.location})`
            )
            .join('\n')
        : 'No upcoming scheduled events listed.';

    const systemInstruction = `
      You are the official admissions and parent assistant for Handahamy Educational Institute, a nursery and early childhood development center.
      Use ONLY the provided Knowledge Base Context and Upcoming Scheduled Events to answer questions concisely and clearly.
      If the context does not contain the answer, politely ask the parent to contact the administration desk directly.
      Format lists using plain dashes (- ) on new lines instead of markdown asterisks (*).
      Maintain a warm, welcoming, and reassuring tone. Keep answers under 4 sentences unless listing steps.
    `;

    const prompt = `Knowledge Base Context:\n${knowledgeText}\n\nUpcoming Scheduled Events:\n${eventsText}\n\nVisitor Question: ${message}`;

    const modelConfigs = [
      { model: 'gemini-3.5-flash-lite', thinkingConfig: undefined },
      { model: 'gemini-4-hydrogen', thinkingConfig: { thinkingLevel: 'low' as never } },
      { model: 'gemini-3.8-flash', thinkingConfig: { thinkingBudget: 0 } },
    ];

    let reply: string | undefined;
    try {
      reply = await Promise.any(
        modelConfigs.map(async ({ model, thinkingConfig }) => {
          const res = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              systemInstruction,
              temperature: 0.2,
              maxOutputTokens: 250,
              ...(thinkingConfig ? { thinkingConfig } : {}),
              abortSignal: AbortSignal.timeout(MODEL_TIMEOUT_MS),
            },
          });
          if (!res.text) throw new Error(`Empty response from ${model}`);
          return res.text;
        })
      );
    } catch {
      console.warn('All Gemini models failed or timed out; using handbook fallback.');
    }

    if (reply) {
      responseCache.set(normalizedKey, { reply, timestamp: Date.now() });
      return NextResponse.json({ reply });
    }

    // Direct handbook fallback if all endpoints are congested
    const topChunk = knowledgeChunks[0]?.content?.trim();
    const fallbackReply = topChunk
      ? `Here is what I found in our handbook:\n\n${topChunk}`
      : 'I am currently experiencing high demand. Please contact our administration desk directly for immediate assistance.';

    return NextResponse.json({ reply: fallbackReply }, { status: 200 });
  } catch (err: unknown) {
    console.error('Chatbot API error:', err);
    const message = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}