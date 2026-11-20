import React, { useState, useEffect } from 'react';
import { TimelineEvent, EventCategory, VerificationModalData, SqliteStats } from '../types';
import { calculateCountdown } from '../mockData';
import {
  Calendar,
  Clock,
  MapPin,
  Search,
  Edit2,
  Trash2,
  Plus,
  Filter,
  CheckCircle2,
  Database,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Translations, Language } from '../translations';

interface UnifiedTimelineSectionProps {
  events: TimelineEvent[];
  sqliteStats: SqliteStats;
  onUpdateEvent: (updated: TimelineEvent) => void;
  onDeleteEvent: (id: string) => void;
  onAddEvent: (event: TimelineEvent) => void;
  onOpenSourceVerification: (modalData: VerificationModalData) => void;
  t: Translations;
  language: Language;
}

export const UnifiedTimelineSection: React.FC<UnifiedTimelineSectionProps> = ({
  events,
  sqliteStats,
  onUpdateEvent,
  onDeleteEvent,
  onAddEvent,
  onOpenSourceVerification,
  t,
  language,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentTimeMs, setCurrentTimeMs] = useState(Date.now());

  // Ticking countdown updates every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimeMs(Date.now());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Filter events
  const filteredEvents = events
    .filter((e) => (activeCategory === 'all' ? true : e.category === activeCategory))
    .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));

  // Add event form state
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newDate, setNewDate] = useState('2026-11-12');
  const [newStart, setNewStart] = useState('10:00');
  const [newEnd, setNewEnd] = useState('12:00');
  const [newCategory, setNewCategory] = useState<EventCategory>('Aulas Teóricas');
  const [newLocation, setNewLocation] = useState('Campus Universitário');

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSubject.trim()) return;

    const ev: TimelineEvent = {
      id: `evt-manual-${Date.now()}`,
      title: newTitle.trim(),
      subject: newSubject.trim(),
      date: newDate,
      startTime: newStart,
      endTime: newEnd,
      category: newCategory,
      priority: 'Normal',
      location: newLocation.trim(),
      sourceType: 'manual',
      sourceDocumentName: 'Inserção Manual do Estudante',
      sourceSnippet: 'Evento adicionado manualmente na grelha cronológica.',
      highlightPhrase: newTitle.trim(),
      dateReasoning: 'Criado diretamente pelo estudante na interface.',
      confidenceScore: 100,
      publicationDate: newDate,
    };

    onAddEvent(ev);
    setShowAddModal(false);
    setNewTitle('');
    setNewSubject('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    onUpdateEvent(editingEvent);
    setEditingEvent(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Local-First Performance */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'pt' ? 'Sincronização Offline Ativa' : 'Offline Mode Active'}</span>
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {language === 'pt' ? 'Calendário Guardado no Dispositivo' : 'Calendar Saved on Device'}
            </span>
          </div>

          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {language === 'pt' ? 'Cronograma Semanal Unificado' : 'Unified Weekly Schedule'}
          </h2>

          <p className="text-sm text-slate-600 mt-1">
            {language === 'pt'
              ? 'Aulas teóricas, laboratórios práticos, entregas de projeto e exames consolidados com temporizadores em contagem decrescente.'
              : 'Lectures, lab assignments, project milestones, and exams consolidated into a single chronological view with countdown timers.'}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-600/20 shrink-0 self-start md:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'pt' ? '+ Adicionar Evento' : '+ Add Event'}</span>
        </button>
      </div>

      {/* Filter Tabs by Category */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1">
          {[
            { id: 'all', label: language === 'pt' ? 'Todos os Eventos' : 'All Events' },
            { id: 'Aulas Teóricas', label: language === 'pt' ? 'Aulas Teóricas' : 'Lectures' },
            { id: 'Aulas Práticas / Labs', label: language === 'pt' ? 'Labs & Práticas' : 'Labs & Practicals' },
            { id: 'Entregas de Projeto', label: language === 'pt' ? 'Entregas de Projeto' : 'Project Deadlines' },
            { id: 'Exames / Frequências', label: language === 'pt' ? 'Exames & Frequências' : 'Exams' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <span className="text-xs font-mono text-slate-500 pr-2">
          {filteredEvents.length} {language === 'pt' ? 'eventos agendados' : 'events scheduled'}
        </span>
      </div>

      {/* Timeline Events List */}
      <div className="space-y-3.5">
        {filteredEvents.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
            <Calendar className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">
              {language === 'pt' ? 'Nenhum evento para a categoria selecionada' : 'No events found for this filter'}
            </p>
          </div>
        ) : (
          filteredEvents.map((evt) => {
            const countdown = calculateCountdown(evt.date, evt.startTime, currentTimeMs);

            const categoryStyle: Record<string, { badge: string; border: string }> = {
              'Entregas de Projeto': { badge: 'bg-blue-50 text-blue-700 border-blue-200', border: 'border-blue-100' },
              'Exames / Frequências': { badge: 'bg-rose-50 text-rose-700 border-rose-200', border: 'border-rose-100' },
              'Aulas Práticas / Labs': { badge: 'bg-purple-50 text-purple-700 border-purple-200', border: 'border-purple-100' },
              'Aulas Teóricas': { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', border: 'border-emerald-100' },
              'Apresentações': { badge: 'bg-amber-50 text-amber-700 border-amber-200', border: 'border-amber-100' },
            };

            const style = categoryStyle[evt.category] || { badge: 'bg-slate-100 text-slate-700', border: 'border-slate-200' };

            return (
              <div
                key={evt.id}
                className={`bg-white rounded-2xl border ${style.border} p-5 hover:shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4`}
              >
                {/* Event Details */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${style.badge}`}>
                      {evt.category}
                    </span>

                    <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{evt.date} · {evt.startTime} - {evt.endTime}</span>
                    </span>

                    {/* Countdown Timer Badge */}
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                        countdown.isUrgent
                          ? 'bg-rose-100 text-rose-800 animate-pulse'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                      }`}
                    >
                      <Zap className="w-3 h-3" />
                      <span>{countdown.formatted}</span>
                    </span>

                    <span className="text-[10px] text-slate-400 font-mono">
                      Fonte: {evt.sourceType}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    {evt.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                    <span className="font-semibold text-slate-800">{evt.subject}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <MapPin className="w-3.5 h-3.5" />
                      {evt.location}
                    </span>
                  </div>
                </div>

                {/* Event Actions: Verify Source & Edit & Delete */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-center">
                  {/* MANDATORY BUTTON: "Verify Source" (Outlined per DEF-04) */}
                  <button
                    onClick={() =>
                      onOpenSourceVerification({
                        isOpen: true,
                        eventTitle: evt.title,
                        subject: evt.subject,
                        sourceDocumentName: evt.sourceDocumentName,
                        publicationDate: evt.publicationDate,
                        extractedDueDate: `${evt.date} às ${evt.startTime}`,
                        dateReasoning: evt.dateReasoning,
                        confidenceScore: evt.confidenceScore,
                        highlightPhrase: evt.highlightPhrase,
                        fullSnippet: evt.sourceSnippet,
                        documentType: evt.sourceDocumentName.endsWith('.docx') ? 'docx' : 'pdf',
                      })
                    }
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5"
                    title={language === 'pt' ? 'Auditar documento fonte original' : 'Audit original source document'}
                  >
                    <Search className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Verify Source</span>
                  </button>

                  <button
                    onClick={() => setEditingEvent({ ...evt })}
                    className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors shadow-2xs flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>{language === 'pt' ? 'Editar' : 'Edit'}</span>
                  </button>

                  <button
                    onClick={() => onDeleteEvent(evt.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Event Modal */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              {language === 'pt' ? 'Editar Evento do Cronograma' : 'Edit Timeline Event'}
            </h3>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'pt' ? 'Título do Evento' : 'Event Title'}
                </label>
                <input
                  type="text"
                  value={editingEvent.title}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {language === 'pt' ? 'Data' : 'Date'}
                  </label>
                  <input
                    type="date"
                    value={editingEvent.date}
                    onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {language === 'pt' ? 'Local / Sala' : 'Location / Room'}
                  </label>
                  <input
                    type="text"
                    value={editingEvent.location}
                    onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {language === 'pt' ? 'Hora Início' : 'Start Time'}
                  </label>
                  <input
                    type="time"
                    value={editingEvent.startTime}
                    onChange={(e) => setEditingEvent({ ...editingEvent, startTime: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {language === 'pt' ? 'Hora Fim' : 'End Time'}
                  </label>
                  <input
                    type="time"
                    value={editingEvent.endTime}
                    onChange={(e) => setEditingEvent({ ...editingEvent, endTime: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                >
                  {language === 'pt' ? 'Cancelar' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                >
                  {language === 'pt' ? 'Guardar Alterações' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              {language === 'pt' ? 'Adicionar Novo Evento ao Cronograma' : 'Add New Event to Timeline'}
            </h3>

            <form onSubmit={handleCreateEvent} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'pt' ? 'Título do Evento' : 'Event Title'}
                </label>
                <input
                  type="text"
                  placeholder="Ex: Aula de Dúvidas, Revisão..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {language === 'pt' ? 'Disciplina' : 'Subject'}
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Sistemas Digitais"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {language === 'pt' ? 'Categoria' : 'Category'}
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as EventCategory)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Aulas Teóricas">Aulas Teóricas</option>
                    <option value="Aulas Práticas / Labs">Aulas Práticas / Labs</option>
                    <option value="Entregas de Projeto">Entregas de Projeto</option>
                    <option value="Exames / Frequências">Exames / Frequências</option>
                    <option value="Apresentações">Apresentações</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {language === 'pt' ? 'Data' : 'Date'}
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {language === 'pt' ? 'Início' : 'Start'}
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
                    {language === 'pt' ? 'Fim' : 'End'}
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
                  {language === 'pt' ? 'Local / Sala' : 'Location / Room'}
                </label>
                <input
                  type="text"
                  placeholder="Ex: Anfiteatro B2"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                >
                  {language === 'pt' ? 'Cancelar' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                >
                  {language === 'pt' ? 'Adicionar ao Cronograma' : 'Add to Timeline'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
