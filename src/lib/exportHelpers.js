import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToExcel = (shifts) => {
  const allData = shifts.flatMap((shift, idx) =>
    shift.data.map((item, i) => ({
      Shift: `Shift ${idx + 1}`,
      Tanggal: shift.date,
      No: i + 1,
      Nama: item.name,
      Total: item.total,
      Waktu: item.time,
    }))
  );

  const worksheet = XLSX.utils.json_to_sheet(allData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'DataShift');
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(blob, 'data-shift.xlsx');
};

export const exportToPDF = (shifts) => {
  const doc = new jsPDF();
  doc.text('Data Penjualan Shift', 14, 10);

  shifts.forEach((shift, idx) => {
    const tableData = shift.data.map((item, i) => [
      i + 1,
      item.name,
      item.total,
      item.time,
    ]);

    autoTable(doc, {
      startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 20,
      head: [[`Shift ${idx + 1} - ${shift.date}`]],
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 2,
      head: [['No', 'Nama', 'Total', 'Waktu']],
      body: tableData,
    });
  });

  doc.save('data-shift.pdf');
};
