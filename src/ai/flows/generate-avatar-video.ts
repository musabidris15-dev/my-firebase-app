'use server';

/**
 * @fileOverview Generates a talking avatar video from an image and audio.
 *
 * - generateAvatarVideo - A function that generates the video.
 * - GenerateAvatarVideoInput - The input type for the function.
 * - GenerateAvatarVideoOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateAvatarVideoInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a person, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  audioDataUri: z
    .string()
    .describe(
      "An audio file of speech, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateAvatarVideoInput = z.infer<typeof GenerateAvatarVideoInputSchema>;

const GenerateAvatarVideoOutputSchema = z.object({
  videoDataUri: z
    .string()
    .describe(
      'The generated video, as a data URI that must include a MIME type and use Base64 encoding.'
    ),
});
export type GenerateAvatarVideoOutput = z.infer<typeof GenerateAvatarVideoOutputSchema>;

export async function generateAvatarVideo(
  input: GenerateAvatarVideoInput
): Promise<GenerateAvatarVideoOutput> {
  return generateAvatarVideoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAvatarVideoPrompt',
  input: { schema: GenerateAvatarVideoInputSchema },
  output: { schema: GenerateAvatarVideoOutputSchema },
  prompt: `You are an expert video synthesis AI. Your task is to create a video of the person in the provided photo speaking the words from the provided audio file. The lip movements in the video must be perfectly synchronized with the audio.

  Photo: {{media url=photoDataUri}}
  Audio: {{media url=audioDataUri}}

  Generate a high-quality video with realistic facial movements and expressions that match the tone of the audio. The output must be a single video file encoded as a data URI.
  `,
});

const generateAvatarVideoFlow = ai.defineFlow(
  {
    name: 'generateAvatarVideoFlow',
    inputSchema: GenerateAvatarVideoInputSchema,
    outputSchema: GenerateAvatarVideoOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output?.videoDataUri) {
      console.warn("AI model did not return a video. This may be due to content safety filters or other issues.");
      throw new Error("The AI model failed to generate a video. This can be due to content safety filters or an unsupported input format. Please try a different photo or audio file.");
    }
    return output;
  }
);
