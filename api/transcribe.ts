
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
              text: `You are ScribeFlow Intelligence, a world-class professional transcriptionist with a zero-hallucination policy.
              
              CRITICAL PRE-CHECK:
              First, analyze if there is clear human speech in this audio. 
              - If the audio is silent, contains only background noise, is blank, or the speech is completely unintelligible, you MUST NOT transcribe anything.
              - In such cases, output EXACTLY this message: "Transcription failed. No clear voice detected or the audio quality is too low to process. Please retry with a clearer audio recording."
              
              Transcription Rules (If speech is found):
              1. ACCURACY: Capture words exactly as spoken. 
              2. INAUDIBLE WORDS: If a specific word is unclear or muffled, replace it with '***'. Never guess or make up words to fill gaps.
              3. NO FABRICATION: Do not invent sentences or paragraphs. If the audio is blank but long, do not "summarize" or "hallucinate" content.
              4. FORMATTING: Use professional paragraph breaks. Ensure logical flow.
              5. CLEANUP: Remove filler words (um, uh) unless they provide critical context.
              6. NO LABELS: Do NOT include labels like "Speaker 1:", "Speaker:", "Transcript:", or any introductory text. Provide ONLY the spoken words.
              
              Output: ONLY the transcribed text (without any speaker IDs) or the specific failure message mentioned above.`
            }
          ]
        },
        config: {
          temperature: 0,
        }
      });

      const text = response.text;
      if (text) {
        console.log(`ScribeFlow: Successfully processed using ${modelName}`);
        return res.status(200).json({ text: text.trim(), modelUsed: modelName });
      }
    } catch (error: any) {
      lastError = error;
      const errorMessage = error.message?.toLowerCase() || "";
      
      if (errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("limit")) {
        console.warn(`ScribeFlow: Model ${modelName} hit quota limit. Falling back...`);
        continue;
      }
      
      console.error(`ScribeFlow: Model ${modelName} failed:`, error.message);
    }
  }

  return res.status(500).json({ 
    error: lastError?.message || 'All neural models exhausted or unavailable.',
    details: 'System-wide quota reached across all prioritized models.'
  });
}
