
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
              text: `You are ScribeFlow Intelligence, a world-class professional transcriptionist.
              
              Task: Provide a high-fidelity verbatim transcription of the provided audio.
              
              Strict Rules:
              1. ACCURACY: Capture words exactly as spoken. 
              2. INAUDIBLE WORDS: If a word is unclear, muffled, or genuinely inaudible, replace it with '***'. Never guess or hallucinate words based on context.
              3. NO FABRICATION: Do not make up words or sentences. If you cannot hear it, use '***'.
              4. TOTAL FAILURE: If the audio is completely inaudible, unintelligible, or mostly silence/noise, DO NOT attempt a transcription. Instead, output exactly: "Transcription failed. The audio quality is too low to process. Please retry with a clearer audio recording."
              5. FORMATTING: Use professional paragraph breaks. Ensure logical flow.
              6. CLEANUP: Remove filler words (um, uh) unless they provide critical context.
              7. SPEAKER ID: If multiple speakers are clearly distinguishable, label them (e.g., Speaker 1, Speaker 2).
              
              Output: ONLY the transcribed text or the failure message.`
            }
          ]
        },
        config: {
          temperature: 0,
          // thinkingConfig removed to allow model default behavior
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
