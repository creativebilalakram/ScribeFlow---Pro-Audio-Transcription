
import React, { useState, useEffect, Component, ReactNode } from 'react';
import Header from './components/Header';
import RecordingInterface from './components/RecordingInterface';
import TranscriptionPanel from './components/TranscriptionPanel';
import { AppStatus, TranscriptionResult, AudioMetadata } from './types';
import { transcribeAudio, fileToBase64, formatFileSize } from './services/geminiService';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// Fixed ErrorBoundary by ensuring it correctly extends Component with props and state types
// and explicitly defining the state member for type safety.
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Explicitly define state property to resolve "Property 'state' does not exist" errors
  public state: ErrorBoundaryState = { hasError: false };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(_: any): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ScribeFlow Runtime Error:", error, errorInfo);
  }

  render() {
    // Accessing state property which is now explicitly defined on the class
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6 transition-colors duration-500">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-zinc-950 dark:text-zinc-50">System Instability Detected</h1>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">An unexpected error occurred in the ScribeFlow core. Please refresh to restore operations.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-zinc-950 dark:bg-zinc-50 dark:text-zinc-950 text-white font-black rounded-2xl shadow-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all active:scale-95"
            >
              Restart ScribeFlow
            </button>
          </div>
        </div>
      );
    }
    // Accessing props.children which is inherited from the Component base class
    return this.props.children;
  }
}

const AppContent: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [progressMsg, setProgressMsg] = useState<string>('');
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [meta, setMeta] = useState<AudioMetadata | null>(null);
  const [inputMode, setInputMode] = useState<'upload' | 'record'>('upload');
  const [error, setError] = useState<string | null>(null);
  
  // Theme Management - Defaulted to 'light' (white) as requested
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('scribeflow-theme');
    if (saved) return saved as 'light' | 'dark';
    // Default to light even if system is dark, to satisfy user request
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('scribeflow-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  useEffect(() => {
    if (status === AppStatus.COMPLETED) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [status]);

  const processAudio = async (blob: Blob, name: string) => {
    try {
      setError(null);
      setStatus(AppStatus.UPLOADING);
      setProgressMsg("Syncing with Global Neural Cluster...");
      
      const base64 = await fileToBase64(blob);
      const mimeType = blob.type.includes('webm') ? 'audio/webm' : blob.type;
      
      setMeta({ name, size: formatFileSize(blob.size), type: mimeType });
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
    setMeta(null);
    setError(null);
    setProgressMsg('');
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#f8f9fb] dark:bg-zinc-950 relative selection:bg-blue-100 selection:text-blue-900 transition-colors duration-500">
      <div className="fixed top-[-300px] left-[-300px] w-[1000px] h-[1000px] bg-blue-500/5 dark:bg-blue-500/10 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-[-300px] right-[-300px] w-[1000px] h-[1000px] bg-indigo-500/5 dark:bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none z-0" />
      
      <Header onLogoClick={reset} theme={theme} onToggleTheme={toggleTheme} />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-[13px] sm:px-6 flex flex-col items-center justify-center relative z-10 py-10 sm:py-20">
        {status === AppStatus.IDLE || status === AppStatus.RECORDING || status === AppStatus.PAUSED || status === AppStatus.ERROR ? (
          <div className="w-full flex flex-col items-center gap-10 sm:gap-16 text-center reveal">
            <div className="space-y-3 sm:space-y-4 w-full">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 bg-blue-50/60 dark:bg-blue-900/20 border border-blue-100/50 dark:border-blue-800/50 rounded-full mx-auto">
                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-blue-600 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                <span className="text-[7px] sm:text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.12em] sm:tracking-[0.15em]">Agency Intelligence Enabled</span>
              </div>
              <h2 className="text-[38px] xs:text-[48px] sm:text-[8vw] md:text-[10vw] lg:text-[110px] font-black tracking-tighter text-zinc-950 dark:text-white leading-[0.9] stagger-1 whitespace-nowrap overflow-hidden py-2">
                Precision <span className="shimmer-text">Scribe.</span>
              </h2>
              <p className="text-sm sm:text-xl text-zinc-500 dark:text-zinc-400 font-medium max-w-2xl mx-auto stagger-2 leading-relaxed px-4">
                Professional-grade audio intelligence engineered for elite performance by <span className="text-zinc-950 dark:text-white font-black border-b-2 border-blue-100/50 dark:border-blue-900/50">Creative Bilal Agency</span>.
              </p>
            </div>

            <div className="w-full max-w-3xl flex flex-col items-center gap-8 sm:gap-12 stagger-3">
              <div className="relative inline-flex p-1 bg-white dark:bg-zinc-900 shadow-xl shadow-zinc-200/40 dark:shadow-none rounded-[18px] sm:rounded-[24px] border border-zinc-100 dark:border-zinc-800 transition-colors">
                <div 
                  className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-zinc-950 dark:bg-zinc-50 rounded-[14px] sm:rounded-[20px] shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                    inputMode === 'upload' ? 'translate-x-0' : 'translate-x-full'
                  }`}
                />
                <button onClick={() => setInputMode('upload')} className={`relative z-10 px-6 sm:px-12 py-2 sm:py-3.5 text-[10px] sm:text-[13px] font-black rounded-[14px] sm:rounded-[20px] transition-colors duration-500 ${inputMode === 'upload' ? 'text-white dark:text-zinc-950' : 'text-zinc-400 dark:text-zinc-500'}`}>File Upload</button>
                <button onClick={() => setInputMode('record')} className={`relative z-10 px-6 sm:px-12 py-2.5 sm:py-3.5 text-[10px] sm:text-[13px] font-black rounded-[14px] sm:rounded-[20px] transition-colors duration-500 ${inputMode === 'record' ? 'text-white dark:text-zinc-950' : 'text-zinc-400 dark:text-zinc-500'}`}>Live Capture</button>
              </div>

              <div className="w-full max-w-[340px] xs:max-w-[400px] sm:max-w-3xl">
                {inputMode === 'upload' ? (
                  <label className="premium-container block cursor-pointer w-full group h-[340px] sm:h-[480px]">
                    <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
                    <div className="inner-content flex flex-col items-center justify-center gap-6 sm:gap-10 p-8">
                      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'linear-gradient(90deg, #000 1.5px, transparent 1.5px), linear-gradient(#000 1.5px, transparent 1.5px)', backgroundSize: '48px 48px' }} />
                      <div className="relative w-20 h-20 sm:w-28 sm:h-28">
                        <div className="absolute inset-0 bg-blue-600/10 rounded-full blur-2xl group-hover:bg-blue-600/20 transition-all duration-700 group-hover:scale-150" />
                        <div className="relative w-full h-full bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[28px] sm:rounded-[36px] flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2 group-hover:bg-zinc-950 dark:group-hover:bg-white overflow-hidden">
                          <svg className="w-10 h-10 sm:w-14 sm:h-14 text-zinc-400 group-hover:text-white dark:group-hover:text-zinc-950 transition-colors duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xl sm:text-2xl font-black text-zinc-950 dark:text-white tracking-tight">Initialize Sequence</p>
                        <p className="text-[8px] sm:text-[11px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-[0.3em]">WAV, MP3, WEBM (100MB)</p>
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
              <div className="mt-8 text-red-600 dark:text-red-400 text-[11px] font-black bg-red-50 dark:bg-red-900/10 px-8 py-3 rounded-2xl border border-red-100 dark:border-red-900/20 shadow-xl shadow-red-100/20 dark:shadow-none flex items-center gap-3">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                {error}
              </div>
            )}

            <div className="w-full max-w-6xl mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 text-left stagger-3 border-t border-zinc-100 dark:border-zinc-800 pt-16">
              {[
                { title: "Verbatim Proof", desc: "Gemini 3 Pro precision for world-class spoken word capture.", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
                { title: "Neural Cleanup", desc: "Advanced noise removal and semantic logic for pristine output.", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
                { title: "Agency Standards", desc: "High-end enterprise grade workflows and encrypted security.", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" }
              ].map((item, i) => (
                <div key={i} className="group p-8 rounded-[40px] bg-white/40 dark:bg-zinc-900/40 backdrop-blur-sm border border-white dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-900 hover:shadow-2xl dark:hover:shadow-none transition-all duration-500 shadow-sm flex flex-col items-start text-left">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 flex items-center justify-center text-zinc-400 dark:text-zinc-500 group-hover:bg-zinc-950 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-zinc-950 transition-all mb-6">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={item.icon}/></svg>
                  </div>
                  <h4 className="text-[14px] font-black text-zinc-950 dark:text-white tracking-tight uppercase mb-2">{item.title}</h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed max-w-[240px]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (status === AppStatus.UPLOADING || status === AppStatus.PROCESSING) ? (
          <div className="w-full max-w-xl flex flex-col items-center gap-12 text-center reveal">
             <div className="relative">
                <div className="w-24 h-24 sm:w-32 sm:h-32 border-[6px] border-zinc-100 dark:border-zinc-800 border-t-blue-600 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse shadow-[0_0_40px_rgba(59,130,246,0.8)]" />
                </div>
             </div>
             <div className="space-y-4">
                <h3 className="text-3xl sm:text-4xl font-black text-zinc-950 dark:text-white tracking-tighter">
                  {status === AppStatus.UPLOADING ? 'Ingesting Sequence' : 'Synthesizing...'}
                </h3>
                <p className="text-blue-600 dark:text-blue-400 font-black uppercase text-[10px] tracking-[0.4em] animate-pulse">
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

      <footer className="w-full mt-auto px-[13px] sm:px-6 z-10">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-6 py-8 sm:py-10 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-sm border-t border-l border-r border-white/50 dark:border-zinc-800 rounded-t-[32px] sm:rounded-t-[40px] px-6 sm:px-12">
          <div className="w-full flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col items-center md:items-start gap-1">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-zinc-950 dark:bg-white rounded-md flex items-center justify-center shadow-lg shadow-zinc-200 dark:shadow-none">
                   <svg className="w-3 h-3 text-white dark:text-zinc-950" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                </div>
                <span className="text-[12px] font-black text-zinc-950 dark:text-white uppercase tracking-[0.2em]">ScribeFlow Elite</span>
              </div>
              <p className="text-[9px] sm:text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-[0.1em] text-center md:text-left">© {new Date().getFullYear()} Creative Bilal Agency. World-Class AI Standards.</p>
            </div>
            
            <div className="flex items-center gap-8 sm:gap-10">
               <a href="https://creativebilal.com/portfolio/" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-1">
                 <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-950 dark:group-hover:text-white uppercase tracking-[0.2em] transition-colors">Portfolio</span>
                 <span className="w-0 h-[2px] bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full" />
               </a>
               <a href="https://creativebilal.com/contact/" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-1">
                 <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-950 dark:group-hover:text-white uppercase tracking-[0.2em] transition-colors">Contact</span>
                 <span className="w-0 h-[2px] bg-blue-600 transition-all duration-300 group-hover:w-full rounded-full" />
               </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => (
  <ErrorBoundary>
    <AppContent />
  </ErrorBoundary>
);

export default App;
