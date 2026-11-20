/**
 * Local iCalendar (.ics) parser that runs directly on the user's device.
 * Extracts VEVENT entries (SUMMARY, DTSTART, DTEND, LOCATION, DESCRIPTION).
 */

export interface ParsedIcsEvent {
  title: string;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  location: string;
  description: string;
}

export function parseIcsContent(icsText: string): ParsedIcsEvent[] {
  const events: ParsedIcsEvent[] = [];
  const lines = icsText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

  let inEvent = false;
  let currentEvent: Partial<ParsedIcsEvent> & { rawStart?: string; rawEnd?: string } = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('BEGIN:VEVENT')) {
      inEvent = true;
      currentEvent = {};
      continue;
    }

    if (line.startsWith('END:VEVENT')) {
      if (inEvent && currentEvent.title) {
        // Format parsed dates
        const parsedStart = parseIcsDateTime(currentEvent.rawStart || '');
        const parsedEnd = parseIcsDateTime(currentEvent.rawEnd || '');

        events.push({
          title: currentEvent.title || 'Sessão Académica',
          startDate: parsedStart.date || '2026-11-06',
          startTime: parsedStart.time || '10:00',
          endTime: parsedEnd.time || '12:00',
          location: currentEvent.location || 'Campus Universitário',
          description: currentEvent.description || 'Importado de ficheiro de calendário .ics',
        });
      }
      inEvent = false;
      continue;
    }

    if (!inEvent) continue;

    if (line.startsWith('SUMMARY:')) {
      currentEvent.title = line.substring(8).trim();
    } else if (line.startsWith('LOCATION:')) {
      currentEvent.location = line.substring(9).trim();
    } else if (line.startsWith('DESCRIPTION:')) {
      currentEvent.description = line.substring(12).trim();
    } else if (line.startsWith('DTSTART')) {
      const val = line.split(':')[1];
      if (val) currentEvent.rawStart = val.trim();
    } else if (line.startsWith('DTEND')) {
      const val = line.split(':')[1];
      if (val) currentEvent.rawEnd = val.trim();
    }
  }

  return events;
}

function parseIcsDateTime(raw: string): { date: string; time: string } {
  // Typical ICS format: 20261106T140000Z or 20261106T140000 or 20261106
  const clean = raw.replace(/[^0-9T]/g, '');
  if (!clean) return { date: '', time: '' };

  if (clean.includes('T')) {
    const [datePart, timePart] = clean.split('T');
    const year = datePart.substring(0, 4);
    const month = datePart.substring(4, 6);
    const day = datePart.substring(6, 8);
    const hours = timePart.substring(0, 2);
    const minutes = timePart.substring(2, 4);
    return {
      date: `${year}-${month}-${day}`,
      time: `${hours}:${minutes}`,
    };
  } else if (clean.length >= 8) {
    const year = clean.substring(0, 4);
    const month = clean.substring(4, 6);
    const day = clean.substring(6, 8);
    return {
      date: `${year}-${month}-${day}`,
      time: '09:00',
    };
  }

  return { date: '', time: '' };
}

export const SAMPLE_ICS_DATA = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Universidade//Horario Academico v2.4//PT
CALSCALE:GREGORIAN
BEGIN:VEVENT
UID:evt-poo-aula-01@campus.up.pt
DTSTART:20261106T093000
DTEND:20261106T113000
SUMMARY:POO - Aula Teórica (Polimorfismo & Interfaces)
LOCATION:Anfiteatro B2 - Edifício de Engenharia
DESCRIPTION:Aula teórica presencial sobre padrões de desenho e arquitetura limpa em Java.
END:VEVENT
BEGIN:VEVENT
UID:evt-ami-lab-02@campus.up.pt
DTSTART:20261106T140000
DTEND:20261106T160000
SUMMARY:Análise Matemática I - Sessão de Problemas
LOCATION:Sala de Aulas 1.04
DESCRIPTION:Resolução supervisionada de integrais impróprios e equações diferenciais lineares.
END:VEVENT
BEGIN:VEVENT
UID:evt-sd-lab-03@campus.up.pt
DTSTART:20261109T100000
DTEND:20261109T120000
SUMMARY:Sistemas Digitais - Lab de FSM e FPGA
LOCATION:Laboratório I-204 (Hardware)
DESCRIPTION:Implementação prática de circuitos sequenciais síncronos em placa FPGA DE10-Lite.
END:VEVENT
END:VCALENDAR`;
