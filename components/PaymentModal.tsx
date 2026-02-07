
import React, { useState } from 'react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCharge: (amount: number) => void;
}

const PRESET_AMOUNTS = [
  { label: '10,000P', value: 10000, desc: '가벼운 시작' },
  { label: '30,000P', value: 30000, desc: '베테랑의 선택' },
  { label: '50,000P', value: 50000, desc: '하이롤러 추천', hot: true },
  { label: '100,000P', value: 100000, desc: '전장의 지배자' },
];

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onCharge }) => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleChargeClick = () => {
    const finalAmount = selectedAmount || Number(customAmount);
    if (!finalAmount || finalAmount <= 0) return;

    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      onCharge(finalAmount);
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        setSelectedAmount(null);
        setCustomAmount('');
      }, 1500);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/95 backdrop-blur-xl"
        onClick={isProcessing ? undefined : onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-[#0d0d0f] border-t sm:border border-zinc-800 rounded-t-[2.5rem] sm:rounded-[2rem] overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.1)] transition-all animate-in slide-in-from-bottom duration-500">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
        
        <div className="p-8 sm:p-10">
          {!isSuccess ? (
            <>
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight uppercase italic flex items-center gap-2">
                    <span className="text-red-600">POINT</span> RECHARGE
                  </h2>
                  <p className="text-zinc-500 text-[10px] mt-1 uppercase tracking-widest font-bold">배틀을 위한 포인트를 충전하세요</p>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 text-zinc-500 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-3">
                  {PRESET_AMOUNTS.map((item) => (
                    <button
                      key={item.value}
                      onClick={() => {
                        setSelectedAmount(item.value);
                        setCustomAmount('');
                      }}
                      className={`relative p-4 rounded-2xl border-2 text-left transition-all ${
                        selectedAmount === item.value 
                          ? 'border-red-600 bg-red-600/5' 
                          : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700'
                      }`}
                    >
                      {item.hot && (
                        <span className="absolute -top-2 -right-1 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">Recommended</span>
                      )}
                      <p className="text-lg font-black text-white">{item.label}</p>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase">{item.desc}</p>
                    </button>
                  ))}
                </div>

                <div className="relative">
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">직접 입력 (P)</label>
                    <div className="relative">
                        <input 
                            type="number" 
                            value={customAmount}
                            onChange={(e) => {
                                setCustomAmount(e.target.value);
                                setSelectedAmount(null);
                            }}
                            placeholder="최소 1,000P 이상"
                            className="w-full bg-zinc-900/50 border-2 border-zinc-800 rounded-2xl px-5 py-4 text-xl font-black text-white placeholder:text-zinc-800 focus:outline-none focus:border-red-600/50 transition-all"
                        />
                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-red-600 font-black">P</span>
                    </div>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-zinc-300">안전한 가상 결제 시스템</p>
                        <p className="text-[9px] text-zinc-500 uppercase tracking-tight">AI Secure Transaction Protocol V2.1</p>
                    </div>
                </div>

                <button 
                  onClick={handleChargeClick}
                  disabled={isProcessing || (!selectedAmount && !customAmount)}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-black py-5 rounded-2xl transition-all shadow-[0_10px_30px_rgba(220,38,38,0.2)] active:scale-95 text-sm uppercase tracking-[0.2em] relative overflow-hidden"
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
                        <span>Processing...</span>
                    </div>
                  ) : (
                    '포인트 충전하기'
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-green-500/10 border-2 border-green-500/50 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-green-500 animate-in bounce-in duration-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Charge Success</h3>
              <p className="text-zinc-500 text-sm font-medium">잔액이 성공적으로 업데이트되었습니다.</p>
            </div>
          )}
        </div>

        <div className="bg-zinc-900/30 p-6 flex justify-center border-t border-zinc-800/50 mb-safe">
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">Battle Wars Payment Gateway</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
