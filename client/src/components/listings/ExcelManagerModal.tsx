import React, { useState, useRef } from 'react';
import { Download, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, X, Loader2, ShieldCheck } from 'lucide-react';
import { listingsAPI } from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useI18n } from '@/i18n';

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
  const { user } = useAuthStore();
  const { t } = useI18n();
  const cleanPhone = (user?.phone || '').replace(/\D/g, '');
  const isSuperAdmin = cleanPhone.endsWith('89767700');

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
      const filePrefix = myOnly ? 'vmax_my_listings' : 'vmax_all_listings';
      link.setAttribute('download', `${filePrefix}_${new Date().toISOString().slice(0, 10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.response?.data?.message || 'Export failed';
      alert(errorMsg);
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
    } catch (err: any) {
      console.error(err);
      alert('Template download failed');
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
        errors: [{ row: 0, title: file.name, reason: err.response?.data?.message || 'Server error' }],
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl rounded-2xl bg-nebula border border-white/10 shadow-2xl p-6 text-starlight overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-plasma/15 text-plasma">
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-starlight flex items-center gap-2">
                <span>{t.excelManager.title}</span>
                {isSuperAdmin && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-plasma/20 text-plasma border border-plasma/30">
                    <ShieldCheck size={12} /> Admin
                  </span>
                )}
              </h2>
              <p className="text-xs text-nebula-text">Bulk listing upload & export</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-nebula-text hover:text-starlight hover:bg-white/10 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex p-1 mt-4 rounded-xl bg-void/50 border border-white/10">
          <button
            onClick={() => { setActiveTab('import'); setResult(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
              activeTab === 'import'
                ? 'bg-gradient-to-r from-plasma to-nova text-white-force shadow-lg shadow-plasma/25'
                : 'text-nebula-text hover:text-starlight hover:bg-white/5'
            }`}
          >
            {t.excelManager.importTab}
          </button>
          <button
            onClick={() => { setActiveTab('export'); setResult(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
              activeTab === 'export'
                ? 'bg-gradient-to-r from-plasma to-nova text-white-force shadow-lg shadow-plasma/25'
                : 'text-nebula-text hover:text-starlight hover:bg-white/5'
            }`}
          >
            {t.excelManager.exportTab}
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
                file
                  ? 'border-plasma bg-plasma/10'
                  : 'border-white/15 hover:border-plasma/50 bg-void/40'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
                accept=".xlsx, .xls, .csv"
                className="hidden"
              />
              <Upload size={32} className={file ? 'text-plasma animate-bounce' : 'text-nebula-text'} />
              {file ? (
                <div>
                  <p className="text-sm font-semibold text-starlight">{file.name}</p>
                  <p className="text-xs text-plasma">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-starlight">{t.excelManager.dragDrop}</p>
                  <p className="text-xs text-nebula-text mt-0.5">{t.excelManager.orBrowse} (.xlsx, .xls, .csv)</p>
                </div>
              )}
            </div>

            {/* Template download link */}
            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-nebula-text">Template:</span>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="text-aurora hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Download size={13} /> {t.excelManager.templateDownload}
              </button>
            </div>

            {/* Results display */}
            {result && (
              <div
                className={`p-4 rounded-xl border ${
                  result.importedCount > 0
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  {result.importedCount > 0 ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  <span>{result.importedCount} {t.excelManager.successImport} {result.failedCount > 0 && `(${result.failedCount} ${t.excelManager.failedImport})`}</span>
                </div>
                {result.errors.length > 0 && (
                  <div className="mt-2 text-xs space-y-1 max-h-24 overflow-y-auto">
                    {result.errors.slice(0, 5).map((err, i) => (
                      <p key={i}>• Row {err.row}: {err.title} — {err.reason}</p>
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
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-cosmic hover:bg-cosmic/80 text-starlight border border-white/10 transition cursor-pointer"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                disabled={!file || uploading}
                onClick={handleImportSubmit}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-plasma to-nova hover:from-plasma/90 hover:to-nova/90 text-white-force disabled:opacity-50 transition flex items-center justify-center gap-2 shadow-lg shadow-plasma/25 cursor-pointer"
              >
                {uploading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> {t.common.loading}
                  </>
                ) : (
                  t.excelManager.uploadBtn
                )}
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: EXPORT */}
        {activeTab === 'export' && (
          <div className="mt-5 space-y-4">
            <div className={`grid gap-3 pt-2 ${isSuperAdmin ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {isSuperAdmin && (
                <button
                  type="button"
                  disabled={exporting}
                  onClick={() => handleExport(false)}
                  className="p-4 rounded-xl bg-plasma/10 border border-plasma/30 hover:border-plasma hover:bg-plasma/20 text-left transition flex flex-col justify-between cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Download size={22} className="text-plasma" />
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-plasma/20 text-plasma uppercase tracking-wide border border-plasma/30">
                      Admin
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-starlight">{t.excelManager.exportAll}</h4>
                  </div>
                </button>
              )}

              <button
                type="button"
                disabled={exporting}
                onClick={() => handleExport(true)}
                className="p-4 rounded-xl bg-cosmic hover:bg-cosmic/80 border border-white/10 hover:border-aurora/50 text-left transition flex flex-col justify-between cursor-pointer"
              >
                <Download size={22} className="text-aurora mb-2" />
                <div>
                  <h4 className="text-sm font-bold text-starlight">{t.excelManager.exportMy}</h4>
                </div>
              </button>
            </div>

            {exporting && (
              <div className="flex items-center justify-center gap-2 py-3 text-xs text-plasma">
                <Loader2 size={16} className="animate-spin" /> {t.common.loading}
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 mt-2 rounded-xl text-xs font-semibold bg-cosmic hover:bg-cosmic/80 text-starlight border border-white/10 transition cursor-pointer"
            >
              {t.common.cancel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
