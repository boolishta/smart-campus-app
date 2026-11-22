import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { AcademicEvent, AcademicEventType, EventPriority } from '../types';
import { getTodayIsoDate } from '../utils/dateUtils';

interface EventFormModalProps {
  isOpen: boolean;
  editingEvent: AcademicEvent | null;
  onClose: () => void;
  onSave: (data: {
    eventId?: string;
    title: string;
    eventType: AcademicEventType;
    eventDate: string;
    startTime: string | null;
    endTime: string | null;
    priority: EventPriority;
  }) => void;
}

const EVENT_TYPES: Array<{ value: AcademicEventType; label: string }> = [
  { value: 'EXAM', label: 'Exam' },
  { value: 'ASSIGNMENT', label: 'Assignment' },
  { value: 'LAB', label: 'Lab' },
  { value: 'LECTURE', label: 'Lecture' },
  { value: 'OTHER', label: 'Other' },
];

const PRIORITIES: Array<{ value: EventPriority; label: string }> = [
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];

export const EventFormModal: React.FC<EventFormModalProps> = ({
  isOpen,
  editingEvent,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState<AcademicEventType>('ASSIGNMENT');
  const [eventDate, setEventDate] = useState(getTodayIsoDate());
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [priority, setPriority] = useState<EventPriority>('MEDIUM');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setValidationError(null);
    if (editingEvent) {
      setTitle(editingEvent.title);
      setEventType(editingEvent.eventType);
      setEventDate(editingEvent.eventDate);
      setStartTime(editingEvent.startTime ?? '');
      setEndTime(editingEvent.endTime ?? '');
      setPriority(editingEvent.priority);
    } else {
      setTitle('');
      setEventType('ASSIGNMENT');
      setEventDate(getTodayIsoDate());
      setStartTime('');
      setEndTime('');
      setPriority('MEDIUM');
    }
  }, [isOpen, editingEvent]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setValidationError('Please enter an event title.');
      return;
    }
    if (!eventDate) {
      setValidationError('Please select a valid date.');
      return;
    }
    if (startTime && endTime && endTime < startTime) {
      setValidationError('End time must be after start time.');
      return;
    }

    onSave({
      eventId: editingEvent?.eventId,
      title: trimmedTitle,
      eventType,
      eventDate,
      startTime: startTime || null,
      endTime: endTime || null,
      priority,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-form-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-zinc-950/40 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl border-t sm:border border-zinc-200 shadow-xl overflow-hidden pb-safe max-h-[92vh] flex flex-col">
        <div className="sm:hidden flex justify-center pt-2.5 pb-1 shrink-0">
          <div className="w-9 h-1 rounded-full bg-zinc-200" />
        </div>

        <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between shrink-0">
          <h2 id="event-form-title" className="text-base font-semibold text-zinc-950">
            {editingEvent ? 'Edit Event' : 'Add Event'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 inline-flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {validationError && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-800"
            >
              {validationError}
            </div>
          )}

          <div>
            <label htmlFor="evt-title" className="block text-xs font-medium text-zinc-600 mb-1.5">
              Title
            </label>
            <input
              id="evt-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Operating Systems Midterm"
              required
              className="w-full px-3.5 py-2.5 text-sm text-zinc-950 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="evt-type" className="block text-xs font-medium text-zinc-600 mb-1.5">
                Type
              </label>
              <select
                id="evt-type"
                value={eventType}
                onChange={(e) => setEventType(e.target.value as AcademicEventType)}
                className="w-full px-3 py-2.5 text-sm text-zinc-950 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900"
              >
                {EVENT_TYPES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="evt-priority"
                className="block text-xs font-medium text-zinc-600 mb-1.5"
              >
                Priority
              </label>
              <select
                id="evt-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as EventPriority)}
                className="w-full px-3 py-2.5 text-sm text-zinc-950 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900"
              >
                {PRIORITIES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="evt-date" className="block text-xs font-medium text-zinc-600 mb-1.5">
              Date
            </label>
            <input
              id="evt-date"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 text-sm font-mono tabular-nums text-zinc-950 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="evt-start" className="block text-xs font-medium text-zinc-600 mb-1.5">
                Start Time
              </label>
              <input
                id="evt-start"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2.5 text-sm font-mono tabular-nums text-zinc-950 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            <div>
              <label htmlFor="evt-end" className="block text-xs font-medium text-zinc-600 mb-1.5">
                End Time
              </label>
              <input
                id="evt-end"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2.5 text-sm font-mono tabular-nums text-zinc-950 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>
          </div>

          <div className="pt-3 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-zinc-700 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-white bg-zinc-950 hover:bg-zinc-800 rounded-xl transition-colors"
            >
              {editingEvent ? 'Save Changes' : 'Add Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
