
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

/**
 * Transcribes audio using Gemini 3 Pro with advanced reasoning.
 * Adheres to strict @google/genai initialization rules.
 */
export const transcribeAudio = async (
  base64Audio: string, 
  mimeType: string,
  onProgress?: (status: string) => void
): Promise<string> => {
  try {
    if (onProgress) onProgress("Establishing secure neural link...");
    
    // Always initialize fresh to ensure latest API key context
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

    const response: GenerateContentResponse = await ai.models.generateContent({
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
        // Using a healthy thinking budget for complex audio reasoning
        thinkingConfig: { thinkingBudget: 16000 }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Neural output empty. Transcription failed.");
    
    return text.trim();
  } catch (error: any) {
    console.error("Transcription Fault:", error);
    if (error.message?.includes("API_KEY")) {
      throw new Error("API Authentication failure. Please check your credentials.");
    }
    throw new Error(error.message || "Failed to process audio sequence.");
  }
};

/**
 * Translates transcriptions using high-fidelity neural translation.
 */
export const translateText = async (
  text: string,
  targetLanguage: string,
  onProgress?: (status: string) => void
): Promise<string> => {
  try {
    if (onProgress) onProgress(`Synthesizing ${targetLanguage} translation...`);
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

    const response: GenerateContentResponse = await ai.models.generateContent({
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
    if (!translated) throw new Error("Translation synthesis failed.");
    
    return translated.trim();
  } catch (error: any) {
    console.error("Translation Fault:", error);
    throw new Error("Neural translation error. Please retry.");
  }
};

export const fileToBase64 = (file: File | Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
