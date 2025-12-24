
import React, { useState, useRef, useEffect } from 'react';
import { TranscriptionResult } from '../types';
import { translateText } from '../services/geminiService';

interface Props {
  result: TranscriptionResult;
  onClose: () => void;
}

const LANGUAGES = [
  "Arabic", "Chinese", "English", "French", "German", 
  "Hindi", "Italian", "Japanese", "Portuguese", 
  "Russian", "Spanish", "Turkish", "Urdu"
];

const TranscriptionPanel: React.FC<Props> = ({ result, onClose }) => {
  const [editableText, setEditableText] = useState(result.text);
  const [copyStatus, setCopyStatus] = useState<'Copy' | 'Copied!'>('Copy');
  const [isTranslating, setIsTranslating] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [translationStatus, setTranslationStatus] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(editableText);
    setCopyStatus('Copied!');
    setTimeout(() => setCopyStatus('Copy'), 2000);
  };

  const handleDownload = () => {
    const file = new Blob([editableText], {type: 'text/plain'});
    const element = document.createElement("a");
    const url = URL.createObjectURL(file);
    element.href = url;
    element.download = `ScribeFlow_${result.fileName?.split('.')[0] || 'Transcript'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(url);
  };

  const handleTranslate = async (lang: string) => {
    setShowLangMenu(false);
    setIsTranslating(true);
    try {
      const translated = await translateText(editableText, lang, setTranslationStatus);
      setEditableText(translated);
    } catch (err) {
      alert("Translation encountered a neural fault.");
    } finally {
      setIsTranslating(false);
      setTranslationStatus('');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 sm:gap-8 reveal px-0 sm:px-0">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-6 bg-white dark:bg-zinc-900 p-5 sm:p-7 border border-zinc-100 dark:border-zinc-800 rounded-3xl shadow-[0_15px_40px_-15px_rgba(0,0,0,0.03)] dark:shadow-none transition-colors duration-500">
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="w-11 h-11 sm:w-14 sm:h-14 bg-zinc-950 dark:bg-white rounded-2xl flex items-center justify-center text-white dark:text-zinc-950 shadow-2xl shadow-zinc-200 dark:shadow-none flex-shrink-0 transition-colors">
             <svg className="w-5 h-5 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="min-w-0">
            <h3 className="text-[14px] sm:text-[17px] font-black text-zinc-950 dark:text-white truncate max-w-[150px] xs:max-w-[200px] sm:max-w-md">{result.fileName || 'Untitled Sequence'}</h3>
            <div className="flex items-center gap-1.5 mt-1">
               <span className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${isTranslating ? 'bg-blue-500 animate-ping' : 'bg-green-500 animate-pulse'}`} />
               <span className="text-[8px] sm:text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest truncate">
                 {isTranslating ? translationStatus : 'Transcription Verified'}
               </span>
            </div>
          </div>
        </div>

        {/* Action Buttons Group */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 relative">
          {/* Neural Translate Dropdown */}
          <div className="relative flex-1 min-w-[100px] sm:flex-none" ref={menuRef}>
            <button 
              onClick={() => setShowLangMenu(!showLangMenu)}
              disabled={isTranslating}
              className={`w-full flex items-center justify-center gap-1.5 px-3 sm:px-5 py-3 sm:py-3.5 ${showLangMenu ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950' : 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white'} text-[9px] sm:text-[12px] font-black uppercase tracking-wider rounded-xl sm:rounded-2xl transition-all border border-zinc-100 dark:border-zinc-700 active:scale-95 shadow-sm hover:border-blue-200 dark:hover:border-blue-700 group whitespace-nowrap`}
            >
              <svg className={`w-3.5 h-3.5 transition-transform duration-500 ${showLangMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <span>{isTranslating ? 'Wait...' : 'Translate'}</span>
            </button>
            
            {/* Smooth Swish Dropdown Container */}
            <div 
              className={`absolute top-full left-0 mt-3 w-44 sm:w-48 bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.12)] dark:shadow-none z-[100] p-1.5 origin-top-left transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                showLangMenu 
                  ? 'opacity-100 scale-100 translate-y-0 visible' 
                  : 'opacity-0 scale-90 -translate-y-4 invisible pointer-events-none'
              }`}
            >
              <div className="max-h-[250px] overflow-y-auto custom-scrollbar p-1">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleTranslate(lang)}
                    className="w-full text-left px-4 py-2.5 text-[10px] sm:text-[11px] font-black text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 rounded-xl transition-all uppercase tracking-widest"
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button 
            onClick={handleCopy}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 sm:px-5 py-3 sm:py-3.5 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-950 dark:text-white text-[9px] sm:text-[12px] font-black uppercase tracking-wider rounded-xl sm:rounded-2xl transition-all border border-zinc-100 dark:border-zinc-700 active:scale-95 whitespace-nowrap"
          >
            {copyStatus === 'Copied!' ? (
              <svg className="w-3.5 h-3.5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
            )}
            {copyStatus}
          </button>
          
          <button 
            onClick={handleDownload}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 sm:px-5 py-3 sm:py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-[9px] sm:text-[12px] font-black uppercase tracking-wider rounded-xl sm:rounded-2xl transition-all shadow-xl shadow-blue-100 dark:shadow-none active:scale-95 whitespace-nowrap"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export
          </button>
        </div>
      </div>

      {/* Main Text Content */}
      <div className={`premium-container group ${isTranslating ? 'active animate-pulse border-blue-200' : 'active'}`}>
        <div className="inner-content p-1 sm:p-2 bg-zinc-50/30 dark:bg-zinc-950/30 relative">
          <textarea
            value={editableText}
            onChange={(e) => setEditableText(e.target.value)}
            spellCheck={false}
            disabled={isTranslating}
            className={`w-full h-[450px] sm:h-[600px] p-5 sm:p-12 pb-20 sm:pb-24 bg-white dark:bg-zinc-900 rounded-[28px] sm:rounded-[44px] text-zinc-800 dark:text-zinc-100 text-sm sm:text-lg leading-relaxed sm:leading-loose font-medium focus:outline-none resize-none border-none shadow-inner transition-all ${isTranslating ? 'opacity-40' : 'opacity-100'}`}
            placeholder="No sequence data found..."
          />
          
          {/* Internal Accuracy Disclaimer - Now Center Bottom Inside */}
          {!isTranslating && (
            <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 w-full max-w-[90%] text-center pointer-events-none">
              <p className="text-[7px] sm:text-[9px] text-zinc-300 dark:text-zinc-600 font-medium tracking-wider uppercase opacity-80">
                ScribeFlow is a high-fidelity AI system; results may contain inaccuracies, please verify critical information.
              </p>
            </div>
          )}

          {isTranslating && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
               <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
               <p className="text-zinc-950 dark:text-white font-black text-[11px] uppercase tracking-widest">{translationStatus}</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer / Reset Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-4 px-4 sm:px-0">
        <div className="flex flex-col gap-1">
           <div className="text-[11px] sm:text-[13px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.25em]">
             Say Thanks to Bilal
           </div>
           <div className="w-12 h-1 bg-blue-600/20 rounded-full" />
        </div>
        
        <button 
          onClick={onClose}
          className="group flex items-center gap-2.5 text-[10px] sm:text-[12px] font-black text-zinc-400 dark:text-zinc-500 hover:text-zinc-950 dark:hover:text-white transition-all uppercase tracking-[0.2em]"
        >
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Return to Hub
        </button>
      </div>
    </div>
  );
};

export default TranscriptionPanel;
