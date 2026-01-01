import { textToSpeechFlow, type TextToSpeechInput } from '@/app/ai/flows/text-to-speech-flow';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { text, voice, narrativeSpeed } = (await request.json()) as TextToSpeechInput;

    if (!text || !voice) {
      return NextResponse.json({ error: 'Missing text or voice parameter' }, { status: 400 });
    }

    const ttsResult = await textToSpeechFlow({ text, voice, narrativeSpeed: narrativeSpeed || 1.0 });

    if (!ttsResult.audioDataUri) {
        throw new Error("Text-to-speech generation failed to return audio.");
    }
    
    return NextResponse.json(ttsResult);

  } catch (error: any) {
    console.error('TTS API Error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
