import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { X, Send, MessageSquare, LogIn, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { eventsApi } from '@/services/eventsApi';
import type { EventVenue, EventMessageItem } from '@/types/events';
import { useAuthStore } from '@/store/useAuthStore';
import { useI18n } from '@/i18n';

interface EventChatModalProps {
  venue: Pick<EventVenue, 'id' | 'name'>;
  isOpen: boolean;
  onClose: () => void;
  customerUserId?: string;
  customerName?: string;
}

export const EventChatModal: React.FC<EventChatModalProps> = ({
  venue,
  isOpen,
  onClose,
  customerUserId,
  customerName,
}) => {
  const { user, isAuthenticated } = useAuthStore();
  const { lang } = useI18n();
  const [messages, setMessages] = useState<EventMessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = async (silent = false) => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }
    if (!silent) setLoading(true);
    try {
      const res = await eventsApi.getMessages(venue.id, customerUserId);
      setMessages(Array.isArray(res.data) ? res.data : []);
      if (!silent) {
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60);
      }
    } catch (err) {
      console.error('Failed to load event chat:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    loadMessages();
    const interval = setInterval(() => loadMessages(true), 4000);
    return () => clearInterval(interval);
  }, [isOpen, venue.id, customerUserId, isAuthenticated]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = text.trim();
    if (!content || sending) return;
    setSending(true);
    try {
      const res = await eventsApi.sendMessage(venue.id, content, customerUserId);
      setMessages((prev) => [...prev, res.data]);
      setText('');
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 40);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            className="w-full max-w-md rounded-2xl bg-void border border-white/15 shadow-2xl overflow-hidden flex flex-col h-[520px] max-h-[88vh]"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-plasma to-aurora flex items-center justify-center text-white flex-shrink-0">
                  <MessageSquare size={17} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-starlight truncate">
                    {customerName ? `${customerName} • ${venue.name}` : venue.name}
                  </h3>
                  <p className="text-[11px] text-nebula-text">
                    {lang === 'en' ? 'Direct Venue Chat' : 'Байгууллагатай шууд чатлах'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Хаах"
                className="p-2 rounded-xl bg-slate-200/80 dark:bg-white/10 text-slate-700 dark:text-starlight hover:bg-slate-300 dark:hover:bg-white/20 transition-colors cursor-pointer flex-shrink-0"
              >
                <X size={17} />
              </button>
            </div>

            {/* Body */}
            {!isAuthenticated ? (
              <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4">
                <LogIn size={32} className="text-plasma" />
                <p className="text-sm text-nebula-text">
                  {lang === 'en'
                    ? 'Please sign in to chat directly with this venue.'
                    : 'Шууд чат бичихийн тулд эхлээд нэвтэрнэ үү.'}
                </p>
                <Link
                  to={`/login?redirect=${encodeURIComponent(window.location.pathname)}`}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-plasma to-nova text-white text-xs font-bold"
                >
                  {lang === 'en' ? 'Sign In' : 'Нэвтрэх'}
                </Link>
              </div>
            ) : loading ? (
              <div className="flex-1 flex items-center justify-center text-nebula-text">
                <Loader2 size={24} className="animate-spin text-plasma" />
              </div>
            ) : (
              <>
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {messages.length === 0 ? (
                    <div className="text-center text-xs text-nebula-text py-10">
                      {lang === 'en'
                        ? 'Ask about available dates, menu, or pricing...'
                        : 'Сул өдөр, меню, багцын үнийн талаар шууд асуугаарай...'}
                    </div>
                  ) : (
                    messages.map((m) => {
                      const isMine = customerUserId
                        ? m.senderRole === 'OWNER'
                        : m.senderRole === 'CUSTOMER';
                      return (
                        <div
                          key={m.id}
                          className={`flex flex-col ${
                            isMine ? 'items-end' : 'items-start'
                          }`}
                        >
                          <span className="text-[10px] text-nebula-text mb-0.5 px-1">
                            {m.senderName}
                          </span>
                          <div
                            className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed ${
                              isMine
                                ? 'bg-gradient-to-r from-plasma to-nova text-white rounded-br-sm'
                                : 'bg-white/10 text-starlight border border-white/10 rounded-bl-sm'
                            }`}
                          >
                            {m.content}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={bottomRef} />
                </div>

                <form
                  onSubmit={handleSend}
                  className="p-3 border-t border-white/10 bg-white/5 flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={
                      lang === 'en' ? 'Type a message...' : 'Зурвас бичих...'
                    }
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-starlight focus:outline-none focus:border-plasma"
                  />
                  <button
                    type="submit"
                    disabled={sending || !text.trim()}
                    className="p-2.5 rounded-xl bg-gradient-to-r from-plasma to-aurora text-white disabled:opacity-50 cursor-pointer"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
