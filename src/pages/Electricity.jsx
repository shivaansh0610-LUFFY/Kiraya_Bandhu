import React, { useState, useEffect } from 'react';
import { 
  getRecentMonthsList, 
  getHindiMonthName, 
  getElectricityRate, 
  setElectricityRate, 
  getElectricityReadings, 
  saveElectricityReadings 
} from '../utils/storage';
import { Calendar, Zap, CheckCircle2, Save, Sparkles, HelpCircle } from 'lucide-react';

export default function Electricity() {
  const [months, setMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [rate, setRate] = useState(8);
  const [readings, setReadings] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const monthsList = getRecentMonthsList();
    setMonths(monthsList);
    
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    if (monthsList.includes(currentMonthStr)) {
      setSelectedMonth(currentMonthStr);
    } else if (monthsList.length > 0) {
      setSelectedMonth(monthsList[12]);
    }
    setRate(getElectricityRate());
  }, []);

  // Fetch readings whenever month changes
  useEffect(() => {
    if (selectedMonth) {
      const data = getElectricityReadings(selectedMonth);
      setReadings(data);
    }
  }, [selectedMonth]);

  // Handle previous reading change
  const handlePrevChange = (tenantId, val) => {
    const numVal = Number(val) || 0;
    setReadings(prev => prev.map(r => {
      if (r.tenantId === tenantId) {
        const units = Math.max(0, r.currentReading - numVal);
        return {
          ...r,
          previousReading: numVal,
          unitsConsumed: units,
          totalBill: units * rate
        };
      }
      return r;
    }));
  };

  // Handle current reading change
  const handleCurrentChange = (tenantId, val) => {
    const numVal = Number(val) || 0;
    setReadings(prev => prev.map(r => {
      if (r.tenantId === tenantId) {
        const units = Math.max(0, numVal - r.previousReading);
        return {
          ...r,
          currentReading: numVal,
          unitsConsumed: units,
          totalBill: units * rate
        };
      }
      return r;
    }));
  };

  // Handle unit rate change
  const handleRateChange = (newRateVal) => {
    const numRate = Number(newRateVal) || 0;
    setRate(numRate);
    // Recalculate all bills in list
    setReadings(prev => prev.map(r => ({
      ...r,
      ratePerUnit: numRate,
      totalBill: r.unitsConsumed * numRate
    })));
  };

  // Toggle paid status in local state
  const handleTogglePaid = (tenantId) => {
    setReadings(prev => prev.map(r => {
      if (r.tenantId === tenantId) {
        return {
          ...r,
          paid: !r.paid,
          paidDate: !r.paid ? new Date().toISOString().split('T')[0] : null
        };
      }
      return r;
    }));
  };

  // Save all readings to LocalStorage
  const handleSaveAll = (e) => {
    e.preventDefault();
    if (!selectedMonth) return;

    // Save unit rate
    setElectricityRate(rate);
    
    // Save readings
    const saved = saveElectricityReadings(selectedMonth, readings);
    if (saved) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        // Refresh readings to load proper database IDs
        setReadings(getElectricityReadings(selectedMonth));
      }, 1500);
    }
  };

  return (
    <div className="flex-1 pb-24 px-4 pt-4 overflow-y-auto relative">
      
      {/* Success Banner Toast */}
      {showSuccess && (
        <div className="absolute inset-0 bg-white/90 z-50 flex flex-col items-center justify-center p-6 animate-fade-in">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-brand-success mb-4 animate-bounce">
            <CheckCircle2 size={48} className="stroke-[2.5]" />
          </div>
          <h3 className="text-xl font-bold text-stone-900 mb-1">Bill Save Ho Gaya!</h3>
          <p className="text-stone-500 text-sm">Electricity readings save kar li gayi hain.</p>
        </div>
      )}

      {/* Screen Title */}
      <div className="mb-4 px-1">
        <h2 className="text-xl font-bold text-stone-900">Bijli Tracker (बिजली बिल)</h2>
        <p className="text-xs text-stone-500 mt-0.5">Har tenant ka electricity reading record karein</p>
      </div>

      {/* Configuration Header Row: Month Selector & Rate per Unit */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {/* Month Selector */}
        <div className="bg-white rounded-2xl p-3 border border-stone-150 shadow-[0_2px_12px_rgba(0,0,0,0.08)] flex items-center gap-2">
          <Calendar className="text-brand-primary shrink-0" size={18} />
          <div className="flex-1 min-w-0">
            <label className="block text-[8px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">Mahina (महीना)</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full bg-transparent text-stone-800 font-bold text-xs border-none p-0 focus:ring-0 focus:outline-none truncate"
            >
              {months.map((m) => (
                <option key={m} value={m}>
                  {getHindiMonthName(m)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Rate Per Unit */}
        <div className="bg-white rounded-2xl p-3 border border-stone-150 shadow-[0_2px_12px_rgba(0,0,0,0.08)] flex items-center gap-2">
          <Zap className="text-brand-primary shrink-0" size={18} />
          <div className="flex-1">
            <label className="block text-[8px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">Rate / Unit (₹)</label>
            <input
              type="number"
              min="1"
              value={rate}
              onChange={(e) => handleRateChange(e.target.value)}
              className="w-full bg-transparent text-stone-850 font-bold text-xs border-none p-0 focus:ring-0 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Tenant Readings List */}
      {readings.length === 0 ? (
        <div className="bg-white border border-dashed border-stone-200 rounded-2xl p-8 text-center shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
          <p className="text-stone-500 text-sm">Koi active kiraya wala nahi mila.</p>
        </div>
      ) : (
        <div className="space-y-4 mb-20">
          {readings.map((r) => {
            const isFirstTime = r.previousReading === 0;

            return (
              <div 
                key={r.tenantId} 
                className="bg-white rounded-2xl p-4 border border-stone-100 shadow-[0_2px_12px_rgba(0,0,0,0.08)] space-y-3"
              >
                {/* Tenant Title Header */}
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <span className="bg-orange-50 border border-orange-100 text-brand-primary text-xs px-2.5 py-0.5 rounded-lg font-bold">
                      {r.tenantRoom}
                    </span>
                    <h4 className="font-bold text-stone-850 text-sm">{r.tenantName}</h4>
                  </div>
                  
                  {/* Paid Badge status */}
                  <div>
                    {r.paid ? (
                      <span className="text-[10px] bg-emerald-100 text-brand-success px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
                        Paid (जमा है)
                      </span>
                    ) : (
                      <span className="text-[10px] bg-stone-100 text-stone-500 px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wide">
                        Unpaid (बाकी)
                      </span>
                    )}
                  </div>
                </div>

                {/* Readings Input Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Previous Reading */}
                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">
                      Purani Reading
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={r.previousReading}
                      onChange={(e) => handlePrevChange(r.tenantId, e.target.value)}
                      placeholder="0"
                      className="w-full min-h-[44px] px-3 rounded-xl border border-stone-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 outline-none text-sm font-semibold bg-stone-50 text-stone-700"
                    />
                  </div>

                  {/* Current Reading */}
                  <div>
                    <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">
                      Nayi Reading
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={r.currentReading}
                      onChange={(e) => handleCurrentChange(r.tenantId, e.target.value)}
                      placeholder="0"
                      className="w-full min-h-[44px] px-3 rounded-xl border border-stone-200 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 outline-none text-sm font-semibold bg-stone-50 text-stone-700"
                    />
                  </div>
                </div>

                {/* Helper text for 0 previous readings */}
                {isFirstTime && (
                  <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100 animate-pulse-subtle">
                    <Sparkles size={11} className="fill-emerald-600/10 shrink-0" />
                    <span>Pehli baar? Sirf current reading bharein.</span>
                  </div>
                )}

                {/* Auto calculations details & Toggle Paid state */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs font-semibold">
                  {/* Calculations breakdown */}
                  <div className="text-stone-500">
                    Units: <span className="text-stone-900 font-bold">{r.unitsConsumed}</span>
                    <span className="mx-2 text-stone-300">|</span>
                    Bill: <span className="text-brand-primary font-extrabold text-sm">₹{r.totalBill}</span>
                  </div>

                  {/* Mark as Paid Action Button */}
                  <button
                    type="button"
                    onClick={() => handleTogglePaid(r.tenantId)}
                    className={`min-h-[36px] px-3.5 rounded-xl text-xs font-bold transition-all ${
                      r.paid
                        ? 'bg-emerald-550 text-white shadow-sm shadow-emerald-500/10'
                        : 'bg-stone-100 border border-stone-200 hover:bg-stone-200 text-stone-600 active:scale-95'
                    }`}
                  >
                    {r.paid ? 'Paid ✅' : 'Mark Paid (जमा)'}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Save Button (minimum 48px height) */}
      <div className="fixed bottom-22 left-0 right-0 z-40 pointer-events-none flex justify-center px-4">
        <button
          onClick={handleSaveAll}
          disabled={readings.length === 0}
          className="pointer-events-auto w-full max-w-[398px] min-h-[48px] bg-brand-primary hover:bg-brand-primary/95 disabled:bg-stone-300 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all pt-1"
        >
          <Save size={18} />
          <span>Sabka Bill Save Karo (बिल सेव करें)</span>
        </button>
      </div>

    </div>
  );
}
