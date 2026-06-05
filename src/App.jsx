import React, { useState, useEffect } from 'react';
import { getTenants, saveTenant } from './utils/storage';
import BottomNav from './components/BottomNav';
import Tenants from './pages/Tenants';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [tenantsCount, setTenantsCount] = useState(0);
  
  const [welcomeName, setWelcomeName] = useState('');
  const [welcomeRoom, setWelcomeRoom] = useState('');
  const [welcomeRent, setWelcomeRent] = useState('');
  const [welcomePhone, setWelcomePhone] = useState('');

  const updateTenantsCount = () => {
    const activeTenants = getTenants();
    setTenantsCount(activeTenants.length);
  };

  useEffect(() => {
    updateTenantsCount();
  }, [page]);

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

  if (tenantsCount === 0) {
    return (
      <div className="app-wrapper px-4 py-8 flex flex-col justify-center min-h-screen bg-[#FFF7ED]">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-stone-900">Kiraya Bandhu</h1>
        </div>
        <form onSubmit={handleWelcomeSubmit} className="bg-white rounded-2xl p-6 border border-orange-100 shadow-md space-y-4">
          <h3 className="font-bold text-center">Add your first tenant</h3>
          <input type="text" placeholder="Name" value={welcomeName} onChange={e => setWelcomeName(e.target.value)} className="w-full p-2 border rounded" required />
          <input type="text" placeholder="Floor (e.g. Ground Floor)" value={welcomeRoom} onChange={e => setWelcomeRoom(e.target.value)} className="w-full p-2 border rounded" required />
          <input type="number" placeholder="Monthly Rent" value={welcomeRent} onChange={e => setWelcomeRent(e.target.value)} className="w-full p-2 border rounded" required />
          <button type="submit" className="w-full bg-[#F97316] text-white p-2 rounded font-bold">Start</button>
        </form>
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <header className="sticky top-0 bg-[#F97316] p-4 text-white text-center font-bold">
        <h1>Kiraya Bandhu</h1>
      </header>
      <main className="flex-1 p-4 bg-[#FFF7ED]">
        {page === 'dashboard' && <div className="text-center py-12">Dashboard View (Coming Soon)</div>}
        {page === 'tenants' && <Tenants />}
      </main>
      <BottomNav currentPage={page} setPage={setPage} />
    </div>
  );
}
