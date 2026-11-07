import React, { useState } from 'react';
import {
  X,
  Plus,
  Video,
  Image as ImageIcon,
  Upload,
  Play,
  Layers,
  AlertCircle,
} from 'lucide-react';
import { furnitureApi } from '@/services/furnitureApi';
import { uploadsAPI } from '@/services/api';
import { getImageUrl } from '@/utils/imageUrl';
import type { FurnitureMaker } from '@/types/furniture';

const CATEGORY_OPTIONS = [
  { id: 'KITCHEN', label: 'Гал тогооны тавилга' },
  { id: 'WARDROBE', label: 'Шүүгээ & Шкаф' },
  { id: 'LIVING_ROOM', label: 'Зочны өрөө' },
  { id: 'KIDS', label: 'Хүүхдийн өрөө' },
  { id: 'OFFICE', label: 'Оффис тавилга' },
  { id: 'SOLID_WOOD', label: 'Цэвэр модон хийц' },
  { id: 'CUSTOM', label: 'Захиалгат хийц' },
];

interface AddPortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  makerId: string;
  defaultDistrict?: string;
  onSuccess: (updatedMaker: FurnitureMaker) => void;
}

export const AddPortfolioModal: React.FC<AddPortfolioModalProps> = ({
  isOpen,
  onClose,
  makerId,
  defaultDistrict = 'Хан-Уул',
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('KITCHEN');
  const [materials, setMaterials] = useState('');
  const [location, setLocation] = useState(defaultDistrict);
  const [durationDays, setDurationDays] = useState(14);
  const [images, setImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;
    setUploadingImages(true);
    try {
      const res = await uploadsAPI.uploadFiles(files);
      if (res.data?.urls) {
        setImages((prev) => [...prev, ...res.data.urls]);
      }
    } catch (err) {
      console.warn('Images upload error:', err);
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingVideo(true);
    try {
      const res = await uploadsAPI.uploadListingVideo('furniture-projects', file);
      if (res.data?.url) {
        setVideoUrl(res.data.url);
      }
    } catch (err) {
      console.warn('Video upload error:', err);
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Төслийн нэрийг оруулна уу.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        title: title.trim(),
        category,
        materials: materials.trim() || undefined,
        location: location.trim() || defaultDistrict,
        durationDays: Number(durationDays) || 14,
        images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80'],
        videoUrl: videoUrl || undefined,
        year: '2026',
      };

      const res = await furnitureApi.addPortfolioItem(makerId, payload);
      onSuccess(res.data);
      onClose();
    } catch (err: any) {
      console.error('Failed to add portfolio item:', err);
      setError(err.response?.data?.message || 'Ажил нэмэхэд алдаа гарлаа.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-void border border-white/15 p-6 shadow-2xl text-white space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-plasma/20 text-plasma flex items-center justify-center">
              <Layers size={18} />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Шинэ ажил / Төсөл нэмэх</h3>
              <p className="text-xs text-nebula-text/70">Хийсэн ажлын зураг болон реел бичлэгээ оруулна уу</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-bold flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-starlight">
              Төсөл / Ажлын нэр <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Жишээ: Зайсан хотхоны орчин үеийн гал тогоо"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-plasma"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-starlight">Ангилал</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
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
              <label className="text-xs font-bold text-starlight">Гүйцэтгэсэн хугацаа (хоногоор)</label>
              <input
                type="number"
                min="1"
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-plasma"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-starlight">Хэрэглэсэн материал</label>
              <input
                type="text"
                placeholder="Egger хавтан, Blum нугас..."
                value={materials}
                onChange={(e) => setMaterials(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-plasma"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-starlight">Байршил / Хотхон</label>
              <input
                type="text"
                placeholder="Жишээ: Хан-Уул, Ривер Гарден"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-plasma"
              />
            </div>
          </div>

          {/* Photos Upload */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-starlight flex items-center gap-1.5">
                <ImageIcon size={14} className="text-plasma" />
                <span>Төслийн зургууд ({images.length} зураг)</span>
              </label>

              <label className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer transition-all flex items-center gap-1">
                <Plus size={12} />
                <span>{uploadingImages ? 'Хуулж байна...' : 'Зураг нэмэх'}</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImagesUpload}
                  disabled={uploadingImages}
                  className="hidden"
                />
              </label>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-2 pt-1">
                {images.map((imgUrl, imgIdx) => (
                  <div
                    key={imgIdx}
                    className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-black group"
                  >
                    <img
                      src={getImageUrl(imgUrl)}
                      alt={`Upload ${imgIdx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(imgIdx)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600/80 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reel Video */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <label className="text-xs font-bold text-starlight flex items-center gap-1.5">
              <Video size={14} className="text-aurora" />
              <span>Walkthrough Reel видео (Босоо 9:16 бичлэг, 90с хүртэл)</span>
            </label>

            {videoUrl ? (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Play size={15} fill="currentColor" className="text-emerald-400" />
                  <span className="text-xs text-emerald-300 font-bold">✓ Видео хуулагдсан</span>
                </div>
                <button
                  type="button"
                  onClick={() => setVideoUrl('')}
                  className="text-xs text-red-400 hover:text-red-300 font-bold"
                >
                  Устгах
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-4 border border-dashed border-white/15 hover:border-plasma rounded-xl cursor-pointer bg-void/50 hover:bg-plasma/5 transition-all text-center">
                <Upload size={20} className="text-plasma mb-1" />
                <span className="text-xs font-bold text-white">
                  {uploadingVideo ? 'Видео хуулж байна...' : 'Энэ ажлын видео реел оруулах'}
                </span>
                <span className="text-[11px] text-nebula-text/60 mt-0.5">MP4 видео файл</span>
                <input
                  type="file"
                  accept="video/mp4,video/quicktime,video/webm"
                  onChange={handleVideoUpload}
                  disabled={uploadingVideo}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs transition-colors"
            >
              Болих
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-plasma to-aurora hover:opacity-95 text-white font-black text-xs shadow-lg shadow-plasma/30 active:scale-95 transition-all cursor-pointer"
            >
              {submitting ? 'Хадгалж байна...' : 'Ажил нийтлэх'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AddPortfolioModal;
