import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// We'll initialize the AI client inside the functions to ensure process.env is available
let aiClient: GoogleGenAI | null = null;

const getAIClient = () => {
  if (!aiClient) {
    const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : '';
    aiClient = new GoogleGenAI({ apiKey: apiKey || '' });
  }
  return aiClient;
};

export const transcribeAudio = async (
  base64Audio: string, 
  mimeType: string,
  onProgress?: (status: string) => void
): Promise<string> => {
  try {
    if (onProgress) onProgress("Initializing advanced AI engine...");
    const ai = getAIClient();

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
            text: `You are a world-class professional transcriptionist. 
            
            Task: Provide a high-fidelity, verbatim-accurate transcription of the provided audio.
            
            Quality Standards:
            1. WORD-FOR-WORD ACCURACY: Ensure every spoken word is captured correctly.
            2. INTELLIGENT CLEANUP: Clean verbatim. Remove filler words (um, uh) and false starts.
            3. LOGICAL FORMATTING: Organize into paragraphs.
            
            Constraint: Output ONLY the final transcribed text.`
          }
        ]
      },
      config: {
        temperature: 0,
        thinkingConfig: { thinkingBudget: 4000 }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No transcription was generated.");
    
    return text.trim();
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
    const ai = getAIClient();

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            text: `You are a professional polyglot translator. 
            
            Task: Translate the following text into ${targetLanguage}.
            
            Standards:
            1. FLUENCY: Ensure the translation sounds natural and professional in ${targetLanguage}.
            2. CONTEXT: Maintain the original tone and nuances of the speaker.
            3. FORMATTING: Preserve the paragraph structure and line breaks.
            
            Original Text:
            """
            ${text}
            """
            
            Output ONLY the ${targetLanguage} translation.`
          }
        ]
      },
      config: {
        temperature: 0.1,
        thinkingConfig: { thinkingBudget: 2000 }
      }
    });

    const translated = response.text;
    if (!translated) throw new Error("Translation failed.");
    
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