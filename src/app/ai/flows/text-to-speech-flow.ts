
'use server';

import { ai } from '@/app/ai/genkit';
import { z } from 'zod';
import wav from 'wav';
import { GenerateRequest } from 'genkit/generate';

const TextToSpeechInputSchema = z.object({
  text: z.string().describe('The text to convert to speech. Can include tags like [expression] to specify emotions.'),
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

type TextSegment = {
    text: string;
    expression: string;
};

function parseTextWithEmotions(text: string): TextSegment[] {
    const segments: TextSegment[] = [];
    const regex = /\[([a-zA-Z\s]+)\]/g;
    
    const processedText = text.trim().startsWith('[') ? text : `[Default] ${text}`;
    
    let lastIndex = 0;
    const parts: {text: string, tag: string | null}[] = [];

    let match;
    while ((match = regex.exec(processedText)) !== null) {
        if (match.index > lastIndex) {
            parts.push({ text: processedText.substring(lastIndex, match.index), tag: null });
        }
        parts.push({ text: match[0], tag: match[1] });
        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < processedText.length) {
        parts.push({ text: processedText.substring(lastIndex), tag: null });
    }

    let currentEmotion = 'Default';
    for (const part of parts) {
        if (part.tag !== null) {
            currentEmotion = part.tag;
        } else if (part.text.trim()) {
            segments.push({
                text: part.text.trim(),
                expression: currentEmotion,
            });
        }
    }

    return segments.filter(segment => segment.text.length > 0);
}


export const textToSpeechFlow = ai.defineFlow(
  {
    name: 'textToSpeechFlow',
    inputSchema: TextToSpeechInputSchema,
    outputSchema: TextToSpeechOutputSchema,
  },
  async ({ text, voice }) => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("API key not valid. Please set the GEMINI_API_KEY environment variable.");
    }
    
    const segments = parseTextWithEmotions(text);

    if (segments.length === 0 && text.trim().length > 0) {
        segments.push({ text: text, expression: 'Default' });
    }

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

    const sampleRate = 24000;
    const wavBase64 = await toWav(combinedPcmBuffer, 1, sampleRate);

    return {
      audioDataUri: `data:audio/wav;base64,${wavBase64}`,
    };
  }
);
