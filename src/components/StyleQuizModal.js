'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';

export default function StyleQuizModal({ isOpen, onClose }) {
  const { addToCart, setIsCartOpen } = useCart();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({ occasion: '', silhouette: '', comfort: '' });

  if (!isOpen) return null;

  const handleSelect = (field, value) => {
    const updated = { ...answers, [field]: value };
    setAnswers(updated);
    if (step < 3) {
      setStep(step + 1);
    } else {
      setStep(4); // Result state
    }
  };

  const handleReset = () => {
    setAnswers({ occasion: '', silhouette: '', comfort: '' });
    setStep(1);
  };

  const handleAddMatch = () => {
    addToCart({
      id: 'prod-01',
      name: 'Peacock Ikat Loafer',
      price: 1499,
      size: 7,
      image: '/assets/loafers.png',
      bgColor: '#f2f9f9',
      pattern: 'ikat'
    });
    onClose();
    setIsCartOpen(true);
  };

  const progressPercent = step === 1 ? 25 : step === 2 ? 50 : step === 3 ? 75 : 100;

  return (
    <div className="quiz-modal-backdrop" id="style-quiz-modal" style={{ display: 'flex' }} onClick={(e) => {
      if (e.target.id === 'style-quiz-modal') onClose();
    }}>
      <div className="quiz-modal-card" role="dialog" aria-labelledby="quiz-modal-title">
        <button className="quiz-close-btn" onClick={onClose} aria-label="Close Quiz">&times;</button>
        
        <span className="craft-eyebrow" style={{ marginBottom: '4px', display: 'block' }}>✦ Concierge Styling Match</span>
        <h3 id="quiz-modal-title" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: 'var(--primary-color)', marginBottom: '12px' }}>
          Find Your Footing
        </h3>
        
        <div className="quiz-progress-bar" style={{ height: '6px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden', marginBottom: '20px' }}>
          <div 
            className="quiz-progress-fill" 
            style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--accent-color)', transition: 'width 0.3s ease' }}
          ></div>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="quiz-step-pane">
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', color: 'var(--primary-color)', marginBottom: '6px' }}>
              1. What is your primary occasion?
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Select the setting where you'll spend the most time in your pairs.
            </p>
            
            <div className="quiz-options-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="quiz-option-btn" onClick={() => handleSelect('occasion', 'festive')}>
                <h6 style={{ fontWeight: 600 }}>🎉 Festive & Celebrations</h6>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Weddings, family gatherings, cultural evenings.</p>
              </div>
              <div className="quiz-option-btn" onClick={() => handleSelect('occasion', 'daily')}>
                <h6 style={{ fontWeight: 600 }}>🚶 Daily Urban Movement</h6>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Casual walks, neighborhood strolls, relaxed days.</p>
              </div>
              <div className="quiz-option-btn" onClick={() => handleSelect('occasion', 'work')}>
                <h6 style={{ fontWeight: 600 }}>💼 Creative Work & Office</h6>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Smart boardroom flair, breathable daily elegance.</p>
              </div>
              <div className="quiz-option-btn" onClick={() => handleSelect('occasion', 'resort')}>
                <h6 style={{ fontWeight: 600 }}>🏖️ Resort & Travel</h6>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Weekend getaways, lightweight holiday lounging.</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="quiz-step-pane">
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', color: 'var(--primary-color)', marginBottom: '6px' }}>
              2. Which silhouette do you naturally gravitate to?
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Select the shape that matches your wardrobe aesthetic.
            </p>
            
            <div className="quiz-options-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="quiz-option-btn" onClick={() => handleSelect('silhouette', 'loafers')}>
                <h6 style={{ fontWeight: 600 }}>👞 Structured Loafers</h6>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tailored, closed-toe elegance with heritage woven borders.</p>
              </div>
              <div className="quiz-option-btn" onClick={() => handleSelect('silhouette', 'juttis')}>
                <h6 style={{ fontWeight: 600 }}>✨ Traditional Juttis & Mojris</h6>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Artisanal mirror-work and embroidery, low profile.</p>
              </div>
              <div className="quiz-option-btn" onClick={() => handleSelect('silhouette', 'slides')}>
                <h6 style={{ fontWeight: 600 }}>🩴 Slip-On Ergonomic Slides</h6>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Effortless slip-and-go with broad footbed cushioning.</p>
              </div>
              <div className="quiz-option-btn" onClick={() => handleSelect('silhouette', 'sandals')}>
                <h6 style={{ fontWeight: 600 }}>👡 Strappy Comfort Sandals</h6>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Secure adjustable ankle straps with supportive arches.</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="quiz-step-pane">
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', color: 'var(--primary-color)', marginBottom: '6px' }}>
              3. What matters most for your feet?
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Our memory foam soles are customized for different foot dynamics.
            </p>
            
            <div className="quiz-options-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="quiz-option-btn" onClick={() => handleSelect('comfort', 'cushion')}>
                <h6 style={{ fontWeight: 600 }}>☁️ Cloud Memory Cushioning</h6>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Maximum shock absorption for long hours on your feet.</p>
              </div>
              <div className="quiz-option-btn" onClick={() => handleSelect('comfort', 'lightweight')}>
                <h6 style={{ fontWeight: 600 }}>🪶 Featherlight Flexibility</h6>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Barely-there feel with responsive natural cork flexibility.</p>
              </div>
              <div className="quiz-option-btn" onClick={() => handleSelect('comfort', 'breathable')}>
                <h6 style={{ fontWeight: 600 }}>🌬️ All-Day Breathability</h6>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Air-permeable organic cotton weaves for warm climates.</p>
              </div>
              <div className="quiz-option-btn" onClick={() => handleSelect('comfort', 'arch')}>
                <h6 style={{ fontWeight: 600 }}>📐 Deep Contoured Arch Support</h6>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ergonomic cup heel preventing foot fatigue.</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Result */}
        {step === 4 && (
          <div className="quiz-result-pane" style={{ textAlign: 'center', padding: '10px 0' }}>
            <span style={{ fontSize: '2rem', marginBottom: '8px', display: 'inline-block' }}>✨</span>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--primary-color)', marginBottom: '6px' }}>
              Your Handcrafted Match
            </h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Based on your occasion and comfort preferences, our master craftsmen recommend:
            </p>
            
            <div style={{ background: 'var(--bg-light)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '20px', display: 'flex', alignItems: 'center', gap: '20px', textAlign: 'left', marginBottom: '24px' }}>
              <img src="/assets/loafers.png" alt="Match" style={{ width: '100px', height: '80px', objectFit: 'contain', borderRadius: '6px' }} />
              <div>
                <span className="craft-tag">98% Aesthetic Match</span>
                <h5 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', color: 'var(--primary-color)', margin: '6px 0 2px 0' }}>
                  Peacock Ikat Loafer
                </h5>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                  Handcrafted teal Ikat canvas with contoured memory foam.
                </p>
                <div style={{ fontWeight: 700, color: 'var(--accent-dark)', marginTop: '4px' }}>₹1,499</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn btn-accent" onClick={handleAddMatch}>Add to Bag • Instant Match</button>
              <button className="btn btn-outline" onClick={handleReset}>Retake Quiz</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
