import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, RotateCw, Sun, Contrast, FlipHorizontal, Crop, Check, Undo, Sparkles } from 'lucide-react';
import { useI18n } from '@/i18n';

interface ImageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onSave: (editedFile: File, editedPreviewUrl: string) => void;
}

type AspectRatio = 'original' | '4:3' | '16:9' | '1:1';

export const ImageEditorModal: React.FC<ImageEditorModalProps> = ({
  isOpen,
  onClose,
  imageSrc,
  onSave,
}) => {
  const { t } = useI18n();
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [brightness, setBrightness] = useState<number>(100); // 50 to 150 (default 100)
  const [contrast, setContrast] = useState<number>(100); // 50 to 150 (default 100)
  const [flipH, setFlipH] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('original');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageObjRef = useRef<HTMLImageElement | null>(null);

  // Load Image Object on Open
  useEffect(() => {
    if (!isOpen || !imageSrc) return;

    // Reset controls
    setRotation(0);
    setBrightness(100);
    setContrast(100);
    setFlipH(false);
    setAspectRatio('original');

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      imageObjRef.current = img;
      renderCanvas();
    };
  }, [isOpen, imageSrc]);

  // Render Canvas with All Transformations and Filters
  const renderCanvas = useCallback(() => {
    const img = imageObjRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let sourceWidth = img.naturalWidth || img.width;
    let sourceHeight = img.naturalHeight || img.height;
    let sourceX = 0;
    let sourceY = 0;

    // Handle Aspect Ratio Cropping from Center
    if (aspectRatio === '4:3') {
      const targetRatio = 4 / 3;
      if (sourceWidth / sourceHeight > targetRatio) {
        const newW = sourceHeight * targetRatio;
        sourceX = (sourceWidth - newW) / 2;
        sourceWidth = newW;
      } else {
        const newH = sourceWidth / targetRatio;
        sourceY = (sourceHeight - newH) / 2;
        sourceHeight = newH;
      }
    } else if (aspectRatio === '16:9') {
      const targetRatio = 16 / 9;
      if (sourceWidth / sourceHeight > targetRatio) {
        const newW = sourceHeight * targetRatio;
        sourceX = (sourceWidth - newW) / 2;
        sourceWidth = newW;
      } else {
        const newH = sourceWidth / targetRatio;
        sourceY = (sourceHeight - newH) / 2;
        sourceHeight = newH;
      }
    } else if (aspectRatio === '1:1') {
      const minDim = Math.min(sourceWidth, sourceHeight);
      sourceX = (sourceWidth - minDim) / 2;
      sourceY = (sourceHeight - minDim) / 2;
      sourceWidth = minDim;
      sourceHeight = minDim;
    }

    // Canvas Dimensions after 90 / 270 deg rotation
    const isSideways = rotation === 90 || rotation === 270;
    canvas.width = isSideways ? sourceHeight : sourceWidth;
    canvas.height = isSideways ? sourceWidth : sourceHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply Filter String (Brightness, Contrast)
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

    // Apply Transformations (Rotate, Flip)
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, 1);

    // Draw Cropped Image centered
    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      -sourceWidth / 2,
      -sourceHeight / 2,
      sourceWidth,
      sourceHeight
    );

    ctx.restore();
  }, [rotation, brightness, contrast, flipH, aspectRatio]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const handleRotateCW = () => setRotation((r) => (r + 90) % 360);
  const handleRotateCCW = () => setRotation((r) => (r - 90 + 360) % 360);
  const handleFlipH = () => setFlipH((f) => !f);

  const handleReset = () => {
    setRotation(0);
    setBrightness(100);
    setContrast(100);
    setFlipH(false);
    setAspectRatio('original');
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsProcessing(true);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const fileName = `edited-${Date.now()}.jpg`;
          const editedFile = new File([blob], fileName, { type: 'image/jpeg' });
          const previewUrl = URL.createObjectURL(blob);
          onSave(editedFile, previewUrl);
          setIsProcessing(false);
          onClose();
        } else {
          setIsProcessing(false);
        }
      },
      'image/jpeg',
      0.92
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          className="relative w-full max-w-4xl max-h-[92vh] flex flex-col glass-card bg-void/95 border border-white/20 rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-cosmic/50">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-plasma/20 text-plasma">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-starlight">{t.photoEditor.title}</h3>
                <p className="text-xs text-nebula-text">{t.photoEditor.subtitle}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-nebula-text hover:text-white transition-all cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body: Canvas Preview + Controls Sidebar */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 p-6 overflow-y-auto">
            {/* Canvas Viewer Container */}
            <div className="md:col-span-2 flex items-center justify-center bg-black/60 rounded-2xl p-4 border border-white/10 min-h-[320px] max-h-[480px] overflow-hidden relative">
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-[440px] object-contain rounded-lg shadow-2xl transition-all"
              />
            </div>

            {/* Editing Controls Sidebar */}
            <div className="space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Rotate & Flip Quick Actions */}
                <div>
                  <label className="block text-xs font-bold text-starlight mb-2">{t.photoEditor.rotateAndFlip}</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={handleRotateCCW}
                      className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-void/60 hover:bg-plasma/20 border border-white/10 hover:border-plasma text-starlight text-xs font-medium transition-all cursor-pointer"
                      title={t.photoEditor.rotateLeft}
                    >
                      <RotateCcw size={16} className="mb-1 text-plasma" />
                      <span>-90°</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRotateCW}
                      className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-void/60 hover:bg-plasma/20 border border-white/10 hover:border-plasma text-starlight text-xs font-medium transition-all cursor-pointer"
                      title={t.photoEditor.rotateRight}
                    >
                      <RotateCw size={16} className="mb-1 text-plasma" />
                      <span>+90°</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleFlipH}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                        flipH
                          ? 'bg-plasma/30 border-plasma text-plasma'
                          : 'bg-void/60 hover:bg-plasma/20 border-white/10 hover:border-plasma text-starlight'
                      }`}
                      title={t.photoEditor.flip}
                    >
                      <FlipHorizontal size={16} className="mb-1 text-aurora" />
                      <span>{t.photoEditor.flip}</span>
                    </button>
                  </div>
                </div>

                {/* Aspect Ratio Presets */}
                <div>
                  <label className="block text-xs font-bold text-starlight mb-2 flex items-center gap-1.5">
                    <Crop size={14} className="text-plasma" />
                    <span>{t.photoEditor.aspectRatio}</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['original', '4:3', '16:9', '1:1'] as AspectRatio[]).map((ratio) => (
                      <button
                        key={ratio}
                        type="button"
                        onClick={() => setAspectRatio(ratio)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          aspectRatio === ratio
                            ? 'bg-gradient-to-r from-plasma to-nova text-white-force border-plasma shadow-md shadow-plasma/25'
                            : 'bg-void/60 hover:bg-white/5 border-white/10 text-nebula-text hover:text-starlight'
                        }`}
                      >
                        {ratio === 'original' ? t.photoEditor.original : ratio === '4:3' ? t.photoEditor.ratio4_3 : ratio === '16:9' ? t.photoEditor.ratio16_9 : t.photoEditor.ratio1_1}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Brightness Slider */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-starlight flex items-center gap-1">
                      <Sun size={14} className="text-amber-400" />
                      <span>{t.photoEditor.brightness}</span>
                    </span>
                    <span className="text-plasma font-mono">{brightness - 100 > 0 ? `+${brightness - 100}%` : `${brightness - 100}%`}</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="160"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full accent-plasma h-1.5 bg-white/10 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Contrast Slider */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-starlight flex items-center gap-1">
                      <Contrast size={14} className="text-aurora" />
                      <span>{t.photoEditor.contrast}</span>
                    </span>
                    <span className="text-aurora font-mono">{contrast - 100 > 0 ? `+${contrast - 100}%` : `${contrast - 100}%`}</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="160"
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-full accent-aurora h-1.5 bg-white/10 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full py-2 rounded-xl bg-void/50 hover:bg-white/10 border border-white/10 text-nebula-text hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Undo size={14} />
                  <span>{t.photoEditor.reset}</span>
                </button>

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-1/2 py-2.5 rounded-xl bg-void/60 hover:bg-white/10 border border-white/15 text-starlight text-xs font-bold transition-all cursor-pointer"
                  >
                    {t.photoEditor.cancel}
                  </button>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleSave}
                    className="w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-plasma to-nova text-white-force text-xs font-bold shadow-lg shadow-plasma/30 hover:shadow-plasma/50 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Check size={15} />
                    <span>{isProcessing ? t.photoEditor.saving : t.photoEditor.save}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
