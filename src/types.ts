export type SourceFileType = 'PDF' | 'ICS';
export type IngestionStatus = 'PARSED' | 'CONFIRMED' | 'FAILED';

export interface SourceDocument {
  documentId: string;
  fileName: string;
  fileType: SourceFileType;
  fileSizeBytes: number;
  characterCount: number;
  uploadedAt: string;
  ingestionStatus: IngestionStatus;
}

export type AcademicEventType = 'LECTURE' | 'ASSIGNMENT' | 'LAB' | 'EXAM' | 'OTHER';
export type EventPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type EventStatus = 'DRAFT' | 'CONFIRMED';

export interface AcademicEvent {
  eventId: string;
  documentId: string | null;
  title: string;
  eventType: AcademicEventType;
  eventDate: string; // YYYY-MM-DD
  startTime: string | null; // HH:MM | null
  endTime: string | null; // HH:MM | null
  priority: EventPriority;
  status: EventStatus;
  sourceSnippet: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DailyBriefing {
  briefingId: string;
  briefingDate: string; // YYYY-MM-DD, unique per day
  summaryText: string;
  isOfflineFallback: boolean;
  fallbackReason?: 'offline' | 'ai_error' | null;
  createdAt: string;
}

export type WorkflowStage = 1 | 2 | 3 | 4 | 5;
