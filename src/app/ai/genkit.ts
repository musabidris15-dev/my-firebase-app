import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Hardcoded Key
const myKey = 'AIzaSyCNJS_aiwaHrwmcp5aUb87ls0eilXIVods'; 

export const ai = genkit({
  plugins: [
    googleAI({ 
      apiKey: myKey 
    })
  ],
  });