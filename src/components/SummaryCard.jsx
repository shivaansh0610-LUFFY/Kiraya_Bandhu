import React from 'react';
import { CheckCircle2, AlertTriangle, Users } from 'lucide-react';

export default function SummaryCard({ summary }) {
  const {
    totalCollected = 0,
    totalPending = 0,
    totalTenantsCount = 0,
    paidTenantsCount = 0,
    rentCollected = 0,
    rentPending = 0,
    electricityCollected = 0,
    electricityPending = 0
  } = summary || {};

  // Calculate percentage of paid tenants for progress bar
  const paidPercent = totalTenantsCount > 0 
    ? Math.round((paidTenantsCount / totalTenantsCount) * 100) 
    : 0;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.08)] border border-stone-100 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-stone-500 text-xs font-semibold tracking-wider uppercase">Mahine Ka Hisab (महीने का हिसाब)</h3>
        <span className="text-xs bg-orange-100/80 text-brand-primary px-3 py-1 rounded-full font-bold flex items-center gap-1">
          <Users size={12} /> {totalTenantsCount} Tenants
        </span>
      </div>

      {/* Stacked Cards for Large 4xl Typography */}
      <div className="space-y-4 mb-5">
        {/* Collected card */}
        <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between transition-transform duration-200 hover:scale-[1.01] shadow-[0_2px_8px_rgba(34,197,94,0.04)]">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-1">
              <CheckCircle2 size={16} className="stroke-[2.5]" />
              <span>Collected (मिला)</span>
            </div>
            {/* Rent & Electricity breakdown subtext */}
            <span className="text-[10px] text-stone-400 font-semibold uppercase">
              Rent: ₹{rentCollected} | Electricity: ₹{electricityCollected}
            </span>
          </div>
          <div className="text-right">
            <div className="text-4xl font-extrabold text-emerald-600 tracking-tight">
              ₹{totalCollected.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Pending card */}
        <div className="bg-rose-50/60 border border-rose-100 rounded-2xl p-4 flex items-center justify-between transition-transform duration-200 hover:scale-[1.01] shadow-[0_2px_8px_rgba(239,68,68,0.04)]">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-rose-750 font-bold text-xs uppercase tracking-wider mb-1">
              <AlertTriangle size={16} className="stroke-[2.5]" />
              <span>Pending (बाकी)</span>
            </div>
            {/* Rent & Electricity breakdown subtext */}
            <span className="text-[10px] text-stone-400 font-semibold uppercase">
              Rent: ₹{rentPending} | Electricity: ₹{electricityPending}
            </span>
          </div>
          <div className="text-right">
            <div className="text-4xl font-extrabold text-brand-pending tracking-tight animate-pulse-subtle">
              ₹{totalPending.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar & Ratio */}
      <div className="space-y-2 pt-2 border-t border-stone-100">
        <div className="flex justify-between items-center text-sm">
          <span className="text-stone-500 font-medium flex items-center gap-1.5">
            <Users size={16} className="text-stone-400" />
            <span className="text-xs uppercase tracking-wide font-bold">Dene Wale (देने वाले)</span>
          </span>
          <span className="font-extrabold text-stone-850 text-sm">
            {paidTenantsCount} <span className="text-stone-400 font-medium">/ {totalTenantsCount} Paid</span>
          </span>
        </div>
        
        <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
          <div 
            className="bg-brand-primary h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${paidPercent}%` }}
          />
        </div>

        <div className="text-right text-[10px] text-stone-400 font-semibold uppercase tracking-wider">
          {paidPercent}% of tenants have fully paid (Rent + Bijli)
        </div>
      </div>
    </div>
  );
}
