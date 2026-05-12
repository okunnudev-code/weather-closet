'use client';

import Image from 'next/image';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import BottomNav from '../components/BottomNav';
import { getItems, markRecommended, sortForRecommendation, type ClosetItem } from '../lib/closetStore';
import {
  WiDaySunny, WiCloudy, WiDayCloudy, WiRain, WiShowers,
  WiSnow, WiThunderstorm, WiFog, WiWindy,
} from 'react-icons/wi';

interface WeatherData {
  city: string;
  tempC: number;
  tempF: number;
  date: string;
  code: number;
  windSpeed: number;
  condition: string;
}

interface OutfitResult {
  items: ClosetItem[];
  explanation: string;
}

const CACHE_KEY = 'wc_outfits_v3';

function WeatherIcon({ code, windSpeed }: { code: number; windSpeed: number }) {
  const size = 48;
  const color = 'var(--primary-teal)';
  if (windSpeed > 30) return <WiWindy size={size} color={color} />;
  if (code === 0) return <WiDaySunny size={size} color="#f4c430" />;
  if (code <= 2) return <WiDayCloudy size={size} color={color} />;
  if (code === 3) return <WiCloudy size={size} color={color} />;
  if (code <= 48) return <WiFog size={size} color={color} />;
  if (code <= 55) return <WiShowers size={size} color={color} />;
  if (code <= 67) return <WiRain size={size} color={color} />;
  if (code <= 77) return <WiSnow size={size} color="#89c4e1" />;
  if (code <= 82) return <WiShowers size={size} color={color} />;
  if (code <= 86) return <WiSnow size={size} color="#89c4e1" />;
  return <WiThunderstorm size={size} color={color} />;
}

function weatherLabel(code: number, windSpeed: number): string {
  if (windSpeed > 30) return 'Windy';
  if (code === 0) return 'Sunny';
  if (code <= 2) return 'Partly Cloudy';
  if (code === 3) return 'Overcast';
  if (code <= 48) return 'Foggy';
  if (code <= 55) return 'Drizzle';
  if (code <= 67) return 'Rainy';
  if (code <= 77) return 'Snowy';
  if (code <= 82) return 'Showers';
  if (code <= 86) return 'Snow Showers';
  return 'Thunderstorm';
}

async function callRecommendAPI(
  weather: { temp: number; condition: string; windSpeed: number },
  items: { id: string; name: string }[],
  excludeIds: string[] = [],
): Promise<{ recommendedIds: string[]; explanation: string }> {
  const res = await fetch('/api/recommend-outfit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ weather, items, excludeIds }),
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export default function HomePage() {
  const { userId } = useAuth();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [tomorrowWeather, setTomorrowWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState('');

  const [todayOutfit, setTodayOutfit] = useState<OutfitResult | null>(null);
  const [tomorrowOutfit, setTomorrowOutfit] = useState<OutfitResult | null>(null);
  const [outfitLoading, setOutfitLoading] = useState(false);
  const [outfitError, setOutfitError] = useState(false);
  const [hasClosetItems, setHasClosetItems] = useState(true);
  const outfitFetchedRef = useRef(false);

  const fetchWeather = useCallback(async () => {
    setWeatherLoading(true);
    setWeatherError('');
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject)
      );
      const { latitude, longitude } = pos.coords;

      const [weatherRes, geoRes] = await Promise.all([
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,weather_code,wind_speed_10m_max&forecast_days=2&timezone=auto`),
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`),
      ]);

      const weatherJson = await weatherRes.json();
      const geoJson = await geoRes.json();

      const city =
        geoJson.address?.city || geoJson.address?.town ||
        geoJson.address?.village || geoJson.address?.county || 'Unknown';

      // Today
      const tempC = Math.round(weatherJson.current.temperature_2m);
      const tempF = Math.round((tempC * 9) / 5 + 32);
      const code = weatherJson.current.weather_code;
      const windSpeed = weatherJson.current.wind_speed_10m;
      const date = new Date().toLocaleDateString('en-GB').replace(/\//g, '/');
      setWeather({ city, tempC, tempF, date, code, windSpeed, condition: weatherLabel(code, windSpeed) });

      // Tomorrow (from daily forecast index 1)
      const tmrTempC = Math.round(weatherJson.daily.temperature_2m_max[1]);
      const tmrTempF = Math.round((tmrTempC * 9) / 5 + 32);
      const tmrCode = weatherJson.daily.weather_code[1];
      const tmrWind = weatherJson.daily.wind_speed_10m_max[1];
      const tmrDate = new Date(Date.now() + 86400000).toLocaleDateString('en-GB').replace(/\//g, '/');
      setTomorrowWeather({ city, tempC: tmrTempC, tempF: tmrTempF, date: tmrDate, code: tmrCode, windSpeed: tmrWind, condition: weatherLabel(tmrCode, tmrWind) });

    } catch {
      setWeatherError('Could not fetch weather. Allow location access and try again.');
    } finally {
      setWeatherLoading(false);
    }
  }, []);

  const fetchRecommendations = useCallback(async (
    todayW: WeatherData,
    tomorrowW: WeatherData,
  ) => {
    if (!userId) return;
    setOutfitLoading(true);
    setOutfitError(false);
    try {
      const allItems = await getItems(userId);
      if (allItems.length === 0) {
        setHasClosetItems(false);
        setOutfitLoading(false);
        return;
      }
      setHasClosetItems(true);
      const pool = sortForRecommendation(allItems);
      const itemsPayload = pool.map(i => ({ id: i.id, name: i.name }));

      const todayJson = await callRecommendAPI(
        { temp: todayW.tempC, condition: todayW.condition, windSpeed: todayW.windSpeed },
        itemsPayload,
      );
      const tomorrowJson = await callRecommendAPI(
        { temp: tomorrowW.tempC, condition: tomorrowW.condition, windSpeed: tomorrowW.windSpeed },
        itemsPayload,
        todayJson.recommendedIds ?? [],
      );

      const todayMatched = (todayJson.recommendedIds ?? [])
        .map(id => allItems.find(i => i.id === id)).filter(Boolean) as ClosetItem[];
      const tomorrowMatched = (tomorrowJson.recommendedIds ?? [])
        .map(id => allItems.find(i => i.id === id)).filter(Boolean) as ClosetItem[];

      const today: OutfitResult = { items: todayMatched, explanation: todayJson.explanation ?? '' };
      const tomorrow: OutfitResult = { items: tomorrowMatched, explanation: tomorrowJson.explanation ?? '' };

      setTodayOutfit(today);
      setTomorrowOutfit(tomorrow);

      const dateKey = new Date().toLocaleDateString('en-GB');
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ date: dateKey, today, tomorrow }));

      await markRecommended([...todayJson.recommendedIds ?? [], ...tomorrowJson.recommendedIds ?? []]);
    } catch (err) {
      console.error(err);
      setOutfitError(true);
    } finally {
      setOutfitLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchWeather(); }, [fetchWeather]);

  useEffect(() => {
    if (!weather || !tomorrowWeather || !userId || outfitFetchedRef.current) return;
    outfitFetchedRef.current = true;

    const dateKey = new Date().toLocaleDateString('en-GB');
    try {
      const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) ?? '');
      if (cached?.date === dateKey) {
        setTodayOutfit(cached.today);
        setTomorrowOutfit(cached.tomorrow);
        setHasClosetItems(true);
        return;
      }
    } catch { /* no cache */ }

    fetchRecommendations(weather, tomorrowWeather);
  }, [weather, tomorrowWeather, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  function OutfitCard({ label, outfit, onRefresh }: {
    label: string;
    outfit: OutfitResult | null;
    onRefresh?: () => void;
  }) {
    return (
      <div style={{ background: 'var(--bg-beige)', borderRadius: '12px', padding: '1.5rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <p style={{ fontSize: '1.1rem', margin: 0 }}>{label}</p>
          {onRefresh && !outfitLoading && hasClosetItems && (
            <button onClick={onRefresh} style={{
              background: 'none', border: 'none', fontSize: '0.9rem',
              color: 'var(--primary-teal)', cursor: 'pointer', fontFamily: 'inherit',
            }}>Refresh</button>
          )}
        </div>

        {outfitLoading && (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', padding: '1rem 0' }}>Finding outfit…</div>
        )}
        {!outfitLoading && outfitError && (
          <div style={{ color: '#c0392b', fontSize: '0.9rem', padding: '0.5rem 0' }}>
            Could not load outfit — AI rate limit reached. Try again in a minute.
          </div>
        )}
        {!outfitLoading && !outfitError && !hasClosetItems && (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', padding: '1rem 0' }}>
            Add clothes to your closet to get outfit recommendations.
          </div>
        )}
        {!outfitLoading && hasClosetItems && outfit && outfit.items.length > 0 && (
          <>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {outfit.items.map((item, i) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '80px', aspectRatio: '3/4', borderRadius: '8px', overflow: 'hidden', background: '#d9d9d9' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  {i < outfit.items.length - 1 && (
                    <span style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>+</span>
                  )}
                </div>
              ))}
            </div>
            {outfit.explanation && (
              <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {outfit.explanation}
              </p>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', paddingBottom: '100px' }}>

      <div style={{ padding: '2rem 3rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <Image src="/logo.png" alt="Weather Closet" width={56} height={64} priority />
        <h1 style={{ fontSize: '2rem', fontWeight: '700', letterSpacing: '0.05em' }}>HOME</h1>
      </div>

      <div style={{ padding: '0 3rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Weather card */}
        <div style={{
          background: 'var(--bg-beige)', borderRadius: '12px', padding: '2rem 2.5rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', minHeight: '120px',
        }}>
          {weatherLoading ? (
            <span style={{ color: 'var(--text-muted)' }}>Getting your location…</span>
          ) : weatherError ? (
            <span style={{ color: '#c0392b', fontSize: '0.95rem' }}>{weatherError}</span>
          ) : weather ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              <WeatherIcon code={weather.code} windSpeed={weather.windSpeed} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <span style={{ fontSize: '1.6rem', fontWeight: '400' }}>{weather.city}</span>
                <span style={{ fontSize: '1.6rem', fontWeight: '400' }}>{weather.date}</span>
                <span style={{ fontSize: '1.6rem', fontWeight: '400' }}>
                  {weather.tempC}°C / {weather.tempF}°F &nbsp;·&nbsp; {weather.condition}
                </span>
              </div>
            </div>
          ) : null}
          <button onClick={fetchWeather} disabled={weatherLoading} style={{
            background: 'none', border: 'none', fontSize: '1rem',
            color: weatherLoading ? 'var(--text-muted)' : 'var(--text-dark)',
            cursor: weatherLoading ? 'default' : 'pointer', fontFamily: 'inherit', padding: '0.25rem 0',
          }}>
            {weatherLoading ? '…' : 'Refresh'}
          </button>
        </div>

        {/* Today's outfit */}
        <OutfitCard
          label="Today's Outfit"
          outfit={todayOutfit}
          onRefresh={weather && tomorrowWeather ? () => fetchRecommendations(weather, tomorrowWeather) : undefined}
        />

        {/* Tomorrow's outfit */}
        <OutfitCard
          label={`Tomorrow's Outfit${tomorrowWeather ? ` · ${tomorrowWeather.condition} ${tomorrowWeather.tempC}°C` : ''}`}
          outfit={tomorrowOutfit}
        />

      </div>

      <BottomNav />
    </div>
  );
}
