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
    // Helper to extract mime type from data URI
    const getMimeType = (dataUri: string) => {
      const matches = dataUri.match(/^data:(.+?);base64,/);
      return matches ? matches[1] : '';
    };

    const photoContentType = getMimeType(input.photoDataUri);
    const audioContentType = getMimeType(input.audioDataUri);

    if (!photoContentType || !audioContentType) {
        throw new Error("Could not determine content type from data URIs.");
    }

    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image-preview',
      prompt: [
        {
          media: {
            contentType: photoContentType,
            url: input.photoDataUri,
          },
        },
        {
          media: {
            contentType: audioContentType,
            url: input.audioDataUri,
          },
        },
        {
          text: "Animate the person in the photo to appear as if they are speaking the words from the audio file. The lip movements should synchronize with the audio to create a realistic talking avatar video."
        }
      ],
      config: {
        responseModalities: ['IMAGE'],
      },
    });
    
    if (!media || !media.url) {
      throw new Error("The AI model failed to generate a video. This can be due to content safety filters or an unsupported input format. Please try a different photo or audio file.");
    }
    
    // The model returns a data URI directly in this case.
    const returnedUrl = media.url;

    return { videoDataUri: returnedUrl };
  }
);
