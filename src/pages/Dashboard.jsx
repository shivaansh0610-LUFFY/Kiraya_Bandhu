import React, { useState, useEffect } from 'react';
import { getMonthlyStatus, getRecentMonthsList } from '../utils/storage';
import { ChevronRight, CheckCircle2, XCircle } from 'lucide-react';

export default function Dashboard({ onRecordPaymentRedirect, onSelectTenant }) {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [statuses, setStatuses] = useState([]);

  useEffect(() => {
    // Default to the current system month (YYYY-MM)
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(currentMonthStr);
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

  // Helper to format date as DD/MM/YYYY
  const formatDateToDDMMYYYY = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  // Helper to format English Month and Year
  const getEnglishMonthNameAndYear = (monthStr) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    const monthsEng = {
      '01': 'January', '02': 'February', '03': 'March', '04': 'April',
      '05': 'May', '06': 'June', '07': 'July', '08': 'August',
      '09': 'September', '10': 'October', '11': 'November', '12': 'December'
    };
    return `${monthsEng[month] || month} ${year}`;
  };

  return (
    <div className="flex-1 pb-24 px-4 pt-4 overflow-y-auto">
      {/* Current Month Name simple text header */}
      <div className="mb-5 px-1 pt-2">
        <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">
          {selectedMonth ? `${getEnglishMonthNameAndYear(selectedMonth)} का हिसाब` : ''}
        </h2>
        <p className="text-xs text-stone-500 mt-1 font-semibold">Ghar ki rent collection ki status</p>
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
                <div
                  key={item.tenant.id}
                  className="w-full bg-white border border-stone-100 rounded-2xl p-4 flex items-center justify-between shadow-[0_2px_12px_rgba(0,0,0,0.08)]"
                >
                  {/* Clickable Left part goes to TenantDetail */}
                  <div
                    onClick={() => onSelectTenant(item.tenant.id)}
                    className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer active:opacity-75 group"
                  >
                    <div className="h-10 min-w-10 px-2.5 rounded-xl bg-red-50 border border-red-100 text-brand-pending flex items-center justify-center font-bold text-xs shrink-0">
                      {item.tenant.room}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-stone-900 text-base truncate group-hover:text-brand-primary transition-colors">
                        {item.tenant.name}
                      </h4>
                      <div className="text-xs text-stone-500 font-semibold mt-0.5">
                        Rent Due: ₹{Number(dueAmount).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                  
                  {/* Pay Karen Button goes directly to RecordPayment */}
                  <button
                    type="button"
                    onClick={() => onRecordPaymentRedirect(item.tenant.id, selectedMonth)}
                    className="flex items-center gap-1 bg-orange-50 hover:bg-orange-100 border border-orange-100 text-brand-primary font-bold text-sm px-3.5 py-2 rounded-xl active:scale-95 transition-all cursor-pointer shrink-0 ml-2"
                  >
                    <span>Pay Karen</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
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
              const paymentDate = lastPayment ? formatDateToDDMMYYYY(lastPayment.date) : '';
              const showElectricity = item.electricityBill > 0 && item.electricityPaid;

              return (
                <div
                  key={item.tenant.id}
                  onClick={() => onSelectTenant(item.tenant.id)}
                  className="bg-white border border-stone-100 hover:border-brand-primary/20 rounded-2xl p-4 flex items-center justify-between shadow-[0_2px_12px_rgba(0,0,0,0.08)] cursor-pointer active:scale-[0.99] transition-all duration-200"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 min-w-10 px-2.5 rounded-xl bg-green-50 border border-green-100 text-brand-success flex items-center justify-center font-bold text-xs shrink-0">
                      {item.tenant.room}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-stone-900 text-base truncate">{item.tenant.name}</h4>
                      <div className="flex flex-col gap-0.5 text-xs text-stone-500 font-semibold mt-0.5">
                        <span>Rent: ₹{Number(item.amountPaid).toLocaleString('en-IN')} Paid</span>
                        <span className="text-stone-400 text-[10px] font-medium">
                          {paymentMode} • {paymentDate}
                        </span>
                        {showElectricity && (
                          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-0.5">
                            ⚡ ₹{item.electricityBill} Paid
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="shrink-0 ml-2">
                    <span className="text-[10px] bg-emerald-100 text-brand-success px-2.5 py-1 rounded-full font-extrabold uppercase tracking-wider">
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
