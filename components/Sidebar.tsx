
import React from 'react';
import { CATEGORIES } from '../constants';

interface SidebarProps {
  balance: number;
  onOpenPayment: () => void;
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  isOpen?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ balance, onOpenPayment, selectedCategory, onSelectCategory, isOpen }) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
          onClick={() => onSelectCategory(selectedCategory)}
        />
      )}

      <aside className={`
        fixed md:static inset-y-0 left-0 z-[70] md:z-auto
        w-64 bg-[#111114] border-r border-zinc-800 flex-shrink-0 flex flex-col h-full 
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 flex-1">
          <div className="flex items-center justify-between md:hidden mb-6">
            <h2 className="text-white font-black uppercase tracking-tighter italic">Menu</h2>
            <button onClick={() => onSelectCategory(selectedCategory)} className="text-zinc-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <h2 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-4">카테고리</h2>
          <nav className="space-y-1">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                  selectedCategory === category.id
                    ? 'bg-red-600 text-white'
                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                }`}
              >
                <span className="text-lg">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 border-t border-zinc-800 bg-zinc-900/20">
          <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 flex flex-col gap-3">
            <div>
              <p className="text-[10px] text-zinc-500 mb-1 uppercase tracking-widest font-bold">내 잔액</p>
              <div className="flex items-end gap-1">
                <p className="text-2xl font-black text-white">{balance.toLocaleString()}</p>
                <p className="text-sm font-bold text-red-600 mb-1">P</p>
              </div>
            </div>
            <button 
              onClick={onOpenPayment}
              className="w-full bg-zinc-800 hover:bg-red-600 hover:text-white text-zinc-400 text-[11px] font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              포인트 충전
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
