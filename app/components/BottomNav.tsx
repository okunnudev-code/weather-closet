'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HiHome, HiUser, HiPlus } from 'react-icons/hi';
import { MdCheckroom } from 'react-icons/md';

export default function BottomNav() {
  const path = usePathname();

  const active = (href: string) =>
    path === href ? 'var(--primary-teal)' : 'var(--text-muted)';

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: '#fff',
      borderTop: '1px solid var(--border-light)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      padding: '1rem 2rem 1.5rem',
      zIndex: 100,
    }}>
      <Link href="/home" style={{ color: active('/home'), textDecoration: 'none' }}>
        <HiHome size={28} />
      </Link>
      <Link href="/closet" style={{ color: active('/closet'), textDecoration: 'none' }}>
        <MdCheckroom size={28} />
      </Link>
      <Link href="/add" style={{
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        background: 'var(--primary-teal)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '-28px',
        boxShadow: '0 4px 16px rgba(85,133,133,0.4)',
        textDecoration: 'none',
      }}>
        <HiPlus size={28} color="#fff" />
      </Link>
      <Link href="/profile" style={{ color: active('/profile'), textDecoration: 'none' }}>
        <HiUser size={28} />
      </Link>
    </nav>
  );
}
