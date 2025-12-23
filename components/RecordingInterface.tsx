import React, { useState, useRef, useEffect } from 'react';
import { AppStatus } from '../types';

interface Props {
  onRecordingComplete: (blob: Blob, name: string) => void;
  status: AppStatus;
  setStatus: (status: AppStatus) => void;
}

const RecordingInterface: React.FC<Props> = ({ onRecordingComplete, status, setStatus }) => {
  const [seconds, setSeconds] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (status === AppStatus.RECORDING) {
      timerRef.current = window.setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  const handleMicClick = async () => {
    if (status === AppStatus.RECORDING) {
      stopRecording();
      return;
    }
    
    // UI shift to "Requesting" state - this will trigger the 'requesting' CSS class 
    // which kills animations to prevent browser overlay protection from triggering.
    setIsRequesting(true);
    setMicError(null);

    // Minor delay to ensure any CSS transitions settle and overlays hide before the browser dialog pops up.
    await new Promise(r => setTimeout(r, 150));

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMicError("Media Devices API not supported.");
      setIsRequesting(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const name = `Live_Sequence_${new Date().toLocaleTimeString().replace(/:/g,'-')}.webm`;
        onRecordingComplete(blob, name);
        stream.getTracks().forEach(track => track.stop());
      };
      
      recorder.start();
      setStatus(AppStatus.RECORDING);
      setIsRequesting(false);
    } catch (err: any) {
      console.error("Mic Access Error:", err);
      if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setMicError("Microphone not found.");
      } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicError("Mic access required.");
      } else {
        setMicError("Hardware Access Error.");
      }
      setIsRequesting(false);
      setStatus(AppStatus.IDLE);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && status === AppStatus.RECORDING) {
      mediaRecorderRef.current.stop();
      setStatus(AppStatus.IDLE);
      setSeconds(0);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`premium-container w-full h-full ${status === AppStatus.RECORDING ? 'active' : ''} ${isRequesting ? 'requesting' : ''}`}>
      <div className="inner-content flex flex-col items-center justify-center p-6 sm:p-12 gap-8 sm:gap-10">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }} />
        
        <div className="flex flex-col items-center gap-2">
          <div className={`px-4 py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${isRequesting ? 'bg-blue-600 text-white' : status === AppStatus.RECORDING ? 'bg-zinc-950 text-white' : 'bg-zinc-50 text-zinc-400 border border-zinc-100'}`}>
            {isRequesting ? 'Authorizing Mic' : status === AppStatus.RECORDING ? 'Sequence Live' : 'System Standby'}
          </div>
          <div className={`text-6xl sm:text-8xl font-mono font-black tracking-tighter transition-all duration-700 ${status === AppStatus.RECORDING ? 'text-zinc-950 scale-105 sm:scale-110' : 'text-zinc-200'}`}>
            {formatTime(seconds)}
          </div>
        </div>

        <div className="relative">
          <button
            onClick={handleMicClick}
            disabled={isRequesting}
            className={`w-20 h-20 sm:w-28 sm:h-28 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl relative group ${
              status === AppStatus.RECORDING 
              ? 'bg-zinc-950 text-white shadow-zinc-300' 
              : 'bg-blue-600 text-white shadow-blue-200 hover:scale-110'
            } ${isRequesting ? 'opacity-50' : ''}`}
          >
            {status === AppStatus.IDLE || isRequesting ? (
              <>
                <div className={`absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20 ${isRequesting ? 'block' : 'hidden'}`} />
                <svg className="w-8 h-8 sm:w-12 sm:h-12 relative z-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
              </>
            ) : (
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg sm:rounded-xl transition-all duration-300 group-hover:rotate-90" />
            )}
          </button>
          
          {isRequesting && (
            <div className="absolute top-full mt-6 left-1/2 -translate-x-1/2 w-max text-center space-y-1 sm:space-y-2">
              <p className="text-[9px] sm:text-[11px] font-black text-zinc-950 uppercase tracking-widest">Please allow access</p>
              <p className="text-[8px] sm:text-[10px] text-zinc-400 font-medium">Click "Allow" in your browser bubble</p>
            </div>
          )}
          
          {micError && (
            <div className="absolute top-full mt-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-in zoom-in-95 duration-300">
               <p className="text-[9px] sm:text-[10px] text-red-500 font-black uppercase w-max bg-red-50 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl border border-red-100 shadow-xl">
                 {micError}
               </p>
               <button 
                 onClick={() => setMicError(null)}
                 className="text-[8px] sm:text-[9px] font-black text-zinc-400 uppercase tracking-widest hover:text-zinc-600 transition-colors"
               >
                 Dismiss
               </button>
            </div>
          )}
        </div>

        <div className="text-center pt-4 sm:pt-8">
          <p className="text-[8px] sm:text-[10px] font-black text-zinc-300 uppercase tracking-[0.3em]">Encrypted Session • Agency v3.0</p>
        </div>
      </div>
    </div>
  );
};

export default RecordingInterface;