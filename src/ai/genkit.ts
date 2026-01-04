'use server';
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// Explicitly pass the API key to the googleAI plugin
export const ai = genkit({
  plugins: [googleAI({apiKey: process.env.GEMINI_API_KEY})],
  // You can set a default model for convenience
  model: 'googleai/gemini-2.5-flash-preview',
});
