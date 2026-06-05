import React from 'react';
import { getTenants, getRecentMonthsList, getMonthlyStatus } from '../utils/storage';
import { ArrowLeft, Phone, Plus, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export default function TenantDetail({ tenantId, onBack, onRecordPayment }) {
  // Find tenant details (including soft-deleted ones for history view)
  const tenant = getTenants(true).find(t => t.id === tenantId);
  const monthsList = getRecentMonthsList();

  if (!tenant) {
    return (
      <div className="flex-1 pb-24 px-4 pt-8 text-center flex flex-col items-center justify-center">
        <p className="text-stone-500 mb-4 font-semibold">Tenant nahi mila.</p>
        <button
          onClick={onBack}
          className="min-h-[48px] px-6 bg-brand-primary text-white font-bold rounded-xl flex items-center gap-2 active:scale-95 transition-transform"
        >
          <ArrowLeft size={18} />
          <span>Wapas Jayein</span>
        </button>
      </div>
    );
  }

  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const tenantJoinMonth = tenant.joinDate.substring(0, 7);

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
    <div className="flex-1 pb-32 px-4 pt-4 overflow-y-auto relative flex flex-col min-h-0 bg-[#FFF7ED]">
      
      {/* Header section with Back Button and Name */}
      <div className="flex items-center gap-3 mb-4 px-1 pt-2">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-xl bg-white text-stone-600 flex items-center justify-center border border-stone-200/60 active:scale-90 transition-transform shadow-sm cursor-pointer"
          aria-label="Go back"
        >
          <ArrowLeft size={20} className="stroke-[2.5]" />
        </button>
        <h2 className="text-xl font-extrabold text-stone-900 truncate tracking-tight">
          {tenant.name}
        </h2>
      </div>

      {/* Tenant Meta Info Card */}
      <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-[0_2px_12px_rgba(0,0,0,0.08)] mb-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs bg-orange-50 text-brand-primary border border-orange-100 px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                Floor: {tenant.room}
              </span>
              <span className="text-xs bg-stone-100 text-stone-600 px-2.5 py-0.5 rounded-md font-bold">
                ₹{Number(tenant.monthlyRent).toLocaleString('en-IN')}/month
              </span>
            </div>
            {tenant.phone && (
              <p className="text-sm font-semibold text-stone-500 flex items-center gap-1 mt-1">
                <span>📞 {tenant.phone}</span>
              </p>
            )}
            <p className="text-[11px] text-stone-400 font-bold uppercase tracking-wider mt-2">
              Joined: {formatDateToDDMMYYYY(tenant.joinDate)}
            </p>
          </div>
          
          {tenant.phone && (
            <a
              href={`tel:${tenant.phone}`}
              className="w-12 h-12 rounded-xl bg-orange-50 text-brand-primary flex items-center justify-center border border-orange-100 shadow-sm active:scale-95 transition-transform shrink-0"
              title={`Call ${tenant.name}`}
            >
              <Phone size={20} className="stroke-[2.2]" />
            </a>
          )}
        </div>
      </div>

      {/* History List Section */}
      <div className="flex-1 min-h-0 flex flex-col mb-4">
        <h3 className="font-extrabold text-base text-stone-850 mb-3 px-1">
          Pichhle Mahine Ka Hisaab (Payment History)
        </h3>
        
        <div className="space-y-3 flex-1 overflow-y-visible">
          {monthsList.map((monthStr) => {
            const statusItem = getMonthlyStatus(monthStr).find(s => s.tenant.id === tenantId);
            
            // Default states if no data exists
            let status = 'unpaid';
            let amountPaid = 0;
            let lastPayment = null;
            let electricityBill = 0;
            let electricityPaid = false;

            if (statusItem) {
              status = statusItem.status;
              amountPaid = statusItem.amountPaid;
              lastPayment = statusItem.payments && statusItem.payments.length > 0 ? statusItem.payments[statusItem.payments.length - 1] : null;
              electricityBill = statusItem.electricityBill;
              electricityPaid = statusItem.electricityPaid;
            }

            const paymentMode = lastPayment ? lastPayment.note : '';
            const paymentDate = lastPayment ? formatDateToDDMMYYYY(lastPayment.date) : '';
            const showElectricity = electricityBill > 0;

            const hasJoined = monthStr >= tenantJoinMonth;
            const hasPayment = amountPaid > 0 || electricityBill > 0 || (statusItem && statusItem.payments && statusItem.payments.length > 0);

            return (
              <div
                key={monthStr}
                onClick={() => onRecordPayment(tenantId, monthStr)}
                className="bg-white border border-stone-100 hover:border-brand-primary/30 rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.08)] flex flex-col gap-2.5 transition-all cursor-pointer active:scale-[0.99] group"
              >
                {/* Month Name & Status Badge Row */}
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="font-bold text-stone-850 text-sm group-hover:text-brand-primary transition-colors">
                      {getEnglishMonthNameAndYear(monthStr)}
                    </span>
                    
                    {!hasJoined && !hasPayment ? (
                      <span className="text-[10px] bg-stone-100 text-stone-400 border border-stone-200/60 px-2.5 py-0.5 rounded-full font-extrabold flex items-center gap-1 uppercase tracking-wider mt-1.5 w-fit">
                        <span>NOT JOINED YET</span>
                      </span>
                    ) : status === 'paid' ? (
                      <span className="text-[10px] bg-green-50 border border-green-100 text-brand-success px-2.5 py-0.5 rounded-full font-extrabold flex items-center gap-1 uppercase tracking-wider mt-1.5 w-fit">
                        <span>PAID</span>
                        <CheckCircle2 size={10} className="stroke-[2.5]" />
                      </span>
                    ) : status === 'partial' ? (
                      <span className="text-[10px] bg-orange-50 border border-orange-100 text-brand-primary px-2.5 py-0.5 rounded-full font-extrabold flex items-center gap-1 uppercase tracking-wider mt-1.5 w-fit">
                        <span>PARTIAL</span>
                        <AlertCircle size={10} className="stroke-[2.5]" />
                      </span>
                    ) : (
                      <span className="text-[10px] bg-red-50 border border-red-100 text-brand-pending px-2.5 py-0.5 rounded-full font-extrabold flex items-center gap-1 uppercase tracking-wider mt-1.5 w-fit">
                        <span>NAHI DIYA</span>
                        <XCircle size={10} className="stroke-[2.5]" />
                      </span>
                    )}
                  </div>

                  {/* Plus icon on the right to make the row obviously tappable */}
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-brand-primary border border-orange-100 flex items-center justify-center shrink-0 active:scale-90 transition-transform">
                    <Plus size={16} className="stroke-[3]" />
                  </div>
                </div>

                {/* Details Row (only if paid/partial or there is an electricity bill) */}
                {(status !== 'unpaid' || electricityBill > 0) && (
                  <div className="grid grid-cols-2 gap-4 border-t border-stone-50 pt-2 text-xs font-semibold text-stone-500">
                    {/* Rent info */}
                    <div>
                      <span className="block text-[10px] text-stone-400 uppercase tracking-wider font-bold mb-0.5">Rent Status</span>
                      <div>
                        <span className="text-stone-850 font-bold block">₹{Number(amountPaid).toLocaleString('en-IN')} Paid</span>
                        {paymentMode && (
                          <span className="text-[10px] text-stone-400 font-medium block mt-0.5">
                            {paymentMode} • {paymentDate}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Electricity Info */}
                    <div>
                      <span className="block text-[10px] text-stone-400 uppercase tracking-wider font-bold mb-0.5">Electricity</span>
                      {showElectricity ? (
                        <div>
                          <span className="text-stone-850 font-bold block">₹{electricityBill}</span>
                          <span className={`text-[10px] font-bold ${electricityPaid ? 'text-emerald-600' : 'text-brand-pending'} block mt-0.5`}>
                            {electricityPaid ? 'Paid' : 'Unpaid (⚡ Pending)'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-stone-450 font-semibold block">-</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Fixed Sticky Action Button at Bottom */}
      <div className="fixed bottom-22 left-0 right-0 z-40 pointer-events-none flex justify-center px-4">
        <button
          onClick={() => onRecordPayment(tenantId, currentMonthStr)}
          className="pointer-events-auto w-full max-w-[398px] min-h-[48px] bg-brand-primary hover:bg-brand-primary/95 text-white font-extrabold rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform text-base pt-1 cursor-pointer"
          aria-label="Record payment for this tenant"
        >
          <span>Payment Record Karo</span>
        </button>
      </div>

    </div>
  );
}
