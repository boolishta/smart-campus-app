import React, { useState } from 'react';
import { ScheduleSlot, StudyMaterial, Deadline } from '../types';
import { DAYS_OF_WEEK } from '../mockData';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Edit2,
  RefreshCw,
  BookOpen,
  ArrowRight,
  Check
} from 'lucide-react';
import { SlotEditModal } from './SlotEditModal';
import { Translations, Language } from '../translations';

interface ScheduleSectionProps {
  schedule: ScheduleSlot[];
  materials: StudyMaterial[];
  deadlines: Deadline[];
  isScheduleConfirmed: boolean;
  onConfirmSchedule: () => void;
  onUpdateSlot: (updatedSlot: ScheduleSlot) => void;
  onDeleteSlot: (slotId: string) => void;
  onAddSlot: (slot: ScheduleSlot) => void;
  onRegenerateSchedule: () => void;
  onNavigateToPlan: () => void;
  t: Translations;
  language: Language;
}

export const ScheduleSection: React.FC<ScheduleSectionProps> = ({
  schedule,
  materials,
  deadlines,
  isScheduleConfirmed,
  onConfirmSchedule,
  onUpdateSlot,
  onDeleteSlot,
  onAddSlot,
  onRegenerateSchedule,
  onNavigateToPlan,
  t,
  language,
}) => {
  const [editingSlot, setEditingSlot] = useState<ScheduleSlot | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(4); // Default Quinta-feira
  const [viewMode, setViewMode] = useState<'grid' | 'day'>('grid');
  const [showAddModal, setShowAddModal] = useState(false);

  // New slot form state
  const [newDay, setNewDay] = useState<number>(4);
  const [newSubject, setNewSubject] = useState(materials[0]?.subject || (language === 'pt' ? 'Estudo Geral' : 'General Study'));
  const [newActivity, setNewActivity] = useState<any>('Revisão Teórica');
  const [newStart, setNewStart] = useState('17:00');
  const [newEnd, setNewEnd] = useState('18:30');
  const [newMaterial, setNewMaterial] = useState(materials[0]?.name || '');

  const availableMaterialNames = materials.map((m) => m.name);

  const handleCreateNewSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const dayObj = DAYS_OF_WEEK.find((d: { id: number; name: string }) => d.id === newDay) || DAYS_OF_WEEK[3];

    const slot: ScheduleSlot = {
      id: `slot-custom-${Date.now()}`,
      dayOfWeek: newDay,
      dayName: dayObj.name,
      startTime: newStart,
      endTime: newEnd,
      subject: newSubject,
      activity: newActivity,
      materialRef: newMaterial || (language === 'pt' ? 'Materiais Diversos' : 'General Resources'),
      notes: language === 'pt' ? 'Bloco adicionado manualmente pelo estudante.' : 'Block manually added by student.',
    };

    onAddSlot(slot);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner with Confirmation Status & Action */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {t.sec2Title}
            </h2>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                isScheduleConfirmed
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}
            >
              {isScheduleConfirmed ? t.scheduleConfirmedBadge : t.schedulePendingBadge}
            </span>
          </div>
          <p className="text-sm text-slate-600">
            {isScheduleConfirmed
              ? t.scheduleConfirmedDesc
              : t.schedulePendingDesc}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={onRegenerateSchedule}
            title={t.recalculateScheduleBtn}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t.recalculateScheduleBtn}</span>
          </button>

          {/* CRITICAL BUTTON: "Confirmar Horário" */}
          <button
            onClick={onConfirmSchedule}
            className={`flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all shadow-sm ${
              isScheduleConfirmed
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white animate-pulse'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>{t.confirmScheduleBtn}</span>
          </button>

          {isScheduleConfirmed && (
            <button
              onClick={onNavigateToPlan}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <span>{t.viewCurrentPlanBtn}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Schedule Controls & Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              viewMode === 'grid'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.viewGrid}
          </button>
          <button
            onClick={() => setViewMode('day')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              viewMode === 'day'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.viewDay}
          </button>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors border border-indigo-100 w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addStudyBlockBtn}</span>
        </button>
      </div>

      {/* Week Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {DAYS_OF_WEEK.map((day: { id: number; name: string }) => {
            const daySlots = schedule
              .filter((s) => s.dayOfWeek === day.id)
              .sort((a, b) => a.startTime.localeCompare(b.startTime));

            const isToday = day.id === 4; // Quinta-feira

            const dayNameDisplay = language === 'en'
              ? (day.id === 1 ? 'Monday' : day.id === 2 ? 'Tuesday' : day.id === 3 ? 'Wednesday' : day.id === 4 ? 'Thursday' : day.id === 5 ? 'Friday' : 'Saturday')
              : day.name;

            return (
              <div
                key={day.id}
                className={`rounded-2xl border transition-all flex flex-col ${
                  isToday
                    ? 'bg-white border-indigo-400 shadow-sm ring-1 ring-indigo-200'
                    : 'bg-white border-slate-200'
                }`}
              >
                {/* Day Header */}
                <div
                  className={`p-3.5 border-b rounded-t-2xl flex items-center justify-between ${
                    isToday
                      ? 'bg-indigo-50/60 border-indigo-100'
                      : 'bg-slate-50 border-slate-100'
                  }`}
                >
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">
                      {dayNameDisplay}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {daySlots.length} {daySlots.length === 1 ? t.sessionCount : t.sessionsCount}
                    </p>
                  </div>
                  {isToday && (
                    <span className="text-[10px] font-bold uppercase text-indigo-700 bg-white px-2 py-0.5 rounded shadow-2xs border border-indigo-100">
                      {t.todayBadge}
                    </span>
                  )}
                </div>

                {/* Day Slots */}
                <div className="p-3 flex-1 space-y-2.5">
                  {daySlots.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      {t.noBlocksPlanned}
                    </div>
                  ) : (
                    daySlots.map((slot) => {
                      const activityStyles: Record<string, string> = {
                        'Desenvolvimento de Código': 'border-blue-200 bg-blue-50/50 text-blue-900',
                        'Resolução de Exercícios': 'border-emerald-200 bg-emerald-50/50 text-emerald-900',
                        'Revisão Teórica': 'border-purple-200 bg-purple-50/50 text-purple-900',
                        'Preparação de Apresentação': 'border-amber-200 bg-amber-50/50 text-amber-900',
                        'Leitura e Resumos': 'border-slate-200 bg-slate-50 text-slate-900',
                      };

                      return (
                        <div
                          key={slot.id}
                          onClick={() => setEditingSlot(slot)}
                          className={`p-3 rounded-xl border cursor-pointer hover:shadow-xs transition-all text-left group ${
                            activityStyles[slot.activity] || 'border-slate-200 bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px] font-mono font-medium text-slate-600 mb-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {slot.startTime} - {slot.endTime}
                            </span>
                            <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 text-slate-500 transition-opacity" />
                          </div>

                          <h4 className="text-xs font-bold text-slate-900 leading-snug">
                            {slot.subject}
                          </h4>

                          <p className="text-[11px] text-slate-600 mt-1 font-medium">
                            {slot.activity}
                          </p>

                          <div className="mt-2 pt-2 border-t border-slate-200/60 text-[10px] text-slate-500 truncate" title={slot.materialRef}>
                            {slot.materialRef}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Day by Day Detailed View */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex flex-wrap items-center gap-2 mb-6 pb-4 border-b border-slate-100">
            {DAYS_OF_WEEK.map((day: { id: number; name: string }) => {
              const dayNameDisplay = language === 'en'
                ? (day.id === 1 ? 'Monday' : day.id === 2 ? 'Tuesday' : day.id === 3 ? 'Wednesday' : day.id === 4 ? 'Thursday' : day.id === 5 ? 'Friday' : 'Saturday')
                : day.name;

              return (
                <button
                  key={day.id}
                  onClick={() => setSelectedDay(day.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    selectedDay === day.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {dayNameDisplay} {day.id === 4 ? `(${t.todayBadge})` : ''}
                </button>
              );
            })}
          </div>

          <div className="space-y-4">
            {schedule
              .filter((s) => s.dayOfWeek === selectedDay)
              .map((slot) => (
                <div
                  key={slot.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        {slot.startTime} — {slot.endTime}
                      </span>
                      <span className="text-xs font-semibold text-slate-600">
                        {slot.activity}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900">
                      {slot.subject}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {t.materialLabel}: <span className="font-medium text-slate-700">{slot.materialRef}</span>
                      {slot.notes ? ` · ${slot.notes}` : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      onClick={() => setEditingSlot(slot)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>{t.edit}</span>
                    </button>
                    <button
                      onClick={() => onDeleteSlot(slot.id)}
                      className="px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      {t.remove}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Manual Slot Edit Modal */}
      <SlotEditModal
        slot={editingSlot}
        isOpen={Boolean(editingSlot)}
        onClose={() => setEditingSlot(null)}
        onSave={(updated) => {
          onUpdateSlot(updated);
          setEditingSlot(null);
        }}
        onDelete={(id) => {
          onDeleteSlot(id);
          setEditingSlot(null);
        }}
        availableMaterials={availableMaterialNames}
        t={t}
      />

      {/* Add New Slot Dialog */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {t.addSessionTitle}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewSlot} className="p-6 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.dayOfWeek}
                </label>
                <select
                  value={newDay}
                  onChange={(e) => setNewDay(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                >
                  {DAYS_OF_WEEK.map((d: { id: number; name: string }) => (
                    <option key={d.id} value={d.id}>
                      {language === 'en'
                        ? (d.id === 1 ? 'Monday' : d.id === 2 ? 'Tuesday' : d.id === 3 ? 'Wednesday' : d.id === 4 ? 'Thursday' : d.id === 5 ? 'Friday' : 'Saturday')
                        : d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.fieldSubject}
                </label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.startTime}
                  </label>
                  <input
                    type="time"
                    value={newStart}
                    onChange={(e) => setNewStart(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.endTime}
                  </label>
                  <input
                    type="time"
                    value={newEnd}
                    onChange={(e) => setNewEnd(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.activityType}
                </label>
                <select
                  value={newActivity}
                  onChange={(e) => setNewActivity(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                >
                  <option value="Revisão Teórica">Revisão Teórica / Theory Review</option>
                  <option value="Resolução de Exercícios">Resolução de Exercícios / Practice Problems</option>
                  <option value="Desenvolvimento de Código">Desenvolvimento de Código / Code Development</option>
                  <option value="Preparação de Apresentação">Preparação de Apresentação / Presentation Prep</option>
                  <option value="Leitura e Resumos">Leitura e Resumos / Reading & Summaries</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.associatedMaterial}
                </label>
                <input
                  type="text"
                  value={newMaterial}
                  onChange={(e) => setNewMaterial(e.target.value)}
                  placeholder="Nome do ficheiro ou tópico"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                >
                  {t.addBlockSubmit}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
