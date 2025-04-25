// File: calculator.js
'use client';

import { useEffect, useState, useContext, useCallback } from 'react';
import { evaluate } from 'mathjs';
import { ThemeContext } from './ThemeProvider';

export default function Calculator({ onSave, getNextCustomerName, value = '', onChange }) {
  const [name, setName] = useState('');
  const [history, setHistory] = useState([]);
  const { isDark } = useContext(ThemeContext);

  const handleSave = () => {
    if (!value || value === 'Error') return alert('Hasil tidak boleh kosong atau error!');

    let finalValue;
    try {
      finalValue = evaluate(value).toString();
    } catch {
      return alert('Ekspresi tidak valid');
    }

    const finalName = name || getNextCustomerName();
    const now = new Date();
    const timestamp = now.toLocaleTimeString('id-ID');

    onSave({ name: finalName, total: finalValue, time: timestamp });
    setHistory((prev) => [...prev.slice(-4), { expression: value, result: finalValue, time: timestamp }]);
    setName('');
    onChange('');
  };

  const handleClick = useCallback((val) => {
    const safeValue = value || '';
    const lastChar = safeValue.slice(-1);
    const isOperator = ['+', '-', '*', '/'].includes(val);

    if (val === '=') {
      try {
        const result = evaluate(safeValue).toString();
        onChange(result);
      } catch {
        onChange('Error');
      }
      return;
    }

    if (val === 'C') return onChange('');
    if (val === '←') return onChange((prev) => (prev || '').slice(0, -1));

    if (safeValue === '') {
      if (['+', '*', '/', '='].includes(val)) return;
      if (val === '-') return onChange('-');
      if (val === '.') return onChange('0.');
      return onChange(val);
    }


    if (val === '.') {
      const currentNumber = safeValue.split(/[+\-*/]/).pop();
      if (currentNumber.includes('.')) return;
    }

    if (isOperator && ['+', '-', '*', '/'].includes(lastChar)) {
      if (val === '-' && lastChar !== '-') return onChange((prev) => prev + '-');
      return onChange((prev) => prev.slice(0, -1) + val);
    }

    // ✅ Fallback: tambahkan angka atau simbol lain
    onChange((prev) => prev + val);
  }, [value, onChange]);

  const applyDiscount = (percent) => {
    try {
      const current = evaluate(value || '0');
      const discounted = (current - current * (percent / 100)).toFixed(2);
      onChange(discounted);
    } catch {
      alert('Tidak bisa aplikasikan diskon');
    }
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      const keyMap = { Enter: '=', Escape: 'C', Backspace: '←', ',': '.' };
      const key = keyMap[e.key] || e.key;
      if (buttons.includes(key)) handleClick(key);
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleClick]);

  const buttons = [
    '7', '8', '9', '+',
    '4', '5', '6', '-',
    '1', '2', '3', '*',
    '0', '.', '=', '/',
    '00', '000', '←', 'C'
  ];

  return (
    <div className={`w-full p-4 border rounded shadow space-y-2 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
      <input
        type="text"
        placeholder="Nama"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-2 border rounded text-sm"
      />
      <input
        type="text"
        value={value}
        className="w-full p-2 border rounded text-right font-mono text-lg"
        readOnly
      />

      <div className="grid grid-cols-4 gap-2">
        {buttons.map((btn) => (
          <button
            key={btn}
            onClick={() => handleClick(btn)}
            className={`p-2 rounded text-sm font-medium ${
              ['+', '-', '*', '/'].includes(btn)
                ? 'bg-orange-300 hover:bg-orange-400'
                : ['←', 'C'].includes(btn)
                ? 'bg-red-200 hover:bg-red-300'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {btn}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 mt-2">
        {[10, 20, 30].map((pct) => (
          <button
            key={pct}
            onClick={() => applyDiscount(pct)}
            className="bg-purple-200 hover:bg-purple-300 p-1 rounded text-xs"
          >
            Diskon {pct}%
          </button>
        ))}
      </div>

      <div className={`mt-2 p-2 border rounded max-h-32 overflow-y-auto ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        {history.map((entry, i) => (
          <div key={i} className="text-xs">
            <div className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              {entry.expression} = {entry.result}
            </div>
            <div className={`text-xxs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {entry.time}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between gap-2 mt-2">
        <button
          onClick={handleSave}
          className="flex-1 bg-green-300 hover:bg-green-400 rounded p-1"
        >
          Simpan
        </button>
      </div>
    </div>
  );
}
