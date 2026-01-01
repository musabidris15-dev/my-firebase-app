
// This route is disabled due to API quota limits on the free tier.
// import { customizeAudioFlow, type CustomizeAudioInput } from '@/app/ai/flows/customize-audio-flow';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    return NextResponse.json(
      { error: 'This feature is temporarily disabled due to API quota limitations.' },
      { status: 429 }
    );
    // const body = (await request.json()) as any; // CustomizeAudioInput;

    // if (!body.audioDataUri) {
    //   return NextResponse.json({ error: 'Missing audioDataUri parameter' }, { status: 400 });
    // }

    // const result = await customizeAudioFlow(body);

    // if (!result.audioDataUri) {
    //     throw new Error("Audio customization failed to return audio.");
    // }
    
    // return NextResponse.json(result);

  } catch (error: any) {
    console.error('Customize API Error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}

    