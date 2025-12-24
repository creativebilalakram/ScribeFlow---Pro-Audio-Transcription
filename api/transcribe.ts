
import { GoogleGenAI } from "@google/genai";

const MODELS_POOL = [
  'gemini-3-pro-preview',
  'gemini-3-flash-preview',
  'gemini-flash-lite-latest'
];

/**
 * Shuffles an array to ensure random starting model and rotation order.
 */
function shufflePool(array: string[]) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { base64Audio, mimeType } = req.body;

  if (!base64Audio || !mimeType) {
    return res.status(400).json({ error: 'Missing audio data or mime type' });
  }

  // Randomize the order for every single request to balance quota usage
  const rotatedModels = shufflePool(MODELS_POOL);
  let lastError = null;

  console.log(`ScribeFlow: Starting neural rotation with pool: ${rotatedModels.join(', ')}`);

  for (const modelName of rotatedModels) {
    try {
      console.log(`ScribeFlow: Attempting sequence with ${modelName}`);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      const response = await ai.models.generateContent({
        model: modelName,
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Audio,
              },
            },
            {
              text: `You are ScribeFlow Intelligence, a world-class professional transcriptionist. 
              
              CRITICAL PRE-CHECK:
              If audio is silent or unintelligible noise, output EXACTLY: "Transcription failed. No clear voice detected or the audio quality is too low to process. Please retry with a clearer audio recording."
              
              Transcription Rules:
              1. ACCURACY: Capture words exactly as spoken. Replace muffled words with '***'.
              2. NO LABELS: Do NOT include "Speaker 1:", "Transcript:", etc.
              3. CLEANUP: Remove filler words (um, uh) unless critical.
              
              Output: ONLY the transcribed text.`
            }
          ]
        },
        config: {
          temperature: 0,
        }
      });

      const text = response.text;
      if (text) {
        console.log(`ScribeFlow: Success with ${modelName}`);
        return res.status(200).json({ text: text.trim(), modelUsed: modelName });
      }
    } catch (error: any) {
      lastError = error;
      const errorMessage = error.message?.toLowerCase() || "";
      
      // If we hit a quota limit (429), log it and move to the next model in our shuffled list
      if (errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("limit") || errorMessage.includes("exhausted")) {
        console.warn(`ScribeFlow: Quota hit for ${modelName}. Rotating to next neural node...`);
        continue;
      }
      
      console.error(`ScribeFlow: Processing error with ${modelName}:`, error.message);
    }
  }

  return res.status(500).json({ 
    error: 'Neural cluster quota exhausted.',
    details: 'All available models (Pro, Flash, Lite) have reached their current rate limits. Please wait a few moments before retrying.',
    raw: lastError?.message
  });
}
