
import React, { useState, useEffect, useRef } from 'react';
import { Game, Room, Participant, ChatMessage, SettlementMode } from '../types';
import { calculateSettlement, SettlementResult } from '../services/settlementService';
import YachtDice from './games/YachtDice';

interface GameRoomProps {
  game: Game;
  room: Room;
  onExit: () => void;
}

const AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Trirta',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jasper',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Milo',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Kiki',
];

const GameRoom: React.FC<GameRoomProps> = ({ game, room: initialRoom, onExit }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isStarted, setIsStarted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [decision, setDecision] = useState<SettlementResult | null>(null);
  const [showExitWarning, setShowExitWarning] = useState(false);

  // 방 설정 상태 (방장만 수정 가능)
  const [roomTitle, setRoomTitle] = useState(initialRoom.title);
  const [roomBet, setRoomBet] = useState(initialRoom.betAmount);
  const [roomIsPrivate, setRoomIsPrivate] = useState(initialRoom.isPrivate);
  const [roomPassword, setRoomPassword] = useState(initialRoom.password || '');
  const [roomSettlementMode, setRoomSettlementMode] = useState<SettlementMode>(initialRoom.settlementMode || 'LOSER_PAYS_ALL');

  // 준비 및 시작 상태
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownRef = useRef<number | null>(null);

  useEffect(() => {
    const bots: Participant[] = [];
    for (let i = 1; i < initialRoom.maxPlayers; i++) {
      bots.push({
        id: `bot-${i}`,
        name: `Warrior-${i}`,
        avatar: AVATARS[i % AVATARS.length],
        isReady: true, // 봇은 항상 준비 완료 상태
        isHost: false,
        level: Math.floor(Math.random() * 5) + 1
      });
    }
    // '나'는 항상 호스트로 설정 (데모 목적)
    setParticipants([
      { id: 'me', name: '나 (Guest77)', avatar: AVATARS[0], isReady: true, isHost: true, level: 4 },
      ...bots
    ]);
  }, [initialRoom]);

  // 방장을 제외한 모든 참가자가 준비되었는지 확인
  const othersReady = participants.length > 0 && participants.filter(p => !p.isHost).every(p => p.isReady);

  const handleStartGame = () => {
    if (!othersReady) return;
    setCountdown(5);
    countdownRef.current = 5;

    const timer = setInterval(() => {
      if (countdownRef.current !== null && countdownRef.current > 0) {
        countdownRef.current -= 1;
        setCountdown(countdownRef.current);
      } else {
        clearInterval(timer);
        setIsStarted(true);
        setCountdown(null);
        setMessages([{ role: 'system', content: '전투가 시작되었습니다.', timestamp: new Date() }]);
      }
    }, 1000);
  };

  const handleResetAllReady = () => {
    if (countdown !== null) return;
    setParticipants(prev => prev.map(p => p.isHost ? p : { ...p, isReady: false }));
    handleGameEvent("방장이 모든 참가자의 준비 상태를 해제했습니다.");
  };

  const handleGameEvent = (log: string) => {
    setMessages(prev => [...prev, { role: 'system', content: log, timestamp: new Date() }]);
  };

  const handleGameOver = (finalScores: Record<string, number>) => {
    const result = calculateSettlement(participants, finalScores, roomBet, roomSettlementMode);
    setDecision(result);
  };

  const ExitWarningModal = () => (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowExitWarning(false)} />
      <div className="relative w-full max-w-sm bg-[#0f0f12] border border-zinc-800 rounded-[2rem] p-8 shadow-2xl">
        <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-4 text-center">전장 이탈 경고</h3>
        <p className="text-zinc-500 text-[11px] font-bold uppercase text-center mb-6">게임을 중단하면 즉시 패배 처리되며 판돈을 잃게 됩니다.</p>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setShowExitWarning(false)} className="bg-zinc-900 text-zinc-500 font-black py-4 rounded-xl uppercase tracking-widest text-[10px]">복귀</button>
          <button onClick={onExit} className="bg-red-600 text-white font-black py-4 rounded-xl uppercase tracking-widest text-[10px]">탈주</button>
        </div>
      </div>
    </div>
  );

  if (!isStarted) {
    return (
      <div className="fixed inset-0 bg-[#0a0a0c] z-[100] flex flex-col p-6 md:p-10 animate-in fade-in overflow-hidden">
        <style>{`
          input[type=number]::-webkit-outer-spin-button,
          input[type=number]::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          input[type=number] {
            -moz-appearance: textfield;
          }
        `}</style>
        <header className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-6 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-white font-black italic text-2xl uppercase tracking-tighter">{roomTitle} <span className="text-zinc-700 ml-2">Lobby</span></h1>
            <div className="bg-red-600/10 border border-red-600/20 rounded-full px-4 py-1 text-[10px] font-black text-red-600 uppercase tracking-widest">
              {roomBet.toLocaleString()} P Stakes
            </div>
          </div>
          <button onClick={onExit} className="bg-zinc-800 text-zinc-400 px-6 py-2 rounded-lg text-xs font-black uppercase transition-colors hover:bg-zinc-700">나가기</button>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row gap-8 overflow-hidden">
          {/* Room Settings (Host Only) */}
          <div className="w-full lg:w-80 bg-zinc-900/30 border border-zinc-800 rounded-[2rem] p-8 flex flex-col gap-6 shrink-0 overflow-y-auto">
            <div className="mb-2">
              <h2 className="text-white font-black italic uppercase text-sm tracking-widest">Mission Config</h2>
              <p className="text-zinc-600 text-[9px] font-bold uppercase mt-1">방장 설정 {othersReady && '(모두 준비 시 잠금)'}</p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">Room Title</label>
                <input 
                  type="text"
                  value={roomTitle}
                  onChange={(e) => setRoomTitle(e.target.value)}
                  disabled={othersReady || countdown !== null}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-red-600 outline-none transition-all disabled:opacity-30"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">Bet Amount (P)</label>
                <div className="relative">
                  <input 
                    type="number"
                    min="1000"
                    max="10000"
                    step="500"
                    value={roomBet}
                    onChange={(e) => setRoomBet(Number(e.target.value))}
                    disabled={othersReady || countdown !== null}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-red-600 outline-none transition-all disabled:opacity-30"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-red-600 font-black text-[10px]">P</span>
                </div>
                <p className="text-[8px] text-zinc-600 mt-1 ml-1 uppercase font-bold tracking-tighter">Range 1,000 ~ 10,000P / Step 500P</p>
              </div>

              <div>
                <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">Settlement Rule</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setRoomSettlementMode('WINNER_TAKES_ALL')}
                    disabled={othersReady || countdown !== null}
                    className={`py-2 rounded-xl border text-[9px] font-black uppercase transition-all ${roomSettlementMode === 'WINNER_TAKES_ALL' ? 'border-red-600 bg-red-600/10 text-red-600' : 'border-zinc-800 text-zinc-500'}`}
                  >
                    승자 독식
                  </button>
                  <button 
                    onClick={() => setRoomSettlementMode('LOSER_PAYS_ALL')}
                    disabled={othersReady || countdown !== null}
                    className={`py-2 rounded-xl border text-[9px] font-black uppercase transition-all ${roomSettlementMode === 'LOSER_PAYS_ALL' ? 'border-red-600 bg-red-600/10 text-red-600' : 'border-zinc-800 text-zinc-500'}`}
                  >
                    꼴찌 독박
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">Access Mode</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setRoomIsPrivate(false)}
                    disabled={othersReady || countdown !== null}
                    className={`flex-1 py-2 rounded-xl border text-[10px] font-black uppercase transition-all ${!roomIsPrivate ? 'border-red-600 bg-red-600/10 text-red-600' : 'border-zinc-800 text-zinc-500 disabled:opacity-30'}`}
                  >
                    Public
                  </button>
                  <button 
                    onClick={() => setRoomIsPrivate(true)}
                    disabled={othersReady || countdown !== null}
                    className={`flex-1 py-2 rounded-xl border text-[10px] font-black uppercase transition-all ${roomIsPrivate ? 'border-red-600 bg-red-600/10 text-red-600' : 'border-zinc-800 text-zinc-500 disabled:opacity-30'}`}
                  >
                    Private
                  </button>
                </div>
              </div>

              {roomIsPrivate && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">Passcode</label>
                  <input 
                    type="password" 
                    value={roomPassword}
                    onChange={(e) => setRoomPassword(e.target.value)}
                    disabled={othersReady || countdown !== null}
                    placeholder="비밀번호 설정"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-red-600 outline-none transition-all disabled:opacity-30"
                  />
                </div>
              )}

              <button 
                onClick={handleResetAllReady}
                disabled={countdown !== null}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 font-black py-3 rounded-xl text-[10px] uppercase tracking-widest transition-all border border-zinc-700 active:scale-95 disabled:opacity-30"
              >
                전체 준비 해제
              </button>
            </div>
            
            <div className="mt-auto pt-6 border-t border-zinc-800">
               <div className="bg-zinc-950 p-4 rounded-2xl flex items-center justify-between">
                  <span className="text-[9px] font-black text-zinc-600 uppercase">Signal Status</span>
                  <span className={`text-[9px] font-black uppercase ${othersReady ? 'text-green-500' : 'text-yellow-500 animate-pulse'}`}>
                    {othersReady ? 'ENGAGEMENT_LOCKED' : 'WAITING_SIG'}
                  </span>
               </div>
            </div>
          </div>

          {/* Player Grid */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pr-2">
            {participants.map(p => (
              <div key={p.id} className={`bg-zinc-900/50 border transition-all duration-500 rounded-3xl p-6 flex items-center justify-between h-fit ${p.isReady ? 'border-green-500/30 bg-green-500/5 shadow-[0_0_20px_rgba(34,197,94,0.05)]' : 'border-zinc-800'}`}>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img src={p.avatar} className="w-16 h-16 rounded-full border-2 border-zinc-800" />
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-zinc-900 flex items-center justify-center text-[8px] font-black ${p.isReady ? 'bg-green-500 text-zinc-900' : 'bg-zinc-800 text-zinc-500'}`}>
                      {p.isReady ? '✓' : '?'}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-white font-black italic">{p.name}</p>
                      {p.isHost && <span className="text-[8px] bg-red-600 text-white px-1.5 py-0.5 rounded font-black italic uppercase">HOST</span>}
                    </div>
                    <p className={`text-[9px] font-black uppercase tracking-widest mt-0.5 ${p.isReady ? 'text-green-500' : 'text-zinc-600'}`}>
                      {p.isHost ? 'Commanding' : p.isReady ? 'Ready for Battle' : 'Awaiting Readiness'}
                    </p>
                  </div>
                </div>
                
                {!p.isHost && p.id === 'me' && (
                  <button 
                    onClick={() => setParticipants(prev => prev.map(item => item.id === 'me' ? { ...item, isReady: !item.isReady } : item))}
                    disabled={countdown !== null}
                    className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${p.isReady ? 'bg-zinc-800 text-zinc-500' : 'bg-red-600 text-white shadow-lg shadow-red-600/20'}`}
                  >
                    {p.isReady ? '준비 해제' : '준비 완료'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Start Button & Countdown Overlay */}
        <div className="mt-8 pt-8 border-t border-zinc-800 flex justify-center shrink-0">
          <div className="w-full max-w-2xl relative">
            {countdown === null ? (
              <button 
                onClick={handleStartGame} 
                disabled={!othersReady}
                className={`w-full py-6 rounded-3xl font-black uppercase tracking-[0.5em] text-xl transition-all relative overflow-hidden group ${othersReady ? 'bg-red-600 text-white shadow-[0_15px_40px_rgba(220,38,38,0.3)] hover:scale-[1.02] active:scale-95' : 'bg-zinc-900 text-zinc-700 border border-zinc-800 cursor-not-allowed'}`}
              >
                <span className="relative z-10 italic">{othersReady ? '작전 개시 (Start Battle)' : '참가자 대기 중...'}</span>
              </button>
            ) : (
              <div className="w-full py-6 bg-red-600 rounded-3xl text-white font-black flex items-center justify-center gap-6 shadow-[0_0_50px_rgba(220,38,38,0.5)] animate-pulse">
                 <span className="text-[10px] uppercase tracking-[0.3em] opacity-80">전술 통신망 활성화 중...</span>
                 <span className="text-5xl italic font-black">{countdown}</span>
                 <span className="text-[10px] uppercase tracking-[0.3em] opacity-80 italic">전투 구역 진입</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#0a0a0c] z-[100] flex flex-col md:flex-row overflow-hidden">
      <div className="w-full md:w-48 bg-[#111114] border-r border-zinc-800 flex flex-col p-4 shrink-0">
        <h3 className="text-zinc-600 font-black text-[10px] uppercase tracking-widest mb-4">Warriors</h3>
        <div className="flex-1 space-y-3 overflow-y-auto">
          {participants.map(p => (
            <div key={p.id} className="flex items-center gap-2">
              <img src={p.avatar} className="w-6 h-6 rounded-full border border-zinc-800" />
              <span className={`text-[11px] font-bold truncate ${p.isReady ? 'text-zinc-200' : 'text-zinc-600'}`}>{p.name}</span>
            </div>
          ))}
        </div>
        <button onClick={() => setShowExitWarning(true)} className="w-full bg-zinc-900 text-zinc-500 py-2.5 mt-4 rounded-xl font-black text-[9px] uppercase hover:bg-zinc-800 transition-colors">게임 포기</button>
      </div>

      <div className="flex-1 flex flex-col relative overflow-hidden h-full">
        <div className="h-12 border-b border-zinc-800 flex items-center px-6 bg-zinc-950/50 justify-between shrink-0">
          <h2 className="text-white font-black text-[11px] italic uppercase truncate">Live: {roomTitle}</h2>
          <span className="text-red-600 text-[10px] font-black uppercase tracking-widest shrink-0">{roomBet.toLocaleString()} P</span>
        </div>

        <div className="flex-1 relative overflow-hidden h-full">
          <YachtDice participants={participants} onScoreUpdate={handleGameEvent} onGameOver={handleGameOver} />
          {decision && (
            <div className="absolute inset-0 z-[200] flex items-center justify-center p-8 bg-black/95 backdrop-blur-md">
              <div className="bg-[#111114] border border-zinc-800 rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl relative animate-in zoom-in-95">
                <div className="text-center mb-8">
                  <span className="text-red-600 font-black text-[10px] uppercase tracking-widest">결과 보고</span>
                  <h2 className="text-3xl font-black text-white mt-2 uppercase italic">{decision.winner} 승리!</h2>
                  <p className="text-zinc-500 text-[10px] mt-2 font-bold uppercase tracking-widest">{decision.reason}</p>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-2 mb-8 pr-2">
                  {decision.payouts.map(p => (
                    <div key={p.name} className="flex justify-between items-center p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                      <div className="flex flex-col">
                        <span className="text-zinc-400 font-bold text-[9px] uppercase tracking-widest">{p.name}</span>
                      </div>
                      <span className={`text-md font-black italic ${p.amount >= 0 ? 'text-green-500' : 'text-red-600'}`}>
                        {p.amount > 0 ? '+' : ''}{p.amount.toLocaleString()} P
                      </span>
                    </div>
                  ))}
                </div>
                <div className="bg-zinc-900/30 p-4 rounded-2xl mb-6 border border-zinc-800/30">
                  <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] text-center">정산 방식: {decision.mode === 'WINNER_TAKES_ALL' ? '승자 독식' : '꼴찌 독박'}</p>
                </div>
                <button onClick={onExit} className="w-full bg-red-600 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-xs shadow-lg shadow-red-600/20 active:scale-95 transition-all">베이스로 복귀</button>
              </div>
            </div>
          )}
        </div>
      </div>
      {showExitWarning && <ExitWarningModal />}
    </div>
  );
};

export default GameRoom;
