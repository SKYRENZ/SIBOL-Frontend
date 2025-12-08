import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

/**
 * Reusable export functionality
 * Works with any table data
 */
export const useExport = () => {
  const exportToPDF = (
    title: string,
    headers: string[],
    rows: any[][],
    filename: string
  ) => {
    const doc = new jsPDF();
    doc.text(title, 14, 15);
    
    autoTable(doc, {
      startY: 20,
      head: [headers],
      body: rows,
    });

    doc.save(`${filename}.pdf`);
  };

  const exportToExcel = (
    data: Record<string, any>[],
    sheetName: string,
    filename: string
  ) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  return {
    exportToPDF,
    exportToExcel,
  };
};