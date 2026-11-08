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
        className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 transition shadow-sm cursor-pointer hover:scale-[1.02] active:scale-95 ${className}`}
        title="Excel Экспорт / Импорт хийх"
      >
        <FileSpreadsheet size={16} />
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
