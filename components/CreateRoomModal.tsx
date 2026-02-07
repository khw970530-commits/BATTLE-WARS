
import React, { useState } from 'react';
import { SettlementMode } from '../types';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (settings: { title: string; maxPlayers: number; isPrivate: boolean; betAmount: number; settlementMode: SettlementMode }) => void;
}

const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ isOpen, onClose, onCreate }) => {
  // 방 제목 무작위 생성
  const [title, setTitle] = useState(() => `Battle-${Math.floor(Math.random() * 9000) + 1000}`);
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [isPrivate, setIsPrivate] = useState(false);
  const [betAmount, setBetAmount] = useState(1000);
  const [settlementMode, setSettlementMode] = useState<SettlementMode>('LOSER_PAYS_ALL');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#0f0f12] border border-zinc-800 rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="absolute top-0 left-0 w-full h-1 bg-red-600" />
        <div className="p-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">New Operation</h2>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">새로운 전장을 설계하십시오</p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2 ml-1">Mission Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="전장 이름을 입력하세요"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-3 text-sm text-white focus:outline-none focus:border-red-600 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2 ml-1">Max Warriors</label>
                <select 
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600 appearance-none cursor-pointer"
                >
                  {[2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}명</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2 ml-1">Bet Amount</label>
                <div className="relative">
                  <input 
                    type="number"
                    min="1000"
                    max="10000"
                    step="500"
                    value={betAmount}
                    onChange={(e) => setBetAmount(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-red-600">P</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2 ml-1">Settlement Rule</label>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setSettlementMode('WINNER_TAKES_ALL')}
                  className={`py-2.5 rounded-xl border text-[9px] font-black uppercase transition-all ${settlementMode === 'WINNER_TAKES_ALL' ? 'border-red-600 bg-red-600/10 text-red-600' : 'border-zinc-800 text-zinc-500'}`}
                >
                  승자 독식
                </button>
                <button 
                  onClick={() => setSettlementMode('LOSER_PAYS_ALL')}
                  className={`py-2.5 rounded-xl border text-[9px] font-black uppercase transition-all ${settlementMode === 'LOSER_PAYS_ALL' ? 'border-red-600 bg-red-600/10 text-red-600' : 'border-zinc-800 text-zinc-500'}`}
                >
                  꼴찌 독박
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2 ml-1">Access Type</label>
              <button 
                onClick={() => setIsPrivate(!isPrivate)}
                className={`w-full h-[46px] rounded-xl border font-bold text-[11px] uppercase transition-all flex items-center justify-center gap-2 ${
                  isPrivate ? 'bg-red-600/10 border-red-600 text-red-600' : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                }`}
              >
                {isPrivate ? '🔒 Private' : '🔓 Public'}
              </button>
            </div>

            <button 
              onClick={() => onCreate({ title, maxPlayers, isPrivate, betAmount, settlementMode })}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl shadow-xl shadow-red-600/20 active:scale-95 transition-all uppercase tracking-widest text-xs mt-2"
            >
              대기실 생성 및 입장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRoomModal;
