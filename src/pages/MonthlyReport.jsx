import React, { useState, useEffect } from 'react';
import { getRecentMonthsList, getHindiMonthName, getMonthlyStatus, getMonthlySummary } from '../utils/storage';
import { exportMonthlyReportToPDF } from '../utils/pdfExport';
import { FileDown, Calendar, MessageSquare, AlertCircle } from 'lucide-react';

export default function MonthlyReport({ onRecordPayment, onSelectTenant }) {
  const [months, setMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [monthlyStatus, setMonthlyStatus] = useState([]);
  const [summary, setSummary] = useState({});
  const [landlordNote, setLandlordNote] = useState('');
  const [statusTab, setStatusTab] = useState('pending');

  useEffect(() => {
    const monthsList = getRecentMonthsList();
    setMonths(monthsList);
    
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    if (monthsList.includes(currentMonthStr)) {
      setSelectedMonth(currentMonthStr);
    } else if (monthsList.length > 0) {
      setSelectedMonth(monthsList[0]);
    }
  }, []);

  useEffect(() => {
    if (selectedMonth) {
      setMonthlyStatus(getMonthlyStatus(selectedMonth));
      setSummary(getMonthlySummary(selectedMonth));
    }
  }, [selectedMonth]);

  const handleExportPDF = () => {
    if (!selectedMonth) return;
    exportMonthlyReportToPDF(selectedMonth, monthlyStatus, summary, landlordNote);
  };

  const totalRentDue = monthlyStatus.reduce((sum, item) => sum + item.rentDue, 0);
  const totalRentPaid = monthlyStatus.reduce((sum, item) => sum + item.amountPaid, 0);
  const totalElectricityBill = monthlyStatus.reduce((sum, item) => sum + item.electricityBill, 0);
  const totalOutstandingDue = monthlyStatus.reduce((sum, item) => sum + item.totalPendingAmount, 0);

  return (
    <div className="flex-1 pb-24 px-4 pt-4 overflow-y-auto">
      
      {/* Screen Title */}
      <div className="mb-4 px-1">
        <h2 className="text-xl font-bold text-stone-900">Monthly Report (रिपोर्ट)</h2>
        <p className="text-xs text-stone-500 mt-0.5">Hisab-kitab aur PDF download karein</p>
      </div>

      {/* Month Selector Dropdown */}
      <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-[0_2px_12px_rgba(0,0,0,0.08)] mb-5 flex items-center gap-3">
        <Calendar className="text-brand-primary shrink-0" size={20} />
        <div className="flex-1">
          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">
            Mahina Select Karein (महीना चुनें)
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full bg-transparent text-stone-850 font-bold border-none p-0 focus:ring-0 focus:outline-none"
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {getHindiMonthName(m)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Collection Summary & Status Lists */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        {/* Collected Card */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider block mb-1">
              Collected (कुल मिला)
            </span>
            <span className="text-xl font-black text-emerald-950 block">
              ₹{(summary.totalCollected || 0).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="border-t border-emerald-100/50 pt-2 mt-2 text-[9px] text-emerald-700 font-bold flex flex-col gap-0.5">
            <span>Rent: ₹{(summary.rentCollected || 0).toLocaleString('en-IN')}</span>
            {summary.electricityCollected > 0 && (
              <span>Bijli: ₹{(summary.electricityCollected || 0).toLocaleString('en-IN')}</span>
            )}
          </div>
        </div>

        {/* Pending Card */}
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-rose-600 uppercase tracking-wider block mb-1">
              Pending (कुल बचा है)
            </span>
            <span className="text-xl font-black text-rose-950 block">
              ₹{(summary.totalPending || 0).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="border-t border-rose-100/50 pt-2 mt-2 text-[9px] text-rose-700 font-bold flex flex-col gap-0.5">
            <span>Rent: ₹{(summary.rentPending || 0).toLocaleString('en-IN')}</span>
            {summary.electricityPending > 0 && (
              <span>Bijli: ₹{(summary.electricityPending || 0).toLocaleString('en-IN')}</span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Summary Lists */}
      {monthlyStatus.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-[0_2px_12px_rgba(0,0,0,0.08)] mb-5">
          <div className="flex border-b border-stone-100 mb-3 pb-1">
            <button
              onClick={() => setStatusTab('pending')}
              className={`flex-1 pb-2 text-center text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
                statusTab === 'pending'
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-stone-400'
              }`}
            >
              Pending ({monthlyStatus.filter(item => !item.tenant.deleted && item.totalPendingAmount > 0).length})
            </button>
            <button
              onClick={() => setStatusTab('paid')}
              className={`flex-1 pb-2 text-center text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
                statusTab === 'paid'
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-stone-400'
              }`}
            >
              Paid ({monthlyStatus.filter(item => !item.tenant.deleted && item.totalPendingAmount === 0).length})
            </button>
          </div>

          {statusTab === 'pending' ? (
            monthlyStatus.filter(item => !item.tenant.deleted && item.totalPendingAmount > 0).length === 0 ? (
              <div className="text-center py-4 text-xs font-semibold text-emerald-600">
                🎉 Sab ne de diya! Koi payment pending nahi hai.
              </div>
            ) : (
              <div className="space-y-2.5">
                {monthlyStatus.filter(item => !item.tenant.deleted && item.totalPendingAmount > 0).map((item) => (
                  <div
                    key={item.tenant.id}
                    className="flex justify-between items-center bg-stone-50/50 hover:bg-stone-50 border border-stone-100/50 rounded-xl p-3 transition-colors"
                  >
                    <div 
                      onClick={() => onSelectTenant && onSelectTenant(item.tenant.id)}
                      className="flex flex-col cursor-pointer group"
                    >
                      <span className="font-bold text-stone-850 text-sm group-hover:text-brand-primary transition-colors">
                        {item.tenant.name}
                      </span>
                      <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mt-0.5">
                        Floor: {item.tenant.room} • Rent Due: ₹{item.rentDue}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-brand-pending block">
                          ₹{item.totalPendingAmount} pending
                        </span>
                        {item.electricityPending > 0 && (
                          <span className="text-[9px] text-stone-400 block font-medium">
                            Incl. ⚡ ₹{item.electricityPending}
                          </span>
                        )}
                      </div>
                      {onRecordPayment && (
                        <button
                          onClick={() => onRecordPayment(item.tenant.id, selectedMonth)}
                          className="min-h-[36px] px-3.5 bg-orange-50 hover:bg-orange-100/80 text-brand-primary text-xs font-extrabold rounded-lg border border-orange-100 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                        >
                          Pay
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            monthlyStatus.filter(item => !item.tenant.deleted && item.totalPendingAmount === 0).length === 0 ? (
              <div className="text-center py-4 text-xs font-semibold text-stone-400">
                Kisi ne bhi abhi tak pura payment nahi diya.
              </div>
            ) : (
              <div className="space-y-2.5">
                {monthlyStatus.filter(item => !item.tenant.deleted && item.totalPendingAmount === 0).map((item) => (
                  <div
                    key={item.tenant.id}
                    onClick={() => onSelectTenant && onSelectTenant(item.tenant.id)}
                    className="flex justify-between items-center bg-stone-50/50 hover:bg-stone-50 border border-stone-100/50 rounded-xl p-3 transition-colors cursor-pointer group"
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-stone-850 text-sm group-hover:text-brand-primary transition-colors">
                        {item.tenant.name}
                      </span>
                      <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mt-0.5">
                        Floor: {item.tenant.room} • Paid: ₹{item.amountPaid + item.electricityBill}
                      </span>
                    </div>
                    <span className="text-[9px] bg-emerald-50 text-brand-success border border-emerald-100 px-2 py-1 rounded-md font-extrabold uppercase tracking-wide">
                      Paid ✅
                    </span>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      )}

      {/* Report Summary Data Table */}
      <div className="bg-white rounded-2xl border border-stone-150 shadow-[0_2px_12px_rgba(0,0,0,0.08)] overflow-hidden mb-5">
        <div className="p-4 bg-stone-50/70 border-b border-stone-100 flex justify-between items-center">
          <h4 className="font-bold text-sm text-stone-700">Tenants List ({monthlyStatus.length})</h4>
          <span className="text-xs text-stone-400 font-bold">Month: {selectedMonth}</span>
        </div>

        {monthlyStatus.length === 0 ? (
          <div className="p-8 text-center text-sm text-stone-500">
            Is mahine koi tenant data nahi hai.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-100 text-stone-500 font-bold text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-3">Naam</th>
                  <th className="py-3 px-2 text-center">Floor</th>
                  <th className="py-3 px-2 text-right">Rent Due</th>
                  <th className="py-3 px-2 text-right">Rent Paid</th>
                  <th className="py-3 px-2 text-right">Bijli Bill</th>
                  <th className="py-3 px-2 text-right">Total Outstanding</th>
                  <th className="py-3 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700 text-xs">
                {monthlyStatus.map((item) => {
                  let overallStatus = 'unpaid';
                  if (item.totalPendingAmount === 0) {
                    overallStatus = 'paid';
                  } else if (item.amountPaid > 0 || (item.electricityBill > 0 && item.electricityPaid)) {
                    overallStatus = 'partial';
                  }

                  return (
                    <tr key={item.tenant.id} className="hover:bg-stone-50/50">
                      <td className="py-3.5 px-3 font-bold text-stone-900">
                        {item.tenant.name}
                      </td>
                      <td className="py-3.5 px-2 text-center font-bold text-stone-500">
                        {item.tenant.room}
                      </td>
                      <td className="py-3.5 px-2 text-right font-medium">
                        ₹{item.rentDue}
                      </td>
                      <td className="py-3.5 px-2 text-right font-semibold text-emerald-600">
                        ₹{item.amountPaid}
                      </td>
                      <td className="py-3.5 px-2 text-right font-medium">
                        {item.electricityBill > 0 ? (
                          <span className={item.electricityPaid ? 'text-emerald-650' : 'text-brand-primary font-bold'}>
                            ₹{item.electricityBill} ({item.electricityPaid ? 'Paid' : 'Unpaid'})
                          </span>
                        ) : (
                          <span className="text-stone-300">₹0</span>
                        )}
                      </td>
                      <td className={`py-3.5 px-2 text-right font-extrabold ${item.totalPendingAmount > 0 ? 'text-brand-pending' : 'text-stone-400'}`}>
                        ₹{item.totalPendingAmount}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        {overallStatus === 'paid' && (
                          <span className="text-[9px] bg-emerald-100 text-brand-success px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                            Paid
                          </span>
                        )}
                        {overallStatus === 'partial' && (
                          <span className="text-[9px] bg-orange-100 text-brand-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                            Partial
                          </span>
                        )}
                        {overallStatus === 'unpaid' && (
                          <span className="text-[9px] bg-rose-100 text-brand-pending px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                            Unpaid
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                
                {/* Total Row */}
                <tr className="bg-stone-50 font-bold text-xs text-stone-900 border-t border-stone-200">
                  <td className="py-3 px-3 uppercase">Total</td>
                  <td className="py-3 px-2"></td>
                  <td className="py-3 px-2 text-right">₹{totalRentDue}</td>
                  <td className="py-3 px-2 text-right text-emerald-600">₹{totalRentPaid}</td>
                  <td className="py-3 px-2 text-right text-brand-primary">₹{totalElectricityBill}</td>
                  <td className="py-3 px-2 text-right text-brand-pending">₹{totalOutstandingDue}</td>
                  <td className="py-3 px-3"></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Landlord Note textarea */}
      <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-[0_2px_12px_rgba(0,0,0,0.08)] mb-5">
        <div className="flex items-center gap-2 mb-2 px-0.5">
          <MessageSquare size={16} className="text-brand-primary" />
          <label className="text-xs font-bold text-stone-700 uppercase tracking-wide">
            Add Note for PDF (पीडीएफ के लिए नोट)
          </label>
        </div>
        <textarea
          rows="2"
          value={landlordNote}
          onChange={(e) => setLandlordNote(e.target.value)}
          placeholder="e.g. PhonePe payment successful. Balance will be paid next month. (इस महीने का किराया मिल गया है.)"
          className="w-full p-3 rounded-xl border border-stone-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none text-sm bg-stone-50 text-stone-800"
        />
      </div>

      {/* Generate PDF Button (minimum 48px height) */}
      <button
        onClick={handleExportPDF}
        disabled={monthlyStatus.length === 0}
        className="w-full min-h-[48px] bg-brand-primary hover:bg-brand-primary/95 disabled:bg-stone-300 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition-all pt-1"
      >
        <FileDown size={20} className="stroke-[2.5]" />
        <span>PDF Banao (पीडीएफ रिपोर्ट बनाएं)</span>
      </button>

    </div>
  );
}
