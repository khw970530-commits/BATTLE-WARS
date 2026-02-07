
import { Game } from './types';

export const CATEGORIES = [
  { id: 'all', name: '전체', icon: '🏠' },
  { id: 'strategy', name: '전략/보드', icon: '♟️' },
];

export const MOCK_GAMES: Game[] = [
  {
    id: 'yacht-01',
    title: '로얄 요트 다이스',
    category: 'strategy',
    thumbnail: 'https://images.unsplash.com/photo-1553481187-be93c21490a9?auto=format&fit=crop&w=600&q=80',
    players: 856,
    isHot: true,
    isTop: true
  }
];
