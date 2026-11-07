'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

// Comprehensive 8-category offline FAQ knowledge base (45+ curated queries)
const FAQ_KNOWLEDGE_BASE = [
  // ── Category A: Materials & Craftsmanship
  {
    category: 'Materials',
    keywords: ['material', 'leather', 'vegan', 'cruelty', 'peta', 'cork', 'sole', 'fabric', 'upper', 'handcrafted', 'handmade', 'artisan', 'durability', 'waterproof', 'clean', 'care'],
    patterns: [
      /what.*material/i,
      /is it (real|genuine|animal) leather/i,
      /is.*vegan/i,
      /cruelty.*free/i,
      /how.*clean/i,
      /water.*proof|water.*resistant/i,
      /how long.*last|durable/i,
      /cork footbed/i
    ],
    answer: "🌿 **100% Cruelty-Free & Sustainable Materials**\n• **Uppers:** High-grade microfiber vegan leather and hand-loomed Indian heritage jacquards.\n• **Footbeds:** Anatomically contoured natural cork with double-density latex cushioning.\n• **Soles:** Non-slip, abrasion-resistant recycled rubber TPR.\n• **Care:** Wipe clean with a damp cotton cloth and mild soapy water. Do not submerge in water or machine wash."
  },
  // ── Category B: Sizing & Fit
  {
    category: 'Sizing',
    keywords: ['size', 'sizing', 'fit', 'chart', 'measurement', 'tight', 'loose', 'broad', 'wide', 'half size', 'uk', 'eu', 'us', 'measure'],
    patterns: [
      /size.*guide|size.*chart/i,
      /how.*fit|true to size/i,
      /wide.*(feet|foot)|broad.*(feet|foot)/i,
      /half.*size/i,
      /how to measure.*(foot|feet)/i,
      /what size.*should i (buy|order|get)/i,
      /size.*comparison|nike.*size/i
    ],
    answer: "📏 **SlideEase Sizing & Fit Guide**\n• All footwear follows standard **Indian / UK sizing**.\n• Fits true-to-size for regular feet.\n• **Broad Feet or In-Between Sizes:** We recommend choosing **one size up** (e.g. if you are UK 7.5, order UK 8).\n• **How to measure:** Place your foot flat on paper, mark your heel and longest toe, and measure the distance in centimeters against our size chart."
  },
  // ── Category C: Orders & Tracking
  {
    category: 'Orders',
    keywords: ['track', 'tracking', 'order status', 'where is my order', 'awb', 'courier', 'dispatch', 'cancel', 'modify', 'change address'],
    patterns: [
      /track.*(order|package|shipment)/i,
      /where is my order/i,
      /order.*status/i,
      /awb|tracking (number|id)/i,
      /cancel.*order/i,
      /change.*(address|phone|number)/i
    ],
    answer: "📦 **Order Tracking & Management**\n• Orders are dispatched within **24–48 hours** via premium couriers (BlueDart & Delhivery).\n• You will receive SMS & WhatsApp notifications containing your live **AWB tracking link** upon dispatch.\n• You can also track and download tax invoices directly from your **Customer Account Dashboard**.\n• To cancel or change your address before dispatch, message us promptly on WhatsApp or reply to your confirmation email."
  },
  // ── Category D: Shipping & Delivery
  {
    category: 'Shipping',
    keywords: ['shipping', 'delivery', 'delivery time', 'how many days', 'charges', 'free shipping', 'cod', 'cash on delivery', 'delhi', 'mumbai', 'bangalore', 'international'],
    patterns: [
      /shipping.*(cost|charge|fee)|free delivery/i,
      /how long.*(deliver|take|arrive)/i,
      /delivery.*(time|days)/i,
      /do you deliver to|serviceable/i,
      /cash on delivery|is cod available/i,
      /international.*shipping/i
    ],
    answer: "🚚 **Shipping & Timelines**\n• **Complimentary Free Shipping** across India on all prepaid & COD orders over ₹999 (₹99 flat shipping for orders below ₹999).\n• **Metros:** Delivered within 2–4 business days.\n• **Rest of India:** Delivered within 4–6 business days.\n• **Cash on Delivery (COD)** is available across 19,000+ Indian pincodes.\n• International shipping: Currently available by bespoke request via our concierge."
  },
  // ── Category E: Payments & Offers
  {
    category: 'Payments',
    keywords: ['payment', 'pay', 'upi', 'gpay', 'phonepe', 'card', 'credit card', 'debit card', 'net banking', 'coupon', 'discount', 'code', 'offer', 'points', 'slideease10'],
    patterns: [
      /payment.*(options|method|mode)/i,
      /coupon.*(code|apply)|discount/i,
      /promo.*code/i,
      /reward.*points/i,
      /payment.*(failed|declined|debited)/i
    ],
    answer: "💳 **Payments & Offers**\n• We accept UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, Net Banking, and Cash on Delivery (COD).\n• **Welcome Offer:** Apply coupon **SLIDEEASE10** at checkout for a flat 10% discount on artisan footwear.\n• **Artisan Circle Points:** Earn 1 point per ₹20 spent (1 point = ₹1 checkout credit).\n• All transactions are secured with 256-bit bank-grade encryption via Cashfree & Razorpay."
  },
  // ── Category F: Returns & Exchanges
  {
    category: 'Returns',
    keywords: ['return', 'exchange', 'refund', 'replacement', 'size change', 'damaged', 'defective', 'doorstep pickup', 'reverse pickup'],
    patterns: [
      /how.*(return|exchange)/i,
      /return.*(policy|window|days)/i,
      /exchange.*(policy|size)/i,
      /how long.*refund/i,
      /reverse.*pickup/i,
      /damaged.*(item|pair|product)/i
    ],
    answer: "🔄 **Hassle-Free 7-Day Exchange & Returns**\n• We provide **complimentary doorstep size exchanges** within 7 days of delivery.\n• Instant replacement stock reservation directly from your **Customer Account Dashboard**.\n• Our courier partner will pick up the unwashed, unworn footwear in its original packaging.\n• **Refunds:** Processed within 24–48 hours of return receipt back to your original payment mode or UPI."
  },
  // ── Category G: Customer Account
  {
    category: 'Account',
    keywords: ['account', 'login', 'password', 'forgot password', 'register', 'sign in', 'invoice', 'profile'],
    patterns: [
      /how.*(login|register|sign in)/i,
      /forgot.*password|reset password/i,
      /download.*invoice/i,
      /account.*dashboard/i
    ],
    answer: "👤 **Customer Account & SlideEase Circle**\n• View past and active orders, download official GST tax invoices, and track reward points from your **Account Dashboard**.\n• If you forgot your password, use the 'Forgot Password' link on the login page for an instant OTP/reset link.\n• Every registered customer automatically joins the SlideEase Circle for early access to limited edition drops."
  },
  // ── Category H: Contact & Concierge
  {
    category: 'Contact',
    keywords: ['contact', 'human', 'agent', 'support', 'customer care', 'phone', 'call', 'whatsapp', 'email', 'store', 'location'],
    patterns: [
      /speak.*(human|agent|person|representative)/i,
      /customer.*(care|support|service)/i,
      /contact.*(number|phone|details)/i,
      /email.*support/i,
      /physical.*store|where are you located/i
    ],
    answer: "💬 **SlideEase Artisan Concierge**\n• **WhatsApp Support:** Instant human assistance Mon–Sat, 10 AM – 7 PM IST.\n• **Email:** support@slideease.com (Replies within 4 working hours).\n• **Headquarters:** Mumbai & New Delhi, India.\n• Tap the green WhatsApp button below for one-click chat with our footwear concierge!"
  }
];

export default function LiveChatWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [waNumber, setWaNumber] = useState('919820012345');
  const [messages, setMessages] = useState([
    { 
      sender: 'bot', 
      text: 'Namaste! Welcome to SlideEase Artisan Concierge. I can assist you with sizing, materials, doorstep exchanges, order tracking, and offers. Tap a topic below or type your question.' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Load WhatsApp number from store settings
  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data?.whatsappNumber) {
          setWaNumber(res.data.whatsappNumber.replace(/[^0-9]/g, ''));
        }
      })
      .catch(() => {});
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  // Do not render on admin dashboard
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  // Matching engine
  const findBestFaqAnswer = (query) => {
    const clean = query.toLowerCase().replace(/[^\w\s]/g, ' ').trim();
    if (!clean) return null;

    // 1. Check regex patterns first (highest precision)
    for (const item of FAQ_KNOWLEDGE_BASE) {
      for (const pattern of item.patterns) {
        if (pattern.test(query)) {
          return item.answer;
        }
      }
    }

    // 2. Score keyword matches
    const words = clean.split(/\s+/).filter(w => w.length > 2);
    let bestScore = 0;
    let bestItem = null;

    for (const item of FAQ_KNOWLEDGE_BASE) {
      let score = 0;
      for (const kw of item.keywords) {
        if (clean.includes(kw)) {
          score += 2;
        }
      }
      for (const word of words) {
        if (item.keywords.some(kw => kw.includes(word) || word.includes(kw))) {
          score += 1;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestItem = item;
      }
    }

    if (bestScore >= 2 && bestItem) {
      return bestItem.answer;
    }

    // 3. Fallback answer with direct WhatsApp link
    return `Thank you for reaching out! I want to ensure you get precise information regarding "${query}".\n\nFor custom fitting recommendations or order inquiries, our human artisan concierge is standing by on WhatsApp.\n\nYou can also explore the quick topics below or email us at support@slideease.com.`;
  };

  const handleSendText = (userText) => {
    const trimmed = userText.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { sender: 'user', text: trimmed }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const reply = findBestFaqAnswer(trimmed);
      setMessages((prev) => [...prev, { sender: 'bot', text: reply }]);
      setIsTyping(false);
    }, 380);
  };

  const handleSend = (e) => {
    e.preventDefault();
    handleSendText(input);
  };

  return (
    <div className="live-chat-widget">
      {/* Floating launcher button */}
      <button 
        className="chat-trigger-btn" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open SlideEase customer support chat"
        type="button"
      >
        <span className="chat-badge" aria-hidden="true"></span>
        {isOpen ? (
          <span style={{ fontSize: '1.4rem', lineHeight: 1, fontWeight: 'bold' }}>✕</span>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        )}
      </button>

      {/* Drawer / Modal Window */}
      <div 
        className={`chat-window ${isOpen ? 'open' : ''}`}
        role="dialog"
        aria-label="SlideEase Assistant Window"
        style={{
          boxShadow: '0 12px 36px rgba(0,0,0,0.22)',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: '16px',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div className="chat-window-header" style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          padding: '1rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#22c55e',
              boxShadow: '0 0 8px #22c55e'
            }} />
            <div>
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, letterSpacing: '0.3px', color: '#ffffff' }}>
                SlideEase Concierge
              </h4>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                Offline Smart Assistant • 24/7 Instant Answers
              </span>
            </div>
          </div>
          <button 
            className="chat-window-close" 
            onClick={() => setIsOpen(false)} 
            aria-label="Close chat window"
            type="button"
            style={{ color: '#cbd5e1', background: 'transparent', border: 'none', fontSize: '1.25rem', cursor: 'pointer', padding: '4px' }}
          >
            ✕
          </button>
        </div>

        {/* Message stream */}
        <div className="chat-messages" style={{
          backgroundColor: '#f8fafc',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
          overflowY: 'auto',
          maxHeight: '380px',
          minHeight: '260px'
        }}>
          {messages.map((m, idx) => (
            <div 
              key={idx} 
              className={`chat-msg ${m.sender}`}
              style={{
                maxWidth: '86%',
                padding: '0.75rem 0.95rem',
                borderRadius: m.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                backgroundColor: m.sender === 'user' ? '#0f172a' : '#ffffff',
                color: m.sender === 'user' ? '#ffffff' : '#1e293b',
                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                fontSize: '0.86rem',
                lineHeight: 1.55,
                border: m.sender === 'bot' ? '1px solid #e2e8f0' : 'none',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}
            >
              {m.text}
            </div>
          ))}

          {isTyping && (
            <div style={{
              alignSelf: 'flex-start',
              fontSize: '0.78rem',
              color: '#64748b',
              backgroundColor: '#ffffff',
              padding: '0.5rem 0.85rem',
              borderRadius: '14px',
              border: '1px solid #e2e8f0'
            }}>
              ✨ SlideEase Assistant is finding the answer...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Category Suggestion Pills */}
        <div style={{
          display: 'flex',
          gap: '6px',
          padding: '8px 12px',
          overflowX: 'auto',
          background: '#f1f5f9',
          borderTop: '1px solid #e2e8f0',
          scrollbarWidth: 'none'
        }}>
          <button 
            type="button" 
            onClick={() => handleSendText('What is your sizing guide and how do your shoes fit?')}
            style={{ fontSize: '0.74rem', whiteSpace: 'nowrap', padding: '4px 10px', borderRadius: '14px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#1e293b', cursor: 'pointer', fontWeight: 500 }}
          >
            📏 Sizing
          </button>
          <button 
            type="button" 
            onClick={() => handleSendText('How do doorstep exchanges and returns work?')}
            style={{ fontSize: '0.74rem', whiteSpace: 'nowrap', padding: '4px 10px', borderRadius: '14px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#1e293b', cursor: 'pointer', fontWeight: 500 }}
          >
            🔄 7-Day Exchange
          </button>
          <button 
            type="button" 
            onClick={() => handleSendText('Are your shoes vegan and cruelty free?')}
            style={{ fontSize: '0.74rem', whiteSpace: 'nowrap', padding: '4px 10px', borderRadius: '14px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#1e293b', cursor: 'pointer', fontWeight: 500 }}
          >
            🌿 Vegan Materials
          </button>
          <button 
            type="button" 
            onClick={() => handleSendText('How do I track my order delivery?')}
            style={{ fontSize: '0.74rem', whiteSpace: 'nowrap', padding: '4px 10px', borderRadius: '14px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#1e293b', cursor: 'pointer', fontWeight: 500 }}
          >
            🚚 Shipping & Tracking
          </button>
          <button 
            type="button" 
            onClick={() => handleSendText('Do you offer discount codes and reward points?')}
            style={{ fontSize: '0.74rem', whiteSpace: 'nowrap', padding: '4px 10px', borderRadius: '14px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#1e293b', cursor: 'pointer', fontWeight: 500 }}
          >
            🎁 Offers & Coupons
          </button>
          <a 
            href={`https://wa.me/${waNumber}?text=Hi%20SlideEase!%20I%20would%20like%20to%20speak%20with%20a%20footwear%20concierge.`}
            target="_blank" 
            rel="noopener noreferrer"
            style={{ fontSize: '0.74rem', whiteSpace: 'nowrap', padding: '4px 10px', borderRadius: '14px', border: '1px solid #16a34a', background: '#dcfce7', color: '#166534', textDecoration: 'none', fontWeight: 600 }}
          >
            💬 WhatsApp Live
          </a>
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="chat-input-area" style={{
          display: 'flex',
          padding: '8px 12px',
          background: '#ffffff',
          borderTop: '1px solid #e2e8f0'
        }}>
          <input 
            type="text" 
            placeholder="Ask about size, materials, return, delivery..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{
              flex: 1,
              border: '1px solid #cbd5e1',
              borderRadius: '20px',
              padding: '8px 14px',
              fontSize: '0.85rem',
              outline: 'none',
              backgroundColor: '#f8fafc'
            }}
          />
          <button 
            type="submit" 
            className="chat-send-btn" 
            aria-label="Send message"
            style={{
              marginLeft: '8px',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            ➤
          </button>
        </form>
      </div>
    </div>
  );
}
