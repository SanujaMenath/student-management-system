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

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Generate text embedding using Gemini
    const embeddingResponse = await ai.models.embedContent({
      model: 'text-embedding-004',
      contents: message,
    });
    
    // Access the first embedding in the returned array
    const embedding = embeddingResponse.embeddings?.[0]?.values;

    if (!embedding) {
      return NextResponse.json(
        { error: 'Failed to generate embedding' },
        { status: 500 }
      );
    }

    // Vector search in Supabase
    const { data: chunks, error } = await supabaseAdmin.rpc('match_nursery_knowledge', {
      query_embedding: embedding,
      match_threshold: 0.65,
      match_count: 4,
    });

    if (error) throw error;

    const contextText = chunks?.map((c: { content: string }) => c.content).join('\n---\n') || '';

    // Grounded response generation
    const systemInstruction = `
      You are the official admissions assistant for Handahamy Educational Institute, a nursery and early childhood development center.
      Use ONLY the provided context to answer questions.
      If the context does not contain the answer, politely ask the parent to contact the administration desk directly.
      Maintain a warm, welcoming, and reassuring tone.
    `;

    const chatResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Context:\n${contextText}\n\nVisitor Question: ${message}`,
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    });

    return NextResponse.json({ reply: chatResponse.text });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}