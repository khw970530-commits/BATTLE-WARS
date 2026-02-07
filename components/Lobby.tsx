
import React, { useState, useEffect, useMemo } from 'react';
import { Game, Room, SettlementMode } from '../types';
import CreateRoomModal from './CreateRoomModal';

interface LobbyProps {
  game: Game;
  onBack: () => void;
  onEnterRoom: (room: Room) => void;
}

const Lobby: React.FC<LobbyProps> = ({ game, onBack, onEnterRoom }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);
  const [activeTab, setActiveTab] = useState<'all' | 'mine'>('all');
  
  const loadingMessages = [
    "INITIALIZING SATELLITE UPLINK...",
    "FILTERING SIGNAL NOISE...",
    "DECRYPTING BATTLE DATA...",
    "RECOVERING ACTIVE SIGNALS..."
  ];

  const [rooms, setRooms] = useState<Room[]>([
    {
      id: 'room-1',
      gameId: game.id,
      title: '고수만 오세요 (내기 빡세게)',
      host: 'Warrior99',
      maxPlayers: 4,
      currentPlayers: 2,
      betAmount: 50000,
      isPrivate: false,
      createdAt: new Date(),
      participants: []
    },
    {
      id: 'room-2',
      gameId: game.id,
      title: '초보 환영 즐겜방',
      host: 'GamerX',
      maxPlayers: 2,
      currentPlayers: 1,
      betAmount: 15000,
      isPrivate: true,
      password: '1234',
      createdAt: new Date(),
      participants: []
    },
    {
      id: 'room-3',
      gameId: game.id,
      title: '내가 만든 연습 전장',
      host: '나',
      maxPlayers: 2,
      currentPlayers: 1,
      betAmount: 10000,
      isPrivate: false,
      createdAt: new Date(),
      participants: []
    }
  ]);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setLoadingStep(prev => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
    }, 450);

    const timer = setTimeout(() => {
      setIsLoading(false);
      clearInterval(messageInterval);
    }, 2200);

    return () => {
      clearTimeout(timer);
      clearInterval(messageInterval);
    };
  }, [game.id]);

  const filteredRooms = useMemo(() => {
    if (activeTab === 'mine') {
      return rooms.filter(room => room.host === '나');
    }
    return rooms;
  }, [rooms, activeTab]);

  const handleCreateRoom = (settings: { title: string; maxPlayers: number; isPrivate: boolean; betAmount: number; settlementMode: SettlementMode }) => {
    const newRoom: Room = {
      id: `room-${Date.now()}`,
      gameId: game.id,
      title: settings.title,
      host: '나',
      maxPlayers: settings.maxPlayers,
      currentPlayers: 1,
      betAmount: settings.betAmount,
      isPrivate: settings.isPrivate,
      settlementMode: settings.settlementMode,
      createdAt: new Date(),
      participants: []
    };
    onEnterRoom(newRoom);
  };

  const handleRoomClick = (room: Room) => {
    if (room.isPrivate) {
      setSelectedRoom(room);
      setIsPasswordModalOpen(true);
      setPasswordInput('');
      setPasswordError(false);
    } else {
      onEnterRoom(room);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRoom && passwordInput === selectedRoom.password) {
      setIsPasswordModalOpen(false);
      onEnterRoom(selectedRoom);
    } else {
      setPasswordError(true);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0a0c] overflow-hidden">
      <header className="p-6 md:p-10 border-b border-zinc-800 bg-zinc-900/10 flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-600 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-red-600 font-black text-[10px] uppercase tracking-widest">{game.category} Arena</span>
            </div>
            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">{game.title} <span className="text-zinc-700 ml-2">Lobby</span></h2>
          </div>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-red-600 hover:bg-red-700 text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-red-600/10 transition-all active:scale-95 uppercase tracking-widest text-xs flex items-center justify-center gap-3"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
          방 만들기
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-6 md:p-10 relative">
        <div className="max-w-6xl mx-auto h-full flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10">
              <div className="relative w-72 h-72 md:w-96 md:h-96 mb-12 flex items-center justify-center">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-600/60 rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-600/60 rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-600/60 rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-600/60 rounded-br-lg"></div>
                <div className="absolute inset-4 border border-zinc-800/40 rounded-full"></div>
                <div className="absolute inset-16 border border-zinc-800/40 rounded-full"></div>
                <div className="absolute inset-32 border border-zinc-800/40 rounded-full"></div>
                <div className="absolute top-1/2 left-0 w-full h-px bg-zinc-800/20"></div>
                <div className="absolute left-1/2 top-0 w-px h-full bg-zinc-800/20"></div>
                <div className="absolute inset-0 animate-[spin_4s_linear_infinite]">
                  <div className="absolute top-0 left-1/2 w-[2px] h-1/2 bg-gradient-to-t from-transparent via-red-600/40 to-red-600 origin-bottom"></div>
                  <div className="absolute top-0 left-1/2 w-24 h-1/2 bg-gradient-to-tr from-transparent via-red-600/5 to-red-600/20 origin-bottom transform -rotate-15 blur-md"></div>
                </div>
                <div className="absolute bottom-4 left-4 text-[7px] text-red-600/40 font-black uppercase tracking-widest animate-pulse">
                   SCANNING...
                </div>
                <div className="relative z-10 w-20 h-20 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center shadow-2xl overflow-hidden group">
                  <div className="absolute inset-0 bg-red-600/5 animate-pulse"></div>
                  <svg className="w-10 h-10 text-red-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex flex-col items-center max-w-sm w-full space-y-4">
                <div className="w-full flex justify-between items-end px-1">
                    <span className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.2em]">Signal Integrity</span>
                    <span className="text-red-600 text-[10px] font-black italic">{Math.round(((loadingStep + 1) / loadingMessages.length) * 100)}%</span>
                </div>
                <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-800/50">
                  <div 
                    className="h-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)] transition-all duration-500 ease-out" 
                    style={{ width: `${((loadingStep + 1) / loadingMessages.length) * 100}%` }}
                  ></div>
                </div>
                <div className="text-center">
                  <p className="text-white font-black uppercase tracking-[0.3em] italic text-sm mb-1">
                    {loadingMessages[loadingStep]}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out flex-1 flex flex-col">
              <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-6 border-b border-zinc-800 pb-6">
                <div className="flex bg-zinc-900/50 p-1 rounded-2xl border border-zinc-800">
                  <button 
                    onClick={() => setActiveTab('all')}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      activeTab === 'all' 
                      ? 'bg-red-600 text-white shadow-lg' 
                      : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    All Arenas
                  </button>
                  <button 
                    onClick={() => setActiveTab('mine')}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      activeTab === 'mine' 
                      ? 'bg-red-600 text-white shadow-lg' 
                      : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    My Battlefields
                  </button>
                </div>
              </div>

              {filteredRooms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRooms.map((room) => (
                    <div 
                      key={room.id}
                      onClick={() => handleRoomClick(room)}
                      className="group bg-[#111114] border border-zinc-800 rounded-3xl p-6 hover:border-red-600/50 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-56 shadow-lg hover:shadow-red-600/5"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-zinc-800 group-hover:bg-red-600 transition-colors" />
                      
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="text-white font-black text-lg truncate mb-1 italic tracking-tight uppercase">{room.title}</h4>
                          <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">Host: {room.host === '나' ? 'YOU' : room.host}</p>
                        </div>
                        <div className="flex gap-2">
                          {room.host === '나' && (
                            <span className="bg-red-600/10 text-red-600 text-[8px] font-black px-2 py-1 rounded-lg border border-red-600/20 uppercase">Admin</span>
                          )}
                          {room.isPrivate && (
                            <span className="bg-zinc-800 p-2 rounded-xl text-zinc-500">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Warriors</span>
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-24 bg-zinc-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-red-600" 
                                style={{ width: `${(room.currentPlayers / room.maxPlayers) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs font-black text-white">{room.currentPlayers} / {room.maxPlayers}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
                          <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Min Stakes</span>
                          <span className="text-xl font-black text-white italic">{room.betAmount.toLocaleString()} <span className="text-[10px] non-italic text-red-600 ml-1">P</span></span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-20 opacity-50 space-y-4">
                  <p className="text-zinc-500 uppercase tracking-[0.3em] font-black text-sm italic">No active signals detected</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <CreateRoomModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onCreate={handleCreateRoom}
      />

      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsPasswordModalOpen(false)} />
          <div className="relative w-full max-w-sm bg-[#0f0f12] border border-zinc-800 rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8">
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <input 
                  type="password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError(false);
                  }}
                  placeholder="비밀번호 입력..."
                  className={`w-full bg-zinc-900 border ${passwordError ? 'border-red-600' : 'border-zinc-800'} rounded-xl px-5 py-3 text-sm text-white text-center focus:outline-none focus:border-red-600 transition-all`}
                />
                <button 
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded-xl shadow-lg transition-all active:scale-95 uppercase tracking-widest text-[10px]"
                >
                  Authorize
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lobby;
