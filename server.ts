import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const MODEL_NAME = 'gemini-4-hydrogen';

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const VALID_EVENT_TYPES = new Set(['LECTURE', 'ASSIGNMENT', 'LAB', 'EXAM', 'OTHER']);
const VALID_PRIORITIES = new Set(['LOW', 'MEDIUM', 'HIGH']);
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

interface ExtractedEventInput {
  title?: unknown;
  eventType?: unknown;
  eventDate?: unknown;
  startTime?: unknown;
  endTime?: unknown;
  priority?: unknown;
  sourceSnippet?: unknown;
}

interface BriefingEventInput {
  title: string;
  eventType: string;
  eventDate: string;
  startTime: string | null;
  endTime: string | null;
  priority: string;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.post('/api/extract-pdf', async (req, res) => {
    try {
      const { text, fileName, todayDate } = req.body as {
        text?: string;
        fileName?: string;
        todayDate?: string;
      };

      if (typeof text !== 'string' || text.trim().length === 0) {
        res.status(400).json({ error: 'PDF text content is empty.' });
        return;
      }

      if (text.length > 50000) {
        res.status(400).json({ error: 'PDF text exceeds the 50,000 character limit.' });
        return;
      }

      const referenceDate =
        typeof todayDate === 'string' && ISO_DATE_RE.test(todayDate)
          ? todayDate
          : new Date().toISOString().slice(0, 10);

      const ai = getGeminiClient();

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: `Document file name: ${typeof fileName === 'string' ? fileName : 'course-document.pdf'}
Reference date (today): ${referenceDate}

Extract all student academic deadlines, exams, assignments, labs, presentations, and scheduled lectures from the anonymized course document text below.

DOCUMENT TEXT:
${text}`,
        config: {
          systemInstruction: `You extract structured academic calendar events from anonymized university course syllabi and assignment documents.
Rules:
1. Extract ONLY actual academic deadlines, exams, labs, project submissions, presentations, or scheduled lectures explicitly mentioned in the text.
2. Do NOT treat document creation dates, syllabus publication dates, or copyright years as deadlines.
3. Convert every event date to strict YYYY-MM-DD format. If a year is omitted, infer the nearest logical academic year relative to the reference date.
4. Use HH:MM (24-hour) for startTime and endTime if explicitly mentioned, otherwise return an empty string "".
5. Classify eventType strictly as one of: LECTURE, ASSIGNMENT, LAB, EXAM, OTHER.
6. Classify priority strictly as one of: HIGH (exams, major projects, near deadlines), MEDIUM (assignments, labs), LOW (lectures, optional readings).
7. For every extracted event, include sourceSnippet containing the exact verbatim sentence or short quote from the input text that specifies the event and date.
8. If no academic dates or deadlines appear in the text, return an empty array [].`,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
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
      });

      const rawText = (response.text ?? '[]').trim();
      let parsed: unknown;
      try {
        parsed = JSON.parse(rawText);
      } catch {
        res.status(502).json({ error: 'AI returned malformed JSON output.' });
        return;
      }

      if (!Array.isArray(parsed)) {
        res.status(502).json({ error: 'AI returned an unexpected format.' });
        return;
      }

      const normalized = (parsed as ExtractedEventInput[])
        .filter((item) => item && typeof item.title === 'string' && item.title.trim().length > 0)
        .map((item) => {
          const rawType = typeof item.eventType === 'string' ? item.eventType.toUpperCase() : 'OTHER';
          const rawPriority = typeof item.priority === 'string' ? item.priority.toUpperCase() : 'MEDIUM';
          const rawDate = typeof item.eventDate === 'string' ? item.eventDate.trim() : referenceDate;
          const rawStart = typeof item.startTime === 'string' ? item.startTime.trim() : '';
          const rawEnd = typeof item.endTime === 'string' ? item.endTime.trim() : '';
          const rawSnippet = typeof item.sourceSnippet === 'string' ? item.sourceSnippet.trim() : '';

          return {
            title: String(item.title).trim().slice(0, 180),
            eventType: VALID_EVENT_TYPES.has(rawType) ? rawType : 'OTHER',
            eventDate: ISO_DATE_RE.test(rawDate) ? rawDate : referenceDate,
            startTime: TIME_RE.test(rawStart) ? rawStart : null,
            endTime: TIME_RE.test(rawEnd) ? rawEnd : null,
            priority: VALID_PRIORITIES.has(rawPriority) ? rawPriority : 'MEDIUM',
            sourceSnippet: rawSnippet.length > 0 ? rawSnippet.slice(0, 600) : null,
          };
        });

      res.json({ events: normalized });
    } catch (err) {
      console.error('[POST /api/extract-pdf] Error:', err);
      res.status(503).json({
        error: 'AI service unavailable. Please check your connection or try again.',
      });
    }
  });

  app.post('/api/morning-briefing', async (req, res) => {
    try {
      const { events, todayDate } = req.body as {
        events?: BriefingEventInput[];
        todayDate?: string;
      };

      if (!Array.isArray(events) || events.length === 0) {
        res.status(400).json({
          error: 'No confirmed schedule found. Please upload a .pdf or .ics file first.',
        });
        return;
      }

      const referenceDate =
        typeof todayDate === 'string' && ISO_DATE_RE.test(todayDate)
          ? todayDate
          : new Date().toISOString().slice(0, 10);

      const safeEvents = events.slice(0, 40).map((evt) => ({
        title: String(evt.title ?? '').slice(0, 180),
        eventType: String(evt.eventType ?? 'OTHER'),
        eventDate: String(evt.eventDate ?? referenceDate),
        startTime: evt.startTime ?? null,
        endTime: evt.endTime ?? null,
        priority: String(evt.priority ?? 'MEDIUM'),
      }));

      const ai = getGeminiClient();

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: `Today's date: ${referenceDate}
Upcoming confirmed student schedule (anonymized):
${JSON.stringify(safeEvents, null, 2)}

Synthesize a concise Daily Morning Briefing (under 1 minute read) highlighting the top 3 priorities.`,
        config: {
          systemInstruction: `You write a crisp, practical Daily Morning Briefing for a university student at 08:00 AM.
Rules:
1. Keep the total reading time strictly under 1 minute (around 80-120 words total).
2. Return up to 3 top priorities ordered by urgency and academic impact (exams and imminent deadlines first).
3. Each priority MUST include the exact eventTitle copied verbatim from the provided schedule so the student can immediately recognize the item, plus a short 1-sentence actionable study focus.
4. Keep the tone calm, direct, and student-friendly. No fluff, no markdown headers, no technical jargon.`,
          responseMimeType: 'application/json',
          responseSchema: {
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
          },
        },
      });

      const rawText = (response.text ?? '{}').trim();
      let parsed: {
        overview?: string;
        priorities?: Array<{ eventTitle?: string; dueLabel?: string; actionNote?: string }>;
      };
      try {
        parsed = JSON.parse(rawText);
      } catch {
        res.status(502).json({ error: 'AI returned malformed briefing output.' });
        return;
      }

      const overview = typeof parsed.overview === 'string' ? parsed.overview.trim() : '';
      const priorities = Array.isArray(parsed.priorities) ? parsed.priorities.slice(0, 3) : [];

      const bulletLines = priorities.map((p, idx) => {
        const title = (p.eventTitle ?? '').trim();
        const due = (p.dueLabel ?? '').trim();
        const note = (p.actionNote ?? '').trim();
        return `${idx + 1}. ${title}${due ? ` (${due})` : ''} — ${note}`;
      });

      const summaryText = [overview, ...bulletLines].filter(Boolean).join('\n');

      res.json({ summaryText });
    } catch (err) {
      console.error('[POST /api/morning-briefing] Error:', err);
      res.status(503).json({
        error: 'AI service unavailable. Please check your connection or try again.',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SmartCampus server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start SmartCampus server:', err);
  process.exit(1);
});
