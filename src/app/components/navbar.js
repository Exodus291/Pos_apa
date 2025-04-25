'use client';

import { useState } from 'react';
import { HamburgerMenuIcon, Cross1Icon } from '@radix-ui/react-icons';
import Link from 'next/link';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-lg font-bold text-gray-800">Emilia!</Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-black transition">Home</Link>
          <Link href="/menu" className="hover:text-black transition">Menu</Link>
          <Link href="/riwayat" className="hover:text-black transition">Riwayat</Link>
        </nav>

        {/* Mobile Menu Toggle */}
        <button onClick={toggleMenu} className="md:hidden text-gray-700">
          {isOpen ? <Cross1Icon className="w-5 h-5" /> : <HamburgerMenuIcon className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t px-4 py-2 text-sm text-gray-600 space-y-2">
          <Link href="/" className="block hover:text-black transition" onClick={toggleMenu}>Home</Link>
          <Link href="/menu" className="block hover:text-black transition" onClick={toggleMenu}>Menu</Link>
          <Link href="/riwayat" className="block hover:text-black transition" onClick={toggleMenu}>Riwayat</Link>
        </div>
      )}
    </header>
  );
}
