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
    .string()
    .describe('The generated lip sync data for the avatar.')
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

  Audio: {{media url=audioDataUri}}

  Provide the lip sync data as a string.
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
