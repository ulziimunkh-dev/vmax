import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Phone,
  User as UserIcon,
  Check,
  CheckCheck,
  Loader2,
  ExternalLink,
  ArrowLeft,
  Image as ImageIcon,
  Smile,
  X,
  Search,
  Sparkles,
  Inbox,
  SendHorizonal,
  Layers,
  Trash2,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useI18n } from '@/i18n';
import { chatAPI, uploadsAPI, listingsAPI } from '@/services/api';
import { getImageUrl } from '@/utils/imageUrl';
import type { Conversation, ChatMessage } from '@/types';
import { Link } from 'react-router-dom';

const CHAT_EMOJIS = [
  '👋', '😊', '🤝', '👍', '❤️', '✨', '🔥', '🎉', '👏', '🙏', '💯', '👌',
  '🏠', '🔑', '🏢', '🛋️', '🚿', '📍', '🚗', '🌲', '🏔️', '🛎️', '🏷️', '📦',
  '💵', '📄', '✍️', '📅', '⏰', '🕒', '📞', '💬', '💡', '✅', '⭐', '☀️',
];

export const DashboardMessages: React.FC = () => {
  const { user } = useAuthStore();
  const { t } = useI18n();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [chatFilter, setChatFilter] = useState<'all' | 'unread' | 'inbox' | 'sent'>('all');
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  // Photo upload & preview state
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<any>(null);

  // Strictly sort conversations by most recently sent message (lastMessageAt DESC)
  const sortConversationsByRecent = (list: Conversation[]) => {
    return [...list].sort((a, b) => {
      const timeA = new Date(a.lastMessageAt || a.updatedAt || a.createdAt || 0).getTime();
      const timeB = new Date(b.lastMessageAt || b.updatedAt || b.createdAt || 0).getTime();
      return timeB - timeA;
    });
  };

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior,
      });
    }
  };

  const fetchConversations = async (isSilent = false) => {
    try {
      if (!isSilent) setLoadingList(true);
      const res = await chatAPI.getConversations();
      const list = res.data || [];
      const sorted = sortConversationsByRecent(list);
      setConversations(sorted);

      // Auto-select first conversation on desktop if none selected
      if (!activeConvId && sorted.length > 0 && window.innerWidth >= 768) {
        setActiveConvId(sorted[0].id);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      if (!isSilent) setLoadingList(false);
    }
  };

  const fetchActiveMessages = async (convId: string, isSilent = false) => {
    try {
      if (!isSilent) setLoadingMessages(true);
      const res = await chatAPI.getMessages(convId);
      if (res.data) {
        setMessages(res.data.messages || []);
        if (!isSilent) {
          setTimeout(() => {
            scrollToBottom('smooth');
          }, 60);
        }
      }
    } catch (err) {
      console.error('Failed to load messages for conversation:', convId, err);
    } finally {
      if (!isSilent) setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConvId) {
      fetchActiveMessages(activeConvId);
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [activeConvId]);

  // Live polling every 3 seconds
  useEffect(() => {
    pollIntervalRef.current = setInterval(() => {
      fetchConversations(true);
      if (activeConvId) {
        fetchActiveMessages(activeConvId, true);
      }
    }, 3000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [activeConvId]);

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
    if ((!text && !attachedImage) || !activeConvId || sending) return;

    setSending(true);
    const imgUrl = attachedImage || undefined;
    try {
      const res = await chatAPI.sendMessage(activeConvId, text, imgUrl);
      setMessages((prev) => [...prev, res.data]);
      setInputText('');
      setAttachedImage(null);
      setShowEmojiPicker(false);

      // Immediately move active conversation to top with latest timestamp
      setConversations((prev) => {
        const now = new Date().toISOString();
        const updated = prev.map((c) =>
          c.id === activeConvId
            ? {
                ...c,
                lastMessage: imgUrl ? (text ? `📷 ${text}` : '📷 Зураг илгээсэн') : text,
                lastMessageAt: now,
                lastMessageSenderId: user?.id,
              }
            : c
        );
        return sortConversationsByRecent(updated);
      });

      fetchConversations(true);
      setTimeout(() => {
        scrollToBottom('smooth');
      }, 50);
    } catch (err) {
      console.error('Failed to send message:', err);
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
      alert('Зураг хуулахад алдаа гарлаа. Та дахин оролдоно уу.');
    } finally {
      setUploadingImage(false);
    }
  };

  const addEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  const [deletingConvId, setDeletingConvId] = useState<string | null>(null);

  const handleCallClick = (listingId?: string) => {
    if (!listingId) return;
    try {
      listingsAPI.revealPhone(listingId, user);
    } catch (err) {
      console.error('Failed to log reveal phone:', err);
    }
  };

  const handleDeleteConversation = async (convId: string) => {
    if (
      !window.confirm(
        'Энэ харилцан яриаг бүх зурвасын хамт устгах уу? Энэ үйлдлийг буцаах боломжгүй.'
      )
    ) {
      return;
    }

    setDeletingConvId(convId);
    try {
      await chatAPI.deleteConversation(convId);
      setConversations((prev) => {
        const remaining = prev.filter((c) => c.id !== convId);
        if (activeConvId === convId) {
          if (remaining.length > 0 && window.innerWidth >= 768) {
            setActiveConvId(remaining[0].id);
          } else {
            setActiveConvId(null);
            setMessages([]);
            setMobileView('list');
          }
        }
        return remaining;
      });
    } catch (err) {
      console.error('Failed to delete conversation:', err);
      alert('Чат устгахад алдаа гарлаа.');
    } finally {
      setDeletingConvId(null);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!activeConvId) return;
    if (!window.confirm('Энэ зурвасыг устгах уу?')) {
      return;
    }

    try {
      await chatAPI.deleteMessage(activeConvId, messageId);
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      fetchConversations(true);
    } catch (err) {
      console.error('Failed to delete message:', err);
      alert('Зурвас устгахад алдаа гарлаа.');
    }
  };

  // Resolve counterpart (inquiring renter or property publisher)
  const getCounterpart = (conv: Conversation) => {
    // Current user is Host if they own the listing or are the conversation host
    const isMeHost = Boolean(
      user?.id && (conv.hostId === user.id || conv.listing?.userId === user.id)
    );

    // If I am the Host, the counterpart is the RENTER who inquired
    // If I am the Renter, the counterpart is the HOST / PUBLISHER
    const counterpartUser = isMeHost ? conv.renter : conv.host;
    const roleLabel = isMeHost ? 'Түрээслэгч' : 'Зар нийтлэгч';
    const unread = isMeHost ? conv.hostUnreadCount : conv.renterUnreadCount;

    // Display Name:
    // If I am host: Counterpart is renter -> show renter's real name (e.g. Code InDaHouse)
    // If I am renter: Counterpart is publisher -> show listing's contactName or seller or host name
    const rawName = isMeHost
      ? conv.renter?.name || conv.renter?.phone
      : (conv.listing?.contactName || conv.listing?.attributes?.contactName || conv.listing?.attributes?.seller || counterpartUser?.name);

    const name =
      rawName && rawName !== 'AI Test User'
        ? rawName
        : isMeHost
        ? 'Түрээслэгч'
        : (conv.listing?.contactName || conv.listing?.attributes?.seller || 'Зарын эзэн');

    // Listing contact phone placed on the listing (prioritized for call action)
    const listingPhone =
      conv.listing?.contactPhone ||
      conv.listing?.attributes?.contactPhone ||
      conv.listing?.attributes?.phone;

    // In call action: strictly use the listing's contact phone (fallback to counterpart phone if none)
    const phone = listingPhone || counterpartUser?.phone;

    return {
      isMeHost,
      user: counterpartUser,
      name,
      phone,
      avatarUrl: counterpartUser?.avatarUrl,
      roleLabel,
      unread,
    };
  };

  const activeConv = conversations.find((c) => c.id === activeConvId);

  // Filter & strictly sort conversations by category tab, search query, and latest message timestamp
  const filteredConversations = sortConversationsByRecent(
    conversations.filter((conv) => {
      const cp = getCounterpart(conv);

      // Tab filter
      if (chatFilter === 'unread' && (!cp.unread || cp.unread === 0)) return false;
      if (chatFilter === 'inbox' && !cp.isMeHost) return false;
      if (chatFilter === 'sent' && cp.isMeHost) return false;

      // Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        cp.name.toLowerCase().includes(q) ||
        (conv.listing?.title && conv.listing.title.toLowerCase().includes(q)) ||
        (conv.lastMessage && conv.lastMessage.toLowerCase().includes(q))
      );
    })
  );

  const totalUnreadCount = conversations.reduce((acc, c) => {
    const cp = getCounterpart(c);
    return acc + (cp.unread || 0);
  }, 0);

  const unreadConvCount = conversations.filter((c) => (getCounterpart(c).unread || 0) > 0).length;
  const inboxCount = conversations.filter((c) => getCounterpart(c).isMeHost).length;
  const sentCount = conversations.filter((c) => !getCounterpart(c).isMeHost).length;

  if (loadingList) {
    return (
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-12 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-white/10 flex flex-col items-center justify-center text-slate-400 space-y-3 shadow-sm min-h-[360px] sm:min-h-[500px]">
        <Loader2 size={32} className="animate-spin text-plasma" />
        <span className="text-sm font-medium">{t.common.loading}</span>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-12 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-white/10 text-center space-y-4 shadow-sm min-h-[360px] sm:min-h-[480px] flex flex-col items-center justify-center">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-plasma/10 text-plasma flex items-center justify-center mx-auto shadow-inner">
          <MessageSquare size={28} className="sm:w-8 sm:h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            {t.chat.noConversations}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-nebula-text max-w-md mx-auto">
            Түрээслэгч таны зар дээр чат илгээх эсвэл та зарын эзэнтэй чатлаж эхлэх үед харилцан ярианууд энд бодит цагаар харагдах болно.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-plasma to-aurora text-white font-bold text-xs sm:text-sm shadow-md shadow-plasma/25 hover:shadow-plasma/40 transition-all active:scale-95"
        >
          <span>Заруудыг харах</span>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl overflow-hidden flex flex-col md:flex-row h-[75vh] sm:h-[720px] min-h-[480px] max-h-[820px]">
        {/* Left Column: Multi-User Conversations List (Landlord / Renter) */}
        <div
          className={`w-full md:w-[360px] lg:w-[400px] flex-shrink-0 border-r border-slate-200 dark:border-white/10 flex flex-col h-full min-h-0 bg-slate-50/70 dark:bg-slate-950/70 ${
            mobileView === 'chat' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Header & Tabs */}
          <div className="p-3 sm:p-3.5 border-b border-slate-200 dark:border-white/10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-plasma/10 flex items-center justify-center text-plasma shrink-0">
                  <MessageSquare size={16} />
                </div>
                <div className="min-w-0">
                  <h2 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-tight truncate">
                    {t.chat.myChats}
                  </h2>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
                    {conversations.length} харилцан яриа
                  </p>
                </div>
              </div>
              {totalUnreadCount > 0 && (
                <span className="text-[11px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white shadow-md shadow-rose-500/30 animate-pulse shrink-0">
                  {totalUnreadCount} шинэ
                </span>
              )}
            </div>

            {/* Role & Status Separation Tabs: All / Unread / Received / Sent */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-[11px] sm:text-xs font-semibold gap-0.5 sm:gap-1 overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setChatFilter('all')}
                className={`flex-1 py-1.5 px-1.5 rounded-lg transition-all text-center flex items-center justify-center space-x-1 cursor-pointer ${
                  chatFilter === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>Бүгд</span>
                <span className="text-[10px] text-slate-400">({conversations.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setChatFilter('unread')}
                className={`flex-1 py-1.5 px-1.5 rounded-lg transition-all text-center flex items-center justify-center space-x-1 cursor-pointer relative ${
                  chatFilter === 'unread'
                    ? 'bg-rose-500 text-white shadow-xs font-bold'
                    : unreadConvCount > 0
                    ? 'text-rose-600 dark:text-rose-400 font-bold hover:bg-rose-50 dark:hover:bg-rose-950/30'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Шинэ уншаагүй чатууд"
              >
                {unreadConvCount > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse flex-shrink-0" />
                )}
                <span>Уншаагүй</span>
                {unreadConvCount > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                      chatFilter === 'unread'
                        ? 'bg-white/20 text-white'
                        : 'bg-rose-500 text-white'
                    }`}
                  >
                    {unreadConvCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setChatFilter('inbox')}
                className={`flex-1 py-1.5 px-1.5 rounded-lg transition-all text-center flex items-center justify-center space-x-1 cursor-pointer ${
                  chatFilter === 'inbox'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Миний зар луу түрээслэгчдээс ирсэн хүсэлтүүд"
              >
                <Inbox size={12} />
                <span>Ирсэн</span>
                {inboxCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                    {inboxCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setChatFilter('sent')}
                className={`flex-1 py-1.5 px-1.5 rounded-lg transition-all text-center flex items-center justify-center space-x-1 cursor-pointer ${
                  chatFilter === 'sent'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Миний бусад зар луу илгээсэн асуултууд"
              >
                <SendHorizonal size={12} />
                <span>Илгээсэн</span>
                {sentCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">
                    {sentCount}
                  </span>
                )}
              </button>
            </div>

            {/* Quick Filter Search */}
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Хэрэглэгч, зарын нэрээр хайх..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-plasma"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Conversations Scrollable List */}
          <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-200/80 dark:divide-white/5 overscroll-contain">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 space-y-1">
                <Search size={20} className="mx-auto text-slate-300 dark:text-slate-600 mb-1" />
                <p>Энэ ангилалд зурвас олдсонгүй</p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const cp = getCounterpart(conv);
                const isActive = conv.id === activeConvId;
                const isUnread = (cp.unread || 0) > 0;
                const timeDate = new Date(conv.lastMessageAt);
                const isToday =
                  timeDate.toDateString() === new Date().toDateString();
                const timeStr = isToday
                  ? timeDate.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : timeDate.toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    });

                const listingImg = conv.listing?.images?.[0];

                return (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setActiveConvId(conv.id);
                      setMobileView('chat');
                      // Instantly clear unread status locally for immediate UI responsiveness
                      setConversations((prev) =>
                        prev.map((c) => {
                          if (c.id === conv.id) {
                            const isMeHost = Boolean(
                              user?.id && (c.hostId === user.id || c.listing?.userId === user.id)
                            );
                            return {
                              ...c,
                              hostUnreadCount: isMeHost ? 0 : c.hostUnreadCount,
                              renterUnreadCount: !isMeHost ? 0 : c.renterUnreadCount,
                            };
                          }
                          return c;
                        })
                      );
                    }}
                    className={`w-full text-left p-3.5 flex items-start space-x-3 transition-all cursor-pointer relative group ${
                      isActive
                        ? isUnread
                          ? 'bg-rose-100/90 dark:bg-rose-950/40 border-l-4 border-rose-600 shadow-inner ring-1 ring-rose-400/30'
                          : 'bg-plasma/10 dark:bg-plasma/20 border-l-4 border-plasma shadow-inner'
                        : isUnread
                        ? 'bg-rose-50/80 hover:bg-rose-100/70 dark:bg-rose-950/25 dark:hover:bg-rose-900/35 border-l-4 border-rose-500 shadow-xs ring-1 ring-rose-200/50 dark:ring-rose-500/20'
                        : 'hover:bg-slate-100/80 dark:hover:bg-white/5 border-l-4 border-transparent'
                    }`}
                  >
                    {/* User Avatar */}
                    <div className="relative flex-shrink-0">
                      <div
                        className={`w-11 h-11 rounded-full p-0.5 shadow-sm ${
                          isUnread
                            ? 'bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-500 ring-2 ring-rose-500/30'
                            : 'bg-gradient-to-tr from-plasma via-indigo-600 to-aurora'
                        }`}
                      >
                        <div className="w-full h-full rounded-full bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                          {cp.avatarUrl ? (
                            <img
                              src={getImageUrl(cp.avatarUrl)}
                              alt={cp.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <UserIcon
                              size={18}
                              className={isUnread ? 'text-rose-500' : 'text-plasma'}
                            />
                          )}
                        </div>
                      </div>
                      {/* Top-right pulsating badge on avatar for unread */}
                      {isUnread && (
                        <span className="absolute -top-1.5 -right-1.5 min-w-[19px] h-4.5 px-1 rounded-full bg-rose-500 text-white font-black text-[10px] flex items-center justify-center shadow-md shadow-rose-500/50 ring-2 ring-white dark:ring-slate-900 animate-pulse z-10">
                          {cp.unread > 99 ? '99+' : cp.unread}
                        </span>
                      )}
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                    </div>

                    {/* Content Details */}
                    <div className="min-w-0 flex-1">
                      {/* Name + Specific Role Badge + Time & Delete Action */}
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <div className="flex items-center space-x-1.5 min-w-0">
                          {isUnread && (
                            <span
                              className="w-2 h-2 rounded-full bg-rose-500 animate-pulse flex-shrink-0 shadow-sm shadow-rose-500/60"
                              title="Шинэ уншаагүй зурвас"
                            />
                          )}
                          <h3
                            className={`text-sm truncate ${
                              isUnread
                                ? 'font-black text-slate-950 dark:text-white'
                                : 'font-bold text-slate-900 dark:text-white'
                            }`}
                          >
                            {cp.name}
                          </h3>
                          <span
                            className={`text-[10px] px-2 py-0.2 rounded-md font-bold flex-shrink-0 ${
                              cp.isMeHost
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                                : 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30'
                            }`}
                          >
                            {cp.roleLabel}
                          </span>
                          {isUnread && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-black flex-shrink-0 shadow-xs animate-pulse">
                              Шинэ
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 flex-shrink-0">
                          <span
                            className={`text-[10px] flex-shrink-0 ${
                              isUnread
                                ? 'font-bold text-rose-600 dark:text-rose-400'
                                : 'text-slate-400'
                            }`}
                          >
                            {timeStr}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteConversation(conv.id);
                            }}
                            disabled={deletingConvId === conv.id}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-100/70 dark:hover:bg-rose-950/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            title="Харилцан яриаг устгах"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Listing Context Mini Banner */}
                      {conv.listing && (
                        <div className="flex items-center space-x-1.5 my-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
                          {listingImg && (
                            <img
                              src={getImageUrl(listingImg)}
                              alt={conv.listing.title}
                              className="w-5 h-5 rounded object-cover flex-shrink-0"
                            />
                          )}
                          <p className="text-[11px] font-semibold text-plasma truncate flex-1">
                            {cp.isMeHost ? '🏷️ Таны зар: ' : '🔍 Сонирхсон: '}
                            {conv.listing.title}
                          </p>
                          <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-200 flex-shrink-0">
                            ₮{Number(conv.listing.price).toLocaleString()}
                          </span>
                        </div>
                      )}

                      {/* Last Message Preview & Unread Pill */}
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <p
                          className={`text-xs truncate flex-1 ${
                            isUnread
                              ? 'font-bold text-slate-950 dark:text-slate-100'
                              : 'font-normal text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {conv.lastMessage || 'Чат эхлүүлсэн'}
                        </p>
                        {isUnread && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-black text-[10px] shadow-sm flex-shrink-0 flex items-center space-x-1 animate-pulse">
                            <span>{cp.unread} шинэ</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Conversation Messages & Chat Window */}
        <div
          className={`flex-1 flex flex-col h-full min-h-0 bg-white dark:bg-slate-900 overflow-hidden ${
            mobileView === 'list' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeConv ? (
            <>
              {/* Active Conversation Header */}
              {(() => {
                const cp = getCounterpart(activeConv);

                return (
                  <div className="flex-shrink-0 px-4 py-3 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50/90 dark:bg-slate-950/80 backdrop-blur-md z-10">
                    <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 flex-1">
                      {/* Mobile Back Button to conversation list */}
                      <button
                        onClick={() => setMobileView('list')}
                        className="p-1.5 -ml-1 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors md:hidden flex-shrink-0 cursor-pointer"
                        aria-label="Буцах"
                      >
                        <ArrowLeft size={18} />
                      </button>

                      {/* Counterpart Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-plasma via-indigo-600 to-aurora p-0.5 shadow-sm">
                          <div className="w-full h-full rounded-full bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                            {cp.avatarUrl ? (
                              <img
                                src={getImageUrl(cp.avatarUrl)}
                                alt={cp.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <UserIcon size={18} className="text-plasma" />
                            )}
                          </div>
                        </div>
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                      </div>

                      {/* User Info & Listing Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                            {cp.name}
                          </h3>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex-shrink-0 ${
                              cp.isMeHost
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                                : 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30'
                            }`}
                          >
                            {cp.roleLabel}
                          </span>
                        </div>

                        {activeConv.listing && (
                          <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            <span className="truncate max-w-[180px] sm:max-w-xs font-medium">
                              {cp.isMeHost ? '🏷️ Таны зар: ' : '🔍 Сонирхсон: '}
                              {activeConv.listing.title}
                            </span>
                            <span className="text-plasma dark:text-plasma-light font-bold flex-shrink-0">
                              ₮{Number(activeConv.listing.price).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Header Actions (Call & Listing Link & Delete) */}
                    <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                      {cp.phone && (
                        <a
                          href={`tel:${cp.phone}`}
                          onClick={() => handleCallClick(activeConv.listingId)}
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-colors cursor-pointer"
                          title="Залгах"
                        >
                          <Phone size={13} className="text-emerald-500" />
                          <span className="hidden sm:inline">{cp.phone}</span>
                        </a>
                      )}
                      {activeConv.listingId && (
                        <Link
                          to={`/listings/${activeConv.listingId}`}
                          target="_blank"
                          className="p-2 rounded-xl text-slate-500 hover:text-plasma dark:text-slate-400 dark:hover:text-plasma hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                          title="Зарыг тусад нь нээх"
                        >
                          <ExternalLink size={16} />
                        </Link>
                      )}
                      {/* Delete Conversation Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteConversation(activeConv.id)}
                        disabled={deletingConvId === activeConv.id}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                        title="Энэ харилцан яриаг устгах"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Messages Body */}
              <div
                ref={messagesContainerRef}
                className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-3 bg-slate-100/60 dark:bg-slate-950"
              >
                {loadingMessages ? (
                  <div className="h-full flex items-center justify-center text-slate-400 space-y-2 flex-col">
                    <Loader2 size={28} className="animate-spin text-plasma" />
                    <span className="text-xs">{t.common.loading}</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 text-center p-6">
                    <div className="w-12 h-12 rounded-2xl bg-plasma/10 flex items-center justify-center text-plasma mb-1">
                      <MessageSquare size={24} />
                    </div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Чат эхлэхэд бэлэн байна
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                      {t.chat.noMessages}
                    </p>
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
                          className={`max-w-[85%] sm:max-w-[72%] rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed shadow-sm break-words ${
                            isMe
                              ? 'chat-bubble-me bg-gradient-to-r from-plasma via-indigo-600 to-plasma text-white-force rounded-tr-xs shadow-md shadow-plasma/25'
                              : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/90 dark:border-white/10 rounded-tl-xs shadow-sm'
                          }`}
                        >
                          {/* Attached Photo Display */}
                          {msg.imageUrl && (
                            <div className="mb-2 overflow-hidden rounded-xl bg-black/10">
                              <img
                                src={getImageUrl(msg.imageUrl)}
                                alt="Хавсаргасан зураг"
                                onClick={() => setLightboxImage(getImageUrl(msg.imageUrl!))}
                                className="max-h-64 sm:max-h-72 w-full object-cover cursor-pointer hover:opacity-95 transition-all rounded-xl"
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

                        {/* Timestamp & Read Status & Delete Message */}
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

              {/* Attached Photo Preview Above Input Bar */}
              {attachedImage && (
                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-white/10 flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={getImageUrl(attachedImage)}
                      alt="Сонгосон зураг"
                      className="w-14 h-14 rounded-xl object-cover border border-plasma shadow-sm"
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
                  className="px-4 py-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-white/10 shadow-lg z-30 animate-in fade-in slide-in-from-bottom-2 duration-150"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center space-x-1">
                      <Sparkles size={13} className="text-plasma" />
                      <span>Эможи сонгох</span>
                    </span>
                    <button
                      onClick={() => setShowEmojiPicker(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-8 sm:grid-cols-12 gap-1.5 max-h-40 overflow-y-auto p-1">
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

              {/* Bottom Input Bar */}
              <div className="flex-shrink-0 p-3 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 pb-[max(env(safe-area-inset-bottom),12px)] z-20">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleImageFileChange}
                  className="hidden"
                />

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
                    disabled={sending}
                    className="flex-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/15 focus:border-plasma focus:bg-white dark:focus:bg-slate-950 rounded-2xl px-4 py-2.5 sm:py-2.5 text-base sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-colors"
                  />

                  {/* Send Button */}
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={(!inputText.trim() && !attachedImage) || sending}
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
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 space-y-3 text-center">
              <div className="w-16 h-16 rounded-3xl bg-plasma/10 flex items-center justify-center text-plasma shadow-inner">
                <MessageSquare size={32} />
              </div>
              <div className="space-y-1">
                <p className="text-base font-bold text-slate-800 dark:text-slate-200">
                  {t.chat.selectConversation}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                  Зүүн талын жагсаалтаас харилцан яриагаа сонгож түрээслэгч эсвэл зарын эзэнтэй шууд холбогдоно уу.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

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
