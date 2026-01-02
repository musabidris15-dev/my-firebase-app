import { customizeAudioFlow, type CustomizeAudioInput } from '@/app/ai/flows/customize-audio-flow';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { audioDataUri, outputFormat } = (await request.json()) as CustomizeAudioInput;

    if (!audioDataUri || !outputFormat) {
      return NextResponse.json({ error: 'Missing audioDataUri or outputFormat parameter' }, { status: 400 });
    }

    const conversionResult = await customizeAudioFlow({ audioDataUri, outputFormat });

    if (!conversionResult.audioDataUri) {
        throw new Error("Audio conversion failed to return audio.");
    }
    
    return NextResponse.json(conversionResult);

  } catch (error: any) {
    console.error('Audio Conversion API Error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred during audio conversion.' },
      { status: 500 }
    );
  }
}
