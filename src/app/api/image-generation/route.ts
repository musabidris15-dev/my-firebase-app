import { imageGeneration, type ImageGenerationInput } from '@/app/ai/flows/image-generation-flow';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { prompt, initialImage } = (await request.json()) as ImageGenerationInput;

    if (!prompt) {
      return NextResponse.json({ error: 'Missing prompt parameter' }, { status: 400 });
    }

    const result = await imageGeneration({ prompt, initialImage });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Image Generation API Error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
