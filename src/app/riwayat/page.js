'use client';

import { useEffect, useState, useMemo } from 'react';
import { exportToExcel, exportToPDF } from '@/lib/exportHelpers';
import { Chart } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Riwayat() {
  const [shifts, setShifts] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const [groupBy, setGroupBy] = useState('bulanan');
  const [visibleDetails, setVisibleDetails] = useState({});

  useEffect(() => {
    const savedShifts = JSON.parse(localStorage.getItem('shifts') || '[]');
    const sortedShifts = savedShifts.sort((a, b) => {
      const dateA = new Date(parseCustomDate(a.date)).getTime();
      const dateB = new Date(parseCustomDate(b.date)).getTime();
      return dateB - dateA;
    });
    setShifts(sortedShifts);
  }, []);

  const toggleDetails = (shiftIdx, itemIdx) => {
    const key = `${shiftIdx}-${itemIdx}`;
    setVisibleDetails((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDeleteAll = () => {
    const confirm = window.confirm('Hapus semua data shift?');
    if (confirm) {
      localStorage.removeItem('shifts');
      setShifts([]);
    }
  };

  const handleDeleteShift = (index) => {
    const confirm = window.confirm(`Hapus shift ke-${index + 1}?`);
    if (confirm) {
      const updatedShifts = [...shifts];
      updatedShifts.splice(index, 1);
      localStorage.setItem('shifts', JSON.stringify(updatedShifts));
      setShifts(updatedShifts);
    }
  };

  const handleDeleteTransaction = (shiftIdx, itemIdx) => {
    const confirmDelete = window.confirm(`Hapus transaksi ke-${itemIdx + 1} dari shift ke-${shiftIdx + 1}?`);
    if (confirmDelete) {
      const updatedShifts = [...shifts];
      updatedShifts[shiftIdx].data.splice(itemIdx, 1);
      localStorage.setItem('shifts', JSON.stringify(updatedShifts));
      setShifts(updatedShifts);
    }
  };

  const handleEditTransaction = (shiftIdx, itemIdx) => {
    const updatedShifts = [...shifts];
    const item = updatedShifts[shiftIdx].data[itemIdx];

    const newName = prompt('Masukkan nama baru:', item.name);
    const newTotal = prompt('Masukkan total baru:', item.total);

    if (newName !== null && newTotal !== null) {
      item.name = newName;
      item.total = parseValidNumber(newTotal);
      localStorage.setItem('shifts', JSON.stringify(updatedShifts));
      setShifts(updatedShifts);
    }
  };

  const parseCustomDate = (str) => {
    const [day, month, year] = str.split(/[\/,-\s]+/);
    if (!day || !month || !year) return null;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  const groupShifts = (shifts) => {
    const groupedData = {};
    shifts.forEach((shift) => {
      const parsedDate = parseCustomDate(shift.date);
      const date = new Date(parsedDate);
      if (isNaN(date.getTime())) return;

      let key = '';
      if (groupBy === 'harian') {
        key = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
      } else if (groupBy === 'bulanan') {
        key = `${date.getMonth() + 1}-${date.getFullYear()}`;
      } else if (groupBy === 'mingguan') {
        const weekNumber = Math.ceil(date.getDate() / 7);
        key = `Week ${weekNumber}-${date.getFullYear()}`;
      }

      if (!groupedData[key]) groupedData[key] = [];
      groupedData[key].push(shift);
    });
    return groupedData;
  };

  const parseValidNumber = (value) => {
    if (!value) return 0;
    const cleaned = String(value).replace(/[^\d.-]/g, '');
    const number = Number(cleaned);
    return isNaN(number) ? 0 : number;
  };

  const sumShiftData = (data) => {
    return data.reduce((sum, item) => sum + parseValidNumber(item.total), 0);
  };

  const getRekapData = () => {
    const grouped = groupShifts(filteredShifts);
    return Object.entries(grouped).map(([label, shiftList]) => {
      const total = shiftList.reduce((sum, shift) => sum + sumShiftData(shift.data), 0);
      return { label, total };
    });
  };

  const filteredShifts = useMemo(() => {
    if (!filterDate) return shifts;
    return shifts.filter((shift) => parseCustomDate(shift.date) === filterDate);
  }, [shifts, filterDate]);

  const rekapData = useMemo(() => getRekapData(), [filteredShifts, groupBy]);
  const labels = useMemo(() => rekapData.map((d) => d.label), [rekapData]);
  const dataValues = useMemo(() => rekapData.map((d) => d.total), [rekapData]);

  const chartData = useMemo(() => ({
    labels,
    datasets: [
      {
        label: 'Pendapatan',
        data: dataValues,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  }), [labels, dataValues]);

  const options = useMemo(() => ({
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: Math.max(...dataValues, 1000) * 1.2,
        ticks: {
          callback: (value) =>
            new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
            }).format(value),
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) =>
            new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
            }).format(context.raw),
        },
      },
    },
  }), [dataValues]);

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Riwayat Penjualan</h1>
            <div className="flex gap-2 items-center">
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="border px-3 py-1 rounded text-sm"
              />
              {filterDate && (
                <button
                  onClick={() => setFilterDate('')}
                  className="text-sm text-gray-500 underline"
                >
                  Reset
                </button>
              )}
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                className="border px-3 py-1 rounded text-sm"
              >
                <option value="harian">Harian</option>
                <option value="mingguan">Mingguan</option>
                <option value="bulanan">Bulanan</option>
              </select>
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-3">
            Total Shift: {filteredShifts.length} • Total Pendapatan:{' '}
            {new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
            }).format(filteredShifts.reduce((acc, s) => acc + sumShiftData(s.data), 0))}
          </p>

          <Chart type="bar" data={chartData} options={options} />
        </div>

        {filteredShifts.length === 0 ? (
          <p className="text-gray-600 text-center">Belum ada data shift disimpan.</p>
        ) : (
          filteredShifts.map((shift, idx) => (
            <div key={idx} className="rounded-lg border border-gray-200 shadow-sm bg-white overflow-hidden">
              <div className="px-4 py-3 border-b font-medium text-gray-700 bg-gray-50 flex justify-between items-center">
                <span>Shift ke-{idx + 1} • Tanggal: {shift.date}</span>
                <button
                  onClick={() => handleDeleteShift(idx)}
                  className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Hapus Shift
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-gray-700">
                  <thead className="bg-gray-100 text-left">
                    <tr>
                      <th className="px-4 py-2 border">No</th>
                      <th className="px-4 py-2 border">Nama</th>
                      <th className="px-4 py-2 border">Total</th>
                      <th className="px-4 py-2 border">Detail Transaksi</th>
                      <th className="px-4 py-2 border">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shift.data.map((item, index) => {
                      const key = `${idx}-${index}`;
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-2 border text-center">{index + 1}</td>
                          <td className="px-4 py-2 border">{item.name}</td>
                          <td className="px-4 py-2 border">
                            {new Intl.NumberFormat('id-ID', {
                              style: 'currency',
                              currency: 'IDR',
                              minimumFractionDigits: 0,
                            }).format(item.total)}
                          </td>
                          <td className="px-4 py-2 border">
                            <button
                              onClick={() => toggleDetails(idx, index)}
                              className="text-sm text-blue-600 hover:underline"
                            >
                              {visibleDetails[key] ? 'Sembunyikan' : 'Lihat'}
                            </button>
                            {visibleDetails[key] && (
                              <div className="text-xs text-gray-500 mt-1">Waktu: {item.time}</div>
                            )}
                          </td>
                          <td className="px-4 py-2 border text-sm space-x-2">
                            <button
                              onClick={() => handleEditTransaction(idx, index)}
                              className="text-yellow-600 hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteTransaction(idx, index)}
                              className="text-red-600 hover:underline"
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-2 p-3 bg-gray-50 text-sm">
                <button
                  onClick={() => exportToExcel([shift])}
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                >
                  Excel
                </button>
                <button
                  onClick={() => exportToPDF([shift])}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  PDF
                </button>
              </div>
            </div>
          ))
        )}

        {filteredShifts.length > 0 && (
          <div className="text-right">
            <button
              onClick={handleDeleteAll}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
            >
              Hapus Semua Shift
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
