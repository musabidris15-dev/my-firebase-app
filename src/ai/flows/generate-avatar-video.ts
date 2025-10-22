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

const generateAvatarVideoFlow = ai.defineFlow(
  {
    name: 'generateAvatarVideoFlow',
    inputSchema: GenerateAvatarVideoInputSchema,
    outputSchema: GenerateAvatarVideoOutputSchema,
  },
  async (input) => {
    let { operation } = await ai.generate({
      model: 'googleai/veo-2.0-generate-001',
      prompt: [
        {
          media: {
            url: input.photoDataUri,
          },
        },
        {
          media: {
            url: input.audioDataUri,
          },
        },
        {
          text: "Create a video of the person in the provided photo speaking the words from the provided audio file. The lip movements in the video must be perfectly synchronized with the audio."
        }
      ],
      config: {
        durationSeconds: 5,
        personGeneration: 'allow_adult',
      },
    });

    if (!operation) {
      throw new Error("The model did not return an operation. This may be due to a configuration error or an issue with the AI service.");
    }
    
    // Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.checkOperation(operation);
    }
    
    if (operation.error) {
      throw new Error(`Video generation failed: ${operation.error.message}`);
    }
    
    const video = operation.output?.message?.content.find(p => !!p.media);
    
    if (!video || !video.media?.url) {
      throw new Error("The AI model failed to generate a video. This can be due to content safety filters or an unsupported input format. Please try a different photo or audio file.");
    }
    
    return { videoDataUri: video.media.url };
  }
);
