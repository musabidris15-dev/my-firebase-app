
'use server';
// This flow is disabled due to API quota limits on the free tier.
// import { ai } from '@/app/ai/genkit';
// import { z } from 'zod';
// import wav from 'wav';

// const CustomizeAudioInputSchema = z.object({
//   audioDataUri: z.string().describe("The generated audio to be transformed, as a data URI."),
//   pitch: z.number().min(-10).max(10).default(0).describe('The pitch shift level, from -10 to 10.'),
//   echo: z.number().min(0).max(10).default(0).describe('The echo level, from 0 to 10.'),
//   reverb: z.number().min(0).max(10).default(0).describe('The reverb level, from 0 to 10.'),
// });
// export type CustomizeAudioInput = z.infer<typeof CustomizeAudioInputSchema>;

// const CustomizeAudioOutputSchema = z.object({
//   audioDataUri: z.string().describe('The transformed audio as a WAV data URI.'),
// });
// export type CustomizeAudioOutput = z.infer<typeof CustomizeAudioOutputSchema>;

// async function toWav(
//   pcmData: Buffer,
//   channels = 1,
//   rate = 24000,
//   sampleWidth = 2
// ): Promise<string> {
//   return new Promise((resolve, reject) => {
//     const writer = new wav.Writer({
//       channels,
//       sampleRate: rate,
//       bitDepth: sampleWidth * 8,
//     });

//     const bufs: any[] = [];
//     writer.on('error', reject);
//     writer.on('data', function (d) {
//       bufs.push(d);
//     });
//     writer.on('end', function () {
//       resolve(Buffer.concat(bufs).toString('base64'));
//     });

//     writer.write(pcmData);
//     writer.end();
//   });
// }

// function buildPrompt(input: CustomizeAudioInput): string {
//     const effects: string[] = [];
//     if (input.pitch !== 0) {
//         effects.push(`a pitch shift of ${input.pitch}`);
//     }
//     if (input.echo > 0) {
//         effects.push(`an echo effect with a level of ${input.echo}/10`);
//     }
//     if (input.reverb > 0) {
//         effects.push(`a reverb effect with a level of ${input.reverb}/10`);
//     }

//     if (effects.length === 0) {
//         return "You are an expert audio engineer. Your task is to return the provided audio without any changes. Respond with ONLY the audio.";
//     }

//     return `You are an expert audio engineer. Your task is to transform the provided audio by applying the following effects: ${effects.join(', ')}. Respond with ONLY the transformed audio. Do not add any conversational text or introductions.`;
// }

// export const customizeAudioFlow = ai.defineFlow(
//   {
//     name: 'customizeAudioFlow',
//     inputSchema: CustomizeAudioInputSchema,
//     outputSchema: CustomizeAudioOutputSchema,
//   },
//   async (input) => {
//     if (!process.env.GEMINI_API_KEY) {
//         throw new Error("API key not valid. Please set the GEMINI_API_KEY environment variable.");
//     }
    
//     const promptText = buildPrompt(input);

//     const { media } = await ai.generate({
//       model: 'googleai/gemini-2.5-flash-image-preview', // This model can handle audio-to-audio
//       config: {
//         responseModalities: ['AUDIO'],
//       },
//       prompt: [
//         {text: promptText},
//         {media: {url: input.audioDataUri}}
//       ],
//     });

//     if (!media || !media.url) {
//       throw new Error('No media returned from the audio customization model.');
//     }
    
//     const audioDataUrl = media.url;
    
//     const mimeTypeMatch = audioDataUrl.match(/^data:(audio\/.+?)(;rate=(\d+))?;base64,/);
//     if (!mimeTypeMatch) {
//         throw new Error("Could not parse audio data URI from model response.");
//     }
    
//     const sampleRate = mimeTypeMatch[3] ? parseInt(mimeTypeMatch[3], 10) : 24000;
//     const base64Data = audioDataUrl.substring(mimeTypeMatch[0].length);

//     const pcmBuffer = Buffer.from(base64Data, 'base64');
    
//     const wavBase64 = await toWav(pcmBuffer, 1, sampleRate);

//     return {
//       audioDataUri: `data:audio/wav;base64,${wavBase64}`,
//     };
//   }
// );

    