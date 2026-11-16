import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Generate text embedding using Gemini
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

    // Vector search in Supabase n fetch live upcoming public events
    const [knowledgeRes, eventsRes] = await Promise.all([
      supabaseAdmin.rpc('match_nursery_knowledge', {
        query_embedding: embedding,
        match_threshold: 0.55,
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

    const knowledgeText =
      knowledgeRes.data?.map((c: { content: string }) => c.content).join('\n---\n') || '';

    const eventsText =
      eventsRes.data && eventsRes.data.length > 0
        ? eventsRes.data
            .map(
              (e) =>
                `- ${e.title} on ${e.event_date} at ${e.event_time} (${e.location})`
            )
            .join('\n')
        : 'No upcoming scheduled events listed.';

    // Grounded response generation
    const systemInstruction = `
      You are the official admissions and parent assistant for Handahamy Educational Institute, a nursery and early childhood development center.
      Use ONLY the provided Knowledge Base Context and Upcoming Scheduled Events to answer questions concisely and clearly.
      If the context does not contain the answer, politely ask the parent to contact the administration desk directly.
      Format lists using plain dashes (- ) on new lines instead of markdown asterisks (*).
      Maintain a warm, welcoming, and reassuring tone. Keep answers under 4 sentences unless listing steps.
    `;

    const chatResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Knowledge Base Context:\n${knowledgeText}\n\nUpcoming Scheduled Events:\n${eventsText}\n\nVisitor Question: ${message}`,
      config: {
        systemInstruction,
        temperature: 0.2,
        thinkingConfig: { thinkingBudget: 0 },
        abortSignal: AbortSignal.timeout(20000),
      },
    });

    return NextResponse.json({ reply: chatResponse.text });
  } catch (err: unknown) {
    console.error('Chatbot API error:', err);
    const message = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}