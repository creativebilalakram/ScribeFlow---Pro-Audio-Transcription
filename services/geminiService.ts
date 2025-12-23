
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Helper to get AI instance safely
const getAI = () => {
  // Try multiple ways to find the API Key
  let apiKey = "";
  
  try {
    apiKey = (window as any).process?.env?.API_KEY || (process as any)?.env?.API_KEY || "";
  } catch (e) {
    apiKey = "";
  }
  
  if (!apiKey || apiKey.length < 5) {
    console.error("AI_INITIALIZATION_FAILED: API_KEY is missing from environment.");
    throw new Error("SYSTEM_ERROR: API Key not found. Please add 'API_KEY' to Vercel Environment Variables and redeploy.");
  }

  return new GoogleGenAI({ apiKey });
};

export const transcribeAudio = async (
  base64Audio: string, 
  mimeType: string,
  onProgress?: (status: string) => void
): Promise<string> => {
  try {
    const ai = getAI();
    if (onProgress) onProgress("Waking neural clusters...");

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
            text: `You are a world-class professional transcriptionist. Provide a high-fidelity, verbatim-accurate transcription. Remove filler words. Logical formatting only.`
          }
        ]
      },
      config: {
        temperature: 0,
        thinkingConfig: { thinkingBudget: 4000 }
      }
    });

    const text = response.text;
    if (!text) throw new Error("TRANSCRIPTION_EMPTY: No text returned from model.");
    
    return text.trim();
  } catch (error: any) {
    console.error("Transcription Process Error:", error);
    throw new Error(error.message || "Neural processing failed. Please check network connection.");
  }
};

export const translateText = async (
  text: string,
  targetLanguage: string,
  onProgress?: (status: string) => void
): Promise<string> => {
  try {
    const ai = getAI();
    if (onProgress) onProgress(`Translating to ${targetLanguage}...`);

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            text: `Translate the following text into ${targetLanguage}. Output ONLY the translation.\n\nText: ${text}`
          }
        ]
      },
      config: {
        temperature: 0.1,
        thinkingConfig: { thinkingBudget: 2000 }
      }
    });

    const translated = response.text;
    if (!translated) throw new Error("TRANSLATION_EMPTY: Logic core returned null.");
    
    return translated.trim();
  } catch (error: any) {
    console.error("Translation error:", error);
    throw new Error("Neural translation fault. Please try again.");
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
