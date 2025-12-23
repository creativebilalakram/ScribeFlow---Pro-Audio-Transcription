
export enum AppStatus {
  IDLE = 'IDLE',
  RECORDING = 'RECORDING',
  PAUSED = 'PAUSED',
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface TranscriptionResult {
  text: string;
  confidence?: number;
  language?: string;
  duration?: number;
  fileName?: string;
}

export interface AudioMetadata {
  name: string;
  size: string;
  type: string;
  duration?: number;
}
