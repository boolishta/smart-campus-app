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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
    >
      <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 id="event-form-title" className="text-base font-semibold text-slate-900">
            {editingEvent ? 'Edit Event' : 'Add Academic Event'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {validationError && (
            <div
              role="alert"
              className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-800"
            >
              {validationError}
            </div>
          )}

          <div>
            <label htmlFor="evt-title" className="block text-xs font-medium text-slate-700 mb-1.5">
              Event Title
            </label>
            <input
              id="evt-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Operating Systems Midterm Exam"
              required
              className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="evt-type" className="block text-xs font-medium text-slate-700 mb-1.5">
                Event Type
              </label>
              <select
                id="evt-type"
                value={eventType}
                onChange={(e) => setEventType(e.target.value as AcademicEventType)}
                className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
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
                className="block text-xs font-medium text-slate-700 mb-1.5"
              >
                Priority
              </label>
              <select
                id="evt-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as EventPriority)}
                className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
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
            <label htmlFor="evt-date" className="block text-xs font-medium text-slate-700 mb-1.5">
              Date
            </label>
            <input
              id="evt-date"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 text-sm font-mono tabular-nums text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="evt-start" className="block text-xs font-medium text-slate-700 mb-1.5">
                Start Time (optional)
              </label>
              <input
                id="evt-start"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm font-mono tabular-nums text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
              />
            </div>

            <div>
              <label htmlFor="evt-end" className="block text-xs font-medium text-slate-700 mb-1.5">
                End Time (optional)
              </label>
              <input
                id="evt-end"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm font-mono tabular-nums text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              {editingEvent ? 'Save Changes' : 'Add Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
