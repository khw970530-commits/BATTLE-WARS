
import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import GameCard from './components/GameCard';
import GameRoom from './components/GameRoom';
import Lobby from './components/Lobby';
import AuthModal from './components/AuthModal';
import PaymentModal from './components/PaymentModal';
import { MOCK_GAMES } from './constants';
import { Game, Room } from './types';

const App: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [balance, setBalance] = useState(100000);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  const handleCharge = (amount: number) => {
    setBalance(prev => prev + amount);
  };

  const filteredGames = useMemo(() => {
    if (selectedCategory === 'all') return MOCK_GAMES;
    return MOCK_GAMES.filter(g => g.category === selectedCategory);
  }, [selectedCategory]);

  const renderContent = () => {
    if (activeRoom && activeGame) {
      return <GameRoom game={activeGame} room={activeRoom} onExit={() => setActiveRoom(null)} />;
    }
    if (activeGame) {
      return <Lobby game={activeGame} onBack={() => setActiveGame(null)} onEnterRoom={(room) => setActiveRoom(room)} />;
    }
    return (
      <main className="flex-1 overflow-y-auto bg-[#0a0a0c] px-4 md:px-12 py-10">
        <div className="relative h-56 rounded-[2rem] overflow-hidden mb-12 group shadow-2xl max-w-6xl mx-auto border border-zinc-800/50">
          <img src="https://images.unsplash.com/photo-1553481187-be93c21490a9?auto=format&fit=crop&w=1200&q=80" className="absolute inset-0 w-full h-full object-cover brightness-[0.2]" alt="Hero" />
          <div className="relative h-full flex flex-col justify-center px-12">
            <h1 className="text-4xl font-black text-white mb-3 italic uppercase tracking-tighter">로얄 요트 다이스, <br /> 정밀한 정산으로 완벽해집니다.</h1>
            <p className="text-zinc-400 mb-6 max-w-md text-xs leading-relaxed opacity-80 font-medium">친구들과 함께 클래식 주사위 배틀을 즐기고 <br />포인트 기반의 공정한 정산을 경험하세요.</p>
            <button onClick={() => setActiveGame(MOCK_GAMES[0])} className="w-fit bg-red-600 text-white text-xs font-black px-8 py-3 rounded-xl shadow-xl uppercase tracking-widest">바로 시작하기</button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-black text-white italic uppercase mb-8">Selection Games</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredGames.map((game) => (
              <GameCard key={game.id} game={game} onClick={(g) => setActiveGame(g)} />
            ))}
          </div>
        </div>
      </main>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0c]">
      <Header onOpenAuth={openAuth} onToggleMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar balance={balance} onOpenPayment={() => setIsPaymentModalOpen(true)} selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} isOpen={isMobileMenuOpen} />
        {renderContent()}
      </div>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} initialMode={authMode} />
      <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} onCharge={handleCharge} />
    </div>
  );
};

export default App;
