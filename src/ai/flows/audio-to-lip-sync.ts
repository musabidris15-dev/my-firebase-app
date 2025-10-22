'use server';

/**
 * @fileOverview Generates lip sync data from an audio file.
 *
 * - generateLipSyncData - A function that generates lip sync data from an audio file.
 * - GenerateLipSyncDataInput - The input type for the generateLipSyncData function.
 * - GenerateLipSyncDataOutput - The return type for the generateLipSyncData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLipSyncDataInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      'An audio file, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' /*  example: data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhUAAABAAgAZGF0YQAAAA */
    ),
});
export type GenerateLipSyncDataInput = z.infer<typeof GenerateLipSyncDataInputSchema>;

const GenerateLipSyncDataOutputSchema = z.object({
  lipSyncData: z
    .array(
      z.object({
        start: z.number().describe('The start time of the viseme in seconds.'),
        end: z.number().describe('The end time of the viseme in seconds.'),
        viseme: z.string().describe('The viseme identifier (e.g., A, B, C).'),
      })
    )
    .describe('A JSON array of viseme objects, each with start time, end time, and viseme identifier.')
});
export type GenerateLipSyncDataOutput = z.infer<typeof GenerateLipSyncDataOutputSchema>;

export async function generateLipSyncData(input: GenerateLipSyncDataInput): Promise<GenerateLipSyncDataOutput> {
  return generateLipSyncDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLipSyncDataPrompt',
  input: {schema: GenerateLipSyncDataInputSchema},
  output: {schema: GenerateLipSyncDataOutputSchema},
  prompt: `You are an AI expert in generating realistic lip sync data from audio files.

  Analyze the uploaded audio and generate lip sync data that drives the avatar\'s mouth movements. The tool will adjust the mouth movements to match the audio.

  The output must be a valid JSON array of objects. Each object must contain 'start' (number), 'end' (number), and 'viseme' (string) properties.
  Example format:
  [
    {"start": 0.1, "end": 0.3, "viseme": "A"},
    {"start": 0.3, "end": 0.5, "viseme": "B"}
  ]

  Audio: {{media url=audioDataUri}}
  `, // Handlebars syntax
});

const generateLipSyncDataFlow = ai.defineFlow(
  {
    name: 'generateLipSyncDataFlow',
    inputSchema: GenerateLipSyncDataInputSchema,
    outputSchema: GenerateLipSyncDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
