
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

  const { text, targetLanguage } = req.body;

  if (!text || !targetLanguage) {
    return res.status(400).json({ error: 'Missing text or target language' });
  }

  let lastError = null;

  for (const modelName of MODELS_PRIORITY) {
    try {
      console.log(`ScribeFlow: Attempting translation with ${modelName}`);
      // Initializing AI with apiKey directly from process.env.API_KEY
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      const response = await ai.models.generateContent({
        model: modelName,
        contents: {
          parts: [
            {
              text: `You are a professional polyglot translator. 
              
              Task: Translate the following text into ${targetLanguage}.
              
              Standards:
              1. FLUENCY: Native-level professional tone.
              2. FIDELITY: Maintain 100% of the original meaning and nuance.
              3. STRUCTURE: Preserve all paragraph breaks.
              
              Text:
              """
              ${text}
              """
              
              Output: ONLY the translation.`
            }
          ]
        },
        config: {
          temperature: 0.1,
          // thinkingConfig removed to allow model default behavior
        }
      });

      const translated = response.text;
      if (translated) {
        console.log(`ScribeFlow: Successfully translated using ${modelName}`);
        return res.status(200).json({ translated: translated.trim(), modelUsed: modelName });
      }
    } catch (error: any) {
      lastError = error;
      const errorMessage = error.message?.toLowerCase() || "";
      
      if (errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("limit")) {
        console.warn(`ScribeFlow: Model ${modelName} hit quota limit. Falling back...`);
        continue;
      }
      
      console.error(`ScribeFlow: Translation model ${modelName} failed:`, error.message);
    }
  }

  return res.status(500).json({ 
    error: lastError?.message || 'Neural translation cluster unavailable.',
    details: 'Exhausted all available models in the priority sequence.'
  });
}
