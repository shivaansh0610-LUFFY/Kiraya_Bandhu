import React, { useState } from 'react';
import BottomNav from './components/BottomNav';

export default function App() {
  const [page, setPage] = useState('dashboard');

  return (
    <div className="app-wrapper">
      <header className="sticky top-0 bg-[#F97316] p-4 text-white text-center font-bold">
        <h1>Kiraya Bandhu</h1>
      </header>
      <main className="flex-1 p-4 bg-[#FFF7ED]">
        {page === 'dashboard' && <div className="text-center py-12">Dashboard View (Coming Soon)</div>}
        {page === 'tenants' && <div className="text-center py-12">Tenants View (Coming Soon)</div>}
      </main>
      <BottomNav currentPage={page} setPage={setPage} />
    </div>
  );
}
