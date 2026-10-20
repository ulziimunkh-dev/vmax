import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2,
  MapPin,
  Sparkles,
  Phone,
  Layers,
  Plus,
  Trash2,
  Upload,
  CheckCircle2,
  DollarSign,
  ShieldCheck,
  Globe,
  Video,
  Film,
  Play,
  X,
  Loader2,
  Mail,
  Handshake,
  ArrowRight,
} from 'lucide-react';
import { projectsAPI, uploadAPI } from '@/services/api';
import type { FloorPlanItem, ProjectReelItem } from '@/types';
import { getImageUrl } from '@/utils/imageUrl';
import { useAuthStore } from '@/store/useAuthStore';

const DISTRICTS = [
  'Хан-Уул',
  'Баянзүрх',
  'Сүхбаатар',
  'Баянгол',
  'Чингэлтэй',
  'Сонгинохайрхан',
];

export const CreateProject: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [developerName, setDeveloperName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('CONSTRUCTING');
  const [completionYearQuarter, setCompletionYearQuarter] = useState('2026 Q4');

  // Location
  const [district, setDistrict] = useState('Хан-Уул');
  const [khoroo, setKhoroo] = useState('11-р хороо');
  const [addressDetail, setAddressDetail] = useState('');

  // Contacts & Socials
  const [salesPhone, setSalesPhone] = useState(user?.phone || '');
  const [salesEmail, setSalesEmail] = useState(user?.email || '');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [facebookPageUrl, setFacebookPageUrl] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');

  // Pricing
  const [minPricePerSqm, setMinPricePerSqm] = useState('');
  const [startingPrice, setStartingPrice] = useState('');

  // Media & 3D Tour
  const [coverImage, setCoverImage] = useState('');
  const [galleryInput, setGalleryInput] = useState('');
  const [tour3dUrl, setTour3dUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoUploading, setVideoUploading] = useState(false);

  // Reels Dynamic List
  const [reels, setReels] = useState<ProjectReelItem[]>([]);
  const [reelUploadingIdx, setReelUploadingIdx] = useState<number | null>(null);

  const checkVideoDuration = (file: File): Promise<number | null> => {
    return new Promise((resolve) => {
      try {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.src = URL.createObjectURL(file);
        video.onloadedmetadata = () => {
          resolve(Number.isFinite(video.duration) ? video.duration : null);
        };
        video.onerror = () => resolve(null);
        setTimeout(() => resolve(null), 2000);
      } catch {
        resolve(null);
      }
    });
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      setError('Зөвхөн видео файл (MP4, WebM, MOV) оруулна уу.');
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      setError('Бичлэгийн хэмжээ хамгийн ихдээ 100MB байх ёстой.');
      return;
    }
    const dur = await checkVideoDuration(file);
    if (dur && dur > 90.5) {
      setError(`⚠️ Сонгосон танилцуулга бичлэгийн урт ${Math.round(dur)} секунд байна. Дээд тал нь 90 секунд (90s) хүртэлх бичлэг сонгоно уу.`);
      return;
    }
    setVideoUploading(true);
    setError('');
    try {
      const res = await uploadAPI.uploadFile(file);
      const url = res.data?.url;
      if (url) {
        setVideoUrl(url);
      }
    } catch (err) {
      console.error('Video upload error:', err);
      setError('Видео байршуулахад алдаа гарлаа.');
    } finally {
      setVideoUploading(false);
    }
  };

  const addReel = () => {
    setReels([
      ...reels,
      {
        title: `Reel #${reels.length + 1} — Тойм үзлэг`,
        videoUrl: '',
        thumbnailUrl: '',
        durationSeconds: 90,
      },
    ]);
  };

  const removeReel = (idx: number) => {
    setReels(reels.filter((_, i) => i !== idx));
  };

  const updateReel = (idx: number, field: keyof ProjectReelItem, val: any) => {
    const updated = [...reels];
    updated[idx] = { ...updated[idx], [field]: val };
    setReels(updated);
  };

  const handleReelFileUpload = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      setError('Зөвхөн видео файл сонгоно уу.');
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      setError('Бичлэгийн хэмжээ хамгийн ихдээ 100MB байх ёстой.');
      return;
    }
    const dur = await checkVideoDuration(file);
    if (dur && dur > 90.5) {
      setError(`⚠️ Сонгосон Reel бичлэгийн урт ${Math.round(dur)} секунд байна. Дээд тал нь 90 секунд (90s) хүртэлх бичлэг сонгоно уу.`);
      return;
    }
    setReelUploadingIdx(idx);
    setError('');
    try {
      const res = await uploadAPI.uploadFile(file);
      const url = res.data?.url;
      if (url) {
        updateReel(idx, 'videoUrl', url);
        if (dur) updateReel(idx, 'durationSeconds', Math.round(dur));
      }
    } catch (err) {
      console.error('Reel upload error:', err);
      setError('Reel байршуулахад алдаа гарлаа.');
    } finally {
      setReelUploadingIdx(null);
    }
  };

  // Terms & Offers (comma or tag separated)
  const [paymentTermsInput, setPaymentTermsInput] = useState('Банкны 6% зээл, Хувь лизинг, Урьдчилгаа 20%');
  const [specialOffersInput, setSpecialOffersInput] = useState('Гал тогооны тавилга бэлгэнд');
  const [amenitiesInput, setAmenitiesInput] = useState('24/7 харуул, Хүүхдийн тоглоомын талбай, Дулаан зогсоол');

  // Floor Plans Dynamic List
  const [floorPlans, setFloorPlans] = useState<FloorPlanItem[]>([
    {
      title: '2 өрөө - А загвар',
      rooms: 2,
      areaSqm: 56.4,
      startingPrice: 220000000,
      image2dUrl: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80',
    },
  ]);

  const addFloorPlan = () => {
    setFloorPlans([
      ...floorPlans,
      {
        title: `${floorPlans.length + 2} өрөө - Шинэ загвар`,
        rooms: Math.min(floorPlans.length + 2, 5),
        areaSqm: 75.0,
        startingPrice: 300000000,
        image2dUrl: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80',
      },
    ]);
  };

  const removeFloorPlan = (idx: number) => {
    setFloorPlans(floorPlans.filter((_, i) => i !== idx));
  };

  const updateFloorPlan = (idx: number, field: keyof FloorPlanItem, val: any) => {
    const updated = [...floorPlans];
    updated[idx] = { ...updated[idx], [field]: val };
    setFloorPlans(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Хотхон, төслийн нэрийг оруулна уу.');
      return;
    }
    if (!developerName.trim()) {
      setError('Барилгын компанийн нэрийг оруулна уу.');
      return;
    }
    if (!salesPhone.trim()) {
      setError('Борлуулалтын утасны дугаарыг оруулна уу.');
      return;
    }
    if (!coverImage.trim()) {
      setError('Төслийн нүүр зургийн линкийг оруулна уу.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name,
        developerName,
        tagline,
        description,
        status,
        completionYearQuarter,
        city: 'Улаанбаатар',
        district,
        khoroo,
        addressDetail,
        salesPhone,
        salesEmail,
        websiteUrl,
        facebookPageUrl,
        instagramHandle,
        minPricePerSqm: minPricePerSqm ? Number(minPricePerSqm) : undefined,
        startingPrice: startingPrice ? Number(startingPrice) : undefined,
        coverImage,
        galleryImages: galleryInput
          ? galleryInput.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        tour3dUrl: tour3dUrl.trim() || undefined,
        videoUrl: videoUrl.trim() || undefined,
        reels: reels.filter((r) => r.videoUrl && r.videoUrl.trim().length > 0),
        paymentTerms: paymentTermsInput
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        specialOffers: specialOffersInput
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        amenities: amenitiesInput
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        floorPlans,
      };

      const res = await projectsAPI.create(payload);
      const newId = res.data?.id;
      navigate(newId ? `/projects/${newId}` : '/projects');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Төсөл нийтлэхэд алдаа гарлаа.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-plasma/10 border border-plasma/30 text-plasma text-xs font-bold uppercase tracking-wider">
          <Building2 size={14} />
          <span>Барилгын компаниудад зориулав</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-black text-starlight">
          Шинэ барилга, хотхоны төсөл бүртгэх
        </h1>
        <p className="text-xs sm:text-sm text-nebula-text max-w-xl mx-auto">
          Хотхоныхоо 3D виртуал аялал, өрөөний хэмжээнүүд, албан ёсны FB, IG болон утасны дугаараа нийтлээрэй.
        </p>
      </div>

      {/* 🤝 Company Partnership & Official Cooperation Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-plasma/30 bg-gradient-to-r from-plasma/20 via-cosmic/80 to-nova/20 p-5 sm:p-6 shadow-2xl backdrop-blur-md">
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-plasma/25 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-plasma/20 border border-plasma/40 text-plasma text-[11px] font-bold uppercase tracking-wider">
              <Handshake size={13} />
              <span>Барилгын компаниудтай хамтран ажиллах</span>
            </div>
            <h3 className="text-base sm:text-lg font-heading font-black text-starlight tracking-tight">
              Барилгын компани, захиалагч нартай албан ёсоор хамтран ажиллана
            </h3>
            <p className="text-xs text-nebula-text leading-relaxed">
              Хэрэв танай байгууллага, барилгын компани төслөө Vmax платформд албан ёсоор байршуулах, гэрээ байгуулах, 3D аялал бэлтгэх болон онцгой сурталчилгааны нөхцөлөөр хамтран ажиллахыг хүсвэл манай харилцагчийн албатай холбогдоно уу.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
            <a
              href="tel:+97689767700"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-plasma to-nova hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-plasma/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Phone size={15} />
              <span>Холбогдох (+976 8976-7700)</span>
            </a>
            <a
              href="mailto:contact@vmax.mn?subject=Барилгын%20компани%20хамтран%20ажиллах%20хүсэлт"
              className="px-4 py-2.5 rounded-xl bg-void/70 hover:bg-white/10 border border-white/15 text-starlight hover:text-white font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Mail size={15} className="text-aurora" />
              <span>Имэйл бичих</span>
            </a>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/15 border border-red-500/40 text-red-400 text-xs font-semibold text-center">
          ⚠️ {error}
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-10 rounded-3xl border border-white/10 space-y-8">
        {/* Section 1: Basic Information */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-starlight border-b border-white/10 pb-2 flex items-center gap-2">
            <Building2 size={18} className="text-plasma" />
            <span>1. Төсөл & Компанийн ерөнхий мэдээлэл</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-nebula-text mb-1.5">
                Хотхон, төслийн нэр *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Жишээ: Sky Garden Residence"
                className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-3 text-starlight text-sm focus:outline-none focus:border-plasma"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-nebula-text mb-1.5">
                Барилгын компани / Захиалагч *
              </label>
              <input
                type="text"
                required
                value={developerName}
                onChange={(e) => setDeveloperName(e.target.value)}
                placeholder="Жишээ: Эко Констракшн ХХК"
                className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-3 text-starlight text-sm focus:outline-none focus:border-plasma"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-nebula-text mb-1.5">
                Төслийн уриа / Богино тодорхойлолт
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Жишээ: 5 одтой тансаг зэрэглэлийн эко хотхон"
                className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-3 text-starlight text-sm focus:outline-none focus:border-plasma"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-nebula-text mb-1.5">
                Ашиглалтад орох хугацаа
              </label>
              <input
                type="text"
                value={completionYearQuarter}
                onChange={(e) => setCompletionYearQuarter(e.target.value)}
                placeholder="Жишээ: 2026 Q4 эсвэл Ашиглалтад орсон"
                className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-3 text-starlight text-sm focus:outline-none focus:border-plasma"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-nebula-text mb-1.5">
              Дэлгэрэнгүй танилцуулга
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Хотхоны архитектур, давуу тал, байршлын онцлогийг дэлгэрэнгүй бичнэ үү..."
              className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-3 text-starlight text-sm focus:outline-none focus:border-plasma resize-none"
            />
          </div>
        </div>

        {/* Section 2: Location & Contacts */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-starlight border-b border-white/10 pb-2 flex items-center gap-2">
            <MapPin size={18} className="text-nova" />
            <span>2. Байршил & Холбоо барих мэдээлэл (Facebook, Instagram, Утас)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-nebula-text mb-1.5">Дүүрэг *</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-3 text-starlight text-sm focus:outline-none focus:border-plasma"
              >
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-nebula-text mb-1.5">Хороо</label>
              <input
                type="text"
                value={khoroo}
                onChange={(e) => setKhoroo(e.target.value)}
                placeholder="11-р хороо"
                className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-3 text-starlight text-sm focus:outline-none focus:border-plasma"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-nebula-text mb-1.5">Дэлгэрэнгүй хаяг</label>
              <input
                type="text"
                value={addressDetail}
                onChange={(e) => setAddressDetail(e.target.value)}
                placeholder="Зайсан толгойн баруун урд"
                className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-3 text-starlight text-sm focus:outline-none focus:border-plasma"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-nebula-text mb-1.5">
                📞 Борлуулалтын албаны утас *
              </label>
              <input
                type="text"
                required
                value={salesPhone}
                onChange={(e) => setSalesPhone(e.target.value)}
                placeholder="7711-8899, 9911-XXXX"
                className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-3 text-starlight text-sm focus:outline-none focus:border-plasma"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-nebula-text mb-1.5">
                ✉️ Борлуулалтын имэйл
              </label>
              <input
                type="email"
                value={salesEmail}
                onChange={(e) => setSalesEmail(e.target.value)}
                placeholder="sales@company.mn"
                className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-3 text-starlight text-sm focus:outline-none focus:border-plasma"
              />
            </div>
          </div>

          {/* Social Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-void/40 border border-white/5">
            <div>
              <label className="block text-xs font-semibold text-nebula-text mb-1.5 flex items-center gap-1.5 text-[#1877F2]">
                <span>Facebook хуудасны линк (URL)</span>
              </label>
              <input
                type="url"
                value={facebookPageUrl}
                onChange={(e) => setFacebookPageUrl(e.target.value)}
                placeholder="https://facebook.com/skygardenresidence"
                className="w-full bg-void/60 border border-white/10 rounded-xl px-4 py-3 text-starlight text-sm focus:outline-none focus:border-plasma"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-nebula-text mb-1.5 flex items-center gap-1.5 text-pink-400">
                <span>Instagram хаяг / линк</span>
              </label>
              <input
                type="text"
                value={instagramHandle}
                onChange={(e) => setInstagramHandle(e.target.value)}
                placeholder="@skygarden_mn эсвэл https://instagram.com/..."
                className="w-full bg-void/60 border border-white/10 rounded-xl px-4 py-3 text-starlight text-sm focus:outline-none focus:border-plasma"
              />
            </div>
          </div>
        </div>

        {/* Section 3: 3D Tour & Images */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-starlight border-b border-white/10 pb-2 flex items-center gap-2">
            <Sparkles size={18} className="text-plasma" />
            <span>3. 3D Виртуал аялал & Зургууд</span>
          </h2>

          <div>
            <label className="block text-xs font-semibold text-nebula-text mb-1.5">
              👓 Matterport / Kuula 3D Tour Embed холбоос (URL)
            </label>
            <input
              type="url"
              value={tour3dUrl}
              onChange={(e) => setTour3dUrl(e.target.value)}
              placeholder="https://my.matterport.com/show/?m=JGPnGQ6hosj&play=1"
              className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-3 text-starlight text-sm focus:outline-none focus:border-plasma"
            />
            <span className="text-[11px] text-nebula-text mt-1 block">
              💡 Matterport эсвэл 360 viewer-ийн шууд үзэх холбоосыг оруулснаар хэрэглэгчид шууд дотор нь аялах боломжтой болно.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-nebula-text mb-1.5">
              Нүүр зураг (Cover Image URL) *
            </label>
            <input
              type="url"
              required
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-3 text-starlight text-sm focus:outline-none focus:border-plasma"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-nebula-text mb-1.5">
              Зургийн цомог (Зургуудын линкийг таслалаар тусгаарлан оруулна уу)
            </label>
            <textarea
              rows={2}
              value={galleryInput}
              onChange={(e) => setGalleryInput(e.target.value)}
              placeholder="https://image1.jpg, https://image2.jpg, https://image3.jpg"
              className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-3 text-starlight text-sm focus:outline-none focus:border-plasma"
            />
          </div>
        </div>

        {/* Section 4: Intro Video & Reels */}
        <div className="space-y-5 p-5 rounded-2xl bg-void/40 border border-white/10">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="text-lg font-bold text-starlight flex items-center gap-2">
              <Film size={18} className="text-pink-400" />
              <span>4. Төслийн танилцуулга бичлэг & Reels (Богино бичлэгүүд)</span>
            </h2>
            <span className="text-xs text-nebula-text hidden sm:inline">16:9 Видео болон 9:16 Reels дэмжинэ</span>
          </div>

          {/* Intro Video (16:9 Landscape Video) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-starlight flex items-center gap-2">
                <Video size={14} className="text-plasma" />
                <span>Төслийн танилцуулга бичлэг (Intro Video — 90s хүртэл)</span>
              </label>
              {videoUrl && (
                <button
                  type="button"
                  onClick={() => setVideoUrl('')}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Бичлэг хасах</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              {/* File Upload Button */}
              <div className="relative">
                <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-plasma/40 bg-plasma/10 hover:bg-plasma/20 text-plasma font-semibold text-xs transition-all cursor-pointer">
                  {videoUploading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Хуулж байна...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      <span>Видео файл хуулах (MP4, WebM)</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/*"
                    onChange={handleVideoUpload}
                    disabled={videoUploading}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Direct URL input */}
              <div>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Эсвэл видео URL / YouTube / Cloud MP4 линк..."
                  className="w-full bg-void/60 border border-white/10 rounded-xl px-4 py-3 text-starlight text-xs focus:outline-none focus:border-plasma"
                />
              </div>
            </div>

            {/* Video Preview */}
            {videoUrl && (
              <div className="mt-2 rounded-xl overflow-hidden border border-white/10 bg-black aspect-video max-w-md mx-auto relative group">
                <video
                  src={getImageUrl(videoUrl)}
                  controls
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Reels Section (9:16 Vertical Story Video Series) */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-starlight flex items-center gap-2">
                  <Film size={15} className="text-pink-400" />
                  <span>Reels & Walkthrough богино бичлэгүүд ({reels.length})</span>
                </h3>
                <p className="text-[11px] text-nebula-text">
                  9:16 босоо хэмжээтэй 90s хүртэлх богино бичлэг (байрны тойм, өрөөний үзлэг, хотхоны орчин).
                </p>
              </div>
              <button
                type="button"
                onClick={addReel}
                className="px-3.5 py-1.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 font-bold text-xs border border-pink-500/40 flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-pink-500/20"
              >
                <Plus size={14} />
                <span>Reel нэмэх</span>
              </button>
            </div>

            {reels.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-white/10 text-center space-y-2 bg-void/20">
                <Film size={24} className="mx-auto text-nebula-text opacity-40" />
                <p className="text-xs text-nebula-text">Одоогоор Reel нэмээгүй байна.</p>
                <button
                  type="button"
                  onClick={addReel}
                  className="text-xs font-bold text-pink-400 hover:text-pink-300 underline cursor-pointer"
                >
                  + Эхний Reel-ээ нэмэх
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {reels.map((reel, rIdx) => (
                  <div
                    key={rIdx}
                    className="p-3.5 rounded-2xl bg-void/70 border border-white/10 space-y-2.5 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-pink-400 uppercase tracking-wider">
                        Reel #{rIdx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeReel(rIdx)}
                        className="text-nebula-text hover:text-rose-400 p-1 transition-colors cursor-pointer"
                        title="Устгах"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={reel.title}
                        onChange={(e) => updateReel(rIdx, 'title', e.target.value)}
                        placeholder="Жишээ: 2 өрөө байрны үзлэг"
                        className="w-full bg-void/80 border border-white/10 rounded-lg px-3 py-1.5 text-starlight text-xs focus:outline-none focus:border-plasma font-medium"
                      />
                    </div>

                    {/* Reel File Upload or URL */}
                    <div className="space-y-1.5">
                      <label className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-pink-500/30 bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 text-[11px] font-semibold transition-all cursor-pointer">
                        {reelUploadingIdx === rIdx ? (
                          <>
                            <Loader2 size={13} className="animate-spin" />
                            <span>Хуулж байна...</span>
                          </>
                        ) : (
                          <>
                            <Upload size={13} />
                            <span>{reel.videoUrl ? 'Файл солих' : '9:16 Видео хуулах'}</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="video/mp4,video/webm,video/quicktime,video/*"
                          onChange={(e) => handleReelFileUpload(rIdx, e)}
                          disabled={reelUploadingIdx === rIdx}
                          className="hidden"
                        />
                      </label>

                      <input
                        type="url"
                        value={reel.videoUrl}
                        onChange={(e) => updateReel(rIdx, 'videoUrl', e.target.value)}
                        placeholder="Эсвэл видео линк..."
                        className="w-full bg-void/80 border border-white/10 rounded-lg px-3 py-1 text-starlight text-[11px] focus:outline-none focus:border-plasma"
                      />
                    </div>

                    {/* Mini vertical preview */}
                    {reel.videoUrl && (
                      <div className="rounded-lg overflow-hidden border border-white/10 bg-black aspect-[9/14] relative max-h-40 mx-auto">
                        <video
                          src={getImageUrl(reel.videoUrl)}
                          className="w-full h-full object-cover"
                          muted
                          loop
                          playsInline
                          onMouseEnter={(e) => e.currentTarget.play()}
                          onMouseLeave={(e) => e.currentTarget.pause()}
                        />
                        <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-bold text-white backdrop-blur-md">
                          Reel
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section 5: Apartment Sizes / Floor Plans */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h2 className="text-lg font-bold text-starlight flex items-center gap-2">
              <Layers size={18} className="text-aurora" />
              <span>5. Байрны хэмжээнүүд & Төлөвлөлтийн зураг (Floor Plans)</span>
            </h2>
            <button
              type="button"
              onClick={addFloorPlan}
              className="px-3 py-1.5 rounded-xl bg-plasma/20 hover:bg-plasma/30 text-plasma text-xs font-bold border border-plasma/40 flex items-center gap-1 transition-all cursor-pointer"
            >
              <Plus size={14} />
              <span>Өрөө нэмэх</span>
            </button>
          </div>

          <div className="space-y-4">
            {floorPlans.map((fp, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-void/50 border border-white/10 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-plasma">Сонголт #{idx + 1}</span>
                  {floorPlans.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFloorPlan(idx)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] text-nebula-text mb-1">Гарчиг</label>
                    <input
                      type="text"
                      value={fp.title}
                      onChange={(e) => updateFloorPlan(idx, 'title', e.target.value)}
                      placeholder="2 өрөө - А загвар"
                      className="w-full bg-void/80 border border-white/10 rounded-lg px-3 py-2 text-starlight text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-nebula-text mb-1">Өрөөний тоо</label>
                    <input
                      type="number"
                      value={fp.rooms}
                      onChange={(e) => updateFloorPlan(idx, 'rooms', Number(e.target.value))}
                      className="w-full bg-void/80 border border-white/10 rounded-lg px-3 py-2 text-starlight text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-nebula-text mb-1">Талбай (м²)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={fp.areaSqm}
                      onChange={(e) => updateFloorPlan(idx, 'areaSqm', Number(e.target.value))}
                      className="w-full bg-void/80 border border-white/10 rounded-lg px-3 py-2 text-starlight text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-nebula-text mb-1">Эхлэх үнэ (₮)</label>
                    <input
                      type="number"
                      value={fp.startingPrice}
                      onChange={(e) => updateFloorPlan(idx, 'startingPrice', Number(e.target.value))}
                      className="w-full bg-void/80 border border-white/10 rounded-lg px-3 py-2 text-starlight text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-nebula-text mb-1">2D План зургийн URL</label>
                  <input
                    type="url"
                    value={fp.image2dUrl}
                    onChange={(e) => updateFloorPlan(idx, 'image2dUrl', e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-void/80 border border-white/10 rounded-lg px-3 py-2 text-starlight text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Offers & Payment Terms */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-starlight border-b border-white/10 pb-2 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-aurora" />
            <span>5. Төлбөрийн нөхцөл, Урамшуулал & Давуу талууд</span>
          </h2>

          <div>
            <label className="block text-xs font-semibold text-nebula-text mb-1.5">
              💳 Төлбөрийн нөхцөлүүд (Таслалаар тусгаарлана)
            </label>
            <input
              type="text"
              value={paymentTermsInput}
              onChange={(e) => setPaymentTermsInput(e.target.value)}
              className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-3 text-starlight text-sm focus:outline-none focus:border-plasma"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-nebula-text mb-1.5">
              🎁 Онцгой урамшуулал (Таслалаар тусгаарлана)
            </label>
            <input
              type="text"
              value={specialOffersInput}
              onChange={(e) => setSpecialOffersInput(e.target.value)}
              className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-3 text-starlight text-sm focus:outline-none focus:border-plasma"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-nebula-text mb-1.5">
              🌳 Хотхоны давуу талууд (Amenities)
            </label>
            <input
              type="text"
              value={amenitiesInput}
              onChange={(e) => setAmenitiesInput(e.target.value)}
              className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-3 text-starlight text-sm focus:outline-none focus:border-plasma"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-plasma to-nova text-white font-bold text-base shadow-xl shadow-plasma/30 hover:shadow-plasma/50 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <span>Нийтэлж байна...</span>
          ) : (
            <>
              <CheckCircle2 size={20} />
              <span>Төслийг нийтлэх</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateProject;
