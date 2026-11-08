import React, { useState } from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { ExcelManagerModal } from './ExcelManagerModal';

interface ListingExcelActionsProps {
  onSuccess?: () => void;
  className?: string;
}

export const ListingExcelActions: React.FC<ListingExcelActionsProps> = ({
  onSuccess,
  className = '',
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-cosmic hover:bg-cosmic/80 text-starlight hover:text-plasma border border-white/15 hover:border-plasma/40 shadow-sm transition-all cursor-pointer hover:scale-[1.02] active:scale-95 ${className}`}
        title="Excel Экспорт / Импорт хийх"
      >
        <FileSpreadsheet size={16} className="text-plasma" />
        <span>Excel Удирдлага</span>
      </button>

      <ExcelManagerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          if (onSuccess) onSuccess();
        }}
      />
    </>
  );
};
