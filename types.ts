
export interface Participant {
  id: string;
  name: string;
  avatar: string;
  isReady: boolean;
  isHost: boolean;
  level: number;
}

export type SettlementMode = 'WINNER_TAKES_ALL' | 'LOSER_PAYS_ALL';

export interface Game {
  id: string;
  title: string;
  category: string;
  thumbnail: string;
  players: number;
  isHot?: boolean;
  isTop?: boolean;
}

export interface Room {
  id: string;
  gameId: string;
  title: string;
  host: string;
  maxPlayers: number;
  currentPlayers: number;
  betAmount: number;
  isPrivate: boolean;
  password?: string;
  createdAt: Date;
  participants: Participant[];
  settlementMode?: SettlementMode;
}

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  senderName?: string;
  content: string;
  timestamp: Date;
}
