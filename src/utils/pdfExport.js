import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Helper to get clean English month name
const getEnglishMonthName = (monthStr) => {
  if (!monthStr) return '';
  const [year, month] = monthStr.split('-');
  const monthNames = {
    '01': 'January',
    '02': 'February',
    '03': 'March',
    '04': 'April',
    '05': 'May',
    '06': 'June',
    '07': 'July',
    '08': 'August',
    '09': 'September',
    '10': 'October',
    '11': 'November',
    '12': 'December'
  };
  return `${monthNames[month] || month} ${year}`;
};

/**
 * Generates and downloads a PDF report for the selected month in English only
 * @param {string} monthStr - Format "YYYY-MM"
 * @param {Array} monthlyStatus - Array of tenant statuses from getMonthlyStatus
 * @param {Object} summary - Summary object from getMonthlySummary
 * @param {string} landlordNote - Custom note entered by the landlord
 */
export const exportMonthlyReportToPDF = (monthStr, monthlyStatus, summary, landlordNote = '') => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const monthLabel = getEnglishMonthName(monthStr);

  // Set Document Header Styling
  doc.setFillColor(249, 115, 22); // #F97316 (Saffron Orange)
  doc.rect(0, 0, 210, 35, 'F');

  // Title Text (English Only)
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('KIRAYA BANDHU', 15, 15);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text('Monthly Rent & Utility Report', 15, 22);
  doc.text(`Month: ${monthLabel}`, 15, 28);

  // Stats Card Section (English Only)
  doc.setTextColor(28, 25, 23); // #1C1917 (Near Black)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Summary:', 15, 47);

  // Draw background boxes for summary stats
  // Total Collected Box
  doc.setFillColor(240, 253, 244); // light green
  doc.setDrawColor(34, 197, 94); // success green
  doc.rect(15, 52, 55, 20, 'FD');
  doc.setTextColor(34, 197, 94);
  doc.setFontSize(9);
  doc.text('TOTAL COLLECTED', 18, 57);
  doc.setFontSize(14);
  doc.text(`Rs. ${summary.totalCollected}`, 18, 67);

  // Total Pending Box
  doc.setFillColor(254, 242, 242); // light red
  doc.setDrawColor(239, 68, 68); // pending red
  doc.rect(78, 52, 55, 20, 'FD');
  doc.setTextColor(239, 68, 68);
  doc.setFontSize(9);
  doc.text('TOTAL PENDING', 81, 57);
  doc.setFontSize(14);
  doc.text(`Rs. ${summary.totalPending}`, 81, 67);

  // Tenant Ratio Box
  doc.setFillColor(255, 247, 237); // light warm orange
  doc.setDrawColor(249, 115, 22); // orange
  doc.rect(140, 52, 55, 20, 'FD');
  doc.setTextColor(249, 115, 22);
  doc.setFontSize(9);
  doc.text('PAID RATIO', 143, 57);
  doc.setFontSize(14);
  doc.text(`${summary.paidTenantsCount} / ${summary.totalTenantsCount} Paid`, 143, 67);

  // Landlord Note Section
  let currentY = 82;
  if (landlordNote && landlordNote.trim()) {
    doc.setTextColor(28, 25, 23);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Landlord Note:', 15, currentY);
    
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(87, 80, 75);
    const splitNote = doc.splitTextToSize(landlordNote, 180);
    doc.text(splitNote, 15, currentY + 5);
    currentY += 10 + (splitNote.length * 4);
  }

  // Draw Table with Electricity columns (English Only)
  const headers = [['Tenant Name', 'Floor', 'Rent Due', 'Rent Paid', 'Electricity', 'Total Due', 'Status']];
  
  const tableData = monthlyStatus.map(item => {
    // Determine overall status
    let statusText = 'UNPAID';
    if (item.totalPendingAmount === 0) {
      statusText = 'PAID';
    } else if (item.amountPaid > 0 || (item.electricityBill > 0 && item.electricityPaid)) {
      statusText = 'PARTIAL';
    }

    const electricityText = item.electricityBill > 0
      ? `Rs. ${item.electricityBill} (${item.electricityPaid ? 'Paid' : 'Unpaid'})`
      : 'Rs. 0';

    return [
      item.tenant.name,
      item.tenant.room,
      `Rs. ${item.rentDue}`,
      `Rs. ${item.amountPaid}`,
      electricityText,
      `Rs. ${item.totalPendingAmount}`,
      statusText
    ];
  });

  // Calculate totals for footer
  const totalRentDue = monthlyStatus.reduce((sum, item) => sum + item.rentDue, 0);
  const totalRentPaid = monthlyStatus.reduce((sum, item) => sum + item.amountPaid, 0);
  const totalElectricityBill = monthlyStatus.reduce((sum, item) => sum + item.electricityBill, 0);
  const totalOutstandingDue = monthlyStatus.reduce((sum, item) => sum + item.totalPendingAmount, 0);

  const footers = [[
    'TOTAL',
    '',
    `Rs. ${totalRentDue}`,
    `Rs. ${totalRentPaid}`,
    `Rs. ${totalElectricityBill}`,
    `Rs. ${totalOutstandingDue}`,
    `${summary.paidTenantsCount} / ${summary.totalTenantsCount} Paid`
  ]];

  autoTable(doc, {
    startY: currentY + 5,
    head: headers,
    body: tableData,
    foot: footers,
    theme: 'striped',
    headStyles: {
      fillColor: [249, 115, 22], // Saffron orange
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    footStyles: {
      fillColor: [28, 25, 23], // dark
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 38 }, // Name
      1: { cellWidth: 15 }, // Floor
      2: { cellWidth: 24 }, // Rent Due
      3: { cellWidth: 24 }, // Rent Paid
      4: { cellWidth: 35 }, // Electricity
      5: { cellWidth: 24 }, // Total Due
      6: { cellWidth: 20 }  // Status
    },
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 2.5
    },
    didParseCell: function (data) {
      // Color status cells individually
      if (data.section === 'body' && data.column.index === 6) {
        const text = data.cell.text[0];
        if (text === 'PAID') {
          data.cell.styles.textColor = [34, 197, 94]; // success green
          data.cell.styles.fontStyle = 'bold';
        } else if (text === 'PARTIAL') {
          data.cell.styles.textColor = [249, 115, 22]; // partial orange
          data.cell.styles.fontStyle = 'bold';
        } else if (text === 'UNPAID') {
          data.cell.styles.textColor = [239, 68, 68]; // pending red
          data.cell.styles.fontStyle = 'bold';
        }
      }
    }
  });

  // Add footer note with timestamp
  const totalPages = doc.internal.pages.length - 1;
  const printedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(`Printed via Kiraya Bandhu at ${printedAt}`, 15, 287);
    doc.text(`Page ${i} of ${totalPages}`, 180, 287);
  }

  // Save the PDF
  const filename = `Kiraya_Report_${monthStr}.pdf`;
  doc.save(filename);
};
