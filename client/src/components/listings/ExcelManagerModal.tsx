import React, { useState, useRef } from 'react';
import { Download, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';
import { listingsAPI } from '@/services/api';

interface ExcelManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ExcelManagerModal: React.FC<ExcelManagerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    importedCount: number;
    failedCount: number;
    errors: { row: number; title: string; reason: string }[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // 1. Export Excel
  const handleExport = async (myOnly: boolean = false) => {
    setExporting(true);
    try {
      const response = await listingsAPI.exportExcel(myOnly);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `vmax_listings_${new Date().toISOString().slice(0, 10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Экспорт хийхэд алдаа гарлаа.');
    } finally {
      setExporting(false);
    }
  };

  // 2. Download Sample Template
  const handleDownloadTemplate = async () => {
    try {
      const response = await listingsAPI.downloadTemplate();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'vmax_import_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Загвар файл татахад алдаа гарлаа.');
    }
  };

  // 3. Handle Drag & Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  // 4. Submit Import
  const handleImportSubmit = async () => {
    if (!file) return;

    setUploading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await listingsAPI.importExcel(formData);
      setResult(response.data);
      if (response.data.importedCount > 0 && onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error(err);
      setResult({
        success: false,
        importedCount: 0,
        failedCount: 1,
        errors: [{ row: 0, title: file.name, reason: err.response?.data?.message || 'Серверийн алдаа гарлаа' }],
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#0f0e17] border border-purple-500/20 shadow-2xl p-6 text-white overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400">
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Excel Зар Удирдлага</h2>
              <p className="text-xs text-gray-400">Бөөнөөр зар оруулах болон системээс татаж авах</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex p-1 mt-4 rounded-xl bg-white/5 border border-white/10">
          <button
            onClick={() => { setActiveTab('import'); setResult(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === 'import' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            📤 Зар Импортлох (Оруулах)
          </button>
          <button
            onClick={() => { setActiveTab('export'); setResult(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === 'export' ? 'bg-purple-600 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            📥 Зар Экспортлох (Татах)
          </button>
        </div>

        {/* TAB 1: IMPORT */}
        {activeTab === 'import' && (
          <div className="mt-5 space-y-4">
            {/* Drag & drop box */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
                file ? 'border-purple-500 bg-purple-500/10' : 'border-white/20 hover:border-purple-400/50 bg-white/5'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
                accept=".xlsx, .xls, .csv"
                className="hidden"
              />
              <Upload size={32} className={file ? 'text-purple-400 animate-bounce' : 'text-gray-400'} />
              {file ? (
                <div>
                  <p className="text-sm font-semibold text-white">{file.name}</p>
                  <p className="text-xs text-purple-300">{(file.size / 1024).toFixed(1)} KB сонгогдсон</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-gray-200">Excel файл чирж тавих эсвэл товшиж сонгоно уу</p>
                  <p className="text-xs text-gray-500 mt-0.5">.xlsx, .xls, .csv файл дэмжинэ</p>
                </div>
              )}
            </div>

            {/* Template download link */}
            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-gray-400">Зөв бүтэцтэй загвар хэрэгтэй юу?</span>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="text-purple-400 hover:text-purple-300 font-semibold underline underline-offset-2 flex items-center gap-1 cursor-pointer"
              >
                <Download size={13} /> Загвар файл татах
              </button>
            </div>

            {/* Results display */}
            {result && (
              <div
                className={`p-4 rounded-xl border ${
                  result.importedCount > 0
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-red-500/10 border-red-500/30 text-red-300'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  {result.importedCount > 0 ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  <span>{result.importedCount} зар амжилттай нэмэгдлээ! {result.failedCount > 0 && `(${result.failedCount} алдаатай)`}</span>
                </div>
                {result.errors.length > 0 && (
                  <div className="mt-2 text-xs space-y-1 max-h-24 overflow-y-auto">
                    {result.errors.slice(0, 5).map((err, i) => (
                      <p key={i}>• Мөр {err.row}: {err.title} — {err.reason}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-gray-300 transition cursor-pointer"
              >
                Хаах
              </button>
              <button
                type="button"
                disabled={!file || uploading}
                onClick={handleImportSubmit}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white disabled:opacity-50 transition flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 cursor-pointer"
              >
                {uploading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Хуулж байна...
                  </>
                ) : (
                  'Импорт эхлүүлэх'
                )}
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: EXPORT */}
        {activeTab === 'export' && (
          <div className="mt-5 space-y-4">
            <p className="text-xs text-gray-300 leading-relaxed">
              Vmax.mn дээрх нийт зар эсвэл зөвхөн өөрийн оруулсан заруудыг Excel форматаар татаж аван тайлан, зах зээлийн шинжилгээ хийх боломжтой.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                disabled={exporting}
                onClick={() => handleExport(false)}
                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 text-left transition flex flex-col justify-between cursor-pointer"
              >
                <Download size={22} className="text-purple-400 mb-2" />
                <div>
                  <h4 className="text-sm font-bold text-white">Бүх зар татах</h4>
                  <p className="text-[11px] text-gray-400">Систем дээрх нийт идэвхтэй зарууд</p>
                </div>
              </button>

              <button
                type="button"
                disabled={exporting}
                onClick={() => handleExport(true)}
                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 text-left transition flex flex-col justify-between cursor-pointer"
              >
                <Download size={22} className="text-emerald-400 mb-2" />
                <div>
                  <h4 className="text-sm font-bold text-white">Өөрийн зар татах</h4>
                  <p className="text-[11px] text-gray-400">Таны нэвтэрсэн хаягийн зарууд</p>
                </div>
              </button>
            </div>

            {exporting && (
              <div className="flex items-center justify-center gap-2 py-3 text-xs text-purple-400">
                <Loader2 size={16} className="animate-spin" /> Excel файл үүсгэж байна, түр хүлээнэ үү...
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 mt-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-gray-300 transition cursor-pointer"
            >
              Хаах
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
