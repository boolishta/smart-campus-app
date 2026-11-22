import { Type } from '@google/genai';

export interface ExtractPdfPromptInput {
  fileName: string;
  referenceDate: string;
  dateHints: string[];
  text: string;
}

export interface BriefingEventPromptInput {
  title: string;
  eventType: string;
  eventDate: string;
  startTime: string | null;
  endTime: string | null;
  priority: string;
}

export interface MorningBriefingPromptInput {
  referenceDate: string;
  events: BriefingEventPromptInput[];
}

// =========================================================
// 1) PDF DEADLINE & SCHEDULE EXTRACTION
// =========================================================

export const EXTRACT_PDF_SYSTEM_INSTRUCTION = `You extract structured academic calendar events from anonymized university course syllabi, project briefs, and assignment documents in BOTH English and Portuguese.
Rules:
1. Scan EVERY page exhaustively from "--- PAGE 1 of N ---" through "--- PAGE N of N ---". NEVER stop after the first match or first page — extract EVERY dated item across the entire document.
2. First populate detectedDateStrings with every calendar date mention found anywhere in the document, then create one item in events for each valid academic event.
3. Support both English and Portuguese academic terminology and date formats, including headings and labels such as "Aula 09", "Aula 10", "Planeamento", "Apresentação e Defesa", "Defesa", "Entrega", "Avaliação", "Exame", "Teste", and Portuguese month names ("janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro").
4. Extract EVERY dated class session, milestone, lab, assignment, project submission, presentation, defense, exam, and deadline explicitly mentioned in the text — INCLUDING dates before the reference date (today). Do NOT drop or filter out past dates; the student decides what to keep in Draft Preview.
5. Do NOT treat document creation dates, syllabus publication dates, or copyright years as events.
6. Convert every event date to strict YYYY-MM-DD format. If a year is omitted, infer the nearest logical academic year relative to the reference date or academic year noted in the document (e.g., "26-27" means 2026 for Sep–Dec and 2027 for Jan–Jul).
7. Use HH:MM (24-hour) for startTime and endTime if explicitly mentioned, otherwise return an empty string "".
8. Classify eventType strictly as one of: LECTURE, ASSIGNMENT, LAB, EXAM, OTHER:
   - LAB: Any practical, hands-on, laboratory, workshop, or guided project-work session — including Portuguese/English indicators such as "Lab", "Laboratory", "Laboratório", "PL", "Prática Laboratorial", "Aula Prática", "Prática", "Workshop", "Implementação", "Configuração", "Desenvolvimento", "Testes", "Acompanhamento", or numbered project-work sessions (e.g., "Aula 09", "Aula 10") inside a project/lab brief where students build, configure, or demo work rather than attend a theoretical lecture.
   - LECTURE: ONLY theoretical/expository classes ("Aula Teórica", "Teórica", "T", "Lecture", "Seminar"). Do NOT default practical or project sessions to LECTURE just because the heading says "Aula".
   - EXAM: Exams, midterms, finals, quizzes, tests ("Exame", "Teste", "Avaliação") and graded presentations/defenses ("Apresentação e Defesa", "Defesa", "Presentation").
   - ASSIGNMENT: Deliverables, submissions, reports, milestones ("Entrega", "Submissão", "Relatório", "Milestone", "Assignment").
   - OTHER: Anything else that does not fit the above.
9. Classify priority strictly as one of: HIGH (exams, presentations/defenses such as "Apresentação e Defesa", major project deliveries, near deadlines), MEDIUM (assignments, labs, practical project sessions, milestones), LOW (theoretical lectures, optional readings).
10. For every extracted event, include sourceSnippet containing the exact verbatim sentence or short quote from the input text that specifies the event and date.
11. If no academic dates or deadlines appear anywhere in the document, return { "detectedDateStrings": [], "events": [] }.`;

export function buildExtractPdfPrompt({
  fileName,
  referenceDate,
  dateHints,
  text,
}: ExtractPdfPromptInput): string {
  const hintsSection =
    dateHints.length > 0
      ? `CANDIDATE DATE LINES FOUND ACROSS ALL PAGES (verify each one against the full text below):\n${dateHints.join('\n')}\n\n`
      : '';

  return `Document file name: ${fileName}
Reference date (today): ${referenceDate}

Scan EVERY page from PAGE 1 through the final page of the anonymized course document below (in English or Portuguese).
First list EVERY calendar date mention you find in detectedDateStrings, then emit ONE event object in events for EACH dated academic item (class session, milestone, lab, assignment, deadline, exam, presentation, or defense), even if the date is before the reference date. Do not stop after the first match or first page.

${hintsSection}DOCUMENT TEXT:
${text}`;
}

export const EXTRACT_PDF_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    detectedDateStrings: {
      type: Type.ARRAY,
      description:
        'List EVERY calendar date string found across ALL pages of the document before extracting events.',
      items: { type: Type.STRING },
    },
    events: {
      type: Type.ARRAY,
      description:
        'One structured academic event object for each dated academic session, milestone, deadline, exam, or presentation found across all pages.',
      items: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: 'Concise, clear event title including course name or code if available.',
          },
          eventType: {
            type: Type.STRING,
            description: 'One of: LECTURE, ASSIGNMENT, LAB, EXAM, OTHER',
          },
          eventDate: {
            type: Type.STRING,
            description: 'Event date in YYYY-MM-DD format.',
          },
          startTime: {
            type: Type.STRING,
            description: '24-hour HH:MM start or due time, or empty string if unspecified.',
          },
          endTime: {
            type: Type.STRING,
            description: '24-hour HH:MM end time, or empty string if unspecified.',
          },
          priority: {
            type: Type.STRING,
            description: 'One of: LOW, MEDIUM, HIGH',
          },
          sourceSnippet: {
            type: Type.STRING,
            description: 'Exact verbatim quote from the source PDF text supporting this event.',
          },
        },
        required: ['title', 'eventType', 'eventDate', 'priority', 'sourceSnippet'],
      },
    },
  },
  required: ['detectedDateStrings', 'events'],
};

// =========================================================
// 2) DAILY MORNING BRIEFING (08:00 AM)
// =========================================================

export const MORNING_BRIEFING_SYSTEM_INSTRUCTION = `You write a crisp, practical Daily Morning Briefing for a university student at 08:00 AM.
Rules:
1. Keep the total reading time strictly under 1 minute (around 80-120 words total).
2. Return up to 3 top priorities ordered by urgency and academic impact (exams and imminent deadlines first).
3. Each priority MUST include the exact eventTitle copied verbatim from the provided schedule so the student can immediately recognize the item, plus a short 1-sentence actionable study focus.
4. Keep the tone calm, direct, and student-friendly. No fluff, no markdown headers, no technical jargon.`;

export function buildMorningBriefingPrompt({
  referenceDate,
  events,
}: MorningBriefingPromptInput): string {
  return `Today's date: ${referenceDate}
Upcoming confirmed student schedule (anonymized):
${JSON.stringify(events, null, 2)}

Synthesize a concise Daily Morning Briefing (under 1 minute read) highlighting the top 3 priorities.`;
}

export const MORNING_BRIEFING_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    overview: {
      type: Type.STRING,
      description: 'One brief opening sentence summarizing today and the upcoming week.',
    },
    priorities: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          eventTitle: {
            type: Type.STRING,
            description: 'Exact verbatim title of the referenced event from the schedule.',
          },
          dueLabel: {
            type: Type.STRING,
            description: 'Short timing label like "Today at 14:00" or "Due Nov 24".',
          },
          actionNote: {
            type: Type.STRING,
            description: 'One concise actionable study step (under 22 words).',
          },
        },
        required: ['eventTitle', 'dueLabel', 'actionNote'],
      },
    },
  },
  required: ['overview', 'priorities'],
};
