import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Camera, Mic, CheckCheck, Phone } from 'lucide-react';

export default function DriverChatModal({ 
  driver, 
  messages: propMessages, 
  onSendMessage, 
  onClose 
}) {
  const [internalMessages, setInternalMessages] = useState([]);
  const messages = propMessages && propMessages.length > 0 ? propMessages : internalMessages;

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const quickReplies = [
    "Parking spot is reserved out front 🅿️",
    "Elevator key code is 4920 🔑",
    "Please handle fragile boxes carefully 💎",
    "I have extra boxes ready 📦",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendText = (textToSend, customType = 'text') => {
    const text = textToSend || inputText;
    if (!text.trim() && customType === 'text') return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      type: customType,
      text: customType === 'photo' ? 'Uploaded photo of freight elevator access' : customType === 'voice' ? 'Voice memo (0:14)' : text,
      photoUrl: customType === 'photo' ? 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80' : null,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    if (onSendMessage) {
      onSendMessage(userMsg);
    } else {
      setInternalMessages((prev) => [...prev, userMsg]);
    }

    if (!textToSend && customType === 'text') setInputText('');

    // Trigger realistic mover reply if not handled by real driver
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      let replyText = "Understood! Thanks for the update, we are making great time.";
      const lower = (text || '').toLowerCase();
      if (lower.includes('park') || lower.includes('🅿️')) {
        replyText = "Perfect, having the spot reserved will save us at least 15 minutes! Thanks.";
      } else if (lower.includes('code') || lower.includes('elevator') || lower.includes('🔑')) {
        replyText = "Noted down the code 4920. Crew has the hand-trucks ready for the elevator run.";
      } else if (lower.includes('fragile') || lower.includes('💎')) {
        replyText = "Will do! We use quilted furniture blankets and double-wrap fragile items.";
      } else if (customType === 'photo') {
        replyText = "Received the photo! Clearance looks great for our ramp.";
      } else if (customType === 'voice') {
        replyText = "Listened to the note. We'll bring the heavy-duty sofa dolly up first.";
      }

      const driverMsg = {
        id: Date.now() + 1,
        sender: 'driver',
        type: 'text',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      if (onSendMessage) {
        onSendMessage(driverMsg);
      } else {
        setInternalMessages((prev) => [...prev, driverMsg]);
      }
    }, 1200);
  };


  return (
    <div className="modal-backdrop">
      <div className="modal-sheet" style={{ height: '80vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ position: 'relative' }}>
              <img src={driver.photo} alt={driver.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: '10px', height: '10px', borderRadius: '50%', background: '#0052ff', border: '2px solid #ffffff' }}></div>
            </div>
            <div>
              <h4 style={{ color: '#09090b', fontWeight: 800, fontSize: '0.95rem', margin: 0 }}>{driver.name}</h4>
              <span style={{ fontSize: '0.72rem', color: '#0052ff', fontWeight: 700 }}>
                Lead Mover • Active Now
              </span>
            </div>
          </div>

          <button className="btn-icon" onClick={onClose} style={{ background: '#f4f4f5' }}>
            <X size={18} />
          </button>
        </div>

        {/* Message Thread */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '82%',
                background: msg.sender === 'user' ? '#09090b' : '#f4f4f5',
                color: msg.sender === 'user' ? '#ffffff' : '#09090b',
                padding: '10px 14px',
                borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                fontSize: '0.85rem',
                lineHeight: 1.4,
              }}
            >
              {msg.photoUrl && (
                <div style={{ borderRadius: '8px', overflow: 'hidden', marginBottom: '6px' }}>
                  <img src={msg.photoUrl} alt="attachment" style={{ width: '100%', maxHeight: '120px', objectFit: 'cover' }} />
                </div>
              )}
              <p style={{ margin: 0, fontWeight: msg.sender === 'user' ? 500 : 400 }}>{msg.text}</p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>{msg.time}</span>
                {msg.sender === 'user' && <CheckCheck size={12} color="#0052ff" />}
              </div>
            </div>
          ))}

          {isTyping && (
            <div style={{ alignSelf: 'flex-start', background: '#f4f4f5', padding: '8px 14px', borderRadius: '16px', fontSize: '0.75rem', color: '#71717a', fontStyle: 'italic' }}>
              Marcus is typing...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
          {quickReplies.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendText(chip)}
              style={{
                whiteSpace: 'nowrap',
                background: '#f4f4f5',
                border: '1px solid var(--border-subtle)',
                borderRadius: '999px',
                padding: '5px 10px',
                fontSize: '0.72rem',
                fontWeight: 600,
                color: '#09090b',
                cursor: 'pointer',
              }}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)', alignItems: 'center' }}>
          <button
            onClick={() => handleSendText(null, 'photo')}
            title="Attach photo"
            style={{
              background: '#f4f4f5',
              border: 'none',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#71717a',
              flexShrink: 0
            }}
          >
            <Camera size={18} />
          </button>

          <button
            onClick={() => handleSendText(null, 'voice')}
            title="Send voice note"
            style={{
              background: '#f4f4f5',
              border: 'none',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#71717a',
              flexShrink: 0
            }}
          >
            <Mic size={18} />
          </button>

          <input
            type="text"
            className="phone-input"
            placeholder="Message driver..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
            style={{ flex: 1, background: '#f4f4f5', padding: '10px 14px', borderRadius: '999px', fontSize: '0.85rem' }}
          />

          <button
            onClick={() => handleSendText()}
            style={{
              background: '#09090b',
              border: 'none',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <Send size={16} />
          </button>
        </div>

      </div>
    </div>
  );
}
