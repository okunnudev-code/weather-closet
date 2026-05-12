'use client';

import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

export function NavAuthButton() {
  const { isSignedIn } = useUser();
  return isSignedIn
    ? <Link href="/home" className="btn btn-primary">Dashboard</Link>
    : <Link href="/auth" className="btn btn-primary">Sign up / Sign in</Link>;
}

export function HeroAuthButton() {
  const { isSignedIn } = useUser();
  return isSignedIn
    ? <Link href="/home" className="btn btn-primary">Dashboard</Link>
    : <Link href="/auth" className="btn btn-primary">Get Started</Link>;
}
