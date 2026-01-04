import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Hardcoded Key
const myKey = 'AIzaSyBSKQELnvS2Hnqiev8U4w1DhWEnLfBPfOk'; 

export const ai = genkit({
  plugins: [
    googleAI({ 
      apiKey: myKey 
    })
  ],
  });