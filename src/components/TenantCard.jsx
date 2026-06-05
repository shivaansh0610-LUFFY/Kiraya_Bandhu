import React from 'react';
import { Phone, Edit3, Home } from 'lucide-react';

export default function TenantCard({ tenant, onEdit }) {
  const { name, room, monthlyRent, phone, joinDate } = tenant;

  return (
    <div 
      onClick={() => onEdit(tenant)}
      className="bg-white rounded-2xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.08)] border border-stone-100 flex items-center justify-between gap-4 transition-all duration-200 hover:border-brand-primary/20 active:scale-[0.98] cursor-pointer"
    >
      
      {/* Left section: Floor & Tenant Details */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Floor Badge */}
        <div className="flex-shrink-0 min-w-12 h-12 px-2 rounded-xl bg-orange-50 border border-orange-100 text-brand-primary flex flex-col items-center justify-center font-bold">
          <span className="text-[10px] uppercase tracking-wide leading-none text-brand-primary/70 font-semibold mb-0.5">Floor</span>
          <span className="text-xs leading-none mt-0.5">{room}</span>
        </div>

        {/* Tenant Info */}
        <div className="min-w-0">
          <h4 className="text-stone-900 font-semibold text-base truncate mb-0.5">{name}</h4>
          <div className="flex items-center gap-3 text-xs text-stone-500 font-medium">
            <span>₹{Number(monthlyRent).toLocaleString('en-IN')}/mo</span>
            {phone && (
              <span className="flex items-center gap-0.5">
                • {phone}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right section: Action Buttons */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {phone && (
          <a
            href={`tel:${phone}`}
            onClick={(e) => e.stopPropagation()} // Prevent triggering card tap event
            className="w-10 h-10 rounded-xl bg-stone-50 text-stone-600 flex items-center justify-center border border-stone-200/60 active:bg-stone-100 transition-colors"
            title="Call Tenant"
            aria-label={`Call ${name}`}
          >
            <Phone size={18} className="stroke-[2]" />
          </a>
        )}
        
        <div
          className="w-10 h-10 rounded-xl bg-brand-primary/5 text-brand-primary flex items-center justify-center border border-brand-primary/10 transition-colors"
          title="Edit/Delete"
        >
          <Edit3 size={18} className="stroke-[2.2]" />
        </div>
      </div>

    </div>
  );
}
