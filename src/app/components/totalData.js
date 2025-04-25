'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ThemeContext } from '@/context/ThemeContext';
import Calculator from './calculator';

export default function TotalData() {
  const [transactions, setTransactions] = useState([]);
  const [now] = useState(new Date());
  const [menuList, setMenuList] = useState([]);
  const [calculatorValue, setCalculatorValue] = useState('');

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:3001/products');
      const result = await response.json();
      setMenuList(result);
    } catch (error) {
      console.error('Gagal mengambil produk:', error);
    }
  };

  // Load saved data saat halaman dimuat
  useEffect(() => {
    fetchProducts();

    const savedTransactions = localStorage.getItem('tempTransactions');
    const savedCalculatorValue = localStorage.getItem('tempCalculatorValue');

    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }

    if (savedCalculatorValue) {
      setCalculatorValue(savedCalculatorValue);
    }
  }, []);

  // Simpan data sementara setiap kali berubah
  useEffect(() => {
    localStorage.setItem('tempTransactions', JSON.stringify(transactions));
    localStorage.setItem('tempCalculatorValue', calculatorValue);
  }, [transactions, calculatorValue]);

  const addPriceToCalculator = useCallback((price) => {
    setCalculatorValue((prev) => {
      const val = prev || '';
      if (val === '' || val === '0') return price.toString();
      return val + '+' + price;
    });
  }, []);

  // Saat menu ditekan, hanya tambahkan harga ke kalkulator
  const handleSelectMenu = useCallback((menuItem) => {
    if (menuItem.stock <= 0) return;
    addPriceToCalculator(menuItem.price);
     // Reduce the stock of the selected menu item
     setMenuList((prevMenuList) =>
      prevMenuList.map((item) =>
        item.id === menuItem.id ? { ...item, stock: item.stock - 1 } : item
      )
    );
  }, [addPriceToCalculator]);

  const handleSaveFromCalculator = (entry) => {
    const fixedEntry = {
      ...entry,
      total: Number(entry.total),
    };
    setTransactions((prev) => [...prev, fixedEntry]);
    setCalculatorValue('');
  };

  const handleEndShift = useCallback(() => {
    if (transactions.length === 0) return alert('Tidak ada data untuk disimpan.');

    const existingShifts = JSON.parse(localStorage.getItem('shifts') || '[]');

    localStorage.setItem(
      'shifts',
      JSON.stringify([...existingShifts, {
        date: new Date().toLocaleString('id-ID'),
        data: transactions
      }])
    );

    setTransactions([]);
    setCalculatorValue('');
    localStorage.removeItem('tempTransactions');
    localStorage.removeItem('tempCalculatorValue');
    fetchProducts();
    alert('Shift berhasil disimpan!');
  }, [transactions]);

  const getTotalPendapatan = useCallback(() => {
    return transactions.reduce((sum, item) => sum + Number(item.total || 0), 0);
  }, [transactions]);

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
        <div className="space-y-4 lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg p-4 transition-all hover:shadow-xl">
            <div className="text-sm text-gray-600">
              {now.toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </div>
            <div className="mt-4">
              <h2 className="text-lg font-semibold text-gray-800">Pendapatan Hari Ini</h2>
              <p className="text-2xl font-bold text-green-600">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                }).format(getTotalPendapatan())}
              </p>
            </div>
            <div className="mt-2">
              <h3 className="text-gray-600">Total Pelanggan</h3>
              <p className="text-xl font-semibold text-blue-600">{transactions.length}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-4">
            <h2 className="font-semibold text-lg text-gray-800 mb-3">Menu</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto">
              {menuList.map((menu) => (
                <button
                  key={menu.id}
                  onClick={() => handleSelectMenu(menu)}
                  disabled={menu.stock <= 0}
                  className={`p-3 rounded-lg text-left transition-all
                    ${menu.stock > 0 
                      ? 'bg-white shadow hover:shadow-md hover:scale-105 transform' 
                      : 'bg-gray-100 cursor-not-allowed opacity-60'
                    }`}
                >
                  <div className="font-medium text-gray-800">{menu.name}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                    }).format(menu.price)}
                  </div>
                  <div className={`text-xs mt-1 ${menu.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    Stok: {menu.stock}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <Calculator
              value={calculatorValue}
              onChange={setCalculatorValue}
              onSave={handleSaveFromCalculator}
              getNextCustomerName={() => `Pelanggan ${transactions.length + 1}`}
            />
            <button
              onClick={handleEndShift}
              className="w-full mt-4 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg
                transition-colors duration-200 font-medium focus:outline-none focus:ring-2 
                focus:ring-red-500 focus:ring-opacity-50"
            >
              End Shift
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
