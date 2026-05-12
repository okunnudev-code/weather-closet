'use client';

import Image from 'next/image';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useClerk, useAuth } from '@clerk/nextjs';
import BottomNav from '../components/BottomNav';
import { getItems } from '../lib/closetStore';

export default function ProfilePage() {
  const router = useRouter();
  const { signOut } = useClerk();
  const { userId } = useAuth();

  const [weather, setWeather] = useState('');
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [clothesCount, setClothesCount] = useState<number | null>(null);
  const [estimatedCost, setEstimatedCost] = useState<string | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchWeather = useCallback(async () => {
    setLoadingWeather(true);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject)
      );
      const { latitude, longitude } = pos.coords;
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m`
      );
      const json = await res.json();
      const c = Math.round(json.current.temperature_2m);
      const f = Math.round((c * 9) / 5 + 32);
      setWeather(`${c}°C / ${f}°F`);
    } catch {
      setWeather('Unavailable');
    } finally {
      setLoadingWeather(false);
    }
  }, []);

  useEffect(() => { fetchWeather(); }, [fetchWeather]);

  useEffect(() => {
    if (!userId) return;

    async function loadStats() {
      setLoadingStats(true);
      try {
        const items = await getItems(userId!);
        setClothesCount(items.length);

        if (items.length === 0) {
          setEstimatedCost('£0');
          setLoadingStats(false);
          return;
        }

        // Use cached cost if item count hasn't changed
        const cached = localStorage.getItem('wc_wardrobe_cost');
        const cachedCount = localStorage.getItem('wc_wardrobe_count');
        if (cached && cachedCount && parseInt(cachedCount) === items.length) {
          setEstimatedCost(cached);
          setLoadingStats(false);
          return;
        }

        const res = await fetch('/api/estimate-wardrobe-cost', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: items.map(i => ({ id: i.id, name: i.name })) }),
        });
        const json = await res.json();
        const costStr = `£${json.totalCost.toLocaleString()}`;
        setEstimatedCost(costStr);
        localStorage.setItem('wc_wardrobe_cost', costStr);
        localStorage.setItem('wc_wardrobe_count', String(items.length));
      } catch {
        setEstimatedCost('—');
      } finally {
        setLoadingStats(false);
      }
    }

    loadStats();
  }, [userId]);

  function handleSignOut() {
    signOut({ redirectUrl: '/' });
  }

  async function handleDeleteAccount() {
    if (!confirm('Are you sure you want to delete your account? This will remove all your clothes and cannot be undone.')) return;
    try {
      const res = await fetch('/api/delete-account', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      await signOut({ redirectUrl: '/' });
    } catch {
      alert('Something went wrong. Please try again.');
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', paddingBottom: '100px' }}>

      {/* Header */}
      <div style={{ padding: '2rem 3rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <Image src="/logo.png" alt="Weather Closet" width={56} height={64} priority />
        <h1 style={{ fontSize: '2rem', fontWeight: '700', letterSpacing: '0.05em' }}>PROFILE</h1>
      </div>

      {/* Content */}
      <div className="profile-grid" style={{ padding: '0 3rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>

        {/* Left — stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          <div>
            <p style={{ marginBottom: '0.6rem', fontSize: '1.1rem' }}>Weather Today</p>
            <div style={statCard}>
              <span style={statValue}>{loadingWeather ? '…' : weather}</span>
            </div>
          </div>

          <div>
            <p style={{ marginBottom: '0.6rem', fontSize: '1.1rem' }}>Clothes Owned</p>
            <div style={statCard}>
              <span style={statValue}>
                {loadingStats ? '…' : clothesCount ?? 0}
              </span>
            </div>
          </div>

          <div>
            <p style={{ marginBottom: '0.6rem', fontSize: '1.1rem' }}>Estimated Cost</p>
            <div style={statCard}>
              <span style={statValue}>
                {loadingStats ? '…' : estimatedCost ?? '—'}
              </span>
            </div>
          </div>

        </div>

        {/* Right — actions */}
        <div className="profile-actions" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingTop: '6rem', maxWidth: '360px', marginLeft: 'auto' }}>
          <button onClick={handleSignOut} style={signOutBtn}>Sign Out</button>
          <button onClick={handleDeleteAccount} style={deleteBtn}>Delete Account</button>
        </div>

      </div>

      <BottomNav />
    </div>
  );
}

const statCard: React.CSSProperties = {
  background: 'var(--bg-beige)',
  borderRadius: '12px',
  padding: '1.5rem 2rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const statValue: React.CSSProperties = {
  fontSize: '1.6rem',
  fontWeight: '400',
};

const signOutBtn: React.CSSProperties = {
  background: 'var(--primary-teal)',
  color: '#fff',
  border: 'none',
  borderRadius: '14px',
  padding: '1.5rem 2rem',
  fontSize: '1.4rem',
  fontWeight: '500',
  fontFamily: 'inherit',
  cursor: 'pointer',
  width: '100%',
};

const deleteBtn: React.CSSProperties = {
  background: '#e53935',
  color: '#fff',
  border: 'none',
  borderRadius: '14px',
  padding: '1.5rem 2rem',
  fontSize: '1.4rem',
  fontWeight: '500',
  fontFamily: 'inherit',
  cursor: 'pointer',
  width: '100%',
};
