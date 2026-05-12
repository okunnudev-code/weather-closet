'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import BottomNav from '../components/BottomNav';
import { getItems, type ClosetItem } from '../lib/closetStore';

export default function ClosetPage() {
  const { userId } = useAuth();
  const [items, setItems] = useState<ClosetItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    getItems(userId)
      .then(data => setItems(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <div style={{ minHeight: '100vh', background: '#fff', paddingBottom: '100px' }}>

      <div style={{ padding: '2rem 3rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <Image src="/logo.png" alt="Weather Closet" width={56} height={64} priority />
        <h1 style={{ fontSize: '2rem', fontWeight: '700', letterSpacing: '0.05em' }}>CLOSET</h1>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', color: '#aaa', marginTop: '4rem' }}>Loading…</div>
      )}

      {!loading && items.length === 0 && (
        <div style={{ textAlign: 'center', color: '#aaa', marginTop: '4rem', fontSize: '1rem' }}>
          No items yet. Tap + to add your first piece.
        </div>
      )}

      {!loading && items.length > 0 && (
        <div style={{
          padding: '0 3rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.25rem',
        }}>
          {items.map((item) => (
            <Link key={item.id} href={`/closet/${item.id}`} style={{ textDecoration: 'none' }}>
              <div style={{
                aspectRatio: '3/4', background: '#d9d9d9',
                borderRadius: '12px', overflow: 'hidden',
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#555', marginTop: '0.4rem', fontFamily: 'inherit' }}>
                {item.name}
              </p>
            </Link>
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
