import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  PartyPopper,
  Upload,
  Plus,
  Trash2,
  CheckCircle,
  Loader2,
  Sparkles,
  Star,
  Video,
  X,
} from 'lucide-react';
import { getImageUrl } from '@/utils/imageUrl';
import {
  VideoEmbedPlayer,
  extractVideoSource,
} from '@/components/events/VideoEmbedPlayer';
import { eventsApi } from '@/services/eventsApi';
import { uploadsAPI } from '@/services/api';
import {
  VENUE_TYPES,
  EVENT_OCCASIONS,
  EVENT_DISTRICTS,
  type VenueType,
  type EventPackageItem,
} from '@/types/events';
import { useAuthStore } from '@/store/useAuthStore';
import { useI18n } from '@/i18n';

const DEFAULT_AMENITY_OPTIONS = [
  'LED Дэлгэц',
  'Тайз & Мэргэжлийн хөгжим',
  'Авто зогсоол',
  'VIP Өрөө',
  'Бүжгийн талбай',
  'Хувцас солих өрөө',
  'Караоке',
  'Заал чимэглэл',
];

export const CreateEventVenue: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const { isAuthenticated } = useAuthStore();
  const { lang } = useI18n();

  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [venueType, setVenueType] = useState<VenueType>('EVENT_HALL');
  const [eventTypes, setEventTypes] = useState<string[]>([
    'NEW_YEAR',
    'BIRTHDAY',
    'WEDDING',
  ]);
  const [minCapacity, setMinCapacity] = useState(20);
  const [maxCapacity, setMaxCapacity] = useState(200);
  const [pricePerPerson, setPricePerPerson] = useState<number | ''>(120000);
  const [hallRentalPrice, setHallRentalPrice] = useState<number | ''>('');
  const [district, setDistrict] = useState('Сүхбаатар');
  const [addressDetail, setAddressDetail] = useState('');
  const [phone, setPhone] = useState('');
  const [secondaryPhone, setSecondaryPhone] = useState('');
  const [email, setEmail] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imageUrlDraft, setImageUrlDraft] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [amenities, setAmenities] = useState<string[]>([
    'LED Дэлгэц',
    'Авто зогсоол',
  ]);
  const [customAmenity, setCustomAmenity] = useState('');
  const [packages, setPackages] = useState<EventPackageItem[]>([]);

  const [pkgName, setPkgName] = useState('');
  const [pkgPrice, setPkgPrice] = useState<number | ''>('');
  const [pkgMinGuests, setPkgMinGuests] = useState<number | ''>('');
  const [pkgDesc, setPkgDesc] = useState('');
  const [pkgIncludes, setPkgIncludes] = useState<string[]>([]);
  const [pkgIncludeDraft, setPkgIncludeDraft] = useState('');

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [orgChecked, setOrgChecked] = useState(false);
  const [hasOrg, setHasOrg] = useState(true);

  useEffect(() => {
    if (editId || !isAuthenticated) {
      setOrgChecked(true);
      return;
    }
    eventsApi
      .getMyOrg()
      .then((res) => {
        const org = res.data;
        if (!org) {
          setHasOrg(false);
        } else {
          setHasOrg(true);
          if (!phone && org.phone) setPhone(org.phone);
          if (!email && org.email) setEmail(org.email);
          if (org.district) setDistrict(org.district);
          if (!addressDetail && org.addressDetail) setAddressDetail(org.addressDetail);
        }
      })
      .catch(() => setHasOrg(false))
      .finally(() => setOrgChecked(true));
  }, [editId, isAuthenticated]);

  useEffect(() => {
    if (!editId) return;
    eventsApi
      .getOne(editId)
      .then((res) => {
        const v = res.data;
        setName(v.name || '');
        setTagline(v.tagline || '');
        setDescription(v.description || '');
        setVenueType(v.venueType || 'EVENT_HALL');
        setEventTypes(v.eventTypes || []);
        setMinCapacity(v.minCapacity || 20);
        setMaxCapacity(v.maxCapacity || 200);
        setPricePerPerson(v.pricePerPerson ?? '');
        setHallRentalPrice(v.hallRentalPrice ?? '');
        setDistrict(v.district || 'Сүхбаатар');
        setAddressDetail(v.addressDetail || '');
        setPhone(v.phone || '');
        setSecondaryPhone(v.secondaryPhone || '');
        setEmail(v.email || '');
        setCoverUrl(v.coverUrl || '');
        setImages(v.images || []);
        setVideoUrl(v.videoUrl || '');
        setAmenities(v.amenities || []);
        setPackages(v.packages || []);
      })
      .catch((err) => {
        console.error('Failed to load venue for editing:', err);
      });
  }, [editId]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-28 pb-16 px-4 max-w-lg mx-auto text-center">
        <div className="p-8 rounded-3xl bg-void/70 border border-white/15 space-y-4">
          <PartyPopper size={40} className="mx-auto text-plasma" />
          <h2 className="text-xl font-bold text-starlight">
            {lang === 'en'
              ? 'Sign in to list your venue'
              : 'Ресторан, эвент заалаа бүртгүүлэхийн тулд нэвтэрнэ үү'}
          </h2>
          <p className="text-sm text-nebula-text">
            {lang === 'en'
              ? 'Create an account or log in to publish your restaurant or event hall on Vmax.mn.'
              : 'Та нэвтэрсний дараа өөрийн ресторан, эвент заалаа байршуулж захиалга авах боломжтой.'}
          </p>
          <Link
            to="/login"
            className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-plasma to-nova text-white font-bold text-sm"
          >
            {lang === 'en' ? 'Go to Login' : 'Нэвтрэх'}
          </Link>
        </div>
      </div>
    );
  }

  if (!editId && orgChecked && !hasOrg) {
    return (
      <div className="min-h-screen pt-28 pb-16 px-4 max-w-lg mx-auto text-center">
        <div className="p-8 rounded-3xl bg-void/70 border border-plasma/30 space-y-4">
          <PartyPopper size={40} className="mx-auto text-plasma" />
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-plasma/20 text-plasma border border-plasma/30">
            Алхам 1: Байгууллагын Профайл (0/1)
          </span>
          <h2 className="text-xl font-bold text-starlight">
            {lang === 'en'
              ? 'Create your Organization Profile first'
              : 'Эхлээд Байгууллагын Профайлаа үүсгэнэ үү'}
          </h2>
          <p className="text-sm text-nebula-text">
            {lang === 'en'
              ? 'First create your 1/1 organization profile in Dashboard, then you can add your restaurants and event halls.'
              : 'Та эхлээд Хянах самбарт байгууллагын 1/1 профайлаа үүсгэсний дараа ресторан болон эвент заалуудаа нэмэх боломжтой.'}
          </p>
          <div className="flex justify-center pt-2">
            <Link
              to="/dashboard?section=events"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-plasma to-nova text-white font-bold text-sm"
            >
              {lang === 'en' ? 'Create Organization Profile' : 'Байгууллагын Профайл үүсгэх'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const toggleOccasion = (id: string) => {
    setEventTypes((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleAmenity = (item: string) => {
    setAmenities((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item],
    );
  };

  const handleAddCustomAmenity = () => {
    const val = customAmenity.trim();
    if (!val) return;
    setAmenities((prev) => (prev.includes(val) ? prev : [...prev, val]));
    setCustomAmenity('');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    setError('');
    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const res = await uploadsAPI.uploadFile(file);
        const url = res.data?.url || res.data?.path;
        if (url) uploadedUrls.push(url);
      }
      if (uploadedUrls.length > 0) {
        setImages((prev) => [...prev, ...uploadedUrls]);
        if (!coverUrl) setCoverUrl(uploadedUrls[0]);
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setError(
        lang === 'en' ? 'Image upload failed.' : 'Зураг хуулахад алдаа гарлаа.',
      );
    } finally {
      setUploading(false);
    }
  };

  const handleAddImageUrl = () => {
    const url = imageUrlDraft.trim();
    if (!url) return;
    setImages((prev) => (prev.includes(url) ? prev : [...prev, url]));
    if (!coverUrl) setCoverUrl(url);
    setImageUrlDraft('');
  };

  const handleRemoveImage = (urlToRemove: string) => {
    setImages((prev) => {
      const next = prev.filter((u) => u !== urlToRemove);
      if (coverUrl === urlToRemove) {
        setCoverUrl(next[0] || '');
      }
      return next;
    });
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');

    // Validate video duration <= 2 minutes (125s buffer)
    const objectUrl = URL.createObjectURL(file);
    const probe = document.createElement('video');
    probe.preload = 'metadata';
    probe.src = objectUrl;
    probe.onloadedmetadata = async () => {
      URL.revokeObjectURL(objectUrl);
      if (probe.duration > 125) {
        setError(
          lang === 'en'
            ? 'Reel video must be 2 minutes or shorter.'
            : 'Танилцуулах Reel бичлэг 2 минутаас хэтрэхгүй байх ёстой.',
        );
        return;
      }
      setUploadingVideo(true);
      try {
        const res = await uploadsAPI.uploadFile(file);
        const url = res.data?.url || res.data?.path;
        if (url) setVideoUrl(url);
      } catch (err) {
        console.error('Video upload failed:', err);
        setError(
          lang === 'en' ? 'Video upload failed.' : 'Видео хуулахад алдаа гарлаа.',
        );
      } finally {
        setUploadingVideo(false);
      }
    };
    probe.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setError(
        lang === 'en' ? 'Invalid video file.' : 'Видео файл уншихад алдаа гарлаа.',
      );
    };
  };

  const togglePkgInclude = (item: string) => {
    setPkgIncludes((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item],
    );
  };

  const addCustomPkgInclude = () => {
    const val = pkgIncludeDraft.trim();
    if (!val) return;
    setPkgIncludes((prev) => (prev.includes(val) ? prev : [...prev, val]));
    setPkgIncludeDraft('');
  };

  const addPackage = () => {
    if (!pkgName.trim() || !pkgPrice) return;
    setPackages((prev) => [
      ...prev,
      {
        id: `${Date.now()}`,
        name: pkgName.trim(),
        pricePerPerson: Number(pkgPrice),
        minGuests: pkgMinGuests ? Number(pkgMinGuests) : undefined,
        description: pkgDesc.trim() || undefined,
        includes: pkgIncludes,
      },
    ]);
    setPkgName('');
    setPkgPrice('');
    setPkgMinGuests('');
    setPkgDesc('');
    setPkgIncludes([]);
    setPkgIncludeDraft('');
  };

  const fillExampleProfile = () => {
    setName('Nomad Grand Restaurant & Event Hall');
    setTagline('Шинэ жил, Хурим, Төрсөн өдөр, Үсний найрын VIP ресторан & заал');
    setDescription(
      'Хотын төвд байрлах 250 хүртэлх хүний багтаамжтай, 4K LED дэлгэц, мэргэжлийн дуу хөгжим, тайз гэрэлтүүлэг болон 30 машины зогсоолтой тансаг зэрэглэлийн ресторан, эвент заал.',
    );
    setVenueType('EVENT_HALL');
    setEventTypes([
      'NEW_YEAR',
      'WEDDING',
      'BIRTHDAY',
      'HAIR_CEREMONY',
      'CORPORATE',
      'GRADUATION',
    ]);
    setMinCapacity(25);
    setMaxCapacity(250);
    setPricePerPerson(145000);
    setHallRentalPrice(0);
    setDistrict('Сүхбаатар');
    setAddressDetail('Чингисийн өргөн чөлөө 15, Grand Plaza 4 давхар');
    setPhone('9911-2233');
    setSecondaryPhone('7711-2233');
    setEmail('booking@nomadgrand.mn');
    setCoverUrl(
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1400&q=80',
    );
    setImages([
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    ]);
    setAmenities([
      'LED Дэлгэц',
      'Тайз & Мэргэжлийн хөгжим',
      'Авто зогсоол',
      'VIP Өрөө',
      'Бүжгийн талбай',
    ]);
    setPackages([
      {
        id: `${Date.now()}-1`,
        name: 'Шинэ жилийн Алтан багц',
        pricePerPerson: 165000,
        minGuests: 50,
        description: '4 хоолтой гала оройн зоог, угталтын коктейль, LED дэлгэц болон DJ.',
        includes: ['4 хоолтой меню', 'Угталтын дарс', 'LED дэлгэц & Тайз'],
      },
      {
        id: `${Date.now()}-2`,
        name: 'Хурим & Үсний найрын VIP багц',
        pricePerPerson: 145000,
        minGuests: 40,
        description: 'Баярын ширээ засалт, цэцгэн чимэглэл, VIP бэлтгэлийн өрөө.',
        includes: ['3 хоолтой меню', 'Чимэглэл', 'VIP өрөө'],
      },
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        name,
        tagline: tagline || undefined,
        description,
        venueType,
        eventTypes,
        minCapacity: Number(minCapacity),
        maxCapacity: Number(maxCapacity),
        pricePerPerson: pricePerPerson ? Number(pricePerPerson) : undefined,
        hallRentalPrice: hallRentalPrice ? Number(hallRentalPrice) : undefined,
        district,
        addressDetail: addressDetail || undefined,
        phone,
        secondaryPhone: secondaryPhone || undefined,
        email: email || undefined,
        coverUrl: coverUrl || images[0] || undefined,
        images,
        videoUrl: extractVideoSource(videoUrl) || undefined,
        amenities,
        packages,
      };
      const res = editId
        ? await eventsApi.update(editId, payload)
        : await eventsApi.create(payload);
      navigate(`/events/${res.data.id}`);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          (lang === 'en'
            ? 'Failed to create venue.'
            : 'Бүртгэхэд алдаа гарлаа. Мэдээллээ шалгана уу.'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <Link
        to="/events"
        className="inline-flex items-center gap-2 text-sm text-nebula-text hover:text-white mb-5"
      >
        <ArrowLeft size={16} />
        <span>{lang === 'en' ? 'Back to Events' : 'Эвент жагсаалт руу буцах'}</span>
      </Link>

      <div className="p-6 sm:p-8 rounded-3xl bg-void/70 border border-white/15 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-plasma to-aurora flex items-center justify-center text-white flex-shrink-0">
              <PartyPopper size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-heading font-black text-starlight">
                {editId
                  ? lang === 'en'
                    ? 'Edit Venue Profile'
                    : 'Байгууллагын Профайл засах'
                  : lang === 'en'
                  ? 'Register Restaurant or Event Hall'
                  : 'Ресторан / Эвент заал бүртгүүлэх'}
              </h1>
              <p className="text-xs text-nebula-text">
                {lang === 'en'
                  ? 'Reach customers looking for New Year, wedding, and birthday venues'
                  : 'Шинэ жил, хурим, төрсөн өдрийн захиалга хайж буй хэрэглэгчдэд хүрээрэй'}
              </p>
            </div>
          </div>

          {!editId && (
            <button
              type="button"
              onClick={fillExampleProfile}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold self-start sm:self-auto cursor-pointer"
            >
              <Sparkles size={14} />
              <span>{lang === 'en' ? 'Fill Example Profile' : 'Жишээ мэдээлэл бөглөх'}</span>
            </button>
          )}
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-nebula-text mb-1.5">
                {lang === 'en' ? 'Venue Name' : 'Газрын нэр'} *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Жишээ: Grand Horizon Event Hall"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-starlight focus:outline-none focus:border-plasma"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-nebula-text mb-1.5">
                {lang === 'en' ? 'Venue Type' : 'Төрөл'} *
              </label>
              <select
                value={venueType}
                onChange={(e) => setVenueType(e.target.value as VenueType)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-starlight focus:outline-none focus:border-plasma"
              >
                {VENUE_TYPES.map((vt) => (
                  <option key={vt.id} value={vt.id} className="bg-void">
                    {vt[lang]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-nebula-text mb-1.5">
              {lang === 'en' ? 'Short Tagline' : 'Товч уриа / Онцлог'}
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Жишээ: Шинэ жил, хурим найрын тансаг зэрэглэлийн их танхим"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-starlight focus:outline-none focus:border-plasma"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-nebula-text mb-1.5">
              {lang === 'en' ? 'Description' : 'Дэлгэрэнгүй танилцуулга'} *
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Танхимын хэмжээ, меню, тоног төхөөрөмж, давуу талуудын талаар бичнэ үү..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-starlight focus:outline-none focus:border-plasma resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-nebula-text mb-2">
              {lang === 'en'
                ? 'Suitable Event Occasions'
                : 'Тохирох арга хэмжээнүүд'}
            </label>
            <div className="flex flex-wrap gap-2">
              {EVENT_OCCASIONS.map((occ) => {
                const active = eventTypes.includes(occ.id);
                return (
                  <button
                    key={occ.id}
                    type="button"
                    onClick={() => toggleOccasion(occ.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      active
                        ? 'bg-plasma/20 border-plasma text-white'
                        : 'bg-white/5 border-white/10 text-nebula-text hover:text-white'
                    }`}
                  >
                    {occ.emoji} {occ[lang]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-nebula-text mb-1.5">
                {lang === 'en' ? 'Min Guests' : 'Доод багтаамж'}
              </label>
              <input
                type="number"
                min={1}
                value={minCapacity}
                onChange={(e) => setMinCapacity(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-starlight focus:outline-none focus:border-plasma"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-nebula-text mb-1.5">
                {lang === 'en' ? 'Max Guests' : 'Дээд багтаамж'}
              </label>
              <input
                type="number"
                min={1}
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-starlight focus:outline-none focus:border-plasma"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-nebula-text mb-1.5">
                {lang === 'en' ? 'Price / Guest (₮)' : '1 хүний үнэ (₮)'}
              </label>
              <input
                type="number"
                min={0}
                value={pricePerPerson}
                onChange={(e) =>
                  setPricePerPerson(
                    e.target.value ? Number(e.target.value) : '',
                  )
                }
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-starlight focus:outline-none focus:border-plasma"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-nebula-text mb-1.5">
                {lang === 'en' ? 'Hall Rental (₮)' : 'Заал түрээс (₮)'}
              </label>
              <input
                type="number"
                min={0}
                value={hallRentalPrice}
                onChange={(e) =>
                  setHallRentalPrice(
                    e.target.value ? Number(e.target.value) : '',
                  )
                }
                placeholder="Сонголттой"
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-starlight focus:outline-none focus:border-plasma"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-nebula-text mb-1.5">
                {lang === 'en' ? 'District' : 'Дүүрэг'} *
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-starlight focus:outline-none focus:border-plasma"
              >
                {EVENT_DISTRICTS.map((d) => (
                  <option key={d} value={d} className="bg-void">
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-nebula-text mb-1.5">
                {lang === 'en' ? 'Detailed Address' : 'Дэлгэрэнгүй хаяг'}
              </label>
              <input
                type="text"
                value={addressDetail}
                onChange={(e) => setAddressDetail(e.target.value)}
                placeholder="Хороо, гудамж, барилгын нэр, давхар"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-starlight focus:outline-none focus:border-plasma"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-nebula-text mb-1.5">
                {lang === 'en' ? 'Phone' : 'Утас'} *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9911-XXXX"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-starlight focus:outline-none focus:border-plasma"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-nebula-text mb-1.5">
                {lang === 'en' ? 'Secondary Phone' : 'Нэмэлт утас'}
              </label>
              <input
                type="tel"
                value={secondaryPhone}
                onChange={(e) => setSecondaryPhone(e.target.value)}
                placeholder="7711-XXXX"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-starlight focus:outline-none focus:border-plasma"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-nebula-text mb-1.5">
                {lang === 'en' ? 'Email' : 'И-мэйл'}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="events@venue.mn"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-starlight focus:outline-none focus:border-plasma"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-nebula-text mb-2">
              {lang === 'en' ? 'Amenities' : 'Боломжууд & Тоноглол'}
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {Array.from(new Set([...DEFAULT_AMENITY_OPTIONS, ...amenities])).map((item) => {
                const active = amenities.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleAmenity(item)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                      active
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                        : 'bg-white/5 border-white/10 text-nebula-text hover:text-white'
                    }`}
                  >
                    {active && <CheckCircle size={12} />}
                    {item}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customAmenity}
                onChange={(e) => setCustomAmenity(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomAmenity();
                  }
                }}
                placeholder={
                  lang === 'en'
                    ? 'Add custom amenity (e.g. Kids Playroom, Rooftop Terrace)...'
                    : 'Жагсаалтад байхгүй боломж нэмэх (жишээ: Гадна террас, Хүүхдийн өрөө)...'
                }
                className="flex-1 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-starlight focus:outline-none focus:border-plasma"
              />
              <button
                type="button"
                onClick={handleAddCustomAmenity}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-starlight flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} />
                <span>{lang === 'en' ? 'Add' : 'Нэмэх'}</span>
              </button>
            </div>
          </div>

          {/* Improved Photos + Cover Selector */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <label className="block text-xs font-bold text-starlight">
                  {lang === 'en' ? 'Venue Photos & Cover Image' : 'Зураг оруулах & Нүүр зураг сонгох'}
                </label>
                <p className="text-[11px] text-nebula-text">
                  {lang === 'en'
                    ? 'Upload multiple photos and click the star button to set your cover photo.'
                    : 'Олон зураг зэрэг хуулж, ⭐ Нүүр болгох товчоор үндсэн нүүр зургаа сонгоно уу.'}
                </p>
              </div>
              <label className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-plasma hover:bg-plasma/90 text-xs font-bold text-white cursor-pointer shadow-md">
                {uploading ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Upload size={15} />
                )}
                <span>{lang === 'en' ? 'Upload Photos' : 'Зураг хуулах'}</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex gap-2">
              <input
                type="url"
                value={imageUrlDraft}
                onChange={(e) => setImageUrlDraft(e.target.value)}
                placeholder="https://... зургийн линкээр нэмэх"
                className="flex-1 px-3.5 py-2 rounded-xl bg-void/70 border border-white/10 text-xs text-starlight focus:outline-none focus:border-plasma"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-starlight cursor-pointer"
              >
                + Нэмэх
              </button>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {images.map((img, idx) => {
                  const isCover = (coverUrl || images[0]) === img;
                  return (
                    <div
                      key={`${img}-${idx}`}
                      className={`relative group rounded-xl overflow-hidden border-2 aspect-[4/3] bg-void/80 ${
                        isCover ? 'border-amber-400 shadow-lg shadow-amber-500/20' : 'border-white/10'
                      }`}
                    >
                      <img
                        src={getImageUrl(img)}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(img)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 text-white hover:bg-red-500 transition-colors cursor-pointer"
                        title="Устгах"
                      >
                        <X size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCoverUrl(img)}
                        className={`absolute bottom-1.5 left-1.5 right-1.5 py-1 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all ${
                          isCover
                            ? 'bg-amber-400 text-void'
                            : 'bg-black/75 text-white hover:bg-plasma'
                        }`}
                      >
                        <Star size={11} className={isCover ? 'fill-void' : ''} />
                        <span>{isCover ? 'Нүүр зураг' : 'Нүүр болгох'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2-Minute Reels Video Upload */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <label className="block text-xs font-bold text-starlight flex items-center gap-1.5">
                  <Video size={14} className="text-aurora" />
                  <span>
                    {lang === 'en'
                      ? 'Walkthrough Reel Video (Up to 2 min)'
                      : 'Танилцуулах Reel бичлэг (2 минут хүртэл)'}
                  </span>
                </label>
                <p className="text-[11px] text-nebula-text">
                  {lang === 'en'
                    ? 'Upload MP4/MOV or paste a Facebook Video/Reel/Embed (<iframe>) or YouTube link.'
                    : 'MP4/MOV бичлэг хуулах эсвэл Facebook Reel / Video / Embed (<iframe>), YouTube линк оруулна уу.'}
                </p>
              </div>
              <label className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-aurora/20 hover:bg-aurora/30 border border-aurora/40 text-xs font-bold text-aurora cursor-pointer">
                {uploadingVideo ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Video size={15} />
                )}
                <span>{lang === 'en' ? 'Upload Reel' : 'Видео хуулах'}</span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                />
              </label>
            </div>

            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(extractVideoSource(e.target.value))}
              placeholder="Facebook Reel/Video линк, <iframe ...> embed код, эсвэл MP4 линк оруулах"
              className="w-full px-3.5 py-2 rounded-xl bg-void/70 border border-white/10 text-xs text-starlight focus:outline-none focus:border-aurora"
            />

            {videoUrl && (
              <div className="relative rounded-xl overflow-hidden bg-black border border-white/10">
                <VideoEmbedPlayer url={videoUrl} maxHeightClass="max-h-60" />
                <button
                  type="button"
                  onClick={() => setVideoUrl('')}
                  className="absolute top-2 right-2 z-10 px-2.5 py-1 rounded-lg bg-black/75 text-white hover:bg-red-500 text-[11px] font-bold cursor-pointer"
                >
                  Устгах
                </button>
              </div>
            )}
          </div>

          {/* Improved Event Packages Builder */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <label className="block text-xs font-bold text-starlight">
                  {lang === 'en'
                    ? 'Event Packages & Menus (Optional)'
                    : 'Эвентийн багц & Меню нэмэх (Сонголттой)'}
                </label>
                <p className="text-[11px] text-nebula-text">
                  {lang === 'en'
                    ? 'Add packages like New Year Gold, Wedding VIP, or Birthday Set.'
                    : 'Шинэ жилийн Алтан багц, Хуримын VIP багц зэргээр үнийн багцаа үүсгэнэ үү.'}
                </p>
              </div>
              {packages.length > 0 && (
                <span className="px-2.5 py-1 rounded-lg bg-plasma/20 text-plasma text-[11px] font-bold">
                  {packages.length} багц
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <input
                type="text"
                value={pkgName}
                onChange={(e) => setPkgName(e.target.value)}
                placeholder={lang === 'en' ? 'Package name (e.g. Gold)' : 'Багцын нэр (жишээ: Алтан багц)'}
                className="sm:col-span-5 px-3.5 py-2.5 rounded-xl bg-void/70 border border-white/10 text-xs text-starlight focus:outline-none focus:border-plasma"
              />
              <input
                type="number"
                min={0}
                value={pkgPrice}
                onChange={(e) =>
                  setPkgPrice(e.target.value ? Number(e.target.value) : '')
                }
                placeholder={lang === 'en' ? 'Price / guest (₮)' : '1 хүний үнэ (₮)'}
                className="sm:col-span-4 px-3.5 py-2.5 rounded-xl bg-void/70 border border-white/10 text-xs text-starlight focus:outline-none focus:border-plasma"
              />
              <input
                type="number"
                min={1}
                value={pkgMinGuests}
                onChange={(e) =>
                  setPkgMinGuests(e.target.value ? Number(e.target.value) : '')
                }
                placeholder={lang === 'en' ? 'Min guests' : 'Доод хүн (жишээ: 30)'}
                className="sm:col-span-3 px-3.5 py-2.5 rounded-xl bg-void/70 border border-white/10 text-xs text-starlight focus:outline-none focus:border-plasma"
              />
            </div>

            <input
              type="text"
              value={pkgDesc}
              onChange={(e) => setPkgDesc(e.target.value)}
              placeholder={
                lang === 'en'
                  ? 'Short package description...'
                  : 'Багцын товч тайлбар (жишээ: 4 хоолтой гала оройн зоог, угталтын коктейль)'
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-void/70 border border-white/10 text-xs text-starlight focus:outline-none focus:border-plasma"
            />

            <div className="space-y-2">
              <span className="block text-[11px] font-semibold text-nebula-text">
                {lang === 'en' ? 'Included in package:' : 'Багцад багтах зүйлс (сонгох эсвэл нэмэх):'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  '3 хоолтой меню',
                  '4 хоолтой гала меню',
                  'Угталтын оргилуун дарс',
                  'LED дэлгэц & тайз',
                  'VIP өрөө',
                  'Ширээ чимэглэл',
                  'DJ / Хөгжим',
                ].map((tag) => {
                  const active = pkgIncludes.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => togglePkgInclude(tag)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                        active
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                          : 'bg-void/60 border-white/10 text-nebula-text hover:text-white'
                      }`}
                    >
                      {active ? '✓ ' : '+ '}
                      {tag}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={pkgIncludeDraft}
                  onChange={(e) => setPkgIncludeDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomPkgInclude();
                    }
                  }}
                  placeholder={lang === 'en' ? 'Custom included item...' : 'Өөр зүйл нэмэх (жишээ: Фото булан)...'}
                  className="flex-1 px-3 py-2 rounded-xl bg-void/70 border border-white/10 text-xs text-starlight focus:outline-none focus:border-plasma"
                />
                <button
                  type="button"
                  onClick={addCustomPkgInclude}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-starlight cursor-pointer"
                >
                  + Нэмэх
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={addPackage}
              disabled={!pkgName.trim() || !pkgPrice}
              className="w-full py-2.5 rounded-xl bg-plasma/20 hover:bg-plasma/30 border border-plasma/40 text-xs font-bold text-plasma flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              <Plus size={15} />
              <span>{lang === 'en' ? 'Add This Package' : 'Энэ багцыг нэмэх'}</span>
            </button>

            {packages.length > 0 && (
              <div className="space-y-2.5 pt-2 border-t border-white/10">
                {packages.map((p) => {
                  const title = p.name || (p as any).title;
                  return (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-xl bg-void/80 border border-white/10 text-xs space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-bold text-starlight text-sm">{title}</span>
                          <span className="ml-2 text-aurora font-black">
                            {(p.pricePerPerson || 0).toLocaleString()}₮/хүн
                          </span>
                          {p.minGuests && (
                            <span className="ml-2 text-[11px] text-nebula-text">
                              (Доод {p.minGuests} хүн)
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setPackages((prev) => prev.filter((x) => x.id !== p.id))
                          }
                          className="p-1 text-red-400 hover:text-red-300 cursor-pointer"
                          title="Устгах"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      {p.description && (
                        <p className="text-nebula-text text-[11px]">{p.description}</p>
                      )}
                      {p.includes && p.includes.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {p.includes.map((inc, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-starlight"
                            >
                              ✓ {inc}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-plasma via-nova to-aurora text-white font-bold text-sm shadow-lg shadow-plasma/25 hover:opacity-95 transition-opacity disabled:opacity-50"
          >
            {submitting
              ? lang === 'en'
                ? 'Publishing...'
                : 'Бүртгэж байна...'
              : lang === 'en'
              ? 'Publish Venue'
              : 'Нийтлэх'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateEventVenue;
