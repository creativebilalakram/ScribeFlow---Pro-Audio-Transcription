
import { GoogleGenAI } from "@google/genai";

const MODELS_POOL = [
  'gemini-3-pro-preview',
  'gemini-3-flash-preview',
  'gemini-flash-lite-latest'
];

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

  const { text, targetLanguage } = req.body;

  if (!text || !targetLanguage) {
    return res.status(400).json({ error: 'Missing text or target language' });
  }

  const rotatedModels = shufflePool(MODELS_POOL);
  let lastError = null;

  for (const modelName of rotatedModels) {
    try {
      console.log(`ScribeFlow: Translating via ${modelName}`);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      const response = await ai.models.generateContent({
        model: modelName,
        contents: {
          parts: [
            {
              text: `Translate the following text into ${targetLanguage}. Maintain professional tone and preserve paragraph structure.
              
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
        }
      });

      const translated = response.text;
      if (translated) {
        console.log(`ScribeFlow: Translation success with ${modelName}`);
        return res.status(200).json({ translated: translated.trim(), modelUsed: modelName });
      }
    } catch (error: any) {
      lastError = error;
      const errorMessage = error.message?.toLowerCase() || "";
      
      if (errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("limit") || errorMessage.includes("exhausted")) {
        console.warn(`ScribeFlow: Translation quota hit for ${modelName}. Rotating...`);
        continue;
      }
      
      console.error(`ScribeFlow: Translation error with ${modelName}:`, error.message);
    }
  }

  return res.status(500).json({ 
    error: 'Translation neural cluster limit reached.',
    details: 'Please retry in a few seconds.',
    raw: lastError?.message
  });
}
