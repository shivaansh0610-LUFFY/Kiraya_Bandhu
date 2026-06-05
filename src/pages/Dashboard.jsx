import React, { useState, useEffect } from 'react';
import { getMonthlyStatus, getHindiMonthName, getRecentMonthsList } from '../utils/storage';
import { ChevronRight, CheckCircle2, XCircle, Calendar } from 'lucide-react';

export default function Dashboard({ onRecordPaymentRedirect }) {
  const [months, setMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
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

  // Fetch statuses whenever selected month changes
  useEffect(() => {
    if (selectedMonth) {
      setStatuses(getMonthlyStatus(selectedMonth));
    }
  }, [selectedMonth]);

  // Filter logic:
  // - "Abhi Tak Nahi Diya" (unpaid or partially paid)
  // - "De Diya" (fully paid)
  const unpaidTenants = statuses.filter(item => {
    return item.status === 'unpaid' || item.status === 'partial';
  });

  const paidTenants = statuses.filter(item => {
    return item.status === 'paid';
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
            Sabhi tenants ne rent de diya hai! 🎉
          </div>
        ) : (
          <div className="space-y-3">
            {unpaidTenants.map((item) => {
              const dueAmount = item.status === 'partial' ? item.balance : item.rentDue;

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
                        <span>Rent Due: ₹{Number(dueAmount).toLocaleString('en-IN')}</span>
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

      {/* Paid List (De diya) */}
      <div>
        <div className="flex items-center gap-2 mb-3 px-1">
          <CheckCircle2 size={18} className="text-brand-success stroke-[2.5]" />
          <h3 className="font-bold text-base text-stone-850">
            De Diya (दे दिया)
            <span className="ml-2 text-xs bg-green-150 text-brand-success px-2.5 py-0.5 rounded-full font-bold">
              {paidTenants.length}
            </span>
          </h3>
        </div>

        {paidTenants.length === 0 ? (
          <div className="bg-white border border-stone-200 text-stone-500 rounded-2xl p-5 text-center text-sm shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
            Abhi tak kisi ne rent payment nahi diya.
          </div>
        ) : (
          <div className="space-y-3">
            {paidTenants.map((item) => {
              const lastPayment = item.payments && item.payments.length > 0 ? item.payments[item.payments.length - 1] : null;
              const paymentMode = lastPayment ? lastPayment.note : 'Cash';
              const paymentDate = lastPayment ? lastPayment.date : '';

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
                        <span>Mode: {paymentMode}</span>
                        {paymentDate && <span>Date: {paymentDate}</span>}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-xs bg-emerald-100 text-brand-success px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      PAID
                    </span>
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
