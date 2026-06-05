import React, { useState, useEffect } from 'react';
import { getTenants, saveTenant } from './utils/storage';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import Tenants from './pages/Tenants';
import RecordPayment from './pages/RecordPayment';
import Electricity from './pages/Electricity';
import MonthlyReport from './pages/MonthlyReport';
import { Heart, Building2 } from 'lucide-react';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [tenantsCount, setTenantsCount] = useState(0);
  const [preSelectedTenantId, setPreSelectedTenantId] = useState('');
  const [preSelectedMonth, setPreSelectedMonth] = useState('');
  
  // First tenant form state
  const [welcomeName, setWelcomeName] = useState('');
  const [welcomeRoom, setWelcomeRoom] = useState('');
  const [welcomeRent, setWelcomeRent] = useState('');
  const [welcomePhone, setWelcomePhone] = useState('');

  // Check tenants count on mount and whenever page switches to dashboard/tenants
  const updateTenantsCount = () => {
    const activeTenants = getTenants();
    setTenantsCount(activeTenants.length);
  };

  useEffect(() => {
    updateTenantsCount();
  }, [page]);

  const handleRecordPaymentRedirect = (tenantId, monthStr) => {
    setPreSelectedTenantId(tenantId);
    setPreSelectedMonth(monthStr || '');
    setPage('record-payment');
  };

  const handlePaymentRecorded = (targetPage = 'dashboard') => {
    setPreSelectedTenantId('');
    setPreSelectedMonth('');
    setPage(targetPage);
    updateTenantsCount();
  };

  const handleWelcomeSubmit = (e) => {
    e.preventDefault();
    if (!welcomeName.trim() || !welcomeRoom.trim() || !welcomeRent) return;

    const saved = saveTenant({
      name: welcomeName,
      room: welcomeRoom,
      monthlyRent: Number(welcomeRent),
      phone: welcomePhone
    });

    if (saved) {
      setWelcomeName('');
      setWelcomeRoom('');
      setWelcomeRent('');
      setWelcomePhone('');
      updateTenantsCount();
      setPage('dashboard');
    }
  };

  // ---------------------------------------------------------
  // RENDER WELCOME SCREEN (FIRST LAUNCH FLOW)
  // ---------------------------------------------------------
  if (tenantsCount === 0) {
    return (
      <div className="app-wrapper px-4 py-8 flex flex-col justify-center min-h-screen bg-[#FFF7ED]">
        <div className="text-center mb-6">
          {/* Emoji Art / Stylized Icons */}
          <div className="text-6xl mb-4 select-none drop-shadow-md animate-bounce-slow">
            🏠💰
          </div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
            Kiraya Bandhu (किराया बंधु)
          </h1>
          <p className="text-brand-primary font-bold text-sm tracking-wide mt-1">
            Aapka ghar, aapka hisaab
          </p>
        </div>

        {/* Polished Welcome Form Card */}
        <div className="bg-[#FFF9F2] rounded-2xl p-6 border border-orange-100 shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
          <div className="bg-orange-100/60 border border-orange-200/50 rounded-xl p-3 text-center mb-5">
            <p className="text-xs text-brand-primary font-bold uppercase tracking-wider mb-0.5">Swaagat Hai! (स्वागत है!)</p>
            <p className="text-xs text-stone-600 font-bold">Shuru karne ke liye apna pehla kiraya wala add karein.</p>
          </div>

          <form onSubmit={handleWelcomeSubmit} className="space-y-4">
            {/* Tenant Name */}
            <div>
              <label className="block text-xs font-semibold text-stone-500 mb-1.5 uppercase tracking-wider">
                Naam (नाम) *
              </label>
              <input
                type="text"
                required
                value={welcomeName}
                onChange={(e) => setWelcomeName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className="w-full min-h-[48px] px-3.5 rounded-xl border border-stone-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all outline-none bg-white font-medium"
              />
            </div>

            {/* Floor */}
            <div>
              <label className="block text-xs font-semibold text-stone-500 mb-1.5 uppercase tracking-wider">
                Floor (मंजिल) *
              </label>
              <input
                type="text"
                required
                value={welcomeRoom}
                onChange={(e) => setWelcomeRoom(e.target.value)}
                placeholder="e.g. Ground Floor, 1st Floor"
                className="w-full min-h-[48px] px-3.5 rounded-xl border border-stone-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all outline-none bg-white font-medium"
              />
            </div>

            {/* Monthly Rent */}
            <div>
              <label className="block text-xs font-semibold text-stone-500 mb-1.5 uppercase tracking-wider">
                Mahina Kiraya (महीना किराया ₹) *
              </label>
              <input
                type="number"
                required
                min="1"
                value={welcomeRent}
                onChange={(e) => setWelcomeRent(e.target.value)}
                placeholder="e.g. 5000"
                className="w-full min-h-[48px] px-3.5 rounded-xl border border-stone-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all outline-none bg-white font-bold text-stone-850"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-stone-500 mb-1.5 uppercase tracking-wider">
                Phone Number (वैकल्पिक)
              </label>
              <input
                type="tel"
                value={welcomePhone}
                onChange={(e) => setWelcomePhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full min-h-[48px] px-3.5 rounded-xl border border-stone-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all outline-none bg-white font-medium"
              />
            </div>

            {/* Save Button */}
            <button
              type="submit"
              className="w-full min-h-[48px] bg-brand-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-brand-primary/95 active:scale-95 transition-all shadow-md pt-1"
            >
              <span>Add Karein aur Shuru Karen</span>
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-[10px] text-stone-400 font-semibold uppercase tracking-wider flex items-center justify-center gap-1">
          <span>Made for Landlords with</span>
          <Heart size={10} className="fill-brand-pending text-brand-pending" />
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // RENDER MAIN APPLICATION SHELL
  // ---------------------------------------------------------
  return (
    <div className="app-wrapper">
      {/* Top Header - Subtle warm gradient with white text */}
      <header className="sticky top-0 header-gradient px-4 py-3 z-45 flex items-center justify-between shadow-[0_2px_12px_rgba(0,0,0,0.08)] select-none">
        <div className="flex items-center gap-2 text-white">
          <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center font-bold">
            <Building2 size={18} className="stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight">
              Kiraya Bandhu
            </h1>
            <span className="text-[9px] text-orange-100 font-bold uppercase tracking-wider block leading-none">
              Aapka Rent Manager (आपका रेंट मैनेजर)
            </span>
          </div>
        </div>
        
        {/* Offline Status indicator badge */}
        <span className="text-[8px] bg-white/10 text-white px-2.5 py-1 rounded-full font-bold border border-white/20 flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-350 animate-pulse" />
          OFFLINE READY
        </span>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 flex flex-col min-h-0 bg-[#FFF7ED]">
        {page === 'dashboard' && (
          <Dashboard 
            onRecordPaymentRedirect={handleRecordPaymentRedirect} 
          />
        )}
        {page === 'tenants' && (
          <Tenants />
        )}
        {page === 'record-payment' && (
          <RecordPayment 
            preSelectedTenantId={preSelectedTenantId}
            preSelectedMonth={preSelectedMonth}
            onPaymentRecorded={handlePaymentRecorded}
          />
        )}
        {page === 'electricity' && (
          <Electricity />
        )}
        {page === 'report' && (
          <MonthlyReport />
        )}
      </main>

      {/* Global Bottom Navigation */}
      <BottomNav currentPage={page} setPage={setPage} />
    </div>
  );
}
