// LocalStorage storage helpers for Kiraya Bandhu

// Helper to generate a unique ID
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 9) + '-' + Date.now().toString(36);
};

// Helper to get previous month string (YYYY-MM)
const getPreviousMonthStr = (monthStr) => {
  const [year, month] = monthStr.split('-').map(Number);
  let prevYear = year;
  let prevMonth = month - 1;
  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear -= 1;
  }
  return `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
};

// ---------------------------------------------------------
// TENANTS API
// ---------------------------------------------------------

export const getTenants = (includeDeleted = false) => {
  try {
    const data = localStorage.getItem('tenants');
    const tenants = data ? JSON.parse(data) : [];
    if (includeDeleted) return tenants;
    return tenants.filter(t => !t.deleted);
  } catch (error) {
    console.error('Error reading tenants from localStorage:', error);
    return [];
  }
};

export const saveTenant = (tenantData) => {
  try {
    const tenants = getTenants(true); // Get all, including soft-deleted ones, to maintain indexing
    let updatedTenant;

    if (tenantData.id) {
      // Edit existing tenant
      const index = tenants.findIndex(t => t.id === tenantData.id);
      if (index !== -1) {
        tenants[index] = {
          ...tenants[index],
          name: tenantData.name,
          room: tenantData.room,
          monthlyRent: Number(tenantData.monthlyRent),
          phone: tenantData.phone || '',
        };
        updatedTenant = tenants[index];
      }
    } else {
      // Create new tenant
      updatedTenant = {
        id: generateId(),
        name: tenantData.name,
        room: tenantData.room,
        monthlyRent: Number(tenantData.monthlyRent),
        phone: tenantData.phone || '',
        joinDate: tenantData.joinDate || new Date().toISOString().split('T')[0],
        deleted: false
      };
      tenants.push(updatedTenant);
    }

    localStorage.setItem('tenants', JSON.stringify(tenants));
    return updatedTenant;
  } catch (error) {
    console.error('Error saving tenant to localStorage:', error);
    return null;
  }
};

export const deleteTenant = (id) => {
  try {
    const tenants = getTenants(true);
    const index = tenants.findIndex(t => t.id === id);
    if (index !== -1) {
      // Soft delete: set deleted flag to true
      tenants[index].deleted = true;
      localStorage.setItem('tenants', JSON.stringify(tenants));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting tenant from localStorage:', error);
    return false;
  }
};

// ---------------------------------------------------------
// PAYMENTS API
// ---------------------------------------------------------

export const getPayments = () => {
  try {
    const data = localStorage.getItem('payments');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading payments from localStorage:', error);
    return [];
  }
};

export const addPayment = (paymentData) => {
  try {
    const payments = getPayments();
    const newPayment = {
      id: generateId(),
      tenantId: paymentData.tenantId,
      amount: Number(paymentData.amount),
      date: paymentData.date || new Date().toISOString().split('T')[0],
      month: paymentData.month || (paymentData.date ? paymentData.date.substring(0, 7) : new Date().toISOString().substring(0, 7)),
      note: paymentData.note || 'Cash',
      recordedAt: new Date().toISOString()
    };

    payments.push(newPayment);
    localStorage.setItem('payments', JSON.stringify(payments));
    return newPayment;
  } catch (error) {
    console.error('Error adding payment to localStorage:', error);
    return null;
  }
};

// ---------------------------------------------------------
// BIJLI (ELECTRICITY) API
// ---------------------------------------------------------

export const getElectricityRate = () => {
  try {
    const rate = localStorage.getItem('electricityRate');
    return rate ? Number(rate) : 8;
  } catch (error) {
    console.error('Error reading electricity rate:', error);
    return 8;
  }
};

export const setElectricityRate = (rate) => {
  try {
    localStorage.setItem('electricityRate', String(Number(rate)));
    return true;
  } catch (error) {
    console.error('Error saving electricity rate:', error);
    return false;
  }
};

export const getAllElectricityReadings = () => {
  try {
    const data = localStorage.getItem('electricityReadings');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading electricity readings:', error);
    return [];
  }
};

export const getElectricityReadings = (monthStr) => {
  const activeTenants = getTenants(false);
  const allReadings = getAllElectricityReadings();
  const monthReadings = allReadings.filter(r => r.month === monthStr);
  const prevMonthStr = getPreviousMonthStr(monthStr);
  const prevReadings = allReadings.filter(r => r.month === prevMonthStr);
  const currentRate = getElectricityRate();

  return activeTenants.map(tenant => {
    // Check if reading exists for this month
    const existing = monthReadings.find(r => r.tenantId === tenant.id);
    if (existing) {
      return existing;
    }

    // If no reading exists, find the previous month's current reading
    const prevReadingObj = prevReadings.find(r => r.tenantId === tenant.id);
    const previousReading = prevReadingObj ? prevReadingObj.currentReading : 0;

    return {
      id: '', // Empty means unsaved in UI
      tenantId: tenant.id,
      month: monthStr,
      previousReading,
      currentReading: previousReading, // Default current reading to previous reading
      unitsConsumed: 0,
      ratePerUnit: currentRate,
      totalBill: 0,
      paid: false,
      paidDate: null,
      // Attached tenant metadata for UI convenience
      tenantName: tenant.name,
      tenantRoom: tenant.room
    };
  });
};

export const saveElectricityReadings = (monthStr, readingsList) => {
  try {
    const allReadings = getAllElectricityReadings();
    
    readingsList.forEach(reading => {
      // Find index of existing reading for this tenant in this month
      const index = allReadings.findIndex(r => r.tenantId === reading.tenantId && r.month === monthStr);
      
      const updatedReading = {
        id: reading.id || generateId(),
        tenantId: reading.tenantId,
        month: monthStr,
        previousReading: Number(reading.previousReading) || 0,
        currentReading: Number(reading.currentReading) || 0,
        unitsConsumed: Math.max(0, (Number(reading.currentReading) || 0) - (Number(reading.previousReading) || 0)),
        ratePerUnit: Number(reading.ratePerUnit),
        totalBill: Math.max(0, (Number(reading.currentReading) || 0) - (Number(reading.previousReading) || 0)) * Number(reading.ratePerUnit),
        paid: !!reading.paid,
        paidDate: reading.paid ? (reading.paidDate || new Date().toISOString().split('T')[0]) : null
      };

      if (index !== -1) {
        allReadings[index] = updatedReading;
      } else {
        allReadings.push(updatedReading);
      }
    });

    localStorage.setItem('electricityReadings', JSON.stringify(allReadings));
    return true;
  } catch (error) {
    console.error('Error saving electricity readings:', error);
    return false;
  }
};

export const toggleElectricityPaid = (readingId) => {
  try {
    const allReadings = getAllElectricityReadings();
    const index = allReadings.findIndex(r => r.id === readingId);
    
    if (index !== -1) {
      const currentPaid = allReadings[index].paid;
      allReadings[index].paid = !currentPaid;
      allReadings[index].paidDate = !currentPaid ? new Date().toISOString().split('T')[0] : null;
      localStorage.setItem('electricityReadings', JSON.stringify(allReadings));
      return allReadings[index];
    }
    return null;
  } catch (error) {
    console.error('Error toggling electricity paid state:', error);
    return null;
  }
};

// ---------------------------------------------------------
// DATA AGGREGATIONS / CALCULATIONS FOR MONTH
// ---------------------------------------------------------

export const getMonthlyStatus = (monthStr) => {
  const allTenants = getTenants(true); // Include soft-deleted ones for history
  const payments = getPayments();
  const electricityReadings = getAllElectricityReadings().filter(r => r.month === monthStr);
  
  // Filter payments for this month
  const monthPayments = payments.filter(p => p.month === monthStr);
  
  // Get active tenants, plus any soft-deleted tenant who has a payment or reading in this month
  const activeTenants = allTenants.filter(t => !t.deleted);
  const deletedTenantsWithHistory = allTenants.filter(t => 
    t.deleted && (
      monthPayments.some(p => p.tenantId === t.id) || 
      electricityReadings.some(r => r.tenantId === t.id)
    )
  );
  
  // Combine them for the month's context
  const targetTenants = [...activeTenants];
  deletedTenantsWithHistory.forEach(dt => {
    if (!targetTenants.some(t => t.id === dt.id)) {
      targetTenants.push(dt);
    }
  });

  return targetTenants.map(tenant => {
    const tenantPayments = monthPayments.filter(p => p.tenantId === tenant.id);
    const amountPaid = tenantPayments.reduce((sum, p) => sum + p.amount, 0);
    const rentDue = tenant.monthlyRent;
    const rentBalance = Math.max(0, rentDue - amountPaid);
    
    let rentStatus = 'unpaid';
    if (amountPaid >= rentDue) {
      rentStatus = 'paid';
    } else if (amountPaid > 0) {
      rentStatus = 'partial';
    }

    // Get electricity details for this tenant
    const elecReading = electricityReadings.find(r => r.tenantId === tenant.id);
    const electricityBill = elecReading ? elecReading.totalBill : 0;
    const electricityPaid = elecReading ? elecReading.paid : false;
    const electricityPending = electricityPaid ? 0 : electricityBill;

    // Combined billing
    const totalPendingAmount = rentBalance + electricityPending;
    
    // Status flag including both
    let status = rentStatus; // Default to rent status
    
    return {
      tenant,
      rentDue,
      amountPaid,
      balance: rentBalance,
      status, // rent status ('paid' | 'partial' | 'unpaid')
      payments: tenantPayments,
      // New Electricity details
      electricityBill,
      electricityPaid,
      electricityPending,
      totalPendingAmount,
      elecReadingId: elecReading ? elecReading.id : null
    };
  });
};

export const getMonthlySummary = (monthStr) => {
  const monthlyStatuses = getMonthlyStatus(monthStr);
  
  let rentCollected = 0;
  let rentPending = 0;
  let electricityCollected = 0;
  let electricityPending = 0;
  
  let paidCount = 0;
  
  monthlyStatuses.forEach(item => {
    rentCollected += item.amountPaid;
    rentPending += item.balance;
    
    if (item.electricityPaid) {
      electricityCollected += item.electricityBill;
    } else {
      electricityPending += item.electricityBill;
    }

    // Consider tenant fully "paid" overall if rent is paid AND electricity (if any) is paid
    const isRentPaid = item.status === 'paid';
    const isElectricityPaid = item.electricityBill === 0 || item.electricityPaid;
    
    if (isRentPaid && isElectricityPaid) {
      paidCount++;
    }
  });

  return {
    // Grand Totals (Rent + Electricity)
    totalCollected: rentCollected + electricityCollected,
    totalPending: rentPending + electricityPending,
    
    // Sub-totals
    rentCollected,
    rentPending,
    electricityCollected,
    electricityPending,
    
    // Counts
    totalTenantsCount: monthlyStatuses.length,
    paidTenantsCount: paidCount
  };
};

export const getRecentMonthsList = () => {
  const months = [];
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed
  
  for (let i = 0; i < 12; i++) {
    const d = new Date(currentYear, currentMonth - i, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    months.push(`${y}-${m}`);
  }
  
  return months;
};

export const getHindiMonthName = (monthStr) => {
  if (!monthStr) return '';
  const [year, month] = monthStr.split('-');
  const monthNames = {
    '01': 'January (जनवरी)',
    '02': 'February (फरवरी)',
    '03': 'March (मार्च)',
    '04': 'April (अप्रैल)',
    '05': 'May (मई)',
    '06': 'June (जून)',
    '07': 'July (जुलाई)',
    '08': 'August (अगस्त)',
    '09': 'September (सितंबर)',
    '10': 'October (अक्टूबर)',
    '11': 'November (नवंबर)',
    '12': 'December (दिसंबर)'
  };
  return `${monthNames[month] || month} ${year}`;
};

// End of storage api helper file. Preserves local offline state.
