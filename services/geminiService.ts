
/**
 * Transcribes audio by proxying to the secure server-side API.
 */
export const transcribeAudio = async (
  base64Audio: string, 
  mimeType: string,
  onProgress?: (status: string) => void
): Promise<string> => {
  try {
    if (onProgress) onProgress("Establishing secure neural gateway...");
    
    const response = await fetch('/api/transcribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ base64Audio, mimeType }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Neural processing fault detected.");
    }

    const data = await response.json();
    return data.text;
  } catch (error: any) {
    console.error("Transcription Gateway Fault:", error);
    throw new Error(error.message || "Failed to establish neural sequence.");
  }
};

/**
 * Translates transcriptions using the secure server-side translation endpoint.
 */
export const translateText = async (
  text: string,
  targetLanguage: string,
  onProgress?: (status: string) => void
): Promise<string> => {
  try {
    if (onProgress) onProgress(`Synthesizing ${targetLanguage} translation...`);
    
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, targetLanguage }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Translation synthesis failed.");
    }

    const data = await response.json();
    return data.translated;
  } catch (error: any) {
    console.error("Translation Gateway Fault:", error);
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
