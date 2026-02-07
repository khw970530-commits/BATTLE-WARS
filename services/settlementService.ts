
import { Participant, SettlementMode } from '../types';

export interface SettlementResult {
  winner: string;
  loser?: string;
  reason: string;
  payouts: { name: string; amount: number }[];
  mode: SettlementMode;
}

export const calculateSettlement = (
  participants: Participant[], 
  scores: Record<string, number>, 
  betAmount: number,
  mode: SettlementMode = 'WINNER_TAKES_ALL'
): SettlementResult => {
  // 점수 순 정렬
  const sorted = [...participants].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0));
  const winner = sorted[0];
  const loser = sorted[sorted.length - 1];
  
  const playerCount = participants.length;
  const totalStakes = betAmount * (playerCount - 1);
  
  let payouts: { name: string; amount: number }[] = [];
  let reason = "";

  if (mode === 'WINNER_TAKES_ALL') {
    reason = `1위 ${winner.name}님이 모든 판돈을 획득했습니다!`;
    payouts = participants.map(p => {
      if (p.id === winner.id) return { name: p.name, amount: totalStakes };
      return { name: p.name, amount: -betAmount };
    });
  } else {
    // LOSER_PAYS_ALL (꼴찌 독박)
    reason = `꼴찌 ${loser.name}님이 모든 플레이어의 배당금을 지불합니다!`;
    payouts = participants.map(p => {
      if (p.id === loser.id) return { name: p.name, amount: -totalStakes };
      return { name: p.name, amount: betAmount };
    });
  }

  return {
    winner: winner.name,
    loser: loser.name,
    reason,
    payouts,
    mode
  };
};
