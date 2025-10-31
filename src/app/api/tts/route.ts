import { textToSpeechFlow, type TextToSpeechInput } from '@/ai/flows/text-to-speech-flow';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { text, voice } = (await request.json()) as TextToSpeechInput;

    if (!text || !voice) {
      return NextResponse.json({ error: 'Missing text or voice parameter' }, { status: 400 });
    }

    const result = await textToSpeechFlow({ text, voice });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('TTS API Error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
