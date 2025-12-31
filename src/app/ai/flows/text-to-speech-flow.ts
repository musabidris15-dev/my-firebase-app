'use server';

import { ai } from '@/app/ai/genkit';
import { z } from 'zod';
import wav from 'wav';
import { GenerateRequest } from 'genkit/generate';

const TextToSpeechInputSchema = z.object({
  text: z.string().describe('The text to convert to speech. Can include phrases like [text](expression) to specify emotions.'),
  voice: z.string().describe('The voice to use for the speech.'),
  expression: z.string().optional().describe('The default emotional expression for the speech.'),
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

type TextSegment = {
    text: string;
    expression: string;
};

function parseText(text: string, defaultExpression: string): TextSegment[] {
    const segments: TextSegment[] = [];
    const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
            segments.push({
                text: text.substring(lastIndex, match.index),
                expression: defaultExpression,
            });
        }
        // Add the matched text with its expression
        segments.push({
            text: match[1],
            expression: match[2],
        });
        lastIndex = regex.lastIndex;
    }

    // Add any remaining text after the last match
    if (lastIndex < text.length) {
        segments.push({
            text: text.substring(lastIndex),
            expression: defaultExpression,
        });
    }

    return segments.filter(segment => segment.text.trim().length > 0);
}


export const textToSpeechFlow = ai.defineFlow(
  {
    name: 'textToSpeechFlow',
    inputSchema: TextToSpeechInputSchema,
    outputSchema: TextToSpeechOutputSchema,
  },
  async ({ text, voice, expression }) => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("API key not valid. Please set the GEMINI_API_KEY environment variable.");
    }
    
    const defaultExpression = (expression && expression.toLowerCase() !== 'default') ? expression : '';
    const segments = parseText(text, defaultExpression);

    const audioGenerationPromises = segments.map(async (segment) => {
        const expressionInstruction = (segment.expression && segment.expression.toLowerCase() !== 'default')
            ? `(The speech should be delivered in a ${segment.expression.toLowerCase()} tone.)`
            : '';

        const request: GenerateRequest = {
            model: 'googleai/gemini-2.5-flash-preview-tts',
            config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voice },
                    },
                },
            },
            prompt: `${segment.text} ${expressionInstruction}`,
        };
        
        const { media } = await ai.generate(request);

        if (!media || !media.url) {
            throw new Error(`Audio generation failed for segment: "${segment.text}"`);
        }

        const audioDataUrl = media.url;
        const mimeTypeMatch = audioDataUrl.match(/^data:(audio\/.+?)(;rate=(\d+))?;base64,/);
        if (!mimeTypeMatch) {
            throw new Error("Could not parse audio data URI from model response.");
        }
        
        const base64Data = audioDataUrl.substring(mimeTypeMatch[0].length);
        return Buffer.from(base64Data, 'base64');
    });

    const pcmBuffers = await Promise.all(audioGenerationPromises);
    const combinedPcmBuffer = Buffer.concat(pcmBuffers);

    // Assuming a constant sample rate from the TTS model, e.g., 24000.
    // A more robust solution might inspect the returned mimeType for each segment if it can vary.
    const sampleRate = 24000;
    const wavBase64 = await toWav(combinedPcmBuffer, 1, sampleRate);

    return {
      audioDataUri: `data:audio/wav;base64,${wavBase64}`,
    };
  }
);
