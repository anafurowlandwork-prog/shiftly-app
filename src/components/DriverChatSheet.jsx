import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Camera, CheckCheck, User, Phone } from 'lucide-react';
import ShiftlyLogo from './ShiftlyLogo';

export default function DriverChatSheet({ 
  customerName = 'Sarah Jenkins', 
  messages, 
  onSendMessage, 
  onClose 
}) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const quickDriverReplies = [
    "Arrived at pickup spot! 🚚",
    "Loading cargo now with crew 📦",
    "Items safely strapped & secured 🛡️",
    "Stuck in brief traffic (~5m delay) ⏳",
    "Arrived at dropoff destination! 🏁"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    onSendMessage({
      id: Date.now(),
      sender: 'driver',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    if (!textToSend) setInputText('');
  };

  return (
    <div 
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div 
        className="driver-chat-card"
        style={{
          width: '100%',
          maxWidth: '430px',
          height: '80vh',
          background: '#ffffff',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
          animation: 'fadeIn 0.2s ease'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '16px', borderBottom: '1px solid #f4f4f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#09090b', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#09090b' }}>{customerName}</span>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></span>
              </div>
              <span style={{ fontSize: '0.725rem', color: '#71717a' }}>Customer • Active Move</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <a href="tel:+15553928190" style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#f4f4f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#09090b', textDecoration: 'none' }}>
              <Phone size={15} />
            </a>
            <button onClick={onClose} style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#f4f4f5', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <X size={16} color="#71717a" />
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {messages.map((msg) => {
            const isMe = msg.sender === 'driver';
            return (
              <div 
                key={msg.id}
                style={{
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMe ? 'flex-end' : 'flex-start'
                }}
              >
                <div 
                  style={{
                    padding: '10px 14px',
                    borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: isMe ? '#0052ff' : '#ffffff',
                    color: isMe ? '#ffffff' : '#09090b',
                    fontSize: '0.85rem',
                    lineHeight: 1.4,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    border: isMe ? 'none' : '1px solid #e2e8f0'
                  }}
                >
                  {msg.text}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px', fontSize: '0.65rem', color: '#94a3b8' }}>
                  <span>{msg.time}</span>
                  {isMe && <CheckCheck size={12} color="#0052ff" />}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Driver Presets */}
        <div style={{ padding: '8px 12px', background: '#ffffff', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '6px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
          {quickDriverReplies.map((reply, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(reply)}
              style={{
                padding: '6px 10px',
                borderRadius: '16px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                fontSize: '0.725rem',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              {reply}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{ padding: '12px 14px', background: '#ffffff', borderTop: '1px solid #f4f4f5', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <input 
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type message to Sarah..."
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: inputText.trim() ? '#0052ff' : '#e4e4e7',
              color: '#ffffff',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: inputText.trim() ? 'pointer' : 'default',
              transition: 'all 0.15s ease'
            }}
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}
