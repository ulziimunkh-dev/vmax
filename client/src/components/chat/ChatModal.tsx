import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ArrowLeft,
  Send,
  MessageSquare,
  Sparkles,
  Phone,
  Check,
  CheckCheck,
  User as UserIcon,
  LogIn,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  Smile,
  Trash2,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useI18n } from '@/i18n';
import { chatAPI, uploadsAPI, listingsAPI } from '@/services/api';
import { getImageUrl } from '@/utils/imageUrl';
import type { Listing, Conversation, ChatMessage } from '@/types';
import { Link } from 'react-router-dom';

const CHAT_EMOJIS = [
  '👋', '😊', '🤝', '👍', '❤️', '✨', '🔥', '🎉', '👏', '🙏', '💯', '👌',
  '🏠', '🔑', '🏢', '🛋️', '🚿', '📍', '🚗', '🌲', '🏔️', '🛎️', '🏷️', '📦',
  '💵', '📄', '✍️', '📅', '⏰', '🕒', '📞', '💬', '💡', '✅', '⭐', '☀️',
];

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing;
  initialMessage?: string;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  listing,
  initialMessage,
}) => {
  const { user } = useAuthStore();
  const { t } = useI18n();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [inputText, setInputText] = useState(initialMessage || '');
  const [errorMsg, setErrorMsg] = useState('');

  // Attached image & emoji picker
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<any>(null);

  const quickQuestions = [
    t.chat.q1,
    t.chat.q2,
    t.chat.q3,
    t.chat.q4,
  ];

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior,
      });
    }
  };

  const fetchMessages = async (convId: string, isSilent = false) => {
    try {
      const res = await chatAPI.getMessages(convId);
      if (res.data) {
        setConversation(res.data.conversation);
        setMessages(res.data.messages || []);
        if (!isSilent) {
          setTimeout(scrollToBottom, 50);
        }
      }
    } catch (err: any) {
      if (!isSilent) {
        console.error('Failed to load chat messages:', err);
      }
    }
  };

  const initChat = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await chatAPI.startConversation(listing.id, initialMessage);
      const conv = res.data;
      setConversation(conv);
      if (conv?.id) {
        await fetchMessages(conv.id);
      }
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message || 'Чат холболт үүсгэхэд алдаа гарлаа.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      initChat();
      setTimeout(() => inputRef.current?.focus(), 300);
    } else {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      setAttachedImage(null);
      setShowEmojiPicker(false);
    }
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [isOpen, listing.id]);

  // Polling for new messages every 3.5 seconds
  useEffect(() => {
    if (isOpen && conversation?.id) {
      pollIntervalRef.current = setInterval(() => {
        fetchMessages(conversation.id, true);
      }, 3500);
      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
      };
    }
  }, [isOpen, conversation?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close emoji picker on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        showEmojiPicker &&
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showEmojiPicker]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend !== undefined ? textToSend : inputText).trim();
    if ((!text && !attachedImage) || !conversation?.id || sending) return;

    setSending(true);
    setErrorMsg('');
    const imgUrl = attachedImage || undefined;
    try {
      const res = await chatAPI.sendMessage(conversation.id, text, imgUrl);
      setMessages((prev) => [...prev, res.data]);
      setInputText('');
      setAttachedImage(null);
      setShowEmojiPicker(false);
      setTimeout(() => scrollToBottom('smooth'), 50);
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message || 'Зурвас илгээхэд алдаа гарлаа.'
      );
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleSendMessage();
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = '';
    setUploadingImage(true);
    try {
      const res = await uploadsAPI.uploadFile(file);
      const url = res.data?.url || res.data?.urls?.[0];
      if (url) {
        setAttachedImage(url);
      }
    } catch (err) {
      console.error('Failed to upload image:', err);
      setErrorMsg('Зураг хуулахад алдаа гарлаа. Та дахин оролдоно уу.');
    } finally {
      setUploadingImage(false);
    }
  };

  const addEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  const handleDeleteConversation = async () => {
    if (!conversation?.id) return;
    if (
      !window.confirm(
        'Энэ харилцан яриаг бүх зурвасын хамт устгах уу? Энэ үйлдлийг буцаах боломжгүй.'
      )
    ) {
      return;
    }

    try {
      await chatAPI.deleteConversation(conversation.id);
      onClose();
    } catch (err) {
      console.error('Failed to delete conversation:', err);
      alert('Чат устгахад алдаа гарлаа.');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!conversation?.id) return;
    if (!window.confirm('Энэ зурвасыг устгах уу?')) {
      return;
    }

    try {
      await chatAPI.deleteMessage(conversation.id, messageId);
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    } catch (err) {
      console.error('Failed to delete message:', err);
      alert('Зурвас устгахад алдаа гарлаа.');
    }
  };

  const handleCallClick = () => {
    if (!listing?.id) return;
    try {
      listingsAPI.revealPhone(listing.id, user);
    } catch (err) {
      console.error('Failed to log reveal phone:', err);
    }
  };

  if (!isOpen) return null;

  // Determine counterpart (the other party in the chat)
  const isMeHost = Boolean(user?.id && (listing.userId === user.id || conversation?.hostId === user.id));
  const counterpartUser = isMeHost ? conversation?.renter : (conversation?.host || listing.user);
  const counterpartRole = isMeHost ? t.chat.renterRole : t.chat.hostRole;

  // Display name from listing table (listing.contactName or attributes) or user account
  const rawUserName = isMeHost
    ? conversation?.renter?.name || conversation?.renter?.phone
    : (listing.contactName || listing.attributes?.contactName || listing.attributes?.seller || counterpartUser?.name);

  const displayName =
    rawUserName && rawUserName !== 'AI Test User'
      ? rawUserName
      : isMeHost
      ? 'Түрээслэгч'
      : (listing.contactName || listing.attributes?.seller || 'Зарын эзэн');

  const listingPhone =
    listing.contactPhone ||
    listing.attributes?.contactPhone ||
    listing.attributes?.phone ||
    counterpartUser?.phone;

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-void/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full sm:max-w-xl h-[100dvh] sm:h-[85vh] sm:max-h-[720px] flex flex-col bg-white dark:bg-slate-900 border-0 sm:border border-slate-200/80 dark:border-plasma/30 rounded-none sm:rounded-3xl shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100"
          >
            {/* Clean, Streamlined Header */}
            <div className="flex-shrink-0 px-4 py-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between z-10 pt-[max(env(safe-area-inset-top),12px)] sm:pt-3">
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                {/* Mobile Back Button */}
                <button
                  onClick={onClose}
                  className="p-1.5 -ml-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors sm:hidden flex-shrink-0 cursor-pointer"
                  aria-label="Буцах"
                >
                  <ArrowLeft size={20} />
                </button>

                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-plasma via-indigo-600 to-aurora p-0.5 shadow-sm">
                    <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                      {counterpartUser?.avatarUrl ? (
                        <img
                          src={getImageUrl(counterpartUser.avatarUrl)}
                          alt={displayName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserIcon size={18} className="text-plasma" />
                      )}
                    </div>
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                </div>

                {/* User Name & Listing Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                      {displayName}
                    </h3>
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-plasma/10 text-plasma dark:bg-plasma/25 dark:text-plasma-light rounded-full border border-plasma/20 flex-shrink-0">
                      {counterpartRole}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    <span className="truncate max-w-[170px] xs:max-w-[220px] sm:max-w-[280px]">
                      {listing.title}
                    </span>
                    <span className="text-plasma dark:text-plasma-light font-bold flex-shrink-0">
                      ₮{Number(listing.price).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Header Actions */}
              <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                {listingPhone && (
                  <a
                    href={`tel:${listingPhone}`}
                    onClick={handleCallClick}
                    className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-colors flex items-center space-x-1 cursor-pointer"
                    title={`Зар дээрх дугаар руу залгах: ${listingPhone}`}
                  >
                    <Phone size={14} className="text-emerald-500" />
                    <span className="hidden sm:inline">{listingPhone}</span>
                  </a>
                )}

                {conversation?.id && (
                  <button
                    type="button"
                    onClick={handleDeleteConversation}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                    title="Энэ харилцан яриаг устгах"
                  >
                    <Trash2 size={17} />
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="hidden sm:flex p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Хаах"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Messages Body */}
            <div
              ref={messagesContainerRef}
              className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 sm:p-4 space-y-3 bg-slate-100/60 dark:bg-slate-950"
            >
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                  <Loader2 size={28} className="animate-spin text-plasma" />
                  <span className="text-xs">{t.common.loading}</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="w-13 h-13 rounded-2xl bg-plasma/10 flex items-center justify-center text-plasma shadow-sm">
                    <MessageSquare size={24} />
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                      {displayName}-тэй чатлах
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                      {t.chat.noMessages}
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === user?.id;
                  const timeStr = new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col group ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        style={isMe ? { color: '#ffffff' } : undefined}
                        className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed break-words shadow-sm ${
                          isMe
                            ? 'chat-bubble-me bg-gradient-to-r from-plasma via-indigo-600 to-plasma text-white-force rounded-tr-xs shadow-md shadow-plasma/25'
                            : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/90 dark:border-white/10 rounded-tl-xs shadow-sm'
                        }`}
                      >
                        {/* Attached Image Preview */}
                        {msg.imageUrl && (
                          <div className="mb-2 overflow-hidden rounded-xl bg-black/10">
                            <img
                              src={getImageUrl(msg.imageUrl)}
                              alt="Хавсаргасан зураг"
                              onClick={() => setLightboxImage(getImageUrl(msg.imageUrl!))}
                              className="max-h-60 sm:max-h-68 w-full object-cover cursor-pointer hover:opacity-95 transition-all rounded-xl"
                              loading="lazy"
                            />
                          </div>
                        )}

                        {/* Text Content */}
                        {msg.content && msg.content !== '📷 Зураг' && (
                          <p
                            style={isMe ? { color: '#ffffff' } : undefined}
                            className={isMe ? 'text-white-force whitespace-pre-wrap font-medium' : 'whitespace-pre-wrap'}
                          >
                            {msg.content}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center space-x-1 mt-1 px-1 text-[10px] text-slate-400">
                        <span>{timeStr}</span>
                        {isMe && (
                          <span>
                            {msg.isRead ? (
                              <CheckCheck size={13} className="text-sky-400 font-bold" />
                            ) : (
                              <Check size={13} className="text-slate-400" />
                            )}
                          </span>
                        )}
                        {isMe && (
                          <button
                            type="button"
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-rose-500 transition-opacity cursor-pointer ml-1"
                            title="Зурвас устгах"
                          >
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Question Chips (Scrollable) */}
            {user && !loading && (
              <div className="flex-shrink-0 px-3 sm:px-4 py-2 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200/70 dark:border-white/5 overflow-x-auto no-scrollbar flex items-center space-x-2">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center space-x-1 flex-shrink-0">
                  <Sparkles size={12} className="text-plasma" />
                  <span className="hidden sm:inline">Асуух:</span>
                </span>
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    disabled={sending}
                    className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-plasma/15 dark:bg-white/5 dark:hover:bg-plasma/20 border border-slate-200 dark:border-white/10 hover:border-plasma/40 text-slate-700 dark:text-slate-300 hover:text-plasma dark:hover:text-plasma-light rounded-full whitespace-nowrap transition-all duration-150 flex-shrink-0 cursor-pointer disabled:opacity-50 active:scale-95"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Attached Photo Preview Above Input Bar */}
            {attachedImage && (
              <div className="px-3 sm:px-4 py-2 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-white/10 flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={getImageUrl(attachedImage)}
                    alt="Сонгосон зураг"
                    className="w-13 h-13 rounded-xl object-cover border border-plasma shadow-sm"
                  />
                  <button
                    onClick={() => setAttachedImage(null)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md cursor-pointer hover:bg-rose-600"
                  >
                    <X size={12} />
                  </button>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  <p className="font-semibold">{t.chat.photoAttached}</p>
                  <p className="text-[11px] text-slate-400">Зурвасын хамт илгээгдэнэ</p>
                </div>
              </div>
            )}

            {/* Floating Emoji Picker Popover */}
            {showEmojiPicker && (
              <div
                ref={emojiPickerRef}
                className="px-3 sm:px-4 py-2.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-white/10 shadow-lg z-30 animate-in fade-in slide-in-from-bottom-2 duration-150"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center space-x-1">
                    <Sparkles size={13} className="text-plasma" />
                    <span>Эможи сонгох</span>
                  </span>
                  <button
                    onClick={() => setShowEmojiPicker(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-8 sm:grid-cols-12 gap-1 max-h-36 overflow-y-auto p-1">
                  {CHAT_EMOJIS.map((emoji, idx) => (
                    <button
                      key={idx}
                      onClick={() => addEmoji(emoji)}
                      className="text-xl p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-transform active:scale-90 flex items-center justify-center cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mobile-optimized Footer Input Bar - ALWAYS VISIBLE */}
            <div className="flex-shrink-0 p-2.5 sm:p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-white/10 pb-[max(env(safe-area-inset-bottom),10px)] z-20">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handleImageFileChange}
                className="hidden"
              />

              {errorMsg && (
                <p className="text-xs text-rose-500 dark:text-rose-400 mb-2 px-1 flex items-center space-x-1">
                  <AlertCircle size={12} />
                  <span>{errorMsg}</span>
                </p>
              )}

              {!user ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Чат бичихийн тулд нэвтэрнэ үү..."
                    readOnly
                    onClick={() => {
                      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
                    }}
                    className="flex-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/15 rounded-2xl px-4 py-3 sm:py-2.5 text-base sm:text-sm text-slate-400 cursor-pointer"
                  />
                  <Link
                    to={`/login?redirect=${encodeURIComponent(window.location.pathname)}`}
                    className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-plasma to-aurora text-white font-bold text-sm shadow-md shadow-plasma/30 whitespace-nowrap flex-shrink-0 flex items-center space-x-1.5 active:scale-95 transition-all cursor-pointer"
                  >
                    <LogIn size={16} />
                    <span>Нэвтрэх</span>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center space-x-1.5 sm:space-x-2">
                  {/* Photo Upload Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage || sending}
                    className="w-10 h-10 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-plasma dark:hover:text-plasma-light hover:bg-slate-100 dark:hover:bg-white/10 transition-colors flex items-center justify-center flex-shrink-0 cursor-pointer disabled:opacity-40"
                    title={t.chat.uploadPhoto}
                    aria-label={t.chat.uploadPhoto}
                  >
                    {uploadingImage ? (
                      <Loader2 size={18} className="animate-spin text-plasma" />
                    ) : (
                      <ImageIcon size={19} />
                    )}
                  </button>

                  {/* Emoji Button */}
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                    className={`w-10 h-10 rounded-2xl transition-colors flex items-center justify-center flex-shrink-0 cursor-pointer ${
                      showEmojiPicker
                        ? 'bg-plasma/15 text-plasma dark:bg-plasma/25'
                        : 'text-slate-500 dark:text-slate-400 hover:text-plasma dark:hover:text-plasma-light hover:bg-slate-100 dark:hover:bg-white/10'
                    }`}
                    title={t.chat.selectEmoji}
                    aria-label={t.chat.selectEmoji}
                  >
                    <Smile size={19} />
                  </button>

                  {/* Text Input */}
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={attachedImage ? 'Тайлбар бичих (сонголттой)...' : t.chat.typeMessage}
                    disabled={sending || loading}
                    className="flex-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/15 focus:border-plasma focus:bg-white dark:focus:bg-slate-950 rounded-2xl px-4 py-2.5 sm:py-2.5 text-base sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-colors"
                  />

                  {/* Send Button */}
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={(!inputText.trim() && !attachedImage) || sending || loading}
                    className="w-11 h-11 rounded-2xl bg-gradient-to-r from-plasma to-aurora text-white hover:opacity-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-plasma/30 flex items-center justify-center flex-shrink-0 cursor-pointer active:scale-90"
                    aria-label="Илгээх"
                  >
                    {sending ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Send size={18} />
                    )}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* Lightbox Modal for Photo Preview */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={lightboxImage}
              alt="Томруулсан зураг"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors shadow-lg cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
