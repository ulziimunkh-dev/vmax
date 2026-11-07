import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  Plus,
  Trash2,
  Video,
  Image as ImageIcon,
  AlertCircle,
  ChevronLeft,
  Upload,
  Building2,
  Phone,
  Camera,
  Layers,
  X,
  Play,
} from 'lucide-react';
import { furnitureApi } from '@/services/furnitureApi';
import { uploadsAPI } from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import { getImageUrl } from '@/utils/imageUrl';

const CATEGORY_OPTIONS = [
  { id: 'KITCHEN', label: 'Гал тогооны тавилга' },
  { id: 'WARDROBE', label: 'Шүүгээ & Хувцасны өрөө' },
  { id: 'LIVING_ROOM', label: 'Зочны өрөө' },
  { id: 'KIDS', label: 'Хүүхдийн өрөө' },
  { id: 'OFFICE', label: 'Оффис тавилга' },
  { id: 'SOLID_WOOD', label: 'Цэвэр модон хийц' },
  { id: 'CUSTOM', label: 'Захиалгат хийц' },
];

const DISTRICT_OPTIONS = [
  'Хан-Уул',
  'Баянзүрх',
  'Сүхбаатар',
  'Баянгол',
  'Чингэлтэй',
  'Сонгинохайрхан',
  'Налайх',
];

interface FormProjectItem {
  id: string;
  title: string;
  category: string;
  materials: string;
  location: string;
  durationDays: number;
  images: string[];
  videoUrl?: string;
  uploadingVideo?: boolean;
  uploadingImages?: boolean;
}

export const CreateFurnitureProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [district, setDistrict] = useState('Хан-Уул');
  const [addressDetail, setAddressDetail] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [secondaryPhone, setSecondaryPhone] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [experienceYears, setExperienceYears] = useState(5);
  const [warrantyMonths, setWarrantyMonths] = useState(24);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['KITCHEN', 'WARDROBE', 'CUSTOM']);
  const [materialsUsed, setMaterialsUsed] = useState('Герман Egger E0 хавтан, Австрийн Blum нугас тоноглол, Кварц чулуу');

  // Media: Cover & Logo
  const [logoUrl, setLogoUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  // Multi-project Works Array
  const [projects, setProjects] = useState<FormProjectItem[]>([
    {
      id: 'proj_1',
      title: '',
      category: 'KITCHEN',
      materials: '',
      location: '',
      durationDays: 14,
      images: [],
      videoUrl: '',
    },
  ]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toggleCategory = (catId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId],
    );
  };

  // ── Cover Upload Handler ──────────────────────────────────────────────────
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const res = await uploadsAPI.uploadFile(file);
      if (res.data?.url) setCoverUrl(res.data.url);
    } catch (err: any) {
      console.warn('Cover upload error:', err);
    } finally {
      setUploadingCover(false);
    }
  };

  // ── Logo Upload Handler ───────────────────────────────────────────────────
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const res = await uploadsAPI.uploadFile(file);
      if (res.data?.url) setLogoUrl(res.data.url);
    } catch (err: any) {
      console.warn('Logo upload error:', err);
    } finally {
      setUploadingLogo(false);
    }
  };

  // ── Multi-project Management ──────────────────────────────────────────────
  const addProject = () => {
    setProjects((prev) => [
      ...prev,
      {
        id: `proj_${Date.now()}`,
        title: '',
        category: 'KITCHEN',
        materials: '',
        location: '',
        durationDays: 14,
        images: [],
        videoUrl: '',
      },
    ]);
  };

  const removeProject = (id: string) => {
    if (projects.length <= 1) return;
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const updateProjectField = (id: string, field: keyof FormProjectItem, value: any) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    );
  };

  const handleProjectImagesUpload = async (projectId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;
    updateProjectField(projectId, 'uploadingImages', true);
    try {
      const res = await uploadsAPI.uploadFiles(files);
      if (res.data?.urls) {
        setProjects((prev) =>
          prev.map((p) =>
            p.id === projectId
              ? { ...p, images: [...p.images, ...res.data.urls] }
              : p,
          ),
        );
      }
    } catch (err: any) {
      console.warn('Project images upload error:', err);
    } finally {
      updateProjectField(projectId, 'uploadingImages', false);
    }
  };

  const removeProjectImage = (projectId: string, indexToRemove: number) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, images: p.images.filter((_, idx) => idx !== indexToRemove) }
          : p,
      ),
    );
  };

  const handleProjectVideoUpload = async (projectId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    updateProjectField(projectId, 'uploadingVideo', true);
    try {
      const res = await uploadsAPI.uploadListingVideo('furniture-projects', file);
      if (res.data?.url) {
        updateProjectField(projectId, 'videoUrl', res.data.url);
      }
    } catch (err: any) {
      console.warn('Project video upload error:', err);
    } finally {
      updateProjectField(projectId, 'uploadingVideo', false);
    }
  };

  const removeProjectVideo = (projectId: string) => {
    updateProjectField(projectId, 'videoUrl', '');
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Урлангийн нэрийг оруулна уу.');
      return;
    }
    if (!phone.trim()) {
      setError('Холбоо барих утасны дугаараа оруулна уу.');
      return;
    }
    if (selectedCategories.length === 0) {
      setError('Хамгийн багадаа 1 ажлын чиглэл сонгоно уу.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // Build portfolio items from projects that have at least title or images/video
      const validPortfolio = projects
        .filter((p) => p.title.trim().length > 0 || p.images.length > 0 || Boolean(p.videoUrl))
        .map((p, idx) => ({
          id: `${Date.now()}_${idx}`,
          title: p.title.trim() || `Гүйцэтгэсэн ажил #${idx + 1}`,
          category: p.category,
          materials: p.materials.trim() || undefined,
          location: p.location.trim() || district,
          durationDays: Number(p.durationDays) || 14,
          images: p.images.length > 0
            ? p.images
            : ['https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80'],
          videoUrl: p.videoUrl || undefined,
          year: '2026',
        }));

      const payload = {
        name: name.trim(),
        tagline: tagline.trim(),
        description: description.trim() || 'Чанартай захиалгат тавилгын урлан.',
        logoUrl: logoUrl || 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef4?auto=format&fit=crop&w=200&q=80',
        coverUrl: coverUrl || 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1400&q=80',
        categories: selectedCategories,
        experienceYears: Number(experienceYears) || 5,
        warrantyMonths: Number(warrantyMonths) || 24,
        city: 'Улаанбаатар',
        district,
        addressDetail: addressDetail.trim(),
        phone: phone.trim(),
        secondaryPhone: secondaryPhone.trim() || undefined,
        facebookUrl: facebookUrl.trim() || undefined,
        instagramUrl: instagramUrl.trim() || undefined,
        websiteUrl: websiteUrl.trim() || undefined,
        materialsUsed: materialsUsed
          .split(',')
          .map((m) => m.trim())
          .filter(Boolean),
        portfolio: validPortfolio,
      };

      const res = await furnitureApi.create(payload);
      navigate(`/furniture/${res.data.id}`);
    } catch (err: any) {
      console.error('Failed to create furniture profile:', err);
      setError(err.response?.data?.message || 'Урлан бүртгэхэд алдаа гарлаа. Та дахин оролдоно уу.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-void pt-20 pb-24 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back Link */}
        <Link
          to="/furniture"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-nebula-text hover:text-white transition-colors mb-6"
        >
          <ChevronLeft size={16} />
          <span>Тавилгын сан руу буцах</span>
        </Link>

        {/* Page Title Header */}
        <div className="space-y-2 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-plasma/20 border border-plasma/30 text-plasma text-xs font-bold uppercase tracking-wider">
            <Sparkles size={13} />
            <span>Шинэ урлан / Компани бүртгэх</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Тавилгын урлангийн профайл үүсгэх
          </h1>
          <p className="text-xs sm:text-sm text-nebula-text/80">
            Өөрийн тавилгын урлан, компаниа бүртгүүлэн ковер зураг, хийсэн ажлууд болон видео реелүүдээ байршуулж хэрэглэгчидтэй шууд холбогдоорой.
          </p>
        </div>

        {/* Auth prompt if not logged in */}
        {!isAuthenticated && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-start sm:items-center gap-2.5">
              <AlertCircle size={18} className="text-amber-400 flex-shrink-0 mt-0.5 sm:mt-0" />
              <span>
                Та одоогоор нэвтрээгүй байна. Үүсгэсэн профайлаа дараа нь өөрөө засаж, шинэ ажлуудаа удирдахын тулд <strong>эхлээд нэвтэрч</strong> үүсгэхийг зөвлөж байна.
              </span>
            </div>
            <Link
              to="/login?redirect=/create-furniture-profile"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs whitespace-nowrap text-center transition-colors"
            >
              Нэвтрэх / Бүртгүүлэх
            </Link>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-bold flex items-center gap-2 mb-6">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* ── Profile Form ─────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Visual Branding (Cover Photo & Logo Avatar) */}
          <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4 bg-void/80">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Camera size={18} className="text-plasma" />
              <span>1. Ковер зураг & Лого баннер</span>
            </h3>
            <p className="text-xs text-nebula-text/70">
              Хэрэглэгчид танай урлангийн профайл руу ороход хамгийн түрүүнд харагдах ковер баннер болон байгууллагын лого.
            </p>

            {/* Cover Photo Dropzone */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-starlight block">
                Ковер баннер зураг (16:6 эсвэл 21:9 хэмжээтэй зураг тохиромжтой)
              </label>

              <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-white/5 h-48 sm:h-60 group">
                {coverUrl ? (
                  <>
                    <img
                      src={getImageUrl(coverUrl)}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <label className="px-4 py-2 rounded-xl bg-plasma hover:bg-plasma/80 text-white text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-lg">
                        <Upload size={14} />
                        <span>Ковер солих</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverUpload}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setCoverUrl('')}
                        className="px-4 py-2 rounded-xl bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold transition-all shadow-lg"
                      >
                        Устгах
                      </button>
                    </div>
                  </>
                ) : (
                  <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-colors p-6 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-plasma/20 text-plasma flex items-center justify-center mb-2">
                      <Upload size={22} />
                    </div>
                    <span className="text-sm font-bold text-white">
                      {uploadingCover ? 'Ковер хуулж байна...' : 'Ковер зураг оруулахын тулд дарна уу'}
                    </span>
                    <span className="text-xs text-nebula-text/60 mt-1">PNG, JPG, WEBP хэлбэртэй өндөр нягтаршилтай зураг</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      disabled={uploadingCover}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Logo Avatar Upload */}
            <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="relative w-20 h-20 rounded-2xl bg-white/5 border-2 border-dashed border-white/20 flex-shrink-0 overflow-hidden group">
                {logoUrl ? (
                  <>
                    <img
                      src={getImageUrl(logoUrl)}
                      alt="Logo Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setLogoUrl('')}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-red-400"
                    >
                      <X size={20} />
                    </button>
                  </>
                ) : (
                  <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 text-nebula-text hover:text-white transition-colors">
                    <Camera size={20} />
                    <span className="text-[10px] mt-1 font-bold">Лого</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-starlight block">Байгууллагын лого / Аватар</label>
                <p className="text-xs text-nebula-text/70">
                  Дөрвөлжин (1:1) хэмжээтэй урлангийн лого эсвэл брэнд тэмдэг оруулна уу. (Сонголттой)
                </p>
                {logoUrl && (
                  <span className="inline-block text-xs text-emerald-400 font-bold">✓ Лого хуулагдсан</span>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: General Info */}
          <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-5 bg-void/80">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Building2 size={18} className="text-plasma" />
              <span>2. Ерөнхий мэдээлэл</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-starlight">
                  Урлан / Компанийн нэр <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Жишээ: Мөнх Мод Урлан, Smart Wood Studio"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-nebula-text/50 text-sm focus:outline-none focus:border-plasma"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-starlight">Уриа үг / Богино тодорхойлолт</label>
                <input
                  type="text"
                  placeholder="Жишээ: Орчин үеийн захиалгат гал тогоо, шкаф хийц"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-nebula-text/50 text-sm focus:outline-none focus:border-plasma"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-starlight">Дэлгэрэнгүй танилцуулга</label>
                <textarea
                  rows={4}
                  placeholder="Туршлага, ашигладаг тоног төхөөрөмж, хэрэглэгчдэд өгөх амлалт..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-nebula-text/50 text-sm focus:outline-none focus:border-plasma"
                />
              </div>

              {/* Experience and Warranty */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-starlight">Туршлага (жилээр)</label>
                <input
                  type="number"
                  min="1"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-plasma"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-starlight">Баталгаат хугацаа (сараар)</label>
                <input
                  type="number"
                  min="6"
                  value={warrantyMonths}
                  onChange={(e) => setWarrantyMonths(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-plasma"
                />
              </div>
            </div>

            {/* Specialization Categories */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <label className="text-xs font-bold text-starlight block">
                Хийдэг тавилгын төрөл, чиглэл (Олон сонголттой) <span className="text-red-400">*</span>
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {CATEGORY_OPTIONS.map((cat) => {
                  const isChecked = selectedCategories.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        isChecked
                          ? 'bg-plasma text-white border-plasma shadow-md shadow-plasma/30'
                          : 'bg-white/5 border-white/10 text-nebula-text hover:text-white'
                      }`}
                    >
                      {isChecked ? '✓ ' : '+ '}
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 3: Contact & Location */}
          <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-5 bg-void/80">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Phone size={18} className="text-emerald-400" />
              <span>3. Холбоо барих & Хаяг байршил</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-starlight">
                  Үндсэн утасны дугаар <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Жишээ: 8911-7722"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-plasma"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-starlight">Нэмэлт утас</label>
                <input
                  type="tel"
                  placeholder="Жишээ: 9901-8833"
                  value={secondaryPhone}
                  onChange={(e) => setSecondaryPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-plasma"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-starlight">Дүүрэг</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-void border border-white/10 text-white text-sm focus:outline-none focus:border-plasma"
                >
                  {DISTRICT_OPTIONS.map((d) => (
                    <option key={d} value={d} className="bg-void text-white">
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-starlight">Дэлгэрэнгүй хаяг / Салон</label>
                <input
                  type="text"
                  placeholder="Жишээ: Мишээл Экспо, 2 давхарт В-08 павильон"
                  value={addressDetail}
                  onChange={(e) => setAddressDetail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-plasma"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-starlight">Facebook хуудасны линк</label>
                <input
                  type="url"
                  placeholder="https://facebook.com/..."
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-plasma"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-starlight">Instagram хаяг</label>
                <input
                  type="url"
                  placeholder="https://instagram.com/..."
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-plasma"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-starlight">Ашигладаг стандартууд (таслалаар тусгаарлах)</label>
                <input
                  type="text"
                  placeholder="E0 хавтан, Blum тоноглол, Акрил, Кварц чулуу..."
                  value={materialsUsed}
                  onChange={(e) => setMaterialsUsed(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-plasma"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Multi-Project Works with Reel Videos & Photo Galleries */}
          <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-6 bg-void/80">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Layers size={18} className="text-aurora" />
                  <span>4. Хийсэн ажлууд & Реел бичлэгүүд ({projects.length} ажил)</span>
                </h3>
                <p className="text-xs text-nebula-text/70 mt-0.5">
                  Нэгээс олон хийсэн төсөл ажлаа нэмж, зураг болон босоо реел бичлэгээ оруулна уу.
                </p>
              </div>

              {/* Add Project Button */}
              <button
                type="button"
                onClick={addProject}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-plasma/20 hover:bg-plasma/30 border border-plasma/40 text-plasma font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer self-start sm:self-auto"
              >
                <Plus size={15} />
                <span>+ Шинэ ажил / Төсөл нэмэх</span>
              </button>
            </div>

            {/* Project List */}
            <div className="space-y-6">
              {projects.map((proj, idx) => (
                <div
                  key={proj.id}
                  className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4 relative"
                >
                  {/* Project Card Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <span className="px-2.5 py-1 rounded-lg bg-plasma/20 text-plasma text-xs font-black uppercase tracking-wider">
                      Төсөл #{idx + 1}
                    </span>

                    {projects.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeProject(proj.id)}
                        className="text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-1 transition-colors"
                      >
                        <Trash2 size={14} />
                        <span>Энэ ажлыг устгах</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-bold text-starlight">Ажлын нэр / Төслийн гарчиг</label>
                      <input
                        type="text"
                        placeholder="Жишээ: Ривер гарден хотхоны Minimalist гал тогоо"
                        value={proj.title}
                        onChange={(e) => updateProjectField(proj.id, 'title', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-void border border-white/10 text-white text-sm focus:outline-none focus:border-plasma"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-starlight">Ангилал</label>
                      <select
                        value={proj.category}
                        onChange={(e) => updateProjectField(proj.id, 'category', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-void border border-white/10 text-white text-sm focus:outline-none focus:border-plasma"
                      >
                        {CATEGORY_OPTIONS.map((c) => (
                          <option key={c.id} value={c.id} className="bg-void text-white">
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-starlight">Хийсэн хугацаа (хоногоор)</label>
                      <input
                        type="number"
                        min="1"
                        value={proj.durationDays}
                        onChange={(e) => updateProjectField(proj.id, 'durationDays', Number(e.target.value))}
                        className="w-full px-4 py-2.5 rounded-xl bg-void border border-white/10 text-white text-sm focus:outline-none focus:border-plasma"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-starlight">Хэрэглэсэн материал, тоноглол</label>
                      <input
                        type="text"
                        placeholder="Жишээ: Egger E0 хавтан, Blum нугас, Кварц чулуу"
                        value={proj.materials}
                        onChange={(e) => updateProjectField(proj.id, 'materials', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-void border border-white/10 text-white text-sm focus:outline-none focus:border-plasma"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-starlight">Байршил / Хотхон</label>
                      <input
                        type="text"
                        placeholder="Жишээ: Ривер Гарден, Хан-Уул"
                        value={proj.location}
                        onChange={(e) => updateProjectField(proj.id, 'location', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-void border border-white/10 text-white text-sm focus:outline-none focus:border-plasma"
                      />
                    </div>

                    {/* Photos Upload for this project */}
                    <div className="sm:col-span-2 space-y-2 pt-2 border-t border-white/5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-starlight flex items-center gap-1.5">
                          <ImageIcon size={14} className="text-plasma" />
                          <span>Төслийн зургууд ({proj.images.length} зураг)</span>
                        </label>

                        <label className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer transition-all flex items-center gap-1">
                          <Plus size={12} />
                          <span>{proj.uploadingImages ? 'Хуулж байна...' : 'Зураг нэмэх'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => handleProjectImagesUpload(proj.id, e)}
                            disabled={proj.uploadingImages}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Images Grid */}
                      {proj.images.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 pt-1">
                          {proj.images.map((imgUrl, imgIdx) => (
                            <div
                              key={imgIdx}
                              className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-black group"
                            >
                              <img
                                src={getImageUrl(imgUrl)}
                                alt={`Project ${idx + 1} img ${imgIdx + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => removeProjectImage(proj.id, imgIdx)}
                                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600/80 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Reel Video for this project */}
                    <div className="sm:col-span-2 space-y-2 pt-2 border-t border-white/5">
                      <label className="text-xs font-bold text-starlight flex items-center gap-1.5">
                        <Video size={14} className="text-aurora" />
                        <span>Walkthrough Reel видео (Босоо 9:16 бичлэг, 90с хүртэл)</span>
                      </label>

                      {proj.videoUrl ? (
                        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                              <Play size={16} fill="currentColor" />
                            </div>
                            <span className="text-xs text-emerald-300 font-bold truncate">
                              ✓ Реел видео амжилттай хуулагдсан
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeProjectVideo(proj.id)}
                            className="text-xs text-red-400 hover:text-red-300 font-bold"
                          >
                            Устгах
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center p-4 border border-dashed border-white/15 hover:border-plasma rounded-xl cursor-pointer bg-void/50 hover:bg-plasma/5 transition-all text-center">
                          <Upload size={20} className="text-plasma mb-1" />
                          <span className="text-xs font-bold text-white">
                            {proj.uploadingVideo ? 'Видео хуулж байна...' : 'Энэ төслийн Реел видеог сонгох'}
                          </span>
                          <span className="text-[11px] text-nebula-text/60 mt-0.5">MP4 видео файл (90 секунд хүртэл)</span>
                          <input
                            type="file"
                            accept="video/mp4,video/quicktime,video/webm"
                            onChange={(e) => handleProjectVideoUpload(proj.id, e)}
                            disabled={proj.uploadingVideo}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Add Another Project button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={addProject}
                className="w-full py-3.5 rounded-2xl border-2 border-dashed border-white/20 hover:border-plasma hover:bg-plasma/5 text-nebula-text hover:text-plasma font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus size={16} />
                <span>+ Өөр нэг ажил / Төсөл нэмэх</span>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Link
              to="/furniture"
              className="px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm transition-all"
            >
              Цуцлах
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-plasma via-nova to-aurora hover:opacity-95 disabled:opacity-50 text-white font-black text-sm shadow-xl shadow-plasma/30 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
            >
              {saving ? 'Хадгалж байна...' : 'Урлангийн профайлыг нийтлэх'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFurnitureProfile;
