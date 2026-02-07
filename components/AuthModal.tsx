
import React, { useState, useEffect } from 'react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setConfirmPassword('');
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'signup' && password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    console.log('Form submitted:', { mode, email, password, nickname });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-xl transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-[#0f0f12] border-t sm:border border-zinc-800/50 rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.5)] transition-all animate-in slide-in-from-bottom duration-500 ease-out">
        {/* Accent Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600"></div>
        
        {/* Mobile Pull Indicator */}
        <div className="sm:hidden flex justify-center py-2.5">
          <div className="w-10 h-1 bg-zinc-800 rounded-full"></div>
        </div>

        <div className="px-6 pb-6 pt-1 sm:p-10">
          <div className="flex flex-col items-center mb-6 sm:mb-8">
            <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center font-black text-white italic text-xl mb-3 shadow-[0_8px_20px_rgba(220,38,38,0.3)] transform -rotate-3">BW</div>
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">
              {mode === 'login' ? 'Warrior Login' : 'New Recruit'}
            </h2>
            <p className="text-zinc-500 text-[9px] mt-1.5 uppercase tracking-[0.2em] font-black opacity-60">
              {mode === 'login' ? '시스템에 접속하십시오' : '전장의 일원이 되십시오'}
            </p>
          </div>

          <form className="space-y-3" onSubmit={handleSubmit}>
            {/* 1. Email Field */}
            <div>
              <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1 ml-1">Email Address</label>
              <div className="relative group">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="warrior@battlewars.com"
                  className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-5 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all"
                  required
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-red-600 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
              </div>
            </div>
            
            {/* 2. Password Field */}
            <div>
              <div className="flex justify-between items-center mb-1 ml-1">
                <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest">Secret Code</label>
                {mode === 'login' && (
                  <button type="button" className="text-[8px] font-black text-red-600 uppercase tracking-tighter hover:underline">비밀번호 찾기</button>
                )}
              </div>
              <div className="relative group">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-5 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all"
                  required
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-red-600 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
              </div>
            </div>

            {mode === 'signup' && (
              <>
                {/* 3. Confirm Password Field */}
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1 ml-1">Confirm Code</label>
                  <div className="relative group">
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="비밀번호 확인"
                      className={`w-full bg-zinc-900/80 border rounded-xl px-5 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 transition-all ${
                        confirmPassword && password !== confirmPassword 
                        ? 'border-red-500 focus:ring-red-500/20' 
                        : 'border-zinc-800 focus:ring-red-600/20 focus:border-red-600'
                      }`}
                      required
                    />
                    <div className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${
                      confirmPassword && password !== confirmPassword ? 'text-red-500' : 'text-zinc-700 group-focus-within:text-red-600'
                    }`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    </div>
                  </div>
                </div>

                {/* 4. Nickname Field */}
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                  <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1 ml-1">Warrior Nickname</label>
                  <div className="relative group">
                    <input 
                      type="text" 
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="사용할 닉네임"
                      className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-5 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all"
                      required
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-red-600 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                  </div>
                </div>
              </>
            )}

            <button 
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl transition-all shadow-[0_10px_25px_rgba(220,38,38,0.25)] active:scale-[0.98] mt-4 text-xs uppercase tracking-[0.2em] relative overflow-hidden group h-12"
            >
              <span className="relative z-10">{mode === 'login' ? '로그인 실행' : '참전 승인'}</span>
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
          </form>

          <div className="mt-6">
            <div className="relative flex items-center justify-center mb-5">
              <div className="w-full border-t border-zinc-800/50"></div>
              <span className="absolute bg-[#0f0f12] px-3 text-[8px] font-black text-zinc-600 uppercase tracking-[0.25em]">소셜 네트워크 연결</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2.5 bg-zinc-900/50 border border-zinc-800/50 hover:bg-zinc-800/80 hover:border-zinc-700 py-2.5 rounded-xl transition-all active:scale-95 group">
                <svg className="w-4 h-4 text-white transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.908 3.152-1.896 4.14-1.224 1.224-3.132 2.592-6.528 2.592-5.46 0-9.84-4.416-9.84-9.84s4.38-9.84 9.84-9.84c2.928 0 5.16 1.152 6.708 2.616l2.304-2.304C18.816 1.488 15.936 0 12.48 0 5.856 0 0 5.856 0 12.48s5.856 12.48 12.48 12.48c3.504 0 6.516-1.152 8.976-3.756 2.472-2.472 3.24-5.928 3.24-8.736 0-.828-.06-1.62-.18-2.364H12.48z"/></svg>
                <span className="text-[10px] font-black text-white uppercase tracking-tighter">Google</span>
              </button>
              <button className="flex items-center justify-center gap-2.5 bg-zinc-900/50 border border-zinc-800/50 hover:bg-zinc-800/80 hover:border-zinc-700 py-2.5 rounded-xl transition-all active:scale-95 group">
                <svg className="w-4 h-4 text-white transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
                <span className="text-[10px] font-black text-white uppercase tracking-tighter">GitHub</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Toggle */}
        <div className="bg-zinc-900/30 px-8 py-5 flex justify-center border-t border-zinc-800/50 mb-safe">
          <p className="text-[11px] text-zinc-500 font-medium">
            {mode === 'login' ? '아직 소속이 없으신가요?' : '이미 소속되어 있으신가요?'}
            <button 
              type="button"
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="ml-2 text-red-600 font-black hover:text-red-500 transition-colors uppercase tracking-tight underline decoration-red-600/30 underline-offset-4"
            >
              {mode === 'login' ? '회원가입' : '로그인'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
