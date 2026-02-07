
import React from 'react';
import { Game } from '../types';

interface GameCardProps {
  game: Game;
  onClick: (game: Game) => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, onClick }) => {
  return (
    <div 
      onClick={() => onClick(game)}
      className="group relative bg-[#1c1c20] rounded-xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:-translate-y-2 hover:ring-2 hover:ring-[#7b2ff7]"
    >
      <div className="aspect-video relative overflow-hidden">
        <img 
          src={game.thumbnail} 
          alt={game.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-2 left-2 flex gap-1">
          {game.isTop && (
            <span className="bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded shadow-lg">⭐ TOP</span>
          )}
          {game.isHot && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg">🔥 HOT</span>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <button className="w-full bg-[#7b2ff7] text-white py-2 rounded-lg font-bold text-sm">플레이 하기</button>
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-bold text-sm text-zinc-100 truncate">{game.title}</h3>
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-zinc-500">{game.category}</span>
          <span className="text-xs text-[#7b2ff7] font-medium">{game.players.toLocaleString()}명 접속 중</span>
        </div>
      </div>
    </div>
  );
};

export default GameCard;
