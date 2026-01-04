import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const myKey = 'AIzaSyBSKQELnvS2Hnqiev8U4w1DhWEnLfBPfOk'; 

export const ai = genkit({
  plugins: [googleAI({ apiKey: myKey })], 
  model: 'googleai/gemini-2.5-flash-preview', 
});
