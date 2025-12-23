import React, { useState } from 'react';
import Header from './components/Header.tsx';
import RecordingInterface from './components/RecordingInterface.tsx';
import TranscriptionPanel from './components/TranscriptionPanel.tsx';
import { AppStatus, TranscriptionResult, AudioMetadata } from './types.ts';
import { transcribeAudio, fileToBase64, formatFileSize } from './services/geminiService.ts';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [progressMsg, setProgressMsg] = useState<string>('');
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [meta, setMeta] = useState<AudioMetadata | null>(null);
  const [inputMode, setInputMode] = useState<'upload' | 'record'>('upload');
  const [error, setError] = useState<string | null>(null);

  const processAudio = async (blob: Blob, name: string) => {
    try {
      setError(null);
      setStatus(AppStatus.UPLOADING);
      setProgressMsg("Syncing with Global Neural Cluster...");
      const base64 = await fileToBase64(blob);
      const mimeType = blob.type.includes('webm') ? 'audio/webm' : blob.type;
      setMeta({ name, size: formatFileSize(blob.size), type: mimeType });
      setStatus(AppStatus.PROCESSING);
      setProgressMsg("AI isolating semantic intent...");
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
      processAudio(file, file.name);
    }
  };

  const reset = () => {
    setStatus(AppStatus.IDLE);
    setResult(null);
    setMeta(null);
    setError(null);
    setProgressMsg('');
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#f8f9fb] relative">
      <Header onLogoClick={reset} />
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 flex flex-col items-center justify-center py-10 sm:py-20">
        {status === AppStatus.IDLE || status === AppStatus.RECORDING || status === AppStatus.PAUSED ? (
          <div className="w-full flex flex-col items-center gap-10 sm:gap-20 text-center reveal">
            <div className="space-y-8 max-w-4xl">
              <h2 className="text-6xl sm:text-8xl font-black tracking-tight text-zinc-950 leading-[0.9]">
                Precision <span className="shimmer-text">Scribe.</span>
              </h2>
              <p className="text-sm sm:text-xl text-zinc-500 font-medium max-w-2xl mx-auto leading-relaxed">
                Professional-grade audio intelligence engineered for elite workflows.
              </p>
            </div>

            <div className="w-full max-w-3xl flex flex-col items-center gap-12">
              <div className="relative inline-flex p-1 bg-white shadow-xl rounded-[24px] border border-zinc-100">
                <div 
                  className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-zinc-950 rounded-[20px] transition-transform duration-500 ${
                    inputMode === 'upload' ? 'translate-x-0' : 'translate-x-full'
                  }`}
                />
                <button onClick={() => setInputMode('upload')} className={`relative z-10 px-12 py-3.5 text-[13px] font-black transition-colors ${inputMode === 'upload' ? 'text-white' : 'text-zinc-400'}`}>File Upload</button>
                <button onClick={() => setInputMode('record')} className={`relative z-10 px-12 py-3.5 text-[13px] font-black transition-colors ${inputMode === 'record' ? 'text-white' : 'text-zinc-400'}`}>Live Capture</button>
              </div>

              <div className="w-full">
                {inputMode === 'upload' ? (
                  <label className="premium-container block cursor-pointer w-full group h-[480px]">
                    <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
                    <div className="inner-content flex flex-col items-center justify-center gap-10 p-8">
                      <div className="w-28 h-28 bg-white border border-zinc-100 rounded-[36px] flex items-center justify-center shadow-xl group-hover:bg-zinc-950 group-hover:text-white transition-all duration-500">
                        <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <p className="text-2xl font-black text-zinc-950">Initialize Sequence</p>
                    </div>
                  </label>
                ) : (
                  <div className="h-[480px] w-full">
                    <RecordingInterface onRecordingComplete={processAudio} status={status} setStatus={setStatus} />
                  </div>
                )}
              </div>
            </div>
            {error && <div className="mt-8 text-red-600 font-black bg-red-50 px-8 py-3 rounded-2xl border border-red-100">{error}</div>}
          </div>
        ) : (status === AppStatus.UPLOADING || status === AppStatus.PROCESSING) ? (
          <div className="w-full max-w-xl flex flex-col items-center gap-12 text-center reveal">
             <div className="w-24 h-24 border-[6px] border-zinc-100 border-t-blue-600 rounded-full animate-spin" />
             <div className="space-y-4">
                <h3 className="text-4xl font-black text-zinc-950">{status === AppStatus.UPLOADING ? 'Ingesting Sequence' : 'Synthesizing...'}</h3>
                <p className="text-blue-600 font-black uppercase text-[10px] tracking-[0.4em] animate-pulse">{progressMsg}</p>
             </div>
          </div>
        ) : status === AppStatus.COMPLETED && result ? (
          <TranscriptionPanel result={result} onClose={reset} />
        ) : null}
      </main>
    </div>
  );
};

export default App;