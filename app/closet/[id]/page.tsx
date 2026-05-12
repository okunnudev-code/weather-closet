'use client';

import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { HiArrowLeft } from 'react-icons/hi';
import BottomNav from '../../components/BottomNav';
import { getItems, updateItem, deleteItem, type ClosetItem } from '../../lib/closetStore';

export default function ClosetItemPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { userId } = useAuth();

  const [item, setItem] = useState<ClosetItem | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    getItems(userId).then(items => {
      const found = items.find(i => i.id === id) ?? null;
      setItem(found);
      setName(found?.name ?? '');
      setLoading(false);
    });
  }, [id, userId]);

  async function handleSaveName() {
    if (!item) return;
    await updateItem(item.id, name);
    setItem({ ...item, name });
    setEditing(false);
  }

  async function handleDelete() {
    if (!item || !confirm('Delete this item?')) return;
    await deleteItem(item.id);
    router.push('/closet');
  }

  if (loading) return <div style={{ padding: '3rem', color: '#aaa' }}>Loading…</div>;
  if (!item) return <div style={{ padding: '3rem' }}>Item not found.</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#fff', paddingBottom: '100px' }}>

      <div style={{ padding: '2rem 3rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <button onClick={() => router.back()} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-dark)', display: 'flex', alignItems: 'center',
          gap: '0.4rem', fontFamily: 'inherit', fontSize: '1rem', padding: 0,
        }}>
          <HiArrowLeft size={22} />
          Back
        </button>
        <div style={{ marginLeft: 'auto' }}>
          <Image src="/logo.png" alt="Weather Closet" width={48} height={56} />
        </div>
      </div>

      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '1rem 3rem 2rem', gap: '1.5rem',
      }}>

        <div style={{
          width: '320px', aspectRatio: '3/4', borderRadius: '16px',
          overflow: 'hidden', background: '#d9d9d9',
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        {editing ? (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
              style={{
                fontSize: '1.5rem', border: 'none',
                borderBottom: '2px solid var(--primary-teal)', outline: 'none',
                textAlign: 'center', fontFamily: 'inherit', background: 'transparent', width: '220px',
              }}
            />
            <button onClick={handleSaveName} style={{
              background: 'var(--primary-teal)', color: '#fff', border: 'none',
              borderRadius: '8px', padding: '0.4rem 1rem', fontFamily: 'inherit',
              cursor: 'pointer', fontSize: '0.9rem',
            }}>
              Save
            </button>
          </div>
        ) : (
          <p style={{ fontSize: '1.8rem', fontWeight: '500' }}>{item.name}</p>
        )}

        <div style={{ display: 'flex', gap: '5rem', marginTop: '0.5rem' }}>
          <button onClick={() => setEditing(true)} style={{
            background: 'none', border: 'none', fontSize: '1.3rem',
            fontFamily: 'inherit', cursor: 'pointer', color: 'var(--text-dark)',
          }}>
            edit
          </button>
          <button onClick={handleDelete} style={{
            background: 'none', border: 'none', fontSize: '1.3rem',
            fontFamily: 'inherit', cursor: 'pointer', color: '#e74c3c',
          }}>
            delete
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
