export type FileFormat = 'pdf' | 'docx' | 'pptx' | 'ics';

export interface AnonymizationAuditEntry {
  id: string;
  field: 'Student ID' | 'Full Name' | 'Institutional Email' | 'Phone';
  redactedToken: string;
  snippet: string;
  timestamp: string;
}

export interface StudyMaterial {
  id: string;
  name: string;
  size: string;
  format: FileFormat;
  subject: string;
  uploadedAt: string;
  pagesCount: number;
  topics: string[];
  rawText: string;
  charCount: number;
  anonymizedText: string;
  redactionsCount: number;
  publicationDate?: string;
  documentSummary?: string;
}

export type EventCategory =
  | 'Aulas Teóricas'
  | 'Aulas Práticas / Labs'
  | 'Entregas de Projeto'
  | 'Exames / Frequências'
  | 'Apresentações';

export type PriorityLevel = 'Alta' | 'Média' | 'Normal';

export type DeadlineType = 'Exame' | 'Frequência' | 'Trabalho de Grupo' | 'Projeto' | 'Apresentação';

export interface Deadline {
  id: string;
  title: string;
  subject: string;
  dueDate: string; // YYYY-MM-DD
  daysLeft: number;
  type: DeadlineType;
  priority: PriorityLevel;
  weight: string;
  notes: string;
}

export type ActivityType =
  | 'Revisão Teórica'
  | 'Resolução de Exercícios'
  | 'Desenvolvimento de Código'
  | 'Preparação de Apresentação'
  | 'Leitura e Resumos';

export interface ScheduleSlot {
  id: string;
  dayOfWeek: number; // 1: Segunda, 2: Terça, 3: Quarta, 4: Quinta, 5: Sexta, 6: Sábado
  dayName: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  subject: string;
  activity: ActivityType;
  materialRef: string;
  notes?: string;
}

export interface DailyTask {
  id: string;
  time: string;
  duration: string;
  subject: string;
  title: string;
  activity: ActivityType;
  sourceMaterial: string;
  completed: boolean;
  priority: PriorityLevel;
}

export interface Recommendation {
  id: string;
  category: 'Foco Imediato' | 'Estratégia Pedagógica' | 'Gestão de Ritmo';
  title: string;
  description: string;
  sourceMaterial: string;
}

export interface DraftEvent {
  id: string;
  title: string;
  subject: string;
  dueDate: string; // YYYY-MM-DD
  time: string; // HH:mm
  endTime?: string;
  category: EventCategory;
  priority: PriorityLevel;
  confidenceScore: number; // e.g. 96 (%)
  publicationDate: string;
  sourceDocumentName: string;
  sourceSnippet: string; // full paragraph
  highlightPhrase: string; // specific trigger text to highlight in yellow
  dateReasoning: string; // e.g. "Distinguished doc publication 2026-09-15 from final submission date"
  isConfirmed: boolean;
  weight?: string;
  location?: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  subject: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  category: EventCategory;
  priority: PriorityLevel;
  location: string;
  sourceType: 'ics' | 'pdf_extracted' | 'docx_extracted' | 'pptx_extracted' | 'manual';
  sourceDocumentName: string;
  sourceSnippet: string;
  highlightPhrase: string;
  dateReasoning: string;
  confidenceScore: number;
  publicationDate: string;
  completed?: boolean;
}

export interface MorningBriefingBullet {
  id: string;
  title: string;
  description: string;
  priority: PriorityLevel;
  subject: string;
  timeWindow: string;
  sourceDocumentName: string;
  sourceSnippet: string;
  highlightPhrase: string;
  dateReasoning: string;
  confidenceScore: number;
  publicationDate: string;
  completed: boolean;
}

export interface MorningBriefing {
  date: string;
  deliveryTime: string; // e.g. "08:00"
  estimatedReadSeconds: number; // e.g. 38s
  bullets: MorningBriefingBullet[];
  isOfflineCached: boolean;
  cachedAt: string;
}

export interface VerificationModalData {
  isOpen: boolean;
  eventTitle: string;
  subject: string;
  sourceDocumentName: string;
  publicationDate: string;
  extractedDueDate: string;
  dateReasoning: string;
  confidenceScore: number;
  highlightPhrase: string;
  fullSnippet: string;
  documentType: FileFormat;
}

export interface AppNotification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

export interface SqliteStats {
  status: 'online' | 'offline';
  queryLatencyMs: number;
  tables: {
    eventsCount: number;
    materialsCount: number;
    auditLogsCount: number;
  };
  storageUsedKb: number;
  lastSyncTime: string;
}
