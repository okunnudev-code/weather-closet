'use client';

import { useState } from 'react';
import Image from 'next/image';
import { NavAuthButton } from './LandingAuthButtons';

export default function LandingNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="navbar">
        <div className="logo">
          <Image src="/logo.png" alt="Weather Closet" width={52} height={60} priority />
        </div>

        {/* Desktop links */}
        <div className="nav-links nav-desktop">
          <a href="#reviews" className="nav-link">Reviews</a>
          <a href="#faq" className="nav-link">Faq</a>
          <a href="#pricing" className="nav-link">Pricing</a>
        </div>
        <div className="nav-desktop">
          <NavAuthButton />
        </div>

        {/* Mobile hamburger */}
        <button
          className="hamburger"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* Mobile overlay */}
      {open && (
        <div className="mobile-menu">
          <div className="mobile-menu-top">
            <Image src="/logo.png" alt="Weather Closet" width={52} height={60} />
            <button
              className="mobile-close"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          <div className="mobile-menu-links">
            <a href="#reviews" className="mobile-link" onClick={() => setOpen(false)}>Reviews</a>
            <a href="#pricing" className="mobile-link" onClick={() => setOpen(false)}>Pricing</a>
            <a href="#faq" className="mobile-link" onClick={() => setOpen(false)}>Faq</a>
          </div>

          <div className="mobile-menu-footer">
            <NavAuthButton />
          </div>
        </div>
      )}
    </>
  );
}
