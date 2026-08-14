import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import LocationPicker from '@/components/map/LocationPicker';
import { useI18n } from '@/i18n';
import { useNavigate } from 'react-router-dom';
import { listingsAPI, uploadAPI, locationsAPI } from '@/services/api';
import {
  Image as ImageIcon,
  X,
  Upload,
  Plus,
  Star,
  GripVertical,
  ArrowLeft,
  ArrowRight,
  Layers,
  Building,
  Calendar,
  Wrench,
  Compass,
  Car,
  CheckCircle,
  Phone,
} from 'lucide-react';
import { PriceInput } from '@/components/common/PriceInput';
import { useAuthStore } from '@/store/useAuthStore';


const CreateListing = () => {
  const { t } = useI18n();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Core Form State
  const [type, setType] = useState('SALE');
  const [category, setCategory] = useState('APARTMENT');
  const [title, setTitle] = useState('');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [step1Error, setStep1Error] = useState('');

  useEffect(() => {
    if (user?.phone && !contactPhone) {
      setContactPhone(user.phone);
    }
  }, [user?.phone]);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [areaSqm, setAreaSqm] = useState('');
  const [district, setDistrict] = useState('Хан-Уул');
  const [khoroo, setKhoroo] = useState('11-р хороо');
  const [khorooList, setKhorooList] = useState<string[]>([]);
  const [location] = useState('Улаанбаатар');
  const [lat, setLat] = useState(47.8864);
  const [lng, setLng] = useState(106.9056);

  useEffect(() => {
    locationsAPI.getKhoroos(district)
      .then((res) => {
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          const khoroos = res.data.map((item: any) => item.khoroo);
          setKhorooList(khoroos);
          if (!khoroos.includes(khoroo)) {
            setKhoroo(khoroos[0] || '1-р хороо');
          }
        }
      })
      .catch(() => {
        // Fallback if API offline
      });
  }, [district]);

  // Asset Specific Attributes State (Dynamic Schema)
  const [rooms, setRooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [floor, setFloor] = useState('');
  const [totalFloors, setTotalFloors] = useState('');
  const [yearBuilt, setYearBuilt] = useState('');
  const [constructionType, setConstructionType] = useState('');
  const [condition, setCondition] = useState('');
  const [windowDirections, setWindowDirections] = useState('');
  const [balcony, setBalcony] = useState('');
  const [garage, setGarage] = useState('');
  const [elevator, setElevator] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');

  // Image Upload State & Drag Reorder
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;

    setUploadingImages(true);
    const newPreviews = selected.map((file) => URL.createObjectURL(file));
    setImageFiles((prev) => [...prev, ...selected]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);

    try {
      const uploadRes = await uploadAPI.uploadFiles(selected);
      if (uploadRes.data?.urls) {
        setUploadedUrls((prev) => [...prev, ...uploadRes.data.urls]);
      } else {
        setUploadedUrls((prev) => [...prev, ...newPreviews]);
      }
    } catch {
      setUploadedUrls((prev) => [...prev, ...newPreviews]);
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setUploadedUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDropDropzone = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
    if (droppedFiles.length > 0) {
      const eventObj = { target: { files: droppedFiles } } as any;
      handleImageSelect(eventObj);
    }
  };

  // Reorder Images Logic
  const reorderImage = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= imagePreviews.length || toIndex >= imagePreviews.length) return;

    const newPreviews = [...imagePreviews];
    const newFiles = [...imageFiles];
    const newUrls = [...uploadedUrls];

    const [movedPreview] = newPreviews.splice(fromIndex, 1);
    newPreviews.splice(toIndex, 0, movedPreview);

    if (newFiles.length > fromIndex) {
      const [movedFile] = newFiles.splice(fromIndex, 1);
      newFiles.splice(toIndex, 0, movedFile);
    }

    if (newUrls.length > fromIndex) {
      const [movedUrl] = newUrls.splice(fromIndex, 1);
      newUrls.splice(toIndex, 0, movedUrl);
    }

    setImagePreviews(newPreviews);
    setImageFiles(newFiles);
    setUploadedUrls(newUrls);
  };

  const handleMakeMain = (index: number) => {
    reorderImage(index, 0);
  };

  const handleDragStartThumbnail = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDropThumbnail = (targetIndex: number) => {
    if (draggedIndex !== null) {
      reorderImage(draggedIndex, targetIndex);
      setDraggedIndex(null);
    }
  };

  const handleNextStep1 = () => {
    if (!title.trim()) {
      setStep1Error('Зарын гарчгийг оруулна уу.');
      return;
    }
    const cleanPhone = (contactPhone || '').replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 8) {
      setStep1Error('Утасны дугааргүй зар оруулах боломжгүй! 8 оронтой холбоо барих дугаар заавал оруулна уу.');
      return;
    }
    setStep1Error('');
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('type', type);
      formData.append('category', category);
      formData.append('price', price);
      formData.append('areaSqm', areaSqm);
      formData.append('district', district);
      formData.append('khoroo', khoroo);
      formData.append('location', location);
      formData.append('contactPhone', contactPhone);
      // Only include user-specified attributes without fake hardcoded fallbacks
      const attrPayload: Record<string, any> = {};
      if (rooms) { attrPayload.rooms = Number(rooms); attrPayload.bedrooms = Number(rooms); }
      if (bathrooms) attrPayload.bathrooms = Number(bathrooms);
      if (floor) attrPayload.floor = Number(floor);
      if (totalFloors) attrPayload.totalFloors = Number(totalFloors);
      if (yearBuilt) attrPayload.yearBuilt = Number(yearBuilt);
      if (constructionType) attrPayload.constructionType = constructionType;
      if (condition) attrPayload.condition = condition;
      if (windowDirections) attrPayload.windowDirections = windowDirections;
      if (balcony) attrPayload.balcony = balcony;
      if (garage) attrPayload.garage = garage;
      if (elevator) attrPayload.elevator = elevator;
      if (paymentTerms) attrPayload.paymentTerms = paymentTerms;

      formData.append('attributes', JSON.stringify(attrPayload));


      // Attach reordered final uploaded image URLs or previews
      const finalImages = uploadedUrls.length > 0 ? uploadedUrls : imagePreviews;
      formData.append('images', JSON.stringify(finalImages));

      await listingsAPI.create(formData);
      navigate('/dashboard');
    } catch {
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-8 border-glow">
        <h2 className="text-3xl font-heading font-bold text-glow mb-8 text-center">{t.createListing.title}</h2>

        <div className="flex justify-between mb-8 relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-void -z-10 -translate-y-1/2">
            <div className="h-full bg-plasma transition-all duration-300" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-colors ${step >= i ? 'bg-plasma text-white-force shadow-lg shadow-plasma/30' : 'bg-void text-nebula-text'}`}>
              {i}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-xl text-starlight font-bold mb-4">Ерөнхий мэдээлэл</h3>
            <div>
              <label className="block text-xs font-semibold text-nebula-text mb-1">Зарын төрөл</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-3 text-starlight focus:outline-none focus:border-plasma">
                <option value="SALE">{t.listings.sale}</option>
                <option value="RENT">{t.listings.rent}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-nebula-text mb-1">Ангилал</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-3 text-starlight focus:outline-none focus:border-plasma">
                <option value="APARTMENT">{t.filters.apartment}</option>
                <option value="HOUSE">{t.filters.house}</option>
                {/* <option value="LAND">{t.filters.land}</option> */}
                <option value="COMMERCIAL">{t.filters.commercial}</option>
                {/* <option value="RESORT">{t.filters.resort}</option> */}
              </select>

            </div>
            <div>
              <label className="block text-xs font-semibold text-nebula-text mb-1">Зарын гарчиг</label>
              <input type="text" value={title} onChange={(e) => { setTitle(e.target.value); if (step1Error) setStep1Error(''); }} placeholder="Жишээ: King Tower, 137мкв 3 өрөө байр зарна" className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-3 text-starlight placeholder-nebula-text focus:outline-none focus:border-plasma" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-starlight flex items-center space-x-1">
                  <span>Холбоо барих утасны дугаар</span>
                  <span className="text-red-400">*</span>
                </label>
                {user?.phone && (
                  <span className="text-[11px] text-aurora font-medium bg-aurora/10 px-2 py-0.5 rounded-full border border-aurora/20">
                    Бүртгэлтэй дугаар: {user.phone}
                  </span>
                )}
              </div>

              <div className="relative">
                <Phone size={18} className="absolute left-3.5 top-3.5 text-plasma" />
                <input
                  type="tel"
                  required
                  value={contactPhone}
                  onChange={(e) => {
                    setContactPhone(e.target.value);
                    if (step1Error) setStep1Error('');
                  }}
                  placeholder={user?.phone ? `Жишээ: ${user.phone}` : 'Жишээ: 89767700 эсвэл 99118888'}
                  maxLength={12}
                  className="w-full bg-void/50 border border-white/10 rounded-xl pl-11 pr-24 py-3 text-starlight placeholder-nebula-text focus:outline-none focus:border-plasma"
                />
                {user?.phone && contactPhone !== user.phone && (
                  <button
                    type="button"
                    onClick={() => { setContactPhone(user.phone || ''); if (step1Error) setStep1Error(''); }}
                    className="absolute right-2.5 top-2.5 text-[11px] bg-plasma/20 hover:bg-plasma/40 text-plasma px-2.5 py-1 rounded-lg border border-plasma/30 transition-all font-medium"
                  >
                    Үндсэн дугаар
                  </button>
                )}
              </div>
              <p className="text-[11px] text-nebula-text">
                💡 Та өөрийн бүртгэлтэй үндсэн дугаараа ашиглах эсвэл энэхүү зард зориулан өөр дугаар оруулж болно.
              </p>
            </div>

            {step1Error && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-400 text-xs font-semibold">
                ⚠️ {step1Error}
              </div>
            )}

            <button
              type="button"
              onClick={handleNextStep1}
              className="w-full bg-gradient-to-r from-plasma to-nova text-white-force font-medium py-3 rounded-xl hover:shadow-lg hover:shadow-plasma/30 transition-all mt-4"
            >
              Дараах ({t.createListing.next})
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-xl text-starlight font-bold mb-2">Байршил & Үл Хөдлөх Хөрөнгийн Дэлгэрэнгүй Үзүүлэлтүүд</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-nebula-text mb-1">Улаанбаатарын Дүүрэг</label>
                <select value={district} onChange={(e) => setDistrict(e.target.value)} className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-3 text-starlight focus:outline-none focus:border-plasma">
                  <option value="Баянгол">{t.filters.districts.bayangol}</option>
                  <option value="Баянзүрх">{t.filters.districts.bayanzurkh}</option>
                  <option value="Сонгинохайрхан">{t.filters.districts.songinokhairkhan}</option>
                  <option value="Сүхбаатар">{t.filters.districts.sukhbaatar}</option>
                  <option value="Хан-Уул">{t.filters.districts.khanuul}</option>
                  <option value="Чингэлтэй">{t.filters.districts.chingeltei}</option>
                  <option value="Багануур">{t.filters.districts.baganuur}</option>
                  <option value="Багахангай">{t.filters.districts.bagakhangai}</option>
                  <option value="Налайх">{t.filters.districts.nalaikh}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-nebula-text mb-1">Хорооны дугаар / Хороо</label>
                <select
                  value={khoroo}
                  onChange={(e) => setKhoroo(e.target.value)}
                  className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-3 text-starlight focus:outline-none focus:border-plasma"
                >
                  {khorooList.length > 0 ? (
                    khorooList.map((kh) => (
                      <option key={kh} value={kh}>{kh}</option>
                    ))
                  ) : (
                    Array.from({ length: 25 }, (_, i) => `${i + 1}-р хороо`).map((kh) => (
                      <option key={kh} value={kh}>{kh}</option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-nebula-text mb-1">Өрөөний тоо</label>
                <select value={rooms} onChange={(e) => setRooms(e.target.value)} className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-3 text-starlight focus:outline-none focus:border-plasma">
                  <option value="1">1 өрөө</option>
                  <option value="2">2 өрөө</option>
                  <option value="3">3 өрөө</option>
                  <option value="4">4 өрөө</option>
                  <option value="5">5+ өрөө</option>
                </select>
              </div>
            </div>

            {/* Expanded Asset Attributes Form Grid */}
            <div className="p-4 bg-void/40 border border-white/10 rounded-2xl space-y-4">
              <div className="text-sm font-bold text-plasma flex items-center">
                <Layers size={16} className="mr-2" />
                <span>{t.assetAttributes.title} (Unegui.mn Стандарт)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-nebula-text mb-1 flex items-center">
                    <Layers size={12} className="mr-1 text-plasma" />
                    <span>{t.assetAttributes.floor}</span>
                  </label>
                  <input type="number" value={floor} onChange={(e) => setFloor(e.target.value)} placeholder="9" className="w-full bg-void/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-starlight focus:outline-none focus:border-plasma" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-nebula-text mb-1 flex items-center">
                    <Building size={12} className="mr-1 text-plasma" />
                    <span>{t.assetAttributes.totalFloors}</span>
                  </label>
                  <input type="number" value={totalFloors} onChange={(e) => setTotalFloors(e.target.value)} placeholder="16" className="w-full bg-void/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-starlight focus:outline-none focus:border-plasma" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-nebula-text mb-1 flex items-center">
                    <Calendar size={12} className="mr-1 text-plasma" />
                    <span>{t.assetAttributes.yearBuilt}</span>
                  </label>
                  <input type="number" value={yearBuilt} onChange={(e) => setYearBuilt(e.target.value)} placeholder="2020" className="w-full bg-void/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-starlight focus:outline-none focus:border-plasma" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-nebula-text mb-1 flex items-center">
                    <Building size={12} className="mr-1 text-plasma" />
                    <span>{t.assetAttributes.constructionType}</span>
                  </label>
                  <select value={constructionType} onChange={(e) => setConstructionType(e.target.value)} className="w-full bg-void/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-starlight focus:outline-none focus:border-plasma">
                    <option value="Бүрэн цутгамал">Бүрэн цутгамал (Cast Concrete)</option>
                    <option value="Төмөр бетонон">Төмөр бетонон (Reinforced Concrete)</option>
                    <option value="Тоосгон">Тоосгон (Brick Building)</option>
                    <option value="Панелан">Панелан (Panel Building)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-nebula-text mb-1 flex items-center">
                    <Wrench size={12} className="mr-1 text-plasma" />
                    <span>{t.assetAttributes.condition}</span>
                  </label>
                  <select value={condition} onChange={(e) => setCondition(e.target.value)} className="w-full bg-void/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-starlight focus:outline-none focus:border-plasma">
                    <option value="Шинэ (Оршин сууж байгаагүй)">Шинэ (Оршин сууж байгаагүй)</option>
                    <option value="Бүрэн засварласан">Бүрэн засварласан (Fully Renovated)</option>
                    <option value="Дунд зэрэг">Дунд зэрэг (Good Condition)</option>
                    <option value="Засвар шаардлагатай">Засвар шаардлагатай (Needs Renovation)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-nebula-text mb-1 flex items-center">
                    <Compass size={12} className="mr-1 text-plasma" />
                    <span>{t.assetAttributes.windowDirections}</span>
                  </label>
                  <input type="text" value={windowDirections} onChange={(e) => setWindowDirections(e.target.value)} placeholder="Өмнө, Зүүн (Наран талтай)" className="w-full bg-void/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-starlight focus:outline-none focus:border-plasma" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-nebula-text mb-1 flex items-center">
                    <Car size={12} className="mr-1 text-plasma" />
                    <span>{t.assetAttributes.garage}</span>
                  </label>
                  <select value={garage} onChange={(e) => setGarage(e.target.value)} className="w-full bg-void/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-starlight focus:outline-none focus:border-plasma">
                    <option value="Дулаан гарааштай">Дулаан гарааштай (Heated Garage)</option>
                    <option value="Гадна зогсоолтой">Гадна зогсоолтой (Outdoor Parking)</option>
                    <option value="Зогсоолгүй">Зогсоолгүй (No Garage)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Google Map Location Picker */}
            <LocationPicker
              latitude={lat}
              longitude={lng}
              onChange={(newLat, newLng) => {
                setLat(newLat);
                setLng(newLng);
              }}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PriceInput
                value={price}
                onChange={setPrice}
                label="Үнэ (₮)"
                placeholder="Жишээ: 850,000,000"
                showQuickAmounts
                mode={type === 'RENT' ? 'rent' : 'sale'}
                required
              />
              <div>
                <label className="block text-xs font-semibold text-nebula-text mb-1.5 flex items-center justify-between">
                  <span>Талбай (м.кв)</span>
                </label>
                <input
                  type="number"
                  value={areaSqm}
                  onChange={(e) => setAreaSqm(e.target.value)}
                  placeholder="137"
                  className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-3 text-starlight placeholder-nebula-text focus:outline-none focus:border-plasma text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-nebula-text mb-1">Тайлбар</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="King Tower-д 137мкв 3 өрөө байр зарна..." rows={3} className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-3 text-starlight placeholder-nebula-text focus:outline-none focus:border-plasma resize-none"></textarea>
            </div>

            <div className="flex space-x-4 pt-2">
              <button onClick={() => setStep(1)} className="w-1/2 bg-void/50 border border-white/10 text-starlight font-medium py-3 rounded-xl hover:bg-plasma/20 transition-all">Буцах</button>
              <button onClick={() => setStep(3)} className="w-1/2 bg-gradient-to-r from-plasma to-nova text-white-force font-medium py-3 rounded-xl hover:shadow-lg hover:shadow-plasma/30 transition-all">Дараах</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-xl text-starlight font-bold">Зураг оруулах & Дараалал тохируулах</h3>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />

            {/* Drag & Drop Upload Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDropDropzone}
              className="border-2 border-dashed border-white/20 rounded-2xl p-6 text-center hover:border-plasma transition-all cursor-pointer bg-void/40 hover:bg-plasma/10"
            >
              <div className="text-plasma mb-2 flex justify-center">
                {uploadingImages ? (
                  <Upload className="h-10 w-10 animate-bounce text-plasma" />
                ) : (
                  <ImageIcon className="h-10 w-10 text-plasma" />
                )}
              </div>
              <div className="text-sm font-bold text-starlight mb-1">
                {uploadingImages ? 'Зураг хуулж байна...' : 'Үл хөдлөх хөрөнгийн зураг сонгох'}
              </div>
              <div className="text-xs text-nebula-text">
                Зургаа оруулсны дараа чирж байрлал солих эсвэл ⭐ дарж нүүр зураг болгоно уу
              </div>
            </div>

            {/* Uploaded Image Previews Grid with Drag & Drop Reordering */}
            {imagePreviews.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="text-xs font-semibold text-starlight flex items-center justify-between">
                  <span>Сонгосон зураг ({imagePreviews.length}) — Эхний зураг зарын нүүр зураг болно</span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-plasma hover:underline text-xs flex items-center space-x-1 font-semibold"
                  >
                    <Plus size={14} />
                    <span>Зураг нэмэх</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {imagePreviews.map((src, idx) => {
                    const isMain = idx === 0;

                    return (
                      <div
                        key={idx}
                        draggable
                        onDragStart={() => handleDragStartThumbnail(idx)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDropThumbnail(idx)}
                        className={`relative group rounded-xl overflow-hidden border transition-all bg-cosmic shadow-md ${
                          isMain
                            ? 'border-plasma ring-2 ring-plasma/50 shadow-plasma/30'
                            : 'border-white/10 hover:border-plasma/40'
                        }`}
                      >
                        <div className="h-32 w-full overflow-hidden relative">
                          <img src={src} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />

                          {/* Top Controls Overlay */}
                          <div className="absolute top-2 left-2 right-2 flex justify-between items-center z-10">
                            {/* Make Main / Cover Star Button */}
                            <button
                              type="button"
                              onClick={() => handleMakeMain(idx)}
                              title={isMain ? 'Нүүр зураг' : 'Нүүр зураг болгох'}
                              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 backdrop-blur-md transition-all ${
                                isMain
                                  ? 'bg-plasma text-white-force shadow-lg shadow-plasma/50 ring-1 ring-white'
                                  : 'bg-black/60 text-white hover:bg-plasma hover:text-white'
                              }`}
                            >
                              <Star size={12} className={isMain ? 'fill-white' : ''} />
                              <span>{isMain ? 'Нүүр зураг' : 'Нүүр болгох'}</span>
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="p-1.5 bg-black/70 hover:bg-red-500 text-white rounded-lg transition-colors"
                              title="Устгах"
                            >
                              <X size={14} />
                            </button>
                          </div>

                          {/* Reorder Arrows & Drag Handle */}
                          <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center z-10 opacity-90">
                            <div className="flex items-center space-x-1">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => reorderImage(idx, idx - 1)}
                                className="p-1 bg-black/60 text-white hover:bg-plasma rounded disabled:opacity-30"
                                title="Зүүн тийш зөөх"
                              >
                                <ArrowLeft size={12} />
                              </button>
                              <button
                                type="button"
                                disabled={idx === imagePreviews.length - 1}
                                onClick={() => reorderImage(idx, idx + 1)}
                                className="p-1 bg-black/60 text-white hover:bg-plasma rounded disabled:opacity-30"
                                title="Баруун тийш зөөх"
                              >
                                <ArrowRight size={12} />
                              </button>
                            </div>
                            <div className="flex items-center space-x-1 text-[10px] text-white/90 bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm cursor-grab">
                              <GripVertical size={12} />
                              <span>#{idx + 1}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex space-x-4 mt-8">
              <button onClick={() => setStep(2)} className="w-1/2 bg-void/50 border border-white/10 text-starlight font-medium py-3 rounded-xl hover:bg-plasma/20 transition-all">Буцах</button>
              <button onClick={handleSubmit} disabled={loading} className="w-1/2 bg-gradient-to-r from-plasma to-nova text-white-force font-medium py-3 rounded-xl hover:shadow-lg hover:shadow-plasma/30 transition-all">
                {loading ? t.common.loading : t.createListing.submit}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default CreateListing;
