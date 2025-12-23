import React from 'react';

interface Props {
  onLogoClick: () => void;
}

const Header: React.FC<Props> = ({ onLogoClick }) => {
  return (
    <header className="sticky top-0 left-0 right-0 z-[100] px-[13px] sm:px-6 py-4 sm:py-6 pointer-events-none">
      <div className="max-w-6xl mx-auto flex justify-between items-center bg-white/80 backdrop-blur-xl border border-white px-[13px] sm:px-6 py-2.5 sm:py-3 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] pointer-events-auto">
        <button 
          onClick={onLogoClick}
          className="flex items-center gap-2.5 sm:gap-3.5 group cursor-pointer text-left focus:outline-none"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-zinc-950 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-500 group-hover:bg-blue-600 shadow-xl shadow-zinc-200 group-hover:shadow-blue-200 active:scale-90">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <div className="flex flex-col -space-y-0.5 sm:space-y-0">
            <h1 className="text-base sm:text-lg font-black tracking-tight text-zinc-950 leading-none transition-colors group-hover:text-blue-600">Scribe<span className="text-blue-600 group-hover:text-zinc-950">Flow</span></h1>
            <span className="text-[7px] sm:text-[8px] font-black text-zinc-400 uppercase tracking-[0.2em] opacity-80">Intelligence v3.0</span>
          </div>
        </button>
        
        <div className="flex items-center gap-2 sm:gap-3">
          <a 
            href="https://creativebilal.com/portfolio/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hidden md:flex text-[11px] sm:text-[12px] font-bold text-zinc-600 hover:text-zinc-950 px-3 py-2 transition-all rounded-xl hover:bg-white/50"
          >
            Portfolio
          </a>
          <a 
            href="https://creativebilal.com/contact/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[10px] sm:text-[12px] font-black bg-zinc-950 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 active:scale-95 flex items-center gap-1.5 sm:gap-2"
          >
            <span>Contact</span>
            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;