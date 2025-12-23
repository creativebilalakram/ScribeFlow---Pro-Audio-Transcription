
import { GoogleGenAI } from "@google/genai";

const MODELS_PRIORITY = [
  'gemini-3-pro-preview',
  'gemini-3-flash-preview',
  'gemini-flash-lite-latest'
];

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { base64Audio, mimeType } = req.body;

  if (!base64Audio || !mimeType) {
    return res.status(400).json({ error: 'Missing audio data or mime type' });
  }

  let lastError = null;

  for (const modelName of MODELS_PRIORITY) {
    try {
      console.log(`ScribeFlow: Attempting transcription with ${modelName}`);
      // Initializing AI with apiKey directly from process.env.API_KEY
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
              text: `You are ScribeFlow Intelligence, a world-class professional transcriptionist specializing in high-fidelity semantic capture.
              
              Task: Provide a verbatim-accurate, intelligently formatted transcription.
              
              Rules:
              1. ACCURACY: Capture every word exactly as spoken.
              2. FORMATTING: Use professional paragraph breaks. Ensure logical flow.
              3. CLEANUP: Remove filler words (um, uh) unless they provide critical context.
              4. SPEAKER ID: If multiple speakers are clearly distinguishable, label them.
              
              Output: ONLY the transcribed text.`
            }
          ]
        },
        config: {
          temperature: 0,
          // Only use thinkingConfig for models that support it
          ...(modelName.includes('pro') || modelName.includes('3') ? { thinkingConfig: { thinkingBudget: 16000 } } : {})
        }
      });

      const text = response.text;
      if (text) {
        console.log(`ScribeFlow: Successfully transcribed using ${modelName}`);
        return res.status(200).json({ text: text.trim(), modelUsed: modelName });
      }
    } catch (error: any) {
      lastError = error;
      const errorMessage = error.message?.toLowerCase() || "";
      
      // If it's a quota issue (429) or a general server error, try the next model
      if (errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("limit")) {
        console.warn(`ScribeFlow: Model ${modelName} hit quota limit. Falling back...`);
        continue;
      }
      
      // For other critical errors, we might want to break early, but usually safer to try all models
      console.error(`ScribeFlow: Model ${modelName} failed:`, error.message);
    }
  }

  return res.status(500).json({ 
    error: lastError?.message || 'All neural models exhausted or unavailable.',
    details: 'System-wide quota reached across all prioritized models.'
  });
}
