'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import wav from 'wav';

const TextToSpeechInputSchema = z.object({
  text: z.string().describe('The text to convert to speech.'),
  voice: z.string().describe('The voice to use for the speech.'),
});
export type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;

const TextToSpeechOutputSchema = z.object({
  audioDataUri: z.string().describe('The generated audio as a WAV data URI.'),
});
export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;

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

export const textToSpeechFlow = ai.defineFlow(
  {
    name: 'textToSpeechFlow',
    inputSchema: TextToSpeechInputSchema,
    outputSchema: TextToSpeechOutputSchema,
  },
  async ({ text, voice }) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
      prompt: text,
    });

    if (!media || !media.url) {
      throw new Error('No media returned from the text-to-speech model.');
    }
    
    const audioDataUrl = media.url;
    
    const mimeTypeMatch = audioDataUrl.match(/^data:(audio\/.+);rate=(\d+);base64,/);
    if (!mimeTypeMatch) {
        throw new Error("Could not parse audio data URI from model response.");
    }
    
    const sampleRate = parseInt(mimeTypeMatch[2], 10);
    const base64Data = audioDataUrl.substring(mimeTypeMatch[0].length);

    const pcmBuffer = Buffer.from(base64Data, 'base64');
    
    const wavBase64 = await toWav(pcmBuffer, 1, sampleRate);

    return {
      audioDataUri: `data:audio/wav;base64,${wavBase64}`,
    };
  }
);
