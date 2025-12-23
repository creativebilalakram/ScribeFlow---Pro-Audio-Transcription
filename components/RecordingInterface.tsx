import React, { useState, useRef, useEffect } from 'react';
import { AppStatus } from '../types.ts';

interface Props {
  onRecordingComplete: (blob: Blob, name: string) => void;
  status: AppStatus;
  setStatus: (status: AppStatus) => void;
}

const RecordingInterface: React.FC<Props> = ({ onRecordingComplete, status, setStatus }) => {
  const [seconds, setSeconds] = useState(0);
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
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [status]);

  const handleMicClick = async () => {
    if (status === AppStatus.RECORDING) {
      stopRecording();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onRecordingComplete(blob, `Live_${Date.now()}.webm`);
        stream.getTracks().forEach(t => t.stop());
      };
      recorder.start();
      setStatus(AppStatus.RECORDING);
    } catch (err) {
      alert("Mic access denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setStatus(AppStatus.IDLE);
      setSeconds(0);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  return (
    <div className={`premium-container w-full h-full ${status === AppStatus.RECORDING ? 'active' : ''}`}>
      <div className="inner-content flex flex-col items-center justify-center p-12 gap-10">
        <div className="text-8xl font-mono font-black text-zinc-950">
          {formatTime(seconds)}
        </div>
        <button
          onClick={handleMicClick}
          className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl ${
            status === AppStatus.RECORDING ? 'bg-zinc-950 text-white' : 'bg-blue-600 text-white hover:scale-110'
          }`}
        >
          {status === AppStatus.RECORDING ? (
            <div className="w-10 h-10 bg-white rounded-xl" />
          ) : (
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default RecordingInterface;