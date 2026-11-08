import React, { useState, useRef, useEffect } from 'react';
import { Bot, Sparkles, Send, X, ArrowRight, Building2, MapPin, Minimize2, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { aiAPI } from '@/services/api';
import { useI18n } from '@/i18n';
import { getImageUrl } from '@/utils/imageUrl';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  quickLinks?: Array<{ label: string; url: string; external?: boolean }>;
  recommendations?: {
    listings?: any[];
    projects?: any[];
  };
}

const PRESET_PROMPTS = [
  '🏢 Шинэ төсөл, хотхонууд',
  '🛋️ Тавилга, интерьер газрууд',
  '🏞️ Газар, зуслангийн газрууд',
  '🏨 Хоногоор түрээслэх байр',
  '✨ Сайтын давуу талууд',
  '📝 Зар хэрхэн оруулах вэ?',
  '💎 Багцын үнэ, тариф',
  '📩 Имэйл мэдэгдлийн тухай',
  'Хан-Уул 2 өрөө байр',
  '📱 Утас баталгаажуулах',
  '🎬 15s Reels бичлэгийн тухай',
  '📞 Холбоо барих мэдээлэл',
];

export const VmaxAIChat: React.FC = () => {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Сайн байна уу! 👋 Би Vmax ухаалаг туслах байна.\n\nБи танд дараах чиглэлээр тусалж чадна:\n• 🏢 **Шинэ төсөл, хотхонууд** (Ашиглалтад орох хугацаа, 6% ипотек)\n• 🛋️ **Тавилга & Интерьер газрууд** (Дэлгүүрийн каталог, профайл)\n• 🏞️ **Газар, зуслангийн байршлууд** (Өмчлөх, эзэмших эрхтэй газрууд)\n• 🏨 **Хоногоор түрээслэх (Daily Rent)** & богино хугацааны захиалга\n• 🏠 **Үл хөдлөх хөрөнгө хайх** (Борлуулах, түрээслэх орон сууц, хаус)\n• ✨ **Сайтын давуу талууд, үнийн багц, зар нийтлэх заавар**\n\nТанд юугаар туслах вэ?',
      quickLinks: [
        { label: '🏢 Шинэ төслүүд', url: '/projects' },
        { label: '🛋️ Тавилгын каталог', url: '/furniture' },
        { label: '🏞️ Газрын бүх зарууд', url: '/?category=LAND' },
        { label: '🏨 Хоногоор түрээслэх', url: '/?type=DAILY_RENT' },
        { label: '📝 Зар оруулах', url: '/create-listing' },
        { label: '💎 Үнийн багц', url: '/pricing' },
      ],
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInput('');
    setLoading(true);

    try {
      const res = await aiAPI.chat({ message: textToSend });
      const aiReply: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: res.data.reply,
        quickLinks: res.data.quickLinks,
        recommendations: res.data.recommendations,
      };
      setMessages((prev) => [...prev, aiReply]);
    } catch (err) {
      const errorReply: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: t.aiAssistant.networkError,
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating AI Launcher Button */}
      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-3.5 sm:px-4 sm:py-3.5 rounded-full bg-gradient-to-r from-plasma via-nova to-pink-500 text-white text-white-force shadow-xl shadow-plasma/40 flex items-center gap-2 border border-white/25 cursor-pointer backdrop-blur-md group"
          aria-label={t.aiAssistant.buttonLabel}
        >
          <div className="relative">
            <Bot size={22} className="text-white text-white-force group-hover:rotate-12 transition-transform" />
            <Sparkles size={11} className="absolute -top-1.5 -right-1.5 text-yellow-300 animate-pulse" />
          </div>
          <span className="hidden sm:inline font-bold text-sm tracking-wide text-white text-white-force">
            {t.aiAssistant.buttonLabel}
          </span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-white/40 animate-ping absolute -top-1 -right-1" />
        </motion.button>
      </div>

      {/* AI Chat Modal Dialog */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 md:bottom-20 right-2 md:right-6 w-[94vw] sm:w-[420px] h-[580px] max-h-[80vh] rounded-3xl bg-white/95 dark:bg-void/95 backdrop-blur-2xl border border-slate-200 dark:border-white/15 shadow-2xl z-50 flex flex-col overflow-hidden text-slate-900 dark:text-starlight"
          >
            {/* Header */}
            <div className="p-4 bg-slate-100 dark:bg-void/80 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-plasma to-nova flex items-center justify-center text-white text-white-force shadow-md shadow-plasma/30">
                  <Bot size={20} className="text-white text-white-force" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-heading font-black text-sm text-slate-900 dark:text-white">
                      {t.aiAssistant.advisorTitle}
                    </h3>
                    <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase bg-plasma/15 text-plasma border border-plasma/25">
                      {t.aiAssistant.versionBadge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-nebula-text flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {t.aiAssistant.onlineStatus}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-nebula-text hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs sm:text-sm">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 whitespace-pre-wrap leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-gradient-to-r from-plasma to-nova text-white text-white-force shadow-md shadow-plasma/20 rounded-br-none font-medium'
                        : 'bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-starlight rounded-bl-none shadow-sm'
                    }`}
                  >
                    {m.text}

                    {/* Quick Link Action Pills */}
                    {m.quickLinks && m.quickLinks.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-slate-200/60 dark:border-white/10">
                        {m.quickLinks.map((link, idx) => (
                          link.external ? (
                            <a
                              key={idx}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-plasma/10 hover:bg-plasma/20 text-plasma border border-plasma/30 transition-all cursor-pointer shadow-sm hover:scale-102"
                            >
                              <span>{link.label}</span>
                              <ArrowRight size={12} />
                            </a>
                          ) : (
                            <Link
                              key={idx}
                              to={link.url}
                              onClick={() => setIsOpen(false)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-plasma/15 to-nova/15 hover:from-plasma hover:to-nova hover:text-white dark:hover:text-white text-plasma dark:text-plasma border border-plasma/30 transition-all cursor-pointer shadow-sm group hover:scale-102"
                            >
                              <span>{link.label}</span>
                              <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                          )
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recommendation Cards Carousel */}
                  {m.recommendations && (
                    <div className="w-full mt-3 space-y-2.5">
                      {/* Projects Carousel */}
                      {m.recommendations.projects && m.recommendations.projects.length > 0 && (
                        <div>
                          <span className="text-[11px] font-bold text-plasma uppercase tracking-wider block mb-1.5">
                            🏢 Шинэ төслүүд
                          </span>
                          <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
                            {m.recommendations.projects.map((proj) => (
                              <Link
                                key={proj.id}
                                to={`/projects/${proj.id}`}
                                onClick={() => setIsOpen(false)}
                                className="w-48 shrink-0 rounded-xl bg-slate-50 dark:bg-void/80 border border-slate-200 dark:border-white/10 overflow-hidden hover:border-plasma transition-all shadow-sm group"
                              >
                                <div className="h-24 w-full overflow-hidden bg-slate-200 relative">
                                  <img
                                    src={proj.coverImage || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600'}
                                    alt={proj.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  />
                                  <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md text-[9px] font-bold bg-black/75 text-white text-white-force">
                                    {proj.district}
                                  </span>
                                </div>
                                <div className="p-2 space-y-1">
                                  <h4 className="font-bold text-xs truncate text-slate-900 dark:text-white group-hover:text-plasma">
                                    {proj.name}
                                  </h4>
                                  <p className="text-[10px] text-plasma font-extrabold truncate">
                                    {proj.startingPrice ? `${(Number(proj.startingPrice) / 1000000).toFixed(0)} сая ₮-өөс` : 'Тохиролцоно'}
                                  </p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Listings Carousel */}
                      {m.recommendations.listings && m.recommendations.listings.length > 0 && (
                        <div>
                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1.5">
                            🏠 Онцлох зарууд
                          </span>
                          <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
                            {m.recommendations.listings.map((item) => (
                              <Link
                                key={item.id}
                                to={`/listings/${item.id}`}
                                onClick={() => setIsOpen(false)}
                                className="w-48 shrink-0 rounded-xl bg-slate-50 dark:bg-void/80 border border-slate-200 dark:border-white/10 overflow-hidden hover:border-plasma transition-all shadow-sm group"
                              >
                                <div className="h-24 w-full overflow-hidden bg-slate-200 relative">
                                  <img
                                    src={getImageUrl(item.images?.[0]) || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600'}
                                    alt={item.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  />
                                  <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md text-[9px] font-bold bg-black/75 text-white text-white-force">
                                    {item.district}
                                  </span>
                                </div>
                                <div className="p-2 space-y-1">
                                  <h4 className="font-bold text-xs truncate text-slate-900 dark:text-white group-hover:text-plasma">
                                    {item.title}
                                  </h4>
                                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold truncate">
                                    {Number(item.price).toLocaleString()} ₮
                                  </p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-slate-500 dark:text-nebula-text text-xs">
                  <div className="w-6 h-6 rounded-lg bg-plasma/20 flex items-center justify-center text-plasma animate-spin">
                    <Sparkles size={14} />
                  </div>
                  <span>{t.aiAssistant.searching}</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Preset Suggested Questions */}
            {messages.length <= 2 && (
              <div className="px-4 py-2 border-t border-slate-200 dark:border-white/10 flex gap-1.5 overflow-x-auto scrollbar-none">
                {PRESET_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSend(prompt)}
                    className="whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] font-medium bg-slate-100 hover:bg-plasma/10 hover:text-plasma dark:bg-white/5 dark:hover:bg-plasma/20 text-slate-700 dark:text-nebula-text border border-slate-200 dark:border-white/10 transition-all cursor-pointer"
                  >
                    ✨ {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <div className="p-3 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-void/50 flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={t.aiAssistant.inputPlaceholder}
                disabled={loading}
                className="flex-1 bg-white dark:bg-void/80 border border-slate-200 dark:border-white/15 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-plasma transition-colors"
              />
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className="p-2.5 rounded-2xl bg-gradient-to-r from-plasma to-nova text-white text-white-force disabled:opacity-40 shadow-md shadow-plasma/30 hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
              >
                <Send size={16} className="text-white text-white-force" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
