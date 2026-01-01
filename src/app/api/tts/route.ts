
import { textToSpeechFlow, type TextToSpeechInput } from '@/app/ai/flows/text-to-speech-flow';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { text, voice, speed } = (await request.json()) as TextToSpeechInput;

    if (!text || !voice) {
      return NextResponse.json({ error: 'Missing text or voice parameter' }, { status: 400 });
    }

    // Generate the initial speech from text.
    const ttsResult = await textToSpeechFlow({ text, voice, speed });

    if (!ttsResult.audioDataUri) {
        throw new Error("Text-to-speech generation failed to return audio.");
    }
    
    // Return the original TTS audio.
    return NextResponse.json(ttsResult);

  } catch (error: any) {
    console.error('TTS API Error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
