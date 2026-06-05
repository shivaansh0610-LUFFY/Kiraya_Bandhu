import React, { useState, useEffect } from 'react';
import { getMonthlySummary, getMonthlyStatus, getHindiMonthName, getRecentMonthsList } from '../utils/storage';
import SummaryCard from '../components/SummaryCard';
import { ChevronRight, CheckCircle2, XCircle, Calendar, Zap } from 'lucide-react';

export default function Dashboard({ onRecordPaymentRedirect }) {
  const [months, setMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [summary, setSummary] = useState({});
  const [statuses, setStatuses] = useState([]);

  // Load months list on mount
  useEffect(() => {
    const list = getRecentMonthsList();
    setMonths(list);
    
    // Find current month string (YYYY-MM)
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    if (list.includes(currentMonthStr)) {
      setSelectedMonth(currentMonthStr);
    } else if (list.length > 0) {
      setSelectedMonth(list[0]); // Fallback to current month
    }
  }, []);

  // Fetch summaries whenever selected month changes
  useEffect(() => {
    if (selectedMonth) {
      setSummary(getMonthlySummary(selectedMonth));
      setStatuses(getMonthlyStatus(selectedMonth));
    }
  }, [selectedMonth]);

  // Filter logic:
  // - A tenant goes to "Abhi tak nahi diya" (Pending) if they have unpaid rent (status === 'unpaid') OR if they have unpaid electricity.
  // - A tenant goes to "De diya" (Paid/Partial) if they have paid rent (status === 'paid' or 'partial') AND their electricity (if any) is paid.
  const unpaidTenants = statuses.filter(item => {
    const isRentUnpaid = item.status === 'unpaid';
    const isElectricityUnpaid = item.electricityBill > 0 && !item.electricityPaid;
    return isRentUnpaid || isElectricityUnpaid;
  });

  const paidOrPartialTenants = statuses.filter(item => {
    const isRentUnpaid = item.status === 'unpaid';
    const isElectricityUnpaid = item.electricityBill > 0 && !item.electricityPaid;
    return !isRentUnpaid && !isElectricityUnpaid;
  });

  return (
    <div className="flex-1 pb-24 px-4 pt-4 overflow-y-auto">
      {/* Interactive Month Selector Dropdown */}
      <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-[0_2px_12px_rgba(0,0,0,0.08)] mb-4 flex items-center gap-3">
        <Calendar className="text-brand-primary shrink-0" size={20} />
        <div className="flex-1">
          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">
            Hisab Ka Mahina (हिसाब का महीना)
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full bg-transparent text-stone-850 font-bold border-none p-0 focus:ring-0 focus:outline-none"
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {getHindiMonthName(m)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Big Summary Card (Rent + Electricity) */}
      <SummaryCard summary={summary} />

      {/* Unpaid List (Abhi tak nahi diya) */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3 px-1">
          <XCircle size={18} className="text-brand-pending stroke-[2.5]" />
          <h3 className="font-bold text-base text-stone-850">
            Abhi Tak Nahi Diya (अभी तक नहीं दिया)
            <span className="ml-2 text-xs bg-red-150 text-brand-pending px-2.5 py-0.5 rounded-full font-bold">
              {unpaidTenants.length}
            </span>
          </h3>
        </div>

        {unpaidTenants.length === 0 ? (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-850 rounded-2xl p-4 text-center text-sm font-bold shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            Sabhi tenants ne rent aur electricity bill de diya hai! 🎉
          </div>
        ) : (
          <div className="space-y-3">
            {unpaidTenants.map((item) => {
              const isRentUnpaid = item.status === 'unpaid';
              const isElecUnpaid = item.electricityBill > 0 && !item.electricityPaid;

              return (
                <button
                  key={item.tenant.id}
                  onClick={() => onRecordPaymentRedirect(item.tenant.id, selectedMonth)}
                  className="w-full text-left bg-white border border-stone-100 hover:border-brand-primary/30 rounded-2xl p-4 flex items-center justify-between transition-all duration-200 active:scale-[0.98] shadow-[0_2px_12px_rgba(0,0,0,0.08)]"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 min-w-10 px-2.5 rounded-xl bg-red-50 border border-red-100 text-brand-pending flex items-center justify-center font-bold text-xs shrink-0">
                      {item.tenant.room}
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900 text-base">{item.tenant.name}</h4>
                      <div className="flex flex-col gap-0.5 text-xs text-stone-500 font-semibold mt-0.5">
                        {isRentUnpaid && (
                          <span>Rent Due: ₹{Number(item.rentDue).toLocaleString('en-IN')}</span>
                        )}
                        {!isRentUnpaid && item.status === 'partial' && (
                          <span className="text-orange-600">Rent Paid: ₹{item.amountPaid} / ₹{item.rentDue}</span>
                        )}
                        {!isRentUnpaid && item.status === 'paid' && (
                          <span className="text-emerald-600">Rent: Paid (पूरा मिला)</span>
                        )}
                        
                        {isElecUnpaid && (
                          <span className="flex items-center gap-1 text-brand-primary font-bold animate-pulse-subtle">
                            <Zap size={13} className="fill-brand-primary" />
                            <span>Bijli Pending: ₹{item.electricityBill}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 text-brand-primary font-bold text-sm">
                    <span>Pay Karen</span>
                    <ChevronRight size={16} />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Paid/Partial List (De diya) */}
      <div>
        <div className="flex items-center gap-2 mb-3 px-1">
          <CheckCircle2 size={18} className="text-brand-success stroke-[2.5]" />
          <h3 className="font-bold text-base text-stone-850">
            De Diya (दे दिया)
            <span className="ml-2 text-xs bg-green-150 text-brand-success px-2.5 py-0.5 rounded-full font-bold">
              {paidOrPartialTenants.length}
            </span>
          </h3>
        </div>

        {paidOrPartialTenants.length === 0 ? (
          <div className="bg-white border border-stone-200 text-stone-500 rounded-2xl p-5 text-center text-sm shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
            Abhi tak kisi ne full payment nahi diya.
          </div>
        ) : (
          <div className="space-y-3">
            {paidOrPartialTenants.map((item) => {
              const isPartial = item.status === 'partial';
              
              return (
                <div
                  key={item.tenant.id}
                  className="bg-white border border-stone-100 rounded-2xl p-4 flex items-center justify-between shadow-[0_2px_12px_rgba(0,0,0,0.08)]"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 min-w-10 px-2.5 rounded-xl bg-green-50 border border-green-100 text-brand-success flex items-center justify-center font-bold text-xs shrink-0">
                      {item.tenant.room}
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900 text-base">{item.tenant.name}</h4>
                      <div className="flex flex-col gap-0.5 text-xs text-stone-500 font-semibold mt-0.5">
                        <span>Rent: ₹{Number(item.rentDue).toLocaleString('en-IN')}</span>
                        {item.electricityBill > 0 && (
                          <span className="text-[10px] text-stone-400 flex items-center gap-0.5">
                            ⚡ Electricity: ₹{item.electricityBill} (Paid)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    {isPartial ? (
                      <div className="flex flex-col items-end">
                        <span className="text-xs bg-orange-100 text-brand-primary px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider mb-0.5">
                          Partial
                        </span>
                        <span className="text-xs text-stone-500 font-semibold">
                          Paid: ₹{item.amountPaid}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-end">
                        <span className="text-xs bg-emerald-100 text-brand-success px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider mb-0.5">
                          Paid
                        </span>
                        <span className="text-xs text-stone-400 font-medium">
                          Mila: ₹{item.amountPaid}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
