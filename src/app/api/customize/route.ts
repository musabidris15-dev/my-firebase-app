
import { customizeAudioFlow, type CustomizeAudioInput } from '@/app/ai/flows/customize-audio-flow';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CustomizeAudioInput;

    if (!body.audioDataUri) {
      return NextResponse.json({ error: 'Missing audioDataUri parameter' }, { status: 400 });
    }

    const result = await customizeAudioFlow(body);

    if (!result.audioDataUri) {
        throw new Error("Audio customization failed to return audio.");
    }
    
    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Customize API Error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
