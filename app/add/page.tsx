'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { HiArrowLeft } from 'react-icons/hi';
import { MdFlipCameraIos, MdPhotoLibrary } from 'react-icons/md';
import { addItem, getItems } from '../lib/closetStore';

export default function AddPage() {
  const router = useRouter();
  const { userId } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facing, setFacing] = useState<'user' | 'environment'>('environment');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [captured, setCaptured] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const startCamera = useCallback(async (facingMode: 'user' | 'environment') => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 1600 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setCameraActive(true);
      setCameraError('');
    } catch {
      setCameraError('Camera access denied. Use the upload button instead.');
    }
  }, []);

  useEffect(() => {
    startCamera(facing);
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function flipCamera() {
    const next = facing === 'environment' ? 'user' : 'environment';
    setFacing(next);
    startCamera(next);
  }

  function capturePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')!.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    streamRef.current?.getTracks().forEach(t => t.stop());
    setCaptured(dataUrl);
  }

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      setCaptured(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  function retake() {
    setCaptured(null);
    startCamera(facing);
  }

  async function saveToCloset() {
    if (!captured || !userId) return;
    setSaving(true);
    try {
      // Ask Gemini to name the item
      const base64 = captured.split(',')[1];
      const mimeType = captured.split(';')[0].split(':')[1];
      let name = `Item`;
      try {
        const res = await fetch('/api/analyze-clothing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64, mimeType }),
        });
        const json = await res.json();
        if (json.name) name = json.name;
      } catch {
        const existing = await getItems(userId);
        name = `Item ${existing.length + 1}`;
      }
      await addItem(userId, captured, name);
      router.push('/closet');
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ padding: '1.5rem 2rem', display: 'flex', alignItems: 'center' }}>
        <button
          onClick={() => { streamRef.current?.getTracks().forEach(t => t.stop()); router.back(); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--text-dark)' }}
        >
          <HiArrowLeft size={24} />
        </button>
        <h2 style={{ margin: '0 auto', fontSize: '1.3rem', fontWeight: '500' }}>
          Take or Upload a Picture.
        </h2>
        <div style={{ width: 24 }} />
      </div>

      {/* Camera / preview area */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '0 2rem', flex: 1 }}>
        <div style={{
          position: 'relative', width: '100%', maxWidth: '480px',
          aspectRatio: '3/4', background: '#d5d5d5', borderRadius: '16px', overflow: 'hidden',
        }}>

          {!captured && (
            <video
              ref={videoRef} autoPlay playsInline muted
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                transform: facing === 'user' ? 'scaleX(-1)' : 'none',
                display: cameraActive ? 'block' : 'none',
              }}
            />
          )}

          {captured && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={captured} alt="Captured" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}

          {cameraError && !captured && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', color: '#666', fontSize: '0.9rem' }}>
              {cameraError}
            </div>
          )}

          {!captured && cameraActive && (
            <button onClick={flipCamera} style={{
              position: 'absolute', top: '1rem', right: '1rem',
              background: 'rgba(0,0,0,0.4)', border: 'none', borderRadius: '50%',
              width: '44px', height: '44px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', color: '#fff',
            }}>
              <MdFlipCameraIos size={24} />
            </button>
          )}

          {!captured && (
            <div style={{ position: 'absolute', bottom: '1.5rem', left: 0, right: 0 }}>
              <button onClick={() => fileInputRef.current?.click()} style={{
                position: 'absolute', left: '1.5rem', bottom: 0,
                width: '56px', height: '56px', borderRadius: '50%',
                background: 'rgba(220,100,100,0.35)', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#fff',
              }}>
                <MdPhotoLibrary size={26} />
              </button>
              <button onClick={capturePhoto} disabled={!cameraActive} style={{
                display: 'block', margin: '0 auto', width: '76px', height: '76px',
                borderRadius: '50%', background: 'rgba(220,100,100,0.35)', border: 'none',
                cursor: cameraActive ? 'pointer' : 'default', padding: '12px',
              }}>
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#c0392b' }} />
              </button>
            </div>
          )}

          {captured && (
            <div style={{
              position: 'absolute', bottom: '1.5rem', left: 0, right: 0,
              display: 'flex', justifyContent: 'center', gap: '1.5rem',
            }}>
              <button onClick={retake} style={actionBtn('#555')} disabled={saving}>Retake</button>
              <button onClick={saveToCloset} style={actionBtn('var(--primary-teal)')} disabled={saving}>
                {saving ? 'Saving…' : 'Save to Closet'}
              </button>
            </div>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />
    </div>
  );
}

const actionBtn = (bg: string): React.CSSProperties => ({
  background: bg, color: '#fff', border: 'none', borderRadius: '24px',
  padding: '0.75rem 1.75rem', fontSize: '1rem', fontFamily: 'inherit',
  cursor: 'pointer', fontWeight: '500',
});
