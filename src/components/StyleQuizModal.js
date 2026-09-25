'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';

export default function StyleQuizModal({ isOpen, onClose }) {
  const { addToCart, setIsCartOpen } = useCart();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({ occasion: '', silhouette: '', comfort: '' });
  const [loadingMatch, setLoadingMatch] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [selectedSize, setSelectedSize] = useState('7');

  if (!isOpen) return null;

  const fetchRecommendation = async (finalAnswers) => {
    setLoadingMatch(true);
    try {
      const res = await fetch('/api/quiz/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalAnswers),
      });
      const data = await res.json();
      if (data.success && data.recommended) {
        setMatchResult(data.recommended);
        if (data.recommended.sizes && data.recommended.sizes.length > 0) {
          setSelectedSize(String(data.recommended.sizes[0]));
        }
      }
    } catch (err) {
      console.error('Quiz recommendation error:', err);
    } finally {
      setLoadingMatch(false);
    }
  };

  const handleSelect = (field, value) => {
    const updated = { ...answers, [field]: value };
    setAnswers(updated);
    if (step < 3) {
      setStep(step + 1);
    } else {
      setStep(4);
      fetchRecommendation(updated);
    }
  };

  const handleReset = () => {
    setAnswers({ occasion: '', silhouette: '', comfort: '' });
    setMatchResult(null);
    setStep(1);
  };

  const handleAddMatch = () => {
    if (!matchResult) return;
    addToCart(matchResult, selectedSize, 1);
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
            {loadingMatch ? (
              <div style={{ padding: '3rem 0' }}>
                <div style={{ fontSize: '2.5rem', animation: 'spin 1.5s infinite linear', display: 'inline-block' }}>⚙️</div>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: 'var(--primary-color)', marginTop: '1rem' }}>
                  Consulting Master Footwear Archives...
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Matching silhouette, arch dynamics, and occasion craft.
                </p>
              </div>
            ) : matchResult ? (
              <>
                <span style={{ fontSize: '2rem', marginBottom: '8px', display: 'inline-block' }}>✨</span>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--primary-color)', marginBottom: '6px' }}>
                  Your Handcrafted Match
                </h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                  Based on your preferences, our master craftsmen recommend:
                </p>
                
                <div style={{ background: 'var(--bg-light)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '20px', display: 'flex', alignItems: 'center', gap: '20px', textAlign: 'left', marginBottom: '20px' }}>
                  <img 
                    src={matchResult.image || '/assets/loafers.png'} 
                    alt={matchResult.name} 
                    style={{ width: '100px', height: '80px', objectFit: 'contain', borderRadius: '6px' }} 
                  />
                  <div>
                    <span className="craft-tag">✦ {matchResult.badge || 'Artisan Pick'}</span>
                    <h5 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', color: 'var(--primary-color)', margin: '6px 0 2px 0' }}>
                      {matchResult.name}
                    </h5>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                      Category: {matchResult.category} {matchResult.color ? `• ${matchResult.color}` : ''}
                    </p>
                    <div style={{ fontWeight: 700, color: 'var(--accent-dark)', marginTop: '4px' }}>
                      ₹{matchResult.price?.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Size Selector */}
                {matchResult.sizes && matchResult.sizes.length > 0 && (
                  <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Select Footwear Size (UK):
                    </label>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {matchResult.sizes.map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setSelectedSize(String(sz))}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '4px',
                            border: selectedSize === String(sz) ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                            backgroundColor: selectedSize === String(sz) ? 'var(--accent-color)' : '#fff',
                            color: selectedSize === String(sz) ? '#fff' : 'var(--text-color)',
                            fontWeight: 600,
                            fontSize: '0.82rem',
                            cursor: 'pointer'
                          }}
                        >
                          UK {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button className="btn btn-accent" onClick={handleAddMatch}>
                    Add Size UK {selectedSize} to Bag • Instant Match
                  </button>
                  <button className="btn btn-outline" onClick={handleReset}>Retake Quiz</button>
                </div>
              </>
            ) : (
              <div>
                <p>No exact match found. Please try different options.</p>
                <button className="btn btn-outline" onClick={handleReset}>Retake Quiz</button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
