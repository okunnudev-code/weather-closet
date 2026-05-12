import Image from 'next/image';
import FaqAccordion from './components/FaqAccordion';
import { HeroAuthButton } from './components/LandingAuthButtons';
import LandingNav from './components/LandingNav';

const reviews = [
  {
    text: 'This app saves me so much time in the morning. I love that it uses clothes I already own and actually considers the weather.',
    name: 'Alex M.',
  },
  {
    text: 'Finally stopped overdressing and underdressing. The weather-based outfit suggestions are surprisingly accurate.',
    name: 'Sophie L.',
  },
  {
    text: "Uploading my closet was easy, and now I don't stress about what to wear. Simple, smart, and super useful",
    name: 'Jordan K.',
  },
];

const plans = [
  {
    name: 'Starter',
    price: '£2.99/mo',
    features: ['Digital closet', '50 Image Upload', 'Unlimited daily outfits', 'Early access features'],
  },
  {
    name: 'Pro',
    price: '£6.99/mo',
    features: ['Digital closet', '300 Image Upload', 'Unlimited daily outfits', 'Early access features'],
    highlight: true,
  },
  {
    name: 'Expert',
    price: '£10.99/mo',
    features: ['Digital closet', '900 Image Upload', 'Unlimited daily outfits', 'Early access features'],
  },
];

export default function Home() {
  return (
    <div style={{ background: 'var(--bg-white)' }}>
      {/* Navbar */}
      <div className="container">
        <LandingNav />
      </div>

      {/* Hero */}
      <div className="container">
        <section className="hero">
          <div className="hero-content">
            <h1>Outfits That Match The Weather</h1>
            <div className="hero-btns">
              <HeroAuthButton />
              <a href="#reviews" className="btn btn-secondary">Reviews</a>
            </div>
          </div>
          <div className="hero-images">
            <div className="hero-img-1">
              <Image src="/hero-2.png" alt="Woman in autumn park" fill style={{ objectFit: 'cover', borderRadius: '12px' }} />
            </div>
            <div className="hero-img-2">
              <Image src="/hero-1.png" alt="Woman in rain" fill style={{ objectFit: 'cover', borderRadius: '12px' }} />
            </div>
          </div>
        </section>
      </div>

      {/* How it Works */}
      <section className="section-padding" style={{ background: 'var(--bg-white)' }}>
        <div className="container">
          <h2 className="center-text" style={{ fontSize: '2.5rem' }}>How it Works</h2>
          <div className="how-it-works-grid">
            <div className="card">
              <h3>Upload Your Closet</h3>
              <p>Add photos of your clothes you already own to build your digital wardrobe.</p>
            </div>
            <div className="card">
              <h3>Get Outfit Recommendations</h3>
              <p>We check the weather and provide outfit ideas from your clothes that fit the current weather.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="section-padding">
        <div className="container">
          <h2 className="center-text" style={{ fontSize: '2.5rem' }}>Reviews</h2>
          <div className="reviews-grid">
            {reviews.map((r, i) => (
              <div key={i} className="review-card">
                <p>{r.text}</p>
                <span className="review-name">{r.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="section-padding">
        <div className="container">
          <h2 className="center-text" style={{ fontSize: '2.5rem' }}>Faq</h2>
          <FaqAccordion />
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="section-padding">
        <div className="container">
          <h2 className="center-text" style={{ fontSize: '2.5rem' }}>Pricing</h2>
          <div className="pricing-grid">
            {plans.map((plan) => (
              <div key={plan.name} className={`pricing-card${plan.highlight ? ' pro' : ''}`}>
                <h3 style={{ fontSize: '1.5rem' }}>{plan.name}</h3>
                <div className="price">{plan.price}</div>
                <ul className="pricing-features">
                  {plan.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <a href="/auth" className="btn btn-primary" style={{ marginTop: 'auto' }}>Get WC</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container center-text">
          <p style={{ color: 'var(--text-muted)' }}>© 2026 Weather Closet All Rights Reserved</p>
        </div>
      </footer>
    </div>
  );
}
