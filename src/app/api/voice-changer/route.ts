import { voiceChangerFlow, type VoiceChangerInput } from '@/app/ai/flows/voice-changer-flow';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { audioDataUri, effect } = (await request.json()) as VoiceChangerInput;

    if (!audioDataUri || !effect) {
      return NextResponse.json({ error: 'Missing audioDataUri or effect parameter' }, { status: 400 });
    }

    const result = await voiceChangerFlow({ audioDataUri, effect });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Voice Changer API Error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
