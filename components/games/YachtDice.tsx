
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Participant } from '../../types';

interface YachtDiceProps {
  participants: Participant[];
  onScoreUpdate: (log: string) => void;
  onGameOver: (scores: Record<string, number>) => void;
}

type Category = 
  | 'Aces' | 'Deuces' | 'Threes' | 'Fours' | 'Fives' | 'Sixes' 
  | 'ThreeKind' | 'FourKind' | 'FullHouse' | 'SmallS' | 'LargeS' | 'Yacht' | 'Choice';

const CATEGORY_MAP: Record<Category, string> = {
  'Aces': '원', 'Deuces': '투', 'Threes': '쓰리', 'Fours': '포', 'Fives': '파이브', 'Sixes': '식스',
  'ThreeKind': '세같수', 'FourKind': '네같수', 'FullHouse': '집',
  'SmallS': '작스', 'LargeS': '큰스', 'Yacht': '요트', 'Choice': '찬스'
};

const UPPER_CATEGORIES: Category[] = ['Aces', 'Deuces', 'Threes', 'Fours', 'Fives', 'Sixes'];
const LOWER_CATEGORIES: Category[] = ['ThreeKind', 'FourKind', 'FullHouse', 'SmallS', 'LargeS', 'Yacht', 'Choice'];
const ALL_CATEGORIES: Category[] = [...UPPER_CATEGORIES, ...LOWER_CATEGORIES];

interface DiceState {
  value: number;
  isRolling: boolean;
}

interface SelectionEffect {
  category: Category;
  score: number;
  contributingValues: number[];
  isZero: boolean;
  playerName: string;
}

const YachtDice: React.FC<YachtDiceProps> = ({ participants, onScoreUpdate, onGameOver }) => {
  const [dice, setDice] = useState<DiceState[]>(
    Array(5).fill(null).map(() => ({ value: 1, isRolling: false }))
  );
  const [kept, setKept] = useState<boolean[]>([false, false, false, false, false]);
  const [rollsLeft, setRollsLeft] = useState(3);
  const [allScores, setAllScores] = useState<Record<string, Partial<Record<Category, number>>>>({});
  const [globalRolling, setGlobalRolling] = useState(false);
  const [effect, setEffect] = useState<SelectionEffect | null>(null);
  const [turnIndex, setTurnIndex] = useState(0);
  
  // 0점 기록 확인 모달 상태
  const [confirmingCategory, setConfirmingCategory] = useState<Category | null>(null);

  const currentPlayer = participants[turnIndex];
  const isMyTurn = currentPlayer?.id === 'me';
  const botTurnTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const initialScores: Record<string, any> = {};
    participants.forEach(p => initialScores[p.id] = {});
    setAllScores(initialScores);
  }, [participants]);

  // 봇 인공지능 로직
  useEffect(() => {
    if (!isMyTurn && !globalRolling && !effect && participants.length > 0) {
      if (rollsLeft > 0) {
        // 주사위 굴리기 (1.5초 뒤)
        botTurnTimeoutRef.current = window.setTimeout(() => {
          // 봇은 2, 3회차 롤에서 무작위로 주사위를 keep함
          if (rollsLeft < 3) {
            const newKept = dice.map(d => Math.random() > 0.6);
            setKept(newKept);
          }
          rollDice();
        }, 1500);
      } else {
        // 점수 선택 (2초 뒤)
        botTurnTimeoutRef.current = window.setTimeout(() => {
          const currentValues = dice.map(d => d.value);
          const pScores = allScores[currentPlayer.id] || {};
          
          // 아직 채우지 않은 카테고리 중 가장 높은 점수를 줄 수 있는 항목 찾기
          let bestCategory: Category | null = null;
          let maxScore = -1;

          ALL_CATEGORIES.forEach(cat => {
            if (pScores[cat] === undefined) {
              const score = calculatePotentialScore(currentValues, cat);
              if (score > maxScore) {
                maxScore = score;
                bestCategory = cat;
              }
            }
          });

          // 만약 모든 점수가 0점이라면, 상단 카테고리부터 하나 포기
          if (bestCategory === null || maxScore === -1) {
            bestCategory = ALL_CATEGORIES.find(cat => pScores[cat] === undefined) || 'Choice';
            maxScore = 0;
          }

          if (bestCategory) {
            applyScore(bestCategory, maxScore);
          }
        }, 2000);
      }
    }
    return () => {
      if (botTurnTimeoutRef.current) clearTimeout(botTurnTimeoutRef.current);
    };
  }, [turnIndex, rollsLeft, globalRolling, effect, isMyTurn]);

  const rollDice = () => {
    if (rollsLeft === 0 || globalRolling || effect || confirmingCategory) return;
    setGlobalRolling(true);
    setDice(prev => prev.map((d, i) => kept[i] ? d : { ...d, isRolling: true }));

    setTimeout(() => {
      setDice(prev => prev.map((d, i) => {
        if (kept[i]) return d;
        return { value: Math.floor(Math.random() * 6) + 1, isRolling: false };
      }));
      setGlobalRolling(false);
      setRollsLeft(prev => prev - 1);
    }, 1000);
  };

  const toggleKeep = (index: number) => {
    if (!isMyTurn || rollsLeft === 3 || globalRolling || effect || confirmingCategory) return;
    setKept(prev => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const sortedKeptDice = useMemo(() => {
    return dice
      .map((d, i) => ({ value: d.value, index: i }))
      .filter((_, i) => kept[i])
      .sort((a, b) => b.value - a.value);
  }, [dice, kept]);

  const calculatePotentialScore = (currentDice: number[], category: Category): number => {
    const counts = Array(7).fill(0);
    currentDice.forEach(d => counts[d]++);
    const sum = currentDice.reduce((a, b) => a + b, 0);
    switch (category) {
      case 'Aces': return counts[1] * 1;
      case 'Deuces': return counts[2] * 2;
      case 'Threes': return counts[3] * 3;
      case 'Fours': return counts[4] * 4;
      case 'Fives': return counts[5] * 5;
      case 'Sixes': return counts[6] * 6;
      case 'Choice': return sum;
      case 'ThreeKind': return Object.values(counts).some(c => c >= 3) ? sum : 0;
      case 'FourKind': return Object.values(counts).some(c => c >= 4) ? sum : 0;
      case 'FullHouse': 
        const v = Object.values(counts);
        return (v.includes(3) && v.includes(2)) || v.includes(5) ? 25 : 0;
      case 'SmallS': 
        const us = Array.from(new Set(currentDice)).sort().join('');
        return /1234|2345|3456/.test(us) ? 30 : 0;
      case 'LargeS':
        const ul = Array.from(new Set(currentDice)).sort().join('');
        return /12345|23456/.test(ul) ? 40 : 0;
      case 'Yacht': return Object.values(counts).includes(5) ? 50 : 0;
      default: return 0;
    }
  };

  const potentials = useMemo(() => {
    const res: Partial<Record<Category, number>> = {};
    if (isMyTurn && rollsLeft < 3 && !globalRolling) {
      const currentValues = dice.map(d => d.value);
      ALL_CATEGORIES.forEach(cat => {
        if (allScores['me']?.[cat] === undefined) res[cat] = calculatePotentialScore(currentValues, cat);
      });
    }
    return res;
  }, [dice, rollsLeft, globalRolling, allScores, isMyTurn]);

  const selectCategory = (category: Category) => {
    if (!isMyTurn || rollsLeft === 3 || allScores['me']?.[category] !== undefined || globalRolling || effect) return;
    
    const currentValues = dice.map(d => d.value);
    const score = calculatePotentialScore(currentValues, category);

    if (score === 0) {
      setConfirmingCategory(category);
      return;
    }

    applyScore(category, score);
  };

  const applyScore = (category: Category, score: number) => {
    const currentValues = dice.map(d => d.value);
    const pId = participants[turnIndex].id;
    const pName = participants[turnIndex].name;

    let contributingValues: number[] = [];
    if (UPPER_CATEGORIES.includes(category)) {
      contributingValues = [UPPER_CATEGORIES.indexOf(category) + 1];
    } else {
      if (category === 'Yacht' || category === 'FourKind' || category === 'ThreeKind') {
        const counts = Array(7).fill(0);
        currentValues.forEach(v => counts[v]++);
        const target = counts.findIndex(c => c >= (category === 'Yacht' ? 5 : category === 'FourKind' ? 4 : 3));
        if (target !== -1) contributingValues = [target];
      } else {
        contributingValues = currentValues;
      }
    }

    setEffect({ category, score, contributingValues, isZero: score === 0, playerName: pName });
    setConfirmingCategory(null);

    setTimeout(() => {
      const newPScores = { ...allScores[pId], [category]: score };
      setAllScores(prev => ({ ...prev, [pId]: newPScores }));
      onScoreUpdate(`${pName}이(가) ${CATEGORY_MAP[category]}에 ${score}점 기록.`);
      
      setKept([false, false, false, false, false]);
      setRollsLeft(3);
      setDice(Array(5).fill(null).map(() => ({ value: 1, isRolling: false })));
      setEffect(null);

      // 다음 턴으로 넘기기
      const nextTurnIndex = (turnIndex + 1) % participants.length;
      
      // 모든 인원의 모든 칸이 찼는지 확인
      const allDone = participants.every(p => {
        const scores = p.id === pId ? newPScores : (allScores[p.id] || {});
        return Object.keys(scores).length === ALL_CATEGORIES.length;
      });

      if (allDone) {
        const finalScores: Record<string, number> = {};
        participants.forEach(p => {
          const pScores = p.id === pId ? newPScores : (allScores[p.id] || {});
          const sub = UPPER_CATEGORIES.reduce((acc, cat) => acc + (pScores[cat] || 0), 0);
          const base = Object.values(pScores).reduce((a, b) => (a || 0) + (b || 0), 0) || 0;
          finalScores[p.id] = base + (sub >= 63 ? 35 : 0);
        });
        onGameOver(finalScores);
      } else {
        setTurnIndex(nextTurnIndex);
      }
    }, 2000);
  };

  const getSubTotal = (id: string) => UPPER_CATEGORIES.reduce((acc, cat) => acc + (allScores[id]?.[cat] || 0), 0);
  const getBonus = (id: string) => getSubTotal(id) >= 63 ? 35 : 0;
  const getTotal = (id: string) => {
    const sub = getSubTotal(id);
    const bonus = getBonus(id);
    const base = Object.values(allScores[id] || {}).reduce((a, b) => (a || 0) + (b || 0), 0) || 0;
    return base + bonus;
  };

  const isYachtSuccess = effect?.category === 'Yacht' && effect.score > 0;
  const isZeroEffect = effect?.isZero;

  return (
    <div className="w-full h-full flex flex-col md:flex-row bg-[#08080a] p-1 gap-1 overflow-hidden select-none relative">
      <style>{`
        @keyframes dice-spin {
          0% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(90deg) scale(1.1); }
          50% { transform: rotate(180deg) scale(0.9); }
          75% { transform: rotate(270deg) scale(1.1); }
          100% { transform: rotate(360deg) scale(1); }
        }
        @keyframes record-slide {
          0% { opacity: 0; transform: translateY(30px) scale(0.9); }
          15% { opacity: 1; transform: translateY(0) scale(1); }
          85% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-20px) scale(0.95); }
        }
        @keyframes yacht-glory {
          0% { transform: scale(0.5) rotate(-5deg); filter: brightness(2); }
          10% { transform: scale(1.1) rotate(2deg); filter: brightness(1); }
          15% { transform: scale(1) rotate(0deg); }
          90% { transform: scale(1) rotate(0deg); opacity: 1; }
          100% { transform: scale(1.2) translateY(-30px); opacity: 0; }
        }
        @keyframes fail-shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        @keyframes turn-glow {
          0%, 100% { box-shadow: 0 0 10px rgba(220, 38, 38, 0.1); }
          50% { box-shadow: 0 0 30px rgba(220, 38, 38, 0.4); }
        }
        .dice-rolling { animation: dice-spin 0.2s linear infinite; }
        .current-turn-col { background-color: rgba(220, 38, 38, 0.05); animation: turn-glow 2s infinite; }
        .dice-dot { width: 10px; height: 10px; background: black; border-radius: 50%; position: absolute; }
        .dot-1 { top: 50%; left: 50%; transform: translate(-50%, -50%); }
        .dot-2-1 { top: 15%; left: 15%; } .dot-2-2 { bottom: 15%; right: 15%; }
        .dot-3-1 { top: 15%; left: 15%; } .dot-3-2 { top: 50%; left: 50%; transform: translate(-50%, -50%); } .dot-3-3 { bottom: 15%; right: 15%; }
        .dot-4-1 { top: 15%; left: 15%; } .dot-4-2 { top: 15%; right: 15%; } .dot-4-3 { bottom: 15%; left: 15%; } .dot-4-4 { bottom: 15%; right: 15%; }
        .dot-5-1 { top: 15%; left: 15%; } .dot-5-2 { top: 15%; right: 15%; } .dot-5-3 { bottom: 15%; left: 15%; } .dot-5-4 { bottom: 15%; right: 15%; } .dot-5-5 { top: 50%; left: 50%; transform: translate(-50%, -50%); }
        .dot-6-1 { top: 15%; left: 20%; } .dot-6-2 { top: 50%; left: 20%; transform: translateY(-50%); } .dot-6-3 { bottom: 15%; left: 20%; } .dot-6-4 { top: 15%; right: 20%; } .dot-6-5 { top: 50%; right: 20%; transform: translateY(-50%); } .dot-6-6 { bottom: 15%; right: 20%; }
        .score-cell-hover:hover { background-color: rgba(255, 255, 255, 0.1) !important; color: #ff3b30 !important; }
      `}</style>

      {/* 0점 기록 확인 모달 */}
      {confirmingCategory && (
        <div className="absolute inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setConfirmingCategory(null)} />
          <div className="relative w-full max-w-sm bg-[#111114] border border-zinc-800 rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
             <div className="text-center mb-6">
                <div className="text-4xl mb-4">😭</div>
                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-2">포기하시겠습니까?</h3>
                <p className="text-zinc-500 text-[12px] font-bold leading-relaxed">정말로 <span className="text-red-500">[{CATEGORY_MAP[confirmingCategory]}]</span> 칸을 0점으로 채워 포기하시겠습니까?</p>
             </div>
             <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setConfirmingCategory(null)} className="bg-zinc-800 text-zinc-400 font-black py-4 rounded-xl uppercase tracking-widest text-[11px]">취소</button>
                <button onClick={() => applyScore(confirmingCategory, 0)} className="bg-red-600 text-white font-black py-4 rounded-xl uppercase tracking-widest text-[11px] shadow-lg shadow-red-600/20">포기하기</button>
             </div>
          </div>
        </div>
      )}

      {effect && (
        <div className={`absolute inset-0 z-[150] flex items-center justify-center pointer-events-none`}>
           <div className={`absolute inset-0 backdrop-blur-md animate-in fade-in duration-500 ${isYachtSuccess ? 'bg-amber-900/40' : isZeroEffect ? 'bg-zinc-900/80' : 'bg-black/70'}`}></div>
           <div className={`relative flex flex-col items-center ${isYachtSuccess ? 'animate-[yacht-glory_2s_ease-in-out_forwards]' : isZeroEffect ? 'animate-[fail-shake_0.5s_infinite]' : 'animate-[record-slide_2s_ease-in-out_forwards]'}`}>
              <div className={`${isYachtSuccess ? 'bg-amber-500 shadow-[0_0_50px_rgba(245,158,11,0.8)]' : isZeroEffect ? 'bg-zinc-700' : 'bg-red-600 shadow-[0_0_40px_rgba(220,38,38,0.6)]'} text-white font-black text-[12px] px-6 py-2 rounded-full uppercase tracking-[0.5em] mb-6 italic transition-all`}>
                {effect.playerName}의 턴 종료
              </div>
              <div className={`text-center px-20 py-12 bg-[#0f0f12] border-x-2 rounded-[4rem] shadow-[0_30px_100px_rgba(0,0,0,0.9)] transition-all ${isYachtSuccess ? 'border-amber-500 scale-110' : isZeroEffect ? 'border-zinc-700' : 'border-red-600'}`}>
                <h3 className={`text-7xl md:text-8xl font-black italic uppercase tracking-tighter mb-4 ${isYachtSuccess ? 'text-amber-500 drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]' : isZeroEffect ? 'text-zinc-600' : 'text-white'}`}>
                    {CATEGORY_MAP[effect.category]}
                </h3>
                <div className={`h-1.5 w-full bg-gradient-to-r from-transparent to-transparent mb-6 opacity-60 ${isYachtSuccess ? 'via-amber-500' : isZeroEffect ? 'via-zinc-700' : 'via-red-600'}`}></div>
                <p className={`text-5xl md:text-6xl font-black italic ${isYachtSuccess ? 'text-amber-400' : isZeroEffect ? 'text-zinc-700 line-through' : 'text-red-600'}`}>
                    +{effect.score} <span className="text-2xl text-zinc-600 non-italic ml-3 font-bold uppercase tracking-[0.3em]">점</span>
                </p>
              </div>
           </div>
        </div>
      )}

      {/* Scoreboard HUD */}
      <div className="flex-[0.5] min-w-[320px] bg-[#0c0c0e] border border-zinc-800 rounded-lg flex flex-col h-full shadow-2xl relative">
        <div className="flex-1 overflow-hidden">
          <table className="w-full border-collapse table-fixed h-full">
            <thead className="bg-[#0f0f12]">
              <tr className="h-40 md:h-44 border-b border-zinc-800">
                <th className="w-28 md:w-36 border-r border-zinc-800/20 italic text-zinc-700 text-[10px] uppercase font-black tracking-widest text-center">CATEGORIES</th>
                {participants.map((p, i) => (
                  <th key={p.id} className={`p-0 border-r border-zinc-800/20 transition-all ${turnIndex === i ? 'current-turn-col' : ''}`}>
                    <div className="flex flex-col items-center justify-center py-5">
                      <div className="relative mb-4">
                        <img src={p.avatar} alt={p.name} className={`w-16 h-16 md:w-20 md:h-20 rounded-full border-2 shadow-2xl transition-all ${turnIndex === i ? 'border-red-600 scale-110' : 'border-zinc-800'}`} />
                        {turnIndex === i && <div className="absolute -top-2 -right-2 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full animate-bounce">TURN</div>}
                        {p.id === 'me' && <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-zinc-800 rounded-full border-2 border-[#0c0c0e] flex items-center justify-center text-[10px] font-black text-white italic">ME</div>}
                      </div>
                      <span className={`text-[13px] md:text-[15px] font-black uppercase tracking-tighter truncate w-full px-2 text-center ${turnIndex === i ? 'text-red-600' : 'text-white'}`}>{p.id === 'me' ? 'ME' : p.name.slice(0, 5)}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-[14px] md:text-[16px] font-bold text-white">
              {[...UPPER_CATEGORIES, 'Bonus', ...LOWER_CATEGORIES].map((cat) => {
                const isBonusRow = cat === 'Bonus';
                const isInteractive = !isBonusRow;
                const currentCat = isInteractive ? cat as Category : null;

                return (
                  <tr key={cat} className={`border-b border-zinc-800/10 h-[calc((100%-200px)/14)] ${isBonusRow ? 'bg-amber-600/20' : ''}`}>
                    <td className={`px-4 uppercase tracking-tighter border-r border-zinc-800/20 font-black italic text-[12px] md:text-[15px] text-center whitespace-nowrap ${isBonusRow ? 'bg-amber-600/10 text-amber-500' : 'bg-[#0a0a0c] text-zinc-500'}`}>
                      {isInteractive ? CATEGORY_MAP[currentCat!] : '보너스'}
                    </td>
                    {participants.map((p, i) => {
                      const isMe = p.id === 'me';
                      const isTurn = turnIndex === i;
                      let content: React.ReactNode = '-';
                      let isAchieved = false;
                      let textColor = 'text-white'; 

                      if (isBonusRow) {
                        const sub = getSubTotal(p.id);
                        const bonus = getBonus(p.id);
                        isAchieved = bonus > 0;
                        content = isAchieved ? `+${bonus}` : `${sub}/63`;
                        textColor = isAchieved ? 'text-green-400 font-black' : 'text-zinc-600';
                      } else {
                        const score = allScores[p.id]?.[currentCat!];
                        const pot = (isMe && isTurn) ? potentials[currentCat!] : undefined;
                        isAchieved = score !== undefined;
                        content = score ?? pot ?? '-';
                        if (isMe && isTurn && !isAchieved && pot !== undefined) textColor = 'text-white/20 hover:text-red-500'; 
                        else if (!isAchieved) textColor = 'text-zinc-900';
                      }

                      return (
                        <td 
                          key={p.id} 
                          onClick={isMe && isTurn && isInteractive && !isAchieved ? () => selectCategory(currentCat!) : undefined} 
                          className={`text-center border-r border-zinc-800/10 transition-all duration-75 
                            ${isMe && isTurn && isInteractive && !isAchieved ? 'cursor-pointer score-cell-hover' : ''} 
                            ${isTurn ? 'bg-red-600/5' : ''}
                            ${textColor}`}
                        >
                          {content}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-red-600 text-white shrink-0 h-16">
              <tr>
                <td className="px-3 font-black italic uppercase text-[10px] tracking-widest border-r border-white/10 text-center">총합</td>
                {participants.map((p, i) => (
                  <td key={p.id} className={`text-center text-[26px] font-black italic border-r border-white/10 ${turnIndex === i ? 'bg-white/10' : ''}`}>{getTotal(p.id)}</td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-[#050507] rounded-xl border border-zinc-800 overflow-hidden h-full relative">
        {/* Turn Indicator Overlay */}
        {!isMyTurn && !effect && (
          <div className="absolute inset-0 z-50 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
            <div className="bg-zinc-900/90 border border-zinc-800 px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4">
               <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
               <span className="text-white font-black italic uppercase tracking-widest">{currentPlayer?.name}의 차례입니다...</span>
            </div>
          </div>
        )}

        <div className="h-40 md:h-52 border-b-2 border-dashed border-zinc-800/40 p-4 flex flex-col items-center justify-center bg-zinc-900/10">
          <div className="flex gap-5 p-5 bg-green-950/5 border border-zinc-800/20 rounded-3xl w-full max-w-2xl h-full items-center justify-center">
             {sortedKeptDice.length === 0 ? (
               <div className="text-[11px] font-black text-zinc-800 uppercase italic tracking-widest">보관할 주사위를 선택하세요</div>
             ) : (
               sortedKeptDice.map((d, i) => {
                 const isContributing = effect?.contributingValues.includes(d.value);
                 return (
                  <div 
                    key={`${d.index}-${i}`}
                    onClick={() => toggleKeep(d.index)}
                    className={`w-14 h-14 md:w-20 md:h-20 bg-white rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.6)] flex items-center justify-center cursor-pointer transform hover:scale-110 active:scale-95 transition-all ring-4 z-10 
                      ${isContributing ? 'ring-red-600 shadow-[0_0_20px_rgba(220,38,38,0.4)]' : 'ring-red-600/40'}`}
                  >
                    <div className="relative w-full h-full p-3 md:p-4">
                      {renderDots(d.value)}
                    </div>
                  </div>
                 );
               })
             )}
          </div>
        </div>

        <div className="flex-1 relative overflow-hidden flex items-center justify-center p-8 bg-[radial-gradient(circle_at_center,_#0a0a0c_0%,_#050507_100%)]">
           <div className="grid grid-cols-5 gap-6 md:gap-12">
              {dice.map((d, i) => !kept[i] && (
                <div key={i} className="flex flex-col items-center gap-4">
                  <div 
                    onClick={() => toggleKeep(i)}
                    className={`w-16 h-16 md:w-24 md:h-24 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-b-[6px] border-zinc-300 flex items-center justify-center cursor-pointer transition-all ${d.isRolling ? 'dice-rolling opacity-80' : 'hover:scale-105 active:scale-95'}`}
                  >
                    <div className="relative w-full h-full p-4 md:p-5">
                      {!d.isRolling && renderDots(d.value)}
                      {d.isRolling && (
                        <div className="absolute inset-0 flex items-center justify-center">
                           <div className="w-10 h-10 border-4 border-zinc-800/10 border-t-red-600 rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
           </div>

           <div className="absolute bottom-8 right-8 flex flex-col items-end">
             <div className="flex gap-2 mb-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`h-3 w-10 rounded-full transition-all duration-300 ${i <= rollsLeft ? 'bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.8)]' : 'bg-zinc-900/50 border border-zinc-800'}`} />
                ))}
             </div>
          </div>
        </div>

        <div className="p-8 bg-[#0c0c0e] border-t border-zinc-800 flex justify-center shrink-0">
          <button 
            onClick={rollDice} 
            disabled={!isMyTurn || rollsLeft === 0 || globalRolling || effect !== null || confirmingCategory !== null} 
            className={`w-full max-w-lg py-6 rounded-3xl text-white font-black text-xl transition-all uppercase tracking-[0.6em] relative overflow-hidden group shadow-[0_15px_40px_rgba(220,38,38,0.3)] ${isMyTurn && rollsLeft > 0 && !globalRolling && !effect && !confirmingCategory ? 'bg-red-600 hover:bg-red-500 active:scale-95' : 'bg-zinc-900 text-zinc-800 cursor-not-allowed border border-zinc-800'}`}
          >
            <span className="relative z-10 italic">{globalRolling ? '계산 중...' : !isMyTurn ? '대기 중...' : '주사위 굴리기'}</span>
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </button>
        </div>
      </div>
    </div>
  );
};

function renderDots(value: number) {
  return (
    <>
      {value === 1 && <div className="dice-dot dot-1"></div>}
      {value === 2 && <><div className="dice-dot dot-2-1"></div><div className="dice-dot dot-2-2"></div></>}
      {value === 3 && <><div className="dice-dot dot-3-1"></div><div className="dice-dot dot-3-2"></div><div className="dice-dot dot-3-3"></div></>}
      {value === 4 && <><div className="dice-dot dot-4-1"></div><div className="dice-dot dot-4-2"></div><div className="dice-dot dot-4-3"></div><div className="dice-dot dot-4-4"></div></>}
      {value === 5 && <><div className="dice-dot dot-5-1"></div><div className="dice-dot dot-5-2"></div><div className="dice-dot dot-5-3"></div><div className="dice-dot dot-5-4"></div><div className="dice-dot dot-5-5"></div></>}
      {value === 6 && <><div className="dice-dot dot-6-1"></div><div className="dice-dot dot-6-2"></div><div className="dice-dot dot-6-3"></div><div className="dice-dot dot-6-4"></div><div className="dice-dot dot-6-5"></div><div className="dice-dot dot-6-6"></div></>}
    </>
  );
}

export default YachtDice;
