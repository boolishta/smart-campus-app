import React from 'react';
import { RefreshCw, Calendar } from 'lucide-react';
import { Translations } from '../translations';

interface FileChangeConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  changeType: 'added' | 'deleted';
  fileName: string;
  t: Translations;
}

export const FileChangeConfirmModal: React.FC<FileChangeConfirmModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  changeType,
  fileName,
  t,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
            <RefreshCw className="w-6 h-6 animate-spin-slow" />
          </div>

          <h3 className="text-lg font-bold text-slate-900 mb-2">
            {t.rn01ModalTitle}
          </h3>

          <p className="text-sm text-slate-600 mb-4 leading-relaxed">
            {changeType === 'added' ? (
              <>O ficheiro <span className="font-semibold text-slate-800">{fileName}</span> {t.rn01AddedDesc}</>
            ) : (
              <>O ficheiro <span className="font-semibold text-slate-800">{fileName}</span> {t.rn01DeletedDesc}</>
            )}
            {' '}{t.rn01Question}
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 mb-6 flex items-start gap-2.5">
            <Calendar className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-slate-800">{t.rn01ImpactTitle}</p>
              <p className="text-slate-500">
                {t.rn01ImpactDesc}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors shadow-2xs"
            >
              {t.rn01KeepCurrentBtn}
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{t.rn01UpdateScheduleBtn}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
