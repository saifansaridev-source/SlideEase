'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function LiveChatWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [waNumber, setWaNumber] = useState('919820012345');
  const [messages, setMessages] = useState([
    { 
      sender: 'bot', 
      text: 'Namaste! I am the SlideEase Automated Concierge Assistant. How can I help you with sizing, materials, or orders today?' 
    }
  ]);
  const [input, setInput] = useState('');

  React.useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data?.whatsappNumber) {
          setWaNumber(res.data.whatsappNumber.replace(/[^0-9]/g, ''));
        }
      })
      .catch(() => {});
  }, []);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const handleSendText = (userText) => {
    if (!userText.trim()) return;

    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setInput('');

    setTimeout(() => {
      let reply = `Thank you for asking! For bespoke live styling advice, tap below to chat directly with our master footwear artisans on WhatsApp.`;
      const lower = userText.toLowerCase();

      if (lower.includes('size') || lower.includes('fit') || lower.includes('measure')) {
        reply = "Our handcrafted footwear fits true to Indian/UK standard sizing. For broader feet or half-sizes, we recommend sizing up by one size. You can also explore our interactive Size & Fit Assistant.";
      } else if (lower.includes('shipping') || lower.includes('delivery') || lower.includes('track')) {
        reply = "We offer complimentary express delivery across India on orders above ₹999. Orders typically arrive in 3-5 business days with automated SMS and email tracking.";
      } else if (lower.includes('return') || lower.includes('exchange') || lower.includes('refund')) {
        reply = "We provide a 7-day hassle-free doorstep size exchange and returns. Submit directly from your Customer Account Dashboard with live replacement stock reservation.";
      } else if (lower.includes('material') || lower.includes('vegan') || lower.includes('leather')) {
        reply = "All SlideEase footwear is 100% cruelty-free, crafted with PETA-approved vegan leather, sustainable cork footbeds, and traditional hand-woven Indian textiles.";
      }

      setMessages((prev) => [...prev, { sender: 'bot', text: reply }]);
    }, 450);
  };

  const handleSend = (e) => {
    e.preventDefault();
    handleSendText(input);
  };

  return (
    <div className="live-chat-widget">
      <button 
        className="chat-trigger-btn" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open customer support chat"
      >
        <span className="chat-badge"></span>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>

      <div className={`chat-window ${isOpen ? 'open' : ''}`}>
        <div className="chat-window-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span>
            <h4 style={{ margin: 0, fontSize: '0.95rem' }}>SlideEase Help Assistant</h4>
          </div>
          <button className="chat-window-close" onClick={() => setIsOpen(false)} aria-label="Close chat window">&times;</button>
        </div>

        <div className="chat-messages">
          {messages.map((m, idx) => (
            <div key={idx} className={`chat-msg ${m.sender}`}>
              {m.text}
            </div>
          ))}
        </div>

        {/* Quick Question Pills */}
        <div style={{ display: 'flex', gap: '6px', padding: '6px 12px', overflowX: 'auto', background: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
          <button 
            type="button" 
            onClick={() => handleSendText('What is your sizing guide?')}
            style={{ fontSize: '0.72rem', whiteSpace: 'nowrap', padding: '3px 8px', borderRadius: '12px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}
          >
            📏 Sizing
          </button>
          <button 
            type="button" 
            onClick={() => handleSendText('How do size exchanges work?')}
            style={{ fontSize: '0.72rem', whiteSpace: 'nowrap', padding: '3px 8px', borderRadius: '12px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}
          >
            🔄 Exchanges
          </button>
          <button 
            type="button" 
            onClick={() => handleSendText('Are your materials vegan?')}
            style={{ fontSize: '0.72rem', whiteSpace: 'nowrap', padding: '3px 8px', borderRadius: '12px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}
          >
            🌿 Materials
          </button>
          <a 
            href={`https://wa.me/${waNumber}?text=Hi%20SlideEase!%20I%20would%20like%20to%20speak%20with%20a%20human%20concierge.`}
            target="_blank" 
            rel="noopener noreferrer"
            style={{ fontSize: '0.72rem', whiteSpace: 'nowrap', padding: '3px 8px', borderRadius: '12px', border: '1px solid #16a34a', background: '#dcfce7', color: '#166534', textDecoration: 'none', fontWeight: 600 }}
          >
            💬 WhatsApp Live
          </a>
        </div>

        <form onSubmit={handleSend} className="chat-input-area">
          <input 
            type="text" 
            placeholder="Ask about sizing, materials, delivery..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="chat-send-btn" aria-label="Send message">
            ➤
          </button>
        </form>
      </div>
    </div>
  );
}
