'use server';

import { ai } from '@/app/ai/genkit';
import { z } from 'zod';
import wav from 'wav';
// FIX: Removed broken import
// import { GenerateRequest } from 'genkit/generate';

const TextToSpeechInputSchema = z.object({
  text: z.string().describe('The text to convert to speech. Can include tags like [expression] or [effect:value] to specify emotions and effects.'),
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
    // FIX: Added 'any' type to data chunk
    writer.on('data', function (d: any) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

type ParsedSegment = {
    text: string;
    tag: string;
    value?: number;
};

// This regex now captures a key, and optionally a colon and a floating-point value.
const tagRegex = /\[([a-zA-Z\s]+)(?::\s*(\d*\.?\d+))?\]/g;

function parseTextWithEffects(text: string): { segments: ParsedSegment[], effects: Record<string, number> } {
    const segments: ParsedSegment[] = [];
    const effects: Record<string, number> = {};
    const effectKeywords = ['reverb', 'echo', 'pitch'];

    // Ensure the text starts with a default tag if it doesn't have one
    const processedText = text.trim().startsWith('[') ? text.trim() : `[Default] ${text.trim()}`;
    
    let lastIndex = 0;
    let lastTag = 'Default';

    let match;
    while ((match = tagRegex.exec(processedText)) !== null) {
        const textBefore = processedText.substring(lastIndex, match.index).trim();
        if (textBefore) {
            segments.push({ text: textBefore, tag: lastTag });
        }

        const currentTag = match[1].toLowerCase();
        const value = match[2] ? parseFloat(match[2]) : undefined;

        if (effectKeywords.includes(currentTag) && value !== undefined) {
            effects[currentTag] = value;
        } else {
             lastTag = match[1]; // This is an expression tag
        }
        
        lastIndex = match.index + match[0].length;
    }

    const remainingText = processedText.substring(lastIndex).trim();
    if (remainingText) {
        segments.push({ text: remainingText, tag: lastTag });
    }
    
    return { segments: segments.filter(s => s.text), effects };
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
    
    const { segments, effects } = parseTextWithEffects(text);

    if (segments.length === 0 && text.trim().length > 0) {
        segments.push({ text: text.trim(), tag: 'Default' });
    }

    const pcmBuffers: Buffer[] = [];
    
    // Process segments sequentially to avoid rate limiting
    for (const segment of segments) {
        // Construct a prompt that includes effects if they exist.
        let promptText = `Synthesize the following text in a ${segment.tag} voice: ${segment.text}`;
        
        let effectsString = Object.entries(effects)
            .map(([key, value]) => `${key}=${value}`)
            .join(', ');
        
        if(effectsString) {
            promptText = `With effects (${effectsString}), synthesize the following text in a ${segment.tag} voice: ${segment.text}`;
        }

        // FIX: Changed type to 'any' to avoid import error
        const request: any = {
            model: 'googleai/gemini-2.5-flash-preview-tts',
            config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { 
                            voiceName: voice,
                        },
                    },
                },
            },
            prompt: promptText,
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
        pcmBuffers.push(Buffer.from(base64Data, 'base64'));
    }

    const combinedPcmBuffer = Buffer.concat(pcmBuffers);

    const sampleRate = 24000;
    const wavBase64 = await toWav(combinedPcmBuffer, 1, sampleRate);

    return {
      audioDataUri: `data:audio/wav;base64,${wavBase64}`,
    };
  }
);
