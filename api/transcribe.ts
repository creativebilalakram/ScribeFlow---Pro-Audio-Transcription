
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { base64Audio, mimeType } = req.body;

  if (!base64Audio || !mimeType) {
    return res.status(400).json({ error: 'Missing audio data or mime type' });
  }

  try {
    // API key is securely accessed only on the server
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
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
            3. CLEANUP: Remove "um", "uh", "like" (filler words), and false starts unless they provide critical context.
            4. SPEAKER ID: If multiple speakers are clearly distinguishable, label them (e.g., Speaker 1, Speaker 2).
            
            Output: ONLY the transcribed text. Do not add intro or outro.`
          }
        ]
      },
      config: {
        temperature: 0,
        thinkingConfig: { thinkingBudget: 16000 }
      }
    });

    const text = response.text;
    if (!text) {
      return res.status(500).json({ error: 'Neural output empty.' });
    }

    return res.status(200).json({ text: text.trim() });
  } catch (error: any) {
    console.error("Server-side Transcription Fault:", error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
