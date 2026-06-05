import React, { useState, useEffect, useRef } from 'react';
import { getTenants, saveTenant, deleteTenant } from '../utils/storage';
import TenantCard from '../components/TenantCard';
import { UserPlus, X, Trash2, Save, Lightbulb } from 'lucide-react';

export default function Tenants({ onSelectTenant }) {
  const [tenants, setTenants] = useState([]);
  const [editingTenant, setEditingTenant] = useState(null);
  
  // Form States
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [phone, setPhone] = useState('');

  const dialogRef = useRef(null);

  useEffect(() => {
    setTenants(getTenants());
  }, []);

  const openModal = (tenant = null) => {
    if (tenant) {
      setEditingTenant(tenant);
      setName(tenant.name);
      setRoom(tenant.room);
      setMonthlyRent(tenant.monthlyRent);
      setPhone(tenant.phone || '');
    } else {
      setEditingTenant(null);
      setName('');
      setRoom('');
      setMonthlyRent('');
      setPhone('');
    }
    dialogRef.current?.showModal();
  };

  const closeModal = () => {
    dialogRef.current?.close();
  };

  // Fallback for light-dismiss on click backdrop
  const handleDialogClick = (e) => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    
    if (e.target === dialog) {
      if (!('closedBy' in HTMLDialogElement.prototype)) {
        const rect = dialog.getBoundingClientRect();
        const isDialogContent = (
          rect.top <= e.clientY &&
          e.clientY <= rect.top + rect.height &&
          rect.left <= e.clientX &&
          e.clientX <= rect.left + rect.width
        );

        if (!isDialogContent) {
          closeModal();
        }
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !room.trim() || !monthlyRent) return;

    const saved = saveTenant({
      id: editingTenant?.id,
      name,
      room,
      monthlyRent: Number(monthlyRent),
      phone
    });

    if (saved) {
      setTenants(getTenants());
      closeModal();
    }
  };

  const handleDelete = () => {
    if (!editingTenant) return;
    
    const confirmDelete = window.confirm(
      `Kya aap sach me ${editingTenant.name} (${editingTenant.room}) ko hatana chahte hain?\n(Unki history safe rahegi.)`
    );

    if (confirmDelete) {
      const deleted = deleteTenant(editingTenant.id);
      if (deleted) {
        setTenants(getTenants());
        closeModal();
      }
    }
  };

  const handleDeleteTenant = (tenantId, tenantName) => {
    const confirmDelete = window.confirm(
      `Kya aap sach me ${tenantName} ko hatana chahte hain?\n(Unki history safe rahegi.)`
    );

    if (confirmDelete) {
      const deleted = deleteTenant(tenantId);
      if (deleted) {
        setTenants(getTenants());
      }
    }
  };

  return (
    <div className="flex-1 pb-24 px-4 pt-4 overflow-y-auto relative">
      
      {/* Title & Count */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-xl font-bold text-stone-900">Kiraya Wale (किरायेदार)</h2>
        <span className="text-sm bg-orange-100/80 text-brand-primary px-3 py-1 rounded-full font-bold">
          Total: {tenants.length}
        </span>
      </div>

      {/* Helpful Tip Card for short tenant list (1 to 5 tenants) */}
      {tenants.length > 0 && tenants.length <= 5 && (
        <div className="bg-amber-50/60 border border-orange-100 rounded-2xl p-4 mb-4 flex items-start gap-3 shadow-[0_2px_12px_rgba(0,0,0,0.08)] animate-fade-in">
          <div className="text-brand-primary p-2 bg-white rounded-xl border border-orange-100 shadow-sm shrink-0 flex items-center justify-center">
            <Lightbulb size={18} className="fill-brand-primary/10 text-brand-primary" />
          </div>
          <div>
            <h4 className="font-bold text-stone-800 text-sm">Zaroori Tip (ज़रूरी टिप)</h4>
            <p className="text-xs text-stone-600 font-semibold mt-0.5 leading-relaxed">
              Kiraya wale ke naam pe tap karein edit karne ke liye (किरायेदार के नाम पर टैप करें एडिट करने के लिए).
            </p>
          </div>
        </div>
      )}

      {/* Tenants List */}
      {tenants.length === 0 ? (
        <div className="bg-white border border-dashed border-stone-200 rounded-2xl p-8 text-center shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
          <p className="text-stone-500 text-sm mb-4">Koi kiraya wala nahi mila. Naya jodne ke liye neeche button dabaen.</p>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 bg-brand-primary text-white font-bold px-5 py-3 rounded-xl shadow-md active:scale-95 transition-transform"
          >
            <UserPlus size={18} />
            <span>Naya Jode (नया जोड़ें)</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {tenants.map((tenant) => (
            <TenantCard
              key={tenant.id}
              tenant={tenant}
              onEdit={openModal}
              onDelete={handleDeleteTenant}
              onSelect={onSelectTenant}
            />
          ))}
        </div>
      )}

      {/* Floating Add Tenant Button (minimum 48px height) */}
      <div className="fixed bottom-22 left-0 right-0 z-40 pointer-events-none flex justify-center px-4">
        <button
          onClick={() => openModal()}
          className="pointer-events-auto w-full max-w-[398px] min-h-[48px] bg-brand-primary text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-brand-primary/95 active:scale-95 transition-transform pt-1"
          aria-label="Add new tenant"
        >
          <UserPlus size={20} className="stroke-[2.5]" />
          <span>+ Naya Kiraya Wala (नया किरायेदार)</span>
        </button>
      </div>

      {/* Add/Edit Dialog Modal */}
      <dialog
        ref={dialogRef}
        closedby="any"
        onClick={handleDialogClick}
        className="w-[90%] max-w-[380px] p-6 focus:outline-none shadow-[0_2px_12px_rgba(0,0,0,0.08)]"
        aria-labelledby="modal-title"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 id="modal-title" className="font-bold text-lg text-stone-900">
            {editingTenant ? 'Edit Kiraya Wala' : 'Naya Kiraya Wala Jode'}
          </h3>
          <button
            onClick={closeModal}
            className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tenant Name */}
          <div>
            <label className="block text-xs font-semibold text-stone-500 mb-1.5 uppercase tracking-wider">
              Naam (नाम) *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              className="w-full min-h-[48px] px-3.5 rounded-xl border border-stone-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all outline-none bg-stone-50 font-medium"
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
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="e.g. Ground Floor, 1st Floor"
              className="w-full min-h-[48px] px-3.5 rounded-xl border border-stone-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all outline-none bg-stone-50 font-medium"
            />
          </div>

          {/* Rent Due */}
          <div>
            <label className="block text-xs font-semibold text-stone-500 mb-1.5 uppercase tracking-wider">
              Mahina Kiraya (महीना किराया ₹) *
            </label>
            <input
              type="number"
              required
              min="1"
              value={monthlyRent}
              onChange={(e) => setMonthlyRent(e.target.value)}
              placeholder="e.g. 5000"
              className="w-full min-h-[48px] px-3.5 rounded-xl border border-stone-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all outline-none bg-stone-50 font-bold text-stone-850"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-stone-500 mb-1.5 uppercase tracking-wider">
              Phone Number (वैकल्पिक)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              className="w-full min-h-[48px] px-3.5 rounded-xl border border-stone-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all outline-none bg-stone-50 font-medium"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            {editingTenant && (
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 min-h-[48px] bg-red-50 hover:bg-red-100 text-brand-pending font-bold rounded-xl border border-red-200 flex items-center justify-center gap-1.5 transition-colors pt-1"
              >
                <Trash2 size={16} />
                <span>Hatae (हटाएं)</span>
              </button>
            )}
            
            <button
              type="submit"
              className="flex-2 min-h-[48px] bg-brand-primary text-white font-bold rounded-xl flex items-center justify-center gap-1.5 hover:bg-brand-primary/95 active:scale-95 transition-transform pt-1"
            >
              <Save size={16} />
              <span>Save Karo (सेव)</span>
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
