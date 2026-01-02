'use server';
/**
 * @fileOverview A flow for converting audio formats, specifically from WAV to MP3.
 */
import { ai } from '@/app/ai/genkit';
import { z } from 'zod';
import wav from 'wav';
import lamejs from 'lamejs';

// Define the Zod schema for the flow's input
const CustomizeAudioInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "The base64 encoded audio data URI to be converted. Must be in WAV format."
    ),
  outputFormat: z
    .enum(['wav', 'mp3'])
    .describe("The desired output audio format."),
});

// Define the TypeScript type for the input
export type CustomizeAudioInput = z.infer<typeof CustomizeAudioInputSchema>;

// Define the Zod schema for the flow's output
const CustomizeAudioOutputSchema = z.object({
  audioDataUri: z.string().describe('The converted audio as a data URI.'),
});

// Define the TypeScript type for the output
export type CustomizeAudioOutput = z.infer<typeof CustomizeAudioOutputSchema>;

// The main function that will be called from the API route
export async function customizeAudio(input: CustomizeAudioInput): Promise<CustomizeAudioOutput> {
  return customizeAudioFlow(input);
}


// Function to convert PCM data to MP3
function pcmToMp3(pcmData: Buffer, channels: number, sampleRate: number): Buffer {
    const mp3Encoder = new lamejs.Mp3Encoder(channels, sampleRate, 128); // 128 kbps
    const pcmDataI16 = new Int16Array(pcmData.buffer, pcmData.byteOffset, pcmData.length / Int16Array.BYTES_PER_ELEMENT);

    const samples = new Int16Array(pcmDataI16);
    const mp3Data: Int8Array[] = [];
    
    const sampleBlockSize = 1152;
    for (let i = 0; i < samples.length; i += sampleBlockSize) {
        const sampleChunk = samples.subarray(i, i + sampleBlockSize);
        const mp3buf = mp3Encoder.encodeBuffer(sampleChunk);
        if (mp3buf.length > 0) {
            mp3Data.push(mp3buf);
        }
    }

    const mp3buf = mp3Encoder.flush();
    if (mp3buf.length > 0) {
        mp3Data.push(mp3buf);
    }
    
    return Buffer.from(mp3Data.flat());
}

// Define the Genkit flow
export const customizeAudioFlow = ai.defineFlow(
  {
    name: 'customizeAudioFlow',
    inputSchema: CustomizeAudioInputSchema,
    outputSchema: CustomizeAudioOutputSchema,
  },
  async ({ audioDataUri, outputFormat }) => {
    if (outputFormat === 'wav') {
      return { audioDataUri }; // No conversion needed
    }

    // Handle MP3 conversion
    const base64Data = audioDataUri.split(',')[1];
    if (!base64Data) {
      throw new Error('Invalid audio data URI: missing base64 data.');
    }
    const wavBuffer = Buffer.from(base64Data, 'base64');
    
    return new Promise((resolve, reject) => {
        const reader = new wav.Reader();

        reader.on('format', (format) => {
            const pcmData: Buffer[] = [];
            reader.on('data', (chunk) => {
                pcmData.push(chunk);
            });

            reader.on('end', () => {
                try {
                    const fullPcmData = Buffer.concat(pcmData);
                    const mp3Buffer = pcmToMp3(fullPcmData, format.channels, format.sampleRate);
                    const mp3Base64 = mp3Buffer.toString('base64');
                    resolve({
                      audioDataUri: `data:audio/mpeg;base64,${mp3Base64}`,
                    });
                } catch(err) {
                    reject(err);
                }
            });
        });

        reader.on('error', (err) => {
            reject(new Error(`Failed to read WAV file: ${err.message}`));
        });

        reader.end(wavBuffer);
    });
  }
);
