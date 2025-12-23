
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { text, targetLanguage } = req.body;

  if (!text || !targetLanguage) {
    return res.status(400).json({ error: 'Missing text or target language' });
  }

  try {
    // API key is securely accessed only on the server
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            text: `You are a professional polyglot translator. 
            
            Task: Translate the following text into ${targetLanguage}.
            
            Standards:
            1. FLUENCY: Native-level professional tone in ${targetLanguage}.
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
        thinkingConfig: { thinkingBudget: 4000 }
      }
    });

    const translated = response.text;
    if (!translated) {
      return res.status(500).json({ error: 'Translation synthesis failed.' });
    }

    return res.status(200).json({ translated: translated.trim() });
  } catch (error: any) {
    console.error("Server-side Translation Fault:", error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
