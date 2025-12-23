
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import RecordingInterface from './components/RecordingInterface';
import TranscriptionPanel from './components/TranscriptionPanel';
import { AppStatus, TranscriptionResult } from './types';
import { transcribeAudio, fileToBase64 } from './services/geminiService';

// Error Boundary for stability
interface ErrorBoundaryProps { children?: React.ReactNode; }
interface ErrorBoundaryState { hasError: boolean; }

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Added constructor to properly initialize class and satisfy TypeScript context for this.props
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: any): ErrorBoundaryState { return { hasError: true }; }
  
  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6 text-center">
          <div className="max-w-md space-y-4">
            <h1 className="text-2xl font-black text-zinc-950">System Fault</h1>
            <p className="text-zinc-500 font-medium">Neural core restart required to restore operations.</p>
            <button onClick={() => window.location.reload()} className="px-8 py-3 bg-zinc-950 text-white font-black rounded-2xl shadow-xl hover:bg-zinc-800 transition-all active:scale-95">Restart ScribeFlow</button>
          </div>
        </div>
      );
    }
    // Fixed: Properly accessing children from props
    return this.props.children;
  }
}

const AppContent: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [progressMsg, setProgressMsg] = useState<string>('');
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [inputMode, setInputMode] = useState<'upload' | 'record'>('upload');
  const [error, setError] = useState<string | null>(null);

  const processAudio = async (blob: Blob, name: string) => {
    try {
      setError(null);
      setStatus(AppStatus.UPLOADING);
      setProgressMsg("Syncing with Global Neural Cluster...");
      
      const base64 = await fileToBase64(blob);
      const mimeType = blob.type.includes('webm') ? 'audio/webm' : blob.type;
      
      setStatus(AppStatus.PROCESSING);
      setProgressMsg("Isolating semantic intent...");
      
      const text = await transcribeAudio(base64, mimeType, setProgressMsg);
      setResult({ text, fileName: name });
      setStatus(AppStatus.COMPLETED);
    } catch (err: any) {
      setError(err.message || "Neural processing fault detected.");
      setStatus(AppStatus.ERROR);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('audio/')) {
        setError("Invalid data format. Standard audio required.");
        return;
      }
      if (file.size > 100 * 1024 * 1024) {
        setError("File exceeds 100MB limit.");
        return;
      }
      processAudio(file, file.name);
    }
  };

  const reset = () => {
    setStatus(AppStatus.IDLE);
    setResult(null);
    setError(null);
    setProgressMsg('');
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#f8f9fb] relative selection:bg-blue-100 selection:text-blue-900">
      <div className="fixed top-[-300px] left-[-300px] w-[1000px] h-[1000px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none z-0" />
      <Header onLogoClick={reset} />
      
      <main className="flex-1 w-full max-w-6xl mx-auto px-[13px] sm:px-6 flex flex-col items-center justify-center relative z-10 py-10 sm:py-20">
        {status === AppStatus.IDLE || status === AppStatus.RECORDING || status === AppStatus.PAUSED || status === AppStatus.ERROR ? (
          <div className="w-full flex flex-col items-center gap-10 sm:gap-20 text-center reveal">
            <div className="space-y-4 sm:space-y-8 max-w-4xl">
              <div className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-1.5 sm:py-2 bg-blue-50 border border-blue-100 rounded-full mx-auto">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-600 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                <span className="text-[9px] sm:text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] sm:tracking-[0.3em]">Neural Link Encrypted</span>
              </div>
              <h2 className="text-5xl xs:text-6xl sm:text-8xl font-black tracking-tight text-zinc-950 leading-[0.9]">
                Precision <span className="shimmer-text">Scribe.</span>
              </h2>
              <p className="text-sm sm:text-xl text-zinc-500 font-medium max-w-2xl mx-auto leading-relaxed px-4">
                Professional-grade audio intelligence engineered for elite performance by <span className="text-zinc-950 font-black border-b-2 border-blue-100/50">Creative Bilal Agency</span>.
              </p>
            </div>

            <div className="w-full max-w-3xl flex flex-col items-center gap-8 sm:gap-12">
              <div className="relative inline-flex p-1 bg-white shadow-xl shadow-zinc-200/40 rounded-[18px] sm:rounded-[24px] border border-zinc-100">
                <div 
                  className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-zinc-950 rounded-[14px] sm:rounded-[20px] shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                    inputMode === 'upload' ? 'translate-x-0' : 'translate-x-full'
                  }`}
                />
                <button onClick={() => setInputMode('upload')} className={`relative z-10 px-6 sm:px-12 py-2 sm:py-3.5 text-[10px] sm:text-[13px] font-black rounded-[14px] sm:rounded-[20px] transition-colors duration-500 ${inputMode === 'upload' ? 'text-white' : 'text-zinc-400'}`}>File Upload</button>
                <button onClick={() => setInputMode('record')} className={`relative z-10 px-6 sm:px-12 py-2.5 sm:py-3.5 text-[10px] sm:text-[13px] font-black rounded-[14px] sm:rounded-[20px] transition-colors duration-500 ${inputMode === 'record' ? 'text-white' : 'text-zinc-400'}`}>Live Capture</button>
              </div>

              <div className="w-full max-w-[340px] xs:max-w-[400px] sm:max-w-3xl">
                {inputMode === 'upload' ? (
                  <label className="premium-container block cursor-pointer w-full group h-[340px] sm:h-[480px]">
                    <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
                    <div className="inner-content flex flex-col items-center justify-center gap-6 sm:gap-10 p-8">
                      <div className="w-20 h-20 sm:w-28 sm:h-28 bg-white border border-zinc-100 rounded-[28px] sm:rounded-[36px] flex items-center justify-center shadow-xl group-hover:bg-zinc-950 group-hover:text-white transition-all duration-500 group-hover:-translate-y-2 overflow-hidden">
                        <svg className="w-10 h-10 sm:w-14 sm:h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight">Initialize Sequence</p>
                        <p className="text-[8px] sm:text-[11px] text-zinc-400 font-bold uppercase tracking-[0.3em]">WAV, MP3, WEBM (100MB)</p>
                      </div>
                    </div>
                  </label>
                ) : (
                  <div className="h-[340px] sm:h-[480px] w-full">
                    <RecordingInterface onRecordingComplete={processAudio} status={status} setStatus={setStatus} />
                  </div>
                )}
              </div>
            </div>
            
            {error && (
              <div className="mt-8 text-red-600 text-[11px] font-black bg-red-50 px-8 py-3 rounded-2xl border border-red-100 shadow-xl shadow-red-100/20 flex items-center gap-3">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                {error}
              </div>
            )}
          </div>
        ) : (status === AppStatus.UPLOADING || status === AppStatus.PROCESSING) ? (
          <div className="w-full max-w-xl flex flex-col items-center gap-12 text-center reveal">
             <div className="relative">
                <div className="w-24 h-24 sm:w-32 sm:h-32 border-[6px] border-zinc-100 border-t-blue-600 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse shadow-[0_0_40px_rgba(59,130,246,0.8)]" />
                </div>
             </div>
             <div className="space-y-4">
                <h3 className="text-3xl sm:text-4xl font-black text-zinc-950 tracking-tighter">
                  {status === AppStatus.UPLOADING ? 'Ingesting Sequence' : 'Synthesizing...'}
                </h3>
                <p className="text-blue-600 font-black uppercase text-[10px] tracking-[0.4em] animate-pulse">
                  {progressMsg || 'Processing Neural Core'}
                </p>
             </div>
          </div>
        ) : status === AppStatus.COMPLETED && result ? (
          <div className="w-full">
            <TranscriptionPanel result={result} onClose={reset} />
          </div>
        ) : null}
      </main>
    </div>
  );
};

const App: React.FC = () => (
  <ErrorBoundary>
    <AppContent />
  </ErrorBoundary>
);

export default App;
