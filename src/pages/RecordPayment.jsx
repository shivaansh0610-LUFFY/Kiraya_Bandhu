import React, { useState, useEffect } from 'react';
import { getTenants, addPayment } from '../utils/storage';
import { DollarSign, Calendar, FileText, CheckCircle2, ChevronRight } from 'lucide-react';

export default function RecordPayment({ preSelectedTenantId, preSelectedMonth, onPaymentRecorded }) {
  const [tenants, setTenants] = useState([]);
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('Cash');
  const [customNote, setCustomNote] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Quick select note templates
  const noteTemplates = [
    { id: 'Cash', label: 'Cash (कैश)' },
    { id: 'PhonePe', label: 'PhonePe' },
    { id: 'GooglePay', label: 'GooglePay' },
    { id: 'Partial', label: 'Aanshik (आंशिक)' }
  ];

  useEffect(() => {
    const activeTenants = getTenants();
    setTenants(activeTenants);

    // Set today's date in YYYY-MM-DD format as default
    const today = new Date().toISOString().split('T')[0];
    const currentMonthStr = today.substring(0, 7);

    // If a specific month was pre-selected on dashboard, default to its first day
    if (preSelectedMonth && preSelectedMonth !== currentMonthStr) {
      setDate(`${preSelectedMonth}-01`);
    } else {
      setDate(today);
    }

    // Handle preselected tenant from dashboard redirection
    if (preSelectedTenantId) {
      setSelectedTenantId(preSelectedTenantId);
      const tenant = activeTenants.find(t => t.id === preSelectedTenantId);
      if (tenant) {
        setAmount(tenant.monthlyRent);
      }
    } else if (activeTenants.length > 0) {
      // Otherwise preselect the first tenant
      setSelectedTenantId(activeTenants[0].id);
      setAmount(activeTenants[0].monthlyRent);
    }
  }, [preSelectedTenantId, preSelectedMonth]);

  // When selected tenant changes, auto-update the amount to their monthly rent
  const handleTenantChange = (tenantId) => {
    setSelectedTenantId(tenantId);
    const tenant = tenants.find(t => t.id === tenantId);
    if (tenant) {
      setAmount(tenant.monthlyRent);
    } else {
      setAmount('');
    }
  };

  const handleQuickNoteSelect = (itemVal) => {
    setNote(itemVal);
    if (itemVal !== 'Other') {
      setCustomNote('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedTenantId || !amount || !date) return;

    const finalNote = note === 'Other' ? customNote : note;

    const saved = addPayment({
      tenantId: selectedTenantId,
      amount: Number(amount),
      date,
      note: finalNote || 'Cash'
    });

    if (saved) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        // Trigger parent callback to redirect back to Dashboard
        onPaymentRecorded();
      }, 1500);
    }
  };

  if (tenants.length === 0) {
    return (
      <div className="flex-1 pb-24 px-4 pt-8 text-center flex flex-col items-center justify-center">
        <p className="text-stone-500 mb-6">Payment record karne ke liye pehle ek kiraya wala add karein.</p>
        <button
          onClick={() => onPaymentRecorded('tenants')}
          className="min-h-[48px] px-6 bg-brand-primary text-white font-bold rounded-xl flex items-center gap-2 active:scale-95 transition-transform"
        >
          <span>Naya Tenant Jode</span>
          <ChevronRight size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 pb-24 px-4 pt-4 overflow-y-auto relative">
      
      {/* Toast Success Animation Overlay */}
      {showSuccess && (
        <div className="absolute inset-0 bg-white/90 z-50 flex flex-col items-center justify-center p-6 animate-fade-in">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-brand-success mb-4 animate-bounce">
            <CheckCircle2 size={48} className="stroke-[2.5]" />
          </div>
          <h3 className="text-xl font-bold text-stone-900 mb-1">Save Ho Gaya!</h3>
          <p className="text-stone-500 text-sm">Payment record kar liya gaya hai.</p>
        </div>
      )}

      {/* Screen Title */}
      <div className="mb-6 px-1">
        <h2 className="text-xl font-bold text-stone-900">Payment Record Karo (पेमेंट दर्ज करें)</h2>
        <p className="text-xs text-stone-500 mt-1">Tenant ki payment details yahan bharein</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 border border-stone-100 shadow-[0_10px_30px_rgba(28,25,23,0.03)] space-y-5">
        
        {/* Select Tenant */}
        <div>
          <label className="block text-xs font-semibold text-stone-500 mb-1.5 uppercase tracking-wider">
            Kiraya Wala Select Karein (किरायेदार चुनें) *
          </label>
          <select
            value={selectedTenantId}
            onChange={(e) => handleTenantChange(e.target.value)}
            className="w-full min-h-[48px] px-3.5 rounded-xl border border-stone-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all outline-none bg-stone-50 font-medium text-stone-800"
          >
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.room})
              </option>
            ))}
          </select>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-semibold text-stone-500 mb-1.5 uppercase tracking-wider">
            Amount (रुपये) *
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-stone-400 text-lg">₹</span>
            <input
              type="number"
              required
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Rent amount"
              className="w-full min-h-[48px] pl-8 pr-4 rounded-xl border border-stone-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all outline-none bg-stone-50 font-bold text-stone-800"
            />
          </div>
        </div>

        {/* Date picker */}
        <div>
          <label className="block text-xs font-semibold text-stone-500 mb-1.5 uppercase tracking-wider">
            Tarikh (तारीख) *
          </label>
          <div className="relative">
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full min-h-[48px] px-3.5 rounded-xl border border-stone-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all outline-none bg-stone-50 font-medium text-stone-800"
            />
          </div>
        </div>

        {/* Note / Mode selector */}
        <div>
          <label className="block text-xs font-semibold text-stone-500 mb-2 uppercase tracking-wider">
            Payment Mode / Note (पेमेंट का तरीका)
          </label>
          
          {/* Quick templates */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {noteTemplates.map((t) => {
              const isSelected = note === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleQuickNoteSelect(t.id)}
                  className={`min-h-[44px] px-3 rounded-lg border text-sm font-semibold transition-all flex items-center justify-center ${
                    isSelected
                      ? 'bg-orange-50 border-brand-primary text-brand-primary'
                      : 'bg-stone-50 border-stone-200 text-stone-600 active:bg-stone-100'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
            
            {/* Custom Mode selector */}
            <button
              type="button"
              onClick={() => {
                setNote('Other');
                setCustomNote('');
              }}
              className={`col-span-2 min-h-[44px] px-3 rounded-lg border text-sm font-semibold transition-all flex items-center justify-center ${
                note === 'Other'
                  ? 'bg-orange-50 border-brand-primary text-brand-primary'
                  : 'bg-stone-50 border-stone-200 text-stone-600 active:bg-stone-100'
              }`}
            >
              Kuch aur (कुछ और - e.g. GPay, Cheque)
            </button>
          </div>

          {/* Custom Note input */}
          {note === 'Other' && (
            <input
              type="text"
              required
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="e.g. GooglePay, Cheque #12345"
              className="w-full min-h-[48px] px-3.5 rounded-xl border border-stone-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all outline-none bg-stone-50 font-medium text-stone-800 mt-2"
            />
          )}
        </div>

        {/* Save Button */}
        <button
          type="submit"
          className="w-full min-h-[48px] bg-brand-primary hover:bg-brand-primary/95 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-transform pt-1"
        >
          <span>Save Karo (सुरक्षित करें)</span>
        </button>

      </form>

    </div>
  );
}
