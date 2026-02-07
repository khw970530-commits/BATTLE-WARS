
import React from 'react';

interface HeaderProps {
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onToggleMenu: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenAuth, onToggleMenu }) => {
  return (
    <header className="h-14 md:h-16 bg-[#0a0a0c]/80 backdrop-blur-md border-b border-zinc-800 flex items-center justify-between px-3 md:px-8 sticky top-0 z-50">
      <div className="flex items-center gap-2 md:gap-8 min-w-0">
        <button 
          onClick={onToggleMenu}
          className="md:hidden p-1.5 text-zinc-400 hover:text-white shrink-0"
        >
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>

        <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
          <div className="w-6 h-6 md:w-8 md:h-8 bg-red-600 rounded-lg flex items-center justify-center font-bold text-white italic text-xs md:text-base">BW</div>
          <span className="text-base md:text-xl font-black tracking-tighter text-white uppercase truncate hidden xs:block">Battle <span className="text-red-600">Wars</span></span>
          <span className="text-base font-black tracking-tighter text-white uppercase block xs:hidden">B<span className="text-red-600">W</span></span>
        </div>
        
        <div className="relative w-48 lg:w-96 hidden md:block">
          <input 
            type="text" 
            placeholder="선별된 게임 검색..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-full px-10 py-2 text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-red-600 transition-all placeholder:text-zinc-600"
          />
          <svg className="absolute left-4 top-2.5 w-4 h-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="flex items-center gap-1.5 md:gap-6 shrink-0">
        <div className="flex items-center gap-1 md:gap-4">
          <button 
            onClick={() => onOpenAuth('login')}
            className="text-[10px] md:text-xs font-bold text-zinc-400 hover:text-white transition-colors px-1.5 py-1"
          >
            로그인
          </button>
          <button 
            onClick={() => onOpenAuth('signup')}
            className="bg-red-600 hover:bg-red-700 text-white text-[9px] md:text-[11px] font-black px-2.5 md:px-5 py-1.5 md:py-2 rounded-full transition-all shadow-lg shadow-red-600/10 active:scale-95 uppercase tracking-tighter"
          >
            회원가입
          </button>
        </div>
        
        <div className="h-4 w-[1px] bg-zinc-800 hidden md:block"></div>

        <button className="p-2 text-zinc-400 hover:text-white transition-colors relative hidden sm:block">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full border-2 border-[#0a0a0c]"></span>
        </button>
      </div>
    </header>
  );
};

export default Header;
