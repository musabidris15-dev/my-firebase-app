'use server';

import { ai } from '@/app/ai/genkit';
import { z } from 'zod';
import wav from 'wav';

const VoiceChangerInputSchema = z.object({
  audioDataUri: z.string().describe("The user's audio to be transformed, as a data URI."),
  effect: z.string().describe('The voice effect to apply (e.g., "robot", "celebrity").'),
});
export type VoiceChangerInput = z.infer<typeof VoiceChangerInputSchema>;

const VoiceChangerOutputSchema = z.object({
  audioDataUri: z.string().describe('The transformed audio as a WAV data URI.'),
});
export type VoiceChangerOutput = z.infer<typeof VoiceChangerOutputSchema>;

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

const changeVoicePrompt = ai.definePrompt({
    name: 'voiceChangerPrompt',
    input: { schema: VoiceChangerInputSchema },
    prompt: `You are an expert audio engineer. Your task is to transform the provided audio by applying a voice effect.
    
The desired effect is: {{{effect}}}

You will receive an audio file. Process it and respond with ONLY the transformed audio. Do not add any conversational text or introductions.
    
Audio to transform: {{media url=audioDataUri}}
`,
});


export const voiceChangerFlow = ai.defineFlow(
  {
    name: 'voiceChangerFlow',
    inputSchema: VoiceChangerInputSchema,
    outputSchema: VoiceChangerOutputSchema,
  },
  async (input) => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("API key not valid. Please set the GEMINI_API_KEY environment variable.");
    }
    
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
      },
      prompt: [
        {text: `Transform the following audio to sound like a ${input.effect}.`},
        {media: {url: input.audioDataUri}}
      ],
    });

    if (!media || !media.url) {
      throw new Error('No media returned from the voice changer model.');
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
