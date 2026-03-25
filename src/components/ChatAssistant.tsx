import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send } from 'lucide-react';
import { api } from '../api/client';
import { useLearnerTier } from '../hooks/useLearnerTier';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const INITIAL_MESSAGE: Message = {
  role: 'assistant',
  content: 'What would you like to learn or understand better? I can explain cybersecurity concepts, help with policy questions, or clarify anything from your training material.',
};

export default function ChatAssistant() {
  const location = useLocation();
  const { tier, loading } = useLearnerTier();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, busy]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  if (loading || tier === 'free') return null;
  if (
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/kb') ||
    location.pathname.startsWith('/ttx')
  ) return null;

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    const userMsg: Message = { role: 'user', content: trimmed };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setBusy(true);
    try {
      const res = await api.learn.chat(updated);
      setMessages(prev => [...prev, { role: 'assistant', content: res.content }]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: "I'm having trouble connecting right now. Please try again." },
      ]);
    } finally {
      setBusy(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <>
      {/* Full-height side panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop (mobile) */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 sm:hidden"
              style={{ background: 'rgba(0,0,0,0.5)' }}
              onClick={() => setOpen(false)}
            />

            <motion.div
              key="panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 36, mass: 0.9 }}
              className="fixed top-0 right-0 bottom-0 z-50 flex flex-col w-full sm:w-[420px]"
              style={{
                background: 'var(--bg-surface)',
                borderLeft: '1px solid var(--border-gold)',
                boxShadow: '-8px 0 40px rgba(0,0,0,0.35)',
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--gold-muted)', border: '1px solid var(--border-gold)' }}
                  >
                    <Bot size={15} style={{ color: 'var(--gold-accent)' }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-none" style={{ color: 'var(--text-primary)' }}>
                      Learning Assistant
                    </p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      Knowledge-grounded · Paid access
                    </p>
                  </div>
                  <div className="ml-1 w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--gold-accent)' }} />
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-full transition-opacity hover:opacity-60"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Messages */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0"
              >
                <AnimatePresence initial={false}>
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className="max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
                        style={
                          msg.role === 'user'
                            ? { background: 'var(--gold-accent)', color: '#000', borderBottomRightRadius: '4px' }
                            : {
                                background: 'var(--bg-elevated)',
                                border: '1px solid var(--border-subtle)',
                                color: 'var(--text-secondary)',
                                borderBottomLeftRadius: '4px',
                              }
                        }
                      >
                        {msg.content}
                      </div>
                    </motion.div>
                  ))}

                  {busy && (
                    <motion.div
                      key="typing"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex justify-start"
                    >
                      <div
                        className="rounded-2xl px-4 py-3 flex items-center gap-1.5"
                        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
                      >
                        {[0, 1, 2].map(i => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 rounded-full"
                            style={{ background: 'var(--gold-accent)' }}
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.1, delay: i * 0.22, repeat: Infinity }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Input */}
              <div
                className="px-4 py-4 border-t flex-shrink-0"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    rows={2}
                    placeholder="Ask about any topic… (Enter to send, Shift+Enter for newline)"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    disabled={busy}
                    className="flex-1 text-sm px-3 py-2.5 rounded-xl outline-none resize-none disabled:opacity-50"
                    style={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      lineHeight: '1.5',
                    }}
                  />
                  <button
                    onClick={() => send(input)}
                    disabled={!input.trim() || busy}
                    className="p-3 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                    style={{ background: 'var(--gold-accent)', color: '#000' }}
                  >
                    <Send size={15} />
                  </button>
                </div>
                <p className="text-[10px] mt-2 text-center" style={{ color: 'var(--text-dim)' }}>
                  Responses grounded in logistics cybersecurity knowledge base
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toggle button — fixed bottom-right */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.05 }}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg text-sm font-semibold"
        style={{
          background: open ? 'var(--bg-elevated)' : 'var(--gold-accent)',
          color: open ? 'var(--gold-accent)' : '#000',
          border: open ? '1px solid var(--border-gold)' : 'none',
          boxShadow: open ? 'none' : 'var(--glow-gold)',
        }}
      >
        {open ? <X size={16} /> : <Bot size={16} />}
        <span>{open ? 'Close' : 'Ask AI'}</span>
      </motion.button>
    </>
  );
}
