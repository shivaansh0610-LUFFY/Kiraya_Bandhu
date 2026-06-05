import React, { useState, useEffect } from 'react';
import { getRecentMonthsList, getHindiMonthName, getMonthlyStatus, getMonthlySummary } from '../utils/storage';
import { exportMonthlyReportToPDF } from '../utils/pdfExport';
import { FileDown, Calendar, MessageSquare, AlertCircle } from 'lucide-react';

export default function MonthlyReport() {
  const [months, setMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [monthlyStatus, setMonthlyStatus] = useState([]);
  const [summary, setSummary] = useState({});
  const [landlordNote, setLandlordNote] = useState('');

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
