
import React, { useState } from 'react';
import Header from './components/Header';
import RecordingInterface from './components/RecordingInterface';
import TranscriptionPanel from './components/TranscriptionPanel';
import { AppStatus, TranscriptionResult, AudioMetadata } from './types';
import { transcribeAudio, fileToBase64, formatFileSize } from './services/geminiService';

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
      setProgressMsg("Creative Bilal's AI isolating semantic intent...");
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
    <div className="min-h-screen w-full flex flex-col bg-[#f8f9fb] relative selection:bg-blue-100 selection:text-blue-900">
      {/* Background Glows */}
      <div className="fixed top-[-300px] left-[-300px] w-[1000px] h-[1000px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-[-300px] right-[-300px] w-[1000px] h-[1000px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none z-0" />
      
      {/* 1. FIXED HEADER */}
      <Header onLogoClick={reset} />
      
      {/* 2. CENTERED BODY */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-[13px] sm:px-6 flex flex-col items-center justify-center relative z-10 py-10 sm:py-20">
        {status === AppStatus.IDLE || status === AppStatus.RECORDING || status === AppStatus.PAUSED ? (
          <div className="w-full flex flex-col items-center gap-10 sm:gap-20 text-center reveal">
            <div className="space-y-4 sm:space-y-8 max-w-4xl">
              <div className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-1.5 sm:py-2 bg-blue-50 border border-blue-100 rounded-full mx-auto">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-600 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                <span className="text-[9px] sm:text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] sm:tracking-[0.3em]">Agency Intelligence Enabled</span>
              </div>
              <h2 className="text-5xl xs:text-6xl sm:text-8xl font-black tracking-tight text-zinc-950 leading-[0.9] stagger-1">
                Precision <span className="shimmer-text">Scribe.</span>
              </h2>
              <p className="text-sm sm:text-xl text-zinc-500 font-medium max-w-2xl mx-auto stagger-2 leading-relaxed px-4">
                Professional-grade audio intelligence engineered by <span className="text-zinc-950 font-black border-b-2 border-blue-100/50">Creative Bilal Agency</span>.
              </p>
            </div>

            <div className="w-full max-w-3xl flex flex-col items-center gap-8 sm:gap-12 stagger-3">
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
                      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(90deg, #000 1.5px, transparent 1.5px), linear-gradient(#000 1.5px, transparent 1.5px)', backgroundSize: '48px 48px' }} />
                      <div className="relative w-20 h-20 sm:w-28 sm:h-28">
                        <div className="absolute inset-0 bg-blue-600/10 rounded-full blur-2xl group-hover:bg-blue-600/20 transition-all duration-700 group-hover:scale-150" />
                        <div className="relative w-full h-full bg-white border border-zinc-100 rounded-[28px] sm:rounded-[36px] flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2 group-hover:bg-zinc-950 overflow-hidden">
                          <svg className="w-10 h-10 sm:w-14 sm:h-14 text-zinc-400 group-hover:text-white transition-colors duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                          </svg>
                        </div>
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
            
            {error && <div className="mt-8 text-red-600 text-[11px] font-black bg-red-50 px-8 py-3 rounded-2xl border border-red-100 shadow-xl shadow-red-100/20">{error}</div>}

            {/* Features Section - Updated with premium backgrounds */}
            <div className="w-full max-w-6xl mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 text-left stagger-3 border-t border-zinc-100 pt-16">
              {[
                { title: "Verbatim Proof", desc: "Gemini 3 Pro precision for world-class spoken word capture.", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
                { title: "Neural Cleanup", desc: "Advanced noise removal and semantic logic for pristine output.", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
                { title: "Agency Standards", desc: "High-end enterprise grade workflows and encrypted security.", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" }
              ].map((item, i) => (
                <div key={i} className="group p-8 rounded-[40px] bg-white/40 backdrop-blur-sm border border-white hover:bg-white hover:shadow-2xl hover:border-zinc-100 transition-all duration-500 shadow-sm flex flex-col items-start text-left">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-zinc-950 group-hover:text-white transition-all mb-6">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={item.icon}/></svg>
                  </div>
                  <h4 className="text-[14px] font-black text-zinc-950 tracking-tight uppercase mb-2">{item.title}</h4>
                  <p className="text-[11px] text-zinc-500 font-medium leading-relaxed max-w-[240px]">{item.desc}</p>
                </div>
              ))}
            </div>
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
                <h3 className="text-3xl sm:text-4xl font-black text-zinc-950 tracking-tighter">{status === AppStatus.UPLOADING ? 'Ingesting Sequence' : 'Synthesizing...'}</h3>
                <p className="text-blue-600 font-black uppercase text-[10px] tracking-[0.4em] animate-pulse">{progressMsg || 'Processing Neural Core'}</p>
             </div>
          </div>
        ) : status === AppStatus.COMPLETED && result ? (
          <div className="w-full">
            <TranscriptionPanel result={result} onClose={reset} />
          </div>
        ) : null}
      </main>

      {/* 3. REFINED FOOTER - Updated with top-only rounded corners */}
      <footer className="w-full mt-auto px-[13px] sm:px-6 z-10">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-6 py-8 sm:py-10 bg-white/40 backdrop-blur-sm border-t border-l border-r border-white/50 rounded-t-[32px] sm:rounded-t-[40px] rounded-b-none px-6 sm:px-12">
          <div className="w-full flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col items-center md:items-start gap-1">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-zinc-950 rounded-md flex items-center justify-center shadow-lg shadow-zinc-200">
                   <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                </div>
                <span className="text-[12px] font-black text-zinc-950 uppercase tracking-[0.2em]">ScribeFlow Elite</span>
              </div>
              <p className="text-[9px] sm:text-[10px] text-zinc-400 font-bold uppercase tracking-[0.1em] text-center md:text-left">© {new Date().getFullYear()} Creative Bilal Agency. World-Class AI Standards.</p>
            </div>
            
            <div className="flex items-center gap-8 sm:gap-10">
               <a href="https://creativebilal.com/portfolio/" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-1">
                 <span className="text-[10px] font-black text-zinc-400 group-hover:text-zinc-950 uppercase tracking-[0.2em] transition-colors">Portfolio</span>
                 <span className="w-0 h-[2px] bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full" />
               </a>
               <a href="https://creativebilal.com/contact/" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-1">
                 <span className="text-[10px] font-black text-zinc-400 group-hover:text-zinc-950 uppercase tracking-[0.2em] transition-colors">Hire Bilal</span>
                 <span className="w-0 h-[2px] bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full" />
               </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
