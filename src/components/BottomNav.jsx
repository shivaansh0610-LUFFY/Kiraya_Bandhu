import React from 'react';
import { Home, Users, Plus, Zap, FileText } from 'lucide-react';

export default function BottomNav({ currentPage, setPage }) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Ghar',
      sublabel: 'घर',
      icon: Home,
    },
    {
      id: 'tenants',
      label: 'Kiraya Wale',
      sublabel: 'किरायेदार',
      icon: Users,
    },
    {
      id: 'record-payment',
      label: 'Payment',
      sublabel: 'पेमेंट',
      icon: Plus,
    },
    {
      id: 'electricity',
      label: 'Bijli',
      sublabel: 'बिजली',
      icon: Zap,
    },
    {
      id: 'report',
      label: 'Report',
      sublabel: 'रिपोर्ट',
      icon: FileText,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-stone-200 shadow-[0_-4px_10px_rgba(28,25,23,0.04)]">
      <div className="max-w-[430px] mx-auto flex justify-around items-stretch h-18 relative px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`flex-1 flex flex-col items-center justify-end min-h-[48px] pt-2 pb-1 relative transition-all duration-150 active:scale-95 ${
                isActive 
                  ? 'text-brand-primary font-bold' 
                  : 'text-stone-500 hover:text-stone-800'
              }`}
              aria-label={`${item.label} (${item.sublabel})`}
            >
              {/* Orange Dot Indicator ABOVE the icon/text */}
              {isActive && (
                <span className="absolute top-0.5 left-1/2 -translate-x-1/2 flex h-1.5 w-1.5 rounded-full bg-brand-primary animate-fade-in" />
              )}

              <div className="relative flex items-center justify-center">
                <Icon 
                  size={22} // Strictly 22px
                  className={`transition-all duration-200 ${
                    isActive ? 'scale-110 stroke-[2.8] text-brand-primary' : 'stroke-[1.8]'
                  }`} 
                />
              </div>
              
              <span className="text-[10px] leading-none mt-1 font-semibold select-none whitespace-nowrap">
                {item.label}
              </span>
              <span className="text-[8px] leading-tight text-stone-400 select-none whitespace-nowrap">
                {item.sublabel}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
