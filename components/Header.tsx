
import React from 'react';

interface Props {
  onLogoClick: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const Header: React.FC<Props> = ({ onLogoClick, theme, onToggleTheme }) => {
  return (
    <header className="sticky top-0 left-0 right-0 z-[100] px-[13px] sm:px-6 py-4 sm:py-6 pointer-events-none">
      <div className="max-w-6xl mx-auto flex justify-between items-center bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-white dark:border-zinc-800 px-[13px] sm:px-6 py-2.5 sm:py-3 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-none pointer-events-auto transition-colors duration-500">
        <button 
          onClick={onLogoClick}
          className="flex items-center gap-2.5 sm:gap-3.5 group cursor-pointer text-left focus:outline-none"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-zinc-950 dark:bg-white rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-500 group-hover:bg-blue-600 dark:group-hover:bg-blue-500 shadow-xl shadow-zinc-200 dark:shadow-none active:scale-90">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white dark:text-zinc-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <div className="flex flex-col -space-y-0.5 sm:space-y-0">
            <h1 className="text-base sm:text-lg font-black tracking-tight text-zinc-950 dark:text-white leading-none transition-colors group-hover:text-blue-600">Scribe<span className="text-blue-600 group-hover:text-zinc-950 dark:group-hover:text-white">Flow</span></h1>
            <span className="text-[7px] sm:text-[8px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] opacity-80">Intelligence v3.0</span>
          </div>
        </button>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={onToggleTheme}
            className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center bg-zinc-50 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all border border-zinc-100 dark:border-zinc-700 active:scale-90 group relative overflow-hidden"
            aria-label="Toggle Theme"
          >
            <div className={`transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${theme === 'dark' ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" />
              </svg>
            </div>
            <div className={`absolute transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${theme === 'light' ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </div>
          </button>

          <a 
            href="https://creativebilal.com/contact/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[10px] sm:text-[12px] font-black bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all shadow-xl shadow-zinc-200 dark:shadow-none active:scale-95 flex items-center gap-1.5 sm:gap-2"
          >
            <span className="hidden xs:inline">Hire</span> Bilal
            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
