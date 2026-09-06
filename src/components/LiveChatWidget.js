'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function LiveChatWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Namaste! Welcome to SlideEase concierge. How may I assist your style journey today?' }
  ]);
  const [input, setInput] = useState('');

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setInput('');

    setTimeout(() => {
      let reply = "Thank you for reaching out! For immediate bespoke support, connect directly with our master artisan team on WhatsApp (+91 22 4567 8900).";
      const lower = userText.toLowerCase();

      if (lower.includes('size') || lower.includes('fit') || lower.includes('measure')) {
        reply = "Our shoes fit true to Indian/UK standard sizing. If between sizes, we recommend ordering one size up. Check our detailed interactive /size-guide page!";
      } else if (lower.includes('shipping') || lower.includes('delivery') || lower.includes('track')) {
        reply = "We offer complimentary express delivery on bespoke orders above ₹999. Typical delivery takes 2 to 4 business days with live SMS tracking.";
      } else if (lower.includes('return') || lower.includes('exchange') || lower.includes('refund')) {
        reply = "We provide a 7-day hassle-free doorstep size exchange. Items must remain in unworn condition with original box packaging.";
      } else if (lower.includes('material') || lower.includes('vegan') || lower.includes('leather')) {
        reply = "All SlideEase products are 100% PETA-approved cruelty-free vegan leather and natural plant-based cork footbeds, combined with traditional Indian artisan weaves.";
      }

      setMessages((prev) => [...prev, { sender: 'bot', text: reply }]);
    }, 600);
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
            <h4>SlideEase Artisan Concierge</h4>
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
