
import { textToSpeechFlow, type TextToSpeechInput } from '@/app/ai/flows/text-to-speech-flow';
import { audioEffectsFlow, type AudioEffectsInput } from '@/app/ai/flows/audio-effects-flow';
import { NextResponse } from 'next/server';

interface TtsApiRequest extends TextToSpeechInput {
  effect?: string;
}

export async function POST(request: Request) {
  try {
    const { text, voice, expression, effect } = (await request.json()) as TtsApiRequest;

    if (!text || !voice) {
      return NextResponse.json({ error: 'Missing text or voice parameter' }, { status: 400 });
    }

    // Step 1: Generate the initial speech from text.
    const ttsResult = await textToSpeechFlow({ text, voice, expression });

    if (!ttsResult.audioDataUri) {
        throw new Error("Text-to-speech generation failed to return audio.");
    }

    // Step 2: If an effect is specified and it's not 'none', apply it.
    if (effect && effect !== 'none') {
        const effectResult = await audioEffectsFlow({
            audioDataUri: ttsResult.audioDataUri,
            effect: effect,
        });

        if (!effectResult.audioDataUri) {
            throw new Error("Audio effect processing failed to return audio.");
        }
        
        // Return the final audio with the effect applied.
        return NextResponse.json(effectResult);
    }

    // If no effect is applied, return the original TTS audio.
    return NextResponse.json(ttsResult);

  } catch (error: any) {
    console.error('TTS API Error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
