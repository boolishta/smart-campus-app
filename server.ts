import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import {
  EXTRACT_PDF_RESPONSE_SCHEMA,
  EXTRACT_PDF_SYSTEM_INSTRUCTION,
  MORNING_BRIEFING_RESPONSE_SCHEMA,
  MORNING_BRIEFING_SYSTEM_INSTRUCTION,
  buildExtractPdfPrompt,
  buildMorningBriefingPrompt,
} from './prompts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const MODEL_NAME = 'gemini-3.5-flash-lite';
const FALLBACK_MODELS = ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-3.5-flash'];

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

async function generateContentWithRetry(
  ai: GoogleGenAI,
  params: Parameters<GoogleGenAI['models']['generateContent']>[0]
) {
  let lastError: unknown;
  const candidates = Array.from(new Set([params.model, ...FALLBACK_MODELS]));
  for (let i = 0; i < candidates.length; i += 1) {
    const model = candidates[i];
    try {
      return await ai.models.generateContent({ ...params, model });
    } catch (err) {
      lastError = err;
      const status = (err as { status?: number })?.status;
      const isTransient = status === 503 || status === 429 || status === 500 || status === 404;
      if (!isTransient || i === candidates.length - 1) {
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
  }
  throw lastError;
}

const VALID_EVENT_TYPES = new Set(['LECTURE', 'ASSIGNMENT', 'LAB', 'EXAM', 'OTHER']);
const VALID_PRIORITIES = new Set(['LOW', 'MEDIUM', 'HIGH']);
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_HINT_RE =
  /\b(?:\d{1,2}[\/\-.]\d{1,2}(?:[\/\-.]\d{2,4})?|\d{4}-\d{2}-\d{2}|(?:jan(?:uary|eiro)?|feb(?:ruary)?|fev(?:ereiro)?|mar(?:ch|ço|co)?|apr(?:il)?|abr(?:il)?|may|mai(?:o)?|jun(?:e|ho)?|jul(?:y|ho)?|aug(?:ust)?|ago(?:sto)?|sep(?:t(?:ember)?)?|set(?:embro)?|oct(?:ober)?|out(?:ubro)?|nov(?:ember|embro)?|dec(?:ember)?|dez(?:embro)?))\b/i;

function extractCandidateDateLines(text: string): string[] {
  const lines = text.split('\n');
  const hints: string[] = [];
  let currentPage = 'PAGE 1';

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line) continue;
    const pageMatch = line.match(/^---\s*(PAGE\s+\d+(?:\s+of\s+\d+)?)\s*---$/i);
    if (pageMatch) {
      currentPage = pageMatch[1].toUpperCase();
      continue;
    }
    if (DATE_HINT_RE.test(line)) {
      const nextLine = (lines[i + 1] ?? '').trim();
      const combined = /^\d{4}\b/.test(nextLine) ? `${line} ${nextLine}` : line;
      hints.push(`[${currentPage}] ${combined.slice(0, 220)}`);
    }
  }
  return hints.slice(0, 60);
}

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
      const dateHints = extractCandidateDateLines(text);

      const response = await generateContentWithRetry(ai, {
        model: MODEL_NAME,
        contents: buildExtractPdfPrompt({
          fileName: typeof fileName === 'string' ? fileName : 'course-document.pdf',
          referenceDate,
          dateHints,
          text,
        }),
        config: {
          temperature: 0,
          maxOutputTokens: 4096,
          systemInstruction: EXTRACT_PDF_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: EXTRACT_PDF_RESPONSE_SCHEMA,
        },
      });

      const rawText = (response.text ?? '{"detectedDateStrings":[],"events":[]}').trim();
      let parsed: unknown;
      try {
        parsed = JSON.parse(rawText);
      } catch {
        res.status(502).json({ error: 'AI returned malformed JSON output.' });
        return;
      }

      const rawEvents = Array.isArray(parsed)
        ? parsed
        : parsed && typeof parsed === 'object' && Array.isArray((parsed as { events?: unknown }).events)
        ? (parsed as { events: unknown[] }).events
        : null;

      if (!rawEvents) {
        res.status(502).json({ error: 'AI returned an unexpected format.' });
        return;
      }

      const normalized = (rawEvents as ExtractedEventInput[])
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

      const response = await generateContentWithRetry(ai, {
        model: MODEL_NAME,
        contents: buildMorningBriefingPrompt({
          referenceDate,
          events: safeEvents,
        }),
        config: {
          temperature: 0.2,
          systemInstruction: MORNING_BRIEFING_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: MORNING_BRIEFING_RESPONSE_SCHEMA,
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
