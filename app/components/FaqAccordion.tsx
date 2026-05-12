'use client';

import { useState } from 'react';

const faqs = [
  {
    question: 'What AI model is being used?',
    answer: 'We use a combination of advanced AI models to analyse weather data and suggest outfits tailored to your wardrobe.',
  },
  {
    question: 'How many clothes can I upload?',
    answer: 'It depends on your plan — Starter allows 50 images, Pro allows 300, and Expert allows 900.',
  },
  {
    question: 'Is my data being used for anything Illegal?',
    answer: 'Absolutely not. Your data is used solely to provide outfit recommendations and is never shared with third parties.',
  },
];

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="faq-list">
      {faqs.map((faq, i) => (
        <div key={i} className="faq-item">
          <button
            className="faq-question"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
          >
            {faq.question}
            <span className="faq-icon">{openIndex === i ? '−' : '+'}</span>
          </button>
          {openIndex === i && (
            <div style={{ padding: '0 1.5rem 1.5rem', color: 'var(--text-muted)' }}>
              {faq.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
