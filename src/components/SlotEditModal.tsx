import React, { useState } from 'react';
import { ScheduleSlot, ActivityType } from '../types';
import { X, Clock, BookOpen, Trash2, Check } from 'lucide-react';
import { Translations } from '../translations';

interface SlotEditModalProps {
  slot: ScheduleSlot | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedSlot: ScheduleSlot) => void;
  onDelete: (slotId: string) => void;
  availableMaterials: string[];
  t: Translations;
}

const ACTIVITIES: ActivityType[] = [
  'Revisão Teórica',
  'Resolução de Exercícios',
  'Desenvolvimento de Código',
  'Preparação de Apresentação',
  'Leitura e Resumos',
];

export const SlotEditModal: React.FC<SlotEditModalProps> = ({
  slot,
  isOpen,
  onClose,
  onSave,
  onDelete,
  availableMaterials,
  t,
}) => {
  if (!isOpen || !slot) return null;

  const [subject, setSubject] = useState(slot.subject);
  const [activity, setActivity] = useState<ActivityType>(slot.activity);
  const [startTime, setStartTime] = useState(slot.startTime);
  const [endTime, setEndTime] = useState(slot.endTime);
  const [materialRef, setMaterialRef] = useState(slot.materialRef);
  const [notes, setNotes] = useState(slot.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...slot,
      subject,
      activity,
      startTime,
      endTime,
      materialRef,
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {t.editBlockTitle}
            </h3>
            <p className="text-xs text-slate-500">
              {slot.dayName} · {t.manualAdjustment}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.fieldSubject}
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.startTime}
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.endTime}
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.activityType}
            </label>
            <select
              value={activity}
              onChange={(e) => setActivity(e.target.value as ActivityType)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            >
              {ACTIVITIES.map((act) => (
                <option key={act} value={act}>
                  {act}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.associatedMaterial}
            </label>
            <select
              value={materialRef}
              onChange={(e) => setMaterialRef(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white truncate"
            >
              {availableMaterials.length > 0 ? (
                availableMaterials.map((mat) => (
                  <option key={mat} value={mat}>
                    {mat}
                  </option>
                ))
              ) : (
                <option value="Sem material associado">Sem material associado</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.sessionNotes}
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Resolver ficha 3, ex 4 a 9; rever demonstração do teorema..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                onDelete(slot.id);
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>{t.removeBlock}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors shadow-2xs"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
              >
                <Check className="w-4 h-4" />
                <span>{t.saveChanges}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
