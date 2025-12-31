
'use server';

import { ai } from '@/app/ai/genkit';
import { z } from 'zod';
import wav from 'wav';

const AudioEffectsInputSchema = z.object({
  audioDataUri: z.string().describe("The user's audio to be transformed, as a data URI."),
  effect: z.string().describe('The voice effect to apply (e.g., "robot", "celebrity").'),
});
export type AudioEffectsInput = z.infer<typeof AudioEffectsInputSchema>;

const AudioEffectsOutputSchema = z.object({
  audioDataUri: z.string().describe('The transformed audio as a WAV data URI.'),
});
export type AudioEffectsOutput = z.infer<typeof AudioEffectsOutputSchema>;

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

export const audioEffectsFlow = ai.defineFlow(
  {
    name: 'audioEffectsFlow',
    inputSchema: AudioEffectsInputSchema,
    outputSchema: AudioEffectsOutputSchema,
  },
  async (input) => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("API key not valid. Please set the GEMINI_API_KEY environment variable.");
    }
    
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image-preview', // This model can handle audio-to-audio
      config: {
        responseModalities: ['AUDIO'],
      },
      prompt: [
        {text: `You are an expert audio engineer. Your task is to transform the provided audio by applying a voice effect. The desired effect is: ${input.effect}. Respond with ONLY the transformed audio. Do not add any conversational text or introductions.`},
        {media: {url: input.audioDataUri}}
      ],
    });

    if (!media || !media.url) {
      throw new Error('No media returned from the audio effects model.');
    }
    
    const audioDataUrl = media.url;
    
    const mimeTypeMatch = audioDataUrl.match(/^data:(audio\/.+?)(;rate=(\d+))?;base64,/);
    if (!mimeTypeMatch) {
        throw new Error("Could not parse audio data URI from model response.");
    }
    
    const sampleRate = mimeTypeMatch[3] ? parseInt(mimeTypeMatch[3], 10) : 24000;
    const base64Data = audioDataUrl.substring(mimeTypeMatch[0].length);

    const pcmBuffer = Buffer.from(base64Data, 'base64');
    
    const wavBase64 = await toWav(pcmBuffer, 1, sampleRate);

    return {
      audioDataUri: `data:audio/wav;base64,${wavBase64}`,
    };
  }
);
