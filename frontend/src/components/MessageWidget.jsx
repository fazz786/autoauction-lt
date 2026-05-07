import { useState, useEffect, useRef } from 'react';
import { S } from '../styles/theme';
import { getMyChat, sendChatMsg } from '../api/chat';

export default function MessageWidget({ showToast }) {
  const [open,    setOpen]    = useState(false);
  const [msgs,    setMsgs]    = useState([]);
  const [body,    setBody]    = useState('');
  const [sending, setSending] = useState(false);
  const [unread,  setUnread]  = useState(0);
  const bottomRef = useRef(null);
  const pollRef   = useRef(null);
  const prevLen   = useRef(0);

  const fetchMsgs = async () => {
    try {
      const data = await getMyChat();
      const list = Array.isArray(data) ? data : [];
      setMsgs(list);
      if (!open) {
        const newUnread = list.filter(m => m.is_admin && !m.is_read).length;
        setUnread(newUnread);
      }
      // Auto-scroll only when new messages arrive
      if (list.length !== prevLen.current) {
        prevLen.current = list.length;
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60);
      }
    } catch (_) {}
  };

  useEffect(() => {
    fetchMsgs();
    pollRef.current = setInterval(fetchMsgs, 4000);
    return () => clearInterval(pollRef.current);
  }, []);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
    }
  }, [open]);

  const handleSend = async () => {
    const text = body.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      const msg = await sendChatMsg(text);
      setMsgs(prev => [...prev, msg]);
      setBody('');
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60);
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 900,
          width: 54, height: 54, borderRadius: '50%',
          background: open ? '#1e293b' : 'linear-gradient(135deg,#f59e0b,#d97706)',
          border: open ? '1px solid #334155' : 'none',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: open ? 26 : 22,
          color: open ? '#94a3b8' : '#fff',
          userSelect: 'none', transition: 'all 0.2s',
        }}
        title={open ? 'Close' : 'Message Admin'}
      >
        {open ? '×' : '✉'}
        {!open && unread > 0 && (
          <div style={{
            position: 'absolute', top: -4, right: -4,
            background: '#ef4444', color: '#fff', borderRadius: '50%',
            width: 20, height: 20, fontSize: 11, fontWeight: 700,
            fontFamily: 'system-ui',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{unread}</div>
        )}
      </div>

      {/* Chat popup */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 92, right: 28, zIndex: 900,
          width: 360, height: 500,
          background: '#0d1117', border: '1px solid #1e293b',
          borderRadius: 18, display: 'flex', flexDirection: 'column',
          boxShadow: '0 12px 48px rgba(0,0,0,0.7)',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '14px 18px', borderBottom: '1px solid #1e293b',
            background: '#080a10', flexShrink: 0,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: '#f59e0b22', border: '1px solid #f59e0b44',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16,
            }}>🛡</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Admin Support</div>
              <div style={{ fontSize: 11, color: '#22c55e', fontFamily: 'system-ui', marginTop: 1 }}>● Live chat</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 4px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {msgs.length === 0 && (
              <div style={{ color: '#475569', fontFamily: 'system-ui', fontSize: 13, textAlign: 'center', marginTop: 32 }}>
                No messages yet. Send one below!
              </div>
            )}
            {msgs.map(msg => {
              const isMe = !msg.is_admin;
              return (
                <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '78%',
                    background: isMe ? '#1e3a5f' : '#1a2e1a',
                    border: isMe ? 'none' : '1px solid #22c55e22',
                    borderRadius: isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    padding: '9px 13px',
                    fontSize: 13, fontFamily: 'system-ui', color: '#cbd5e1', lineHeight: 1.55,
                  }}>
                    {!isMe && <div style={{ fontSize: 10, color: '#22c55e', fontWeight: 700, marginBottom: 3, letterSpacing: 0.5 }}>ADMIN</div>}
                    {msg.body}
                    <div style={{ fontSize: 10, color: '#475569', marginTop: 4, textAlign: isMe ? 'right' : 'left' }}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '10px 12px', borderTop: '1px solid #1e293b', background: '#080a10', flexShrink: 0, display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <textarea
              rows={2}
              style={{ ...S.input, flex: 1, resize: 'none', fontSize: 13, padding: '9px 12px', borderRadius: 12 }}
              placeholder="Type a message…"
              value={body}
              onChange={e => setBody(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            />
            <button
              onClick={handleSend}
              disabled={sending || !body.trim()}
              style={{
                ...S.btn, ...S.btnPrimary,
                width: 40, height: 40, padding: 0, fontSize: 17, borderRadius: 12,
                opacity: (!body.trim() || sending) ? 0.4 : 1, flexShrink: 0,
              }}
            >➤</button>
          </div>
        </div>
      )}
    </>
  );
}
