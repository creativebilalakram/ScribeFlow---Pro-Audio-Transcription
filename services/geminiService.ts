import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

export const transcribeAudio = async (
  base64Audio: string, 
  mimeType: string,
  onProgress?: (status: string) => void
): Promise<string> => {
  try {
    if (onProgress) onProgress("Initializing advanced AI engine...");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
            text: `You are a world-class professional transcriptionist. Provide a high-fidelity, verbatim-accurate transcription. Organized into paragraphs. Output ONLY the text.`
          }
        ]
      },
      config: {
        temperature: 0,
        thinkingConfig: { thinkingBudget: 4000 }
      }
    });

    return response.text?.trim() || "No transcription generated.";
  } catch (error: any) {
    console.error("Transcription error:", error);
    throw new Error(error.message || "Failed to transcribe audio.");
  }
};

export const translateText = async (
  text: string,
  targetLanguage: string,
  onProgress?: (status: string) => void
): Promise<string> => {
  try {
    if (onProgress) onProgress(`Synthesizing ${targetLanguage} translation...`);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            text: `Translate the following text into ${targetLanguage}. Output ONLY the translation.\n\n${text}`
          }
        ]
      },
      config: {
        temperature: 0.1,
        thinkingConfig: { thinkingBudget: 2000 }
      }
    });

    return response.text?.trim() || "Translation failed.";
  } catch (error: any) {
    console.error("Translation error:", error);
    throw new Error("Neural translation fault.");
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