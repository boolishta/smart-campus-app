import {
  StudyMaterial,
  DraftEvent,
  TimelineEvent,
  MorningBriefing,
  AnonymizationAuditEntry,
} from './types';

export const INITIAL_MATERIALS: StudyMaterial[] = [
  {
    id: 'mat-1',
    name: 'POO_Guiao_Projeto_Milestone1.docx',
    size: '1.2 MB',
    format: 'docx',
    subject: 'Programação Orientada a Objetos',
    uploadedAt: '05 Nov 2026, 09:15',
    pagesCount: 14,
    topics: ['Polimorfismo', 'Arquitetura MVC', 'Testes JUnit', 'Diagrama UML'],
    charCount: 14850,
    publicationDate: '2026-09-15',
    documentSummary: 'Guião de desenvolvimento do projeto prático em Java. Define critérios de avaliação e arquitetura.',
    rawText: `UNIVERSIDADE DE ENGENHARIA - DEPARTAMENTO DE INFORMÁTICA
Disciplina: Programação Orientada a Objetos (LEI 2026/2027)
Data de Publicação do Documento: 15 de Setembro de 2026
Docente Responsável: Prof. Dr. Armando Ferreira
Autores Submetidos: Estudante Tiago Silva, Nº up202305812, contacto: up202305812@campus.up.pt, tlf: 912345678.

1. INTRODUÇÃO E REQUISITOS
O presente trabalho prático visa a implementação de uma plataforma universitária de gestão curricular em Java 21 LTS.

2. ARQUITETURA DE SOFTWARE
A solução deverá respeitar o padrão Model-View-Controller (MVC) e demonstrar polimorfismo dinâmico.

4. CRITÉRIOS DE ENTREGA E CALENDARIZAÇÃO
Atenção: A data deste enunciado é 15 de Setembro de 2026, contudo a submissão formal no Inforestudante encerra impreterivelmente no dia 08 de Novembro de 2026 às 23h59.
Trabalhos submetidos após esta hora sofrerão uma penalização de 2 valores por dia de atraso.`,
    anonymizedText: `UNIVERSIDADE DE ENGENHARIA - DEPARTAMENTO DE INFORMÁTICA
Disciplina: Programação Orientada a Objetos (LEI 2026/2027)
Data de Publicação do Documento: 15 de Setembro de 2026
Docente Responsável: Prof. Dr. Armando Ferreira
Autores Submetidos: Estudante [REDACTED_NAME], Nº [REDACTED_STUDENT_ID], contacto: [REDACTED_EMAIL], tlf: [REDACTED_PHONE].

1. INTRODUÇÃO E REQUISITOS
O presente trabalho prático visa a implementação de uma plataforma universitária de gestão curricular em Java 21 LTS.

2. ARQUITETURA DE SOFTWARE
A solução deverá respeitar o padrão Model-View-Controller (MVC) e demonstrar polimorfismo dinâmico.

4. CRITÉRIOS DE ENTREGA E CALENDARIZAÇÃO
Atenção: A data deste enunciado é 15 de Setembro de 2026, contudo a submissão formal no Inforestudante encerra impreterivelmente no dia 08 de Novembro de 2026 às 23h59.
Trabalhos submetidos após esta hora sofrerão uma penalização de 2 valores por dia de atraso.`,
    redactionsCount: 4,
  },
  {
    id: 'mat-2',
    name: 'Analise_Matematica_I_Frequencia_Regulamento.pdf',
    size: '2.4 MB',
    format: 'pdf',
    subject: 'Análise Matemática I',
    uploadedAt: '05 Nov 2026, 09:18',
    pagesCount: 8,
    topics: ['Cálculo Integral', 'Séries Numéricas', 'Primitivação Racional'],
    charCount: 22400,
    publicationDate: '2026-09-20',
    documentSummary: 'Ficha de funcionamento e calendário de provas escritas de avaliação contínua.',
    rawText: `FACULDADE DE CIÊNCIAS - DEPARTAMENTO DE MATEMÁTICA
ANÁLISE MATEMÁTICA I - 1º ANO / 1º SEMESTRE (2026/2027)
Regulamento Pedagógico emitido em: 20 de Setembro de 2026.
Gabinete de Apoio Tutorial: Aluna Mariana Costa (nmec 202204192, mariana.costa@campus.up.pt).

CALENDÁRIO DAS AVALIAÇÕES FORMAIS:
A frequência escrita decorrerá na data oficial estabelecida pela comissão pedagógica:
- 1ª Frequência Semestral: 14 de Novembro de 2026, com início pontual às 09h00 nas salas do Bloco B.
- Conteúdos: Primitivas por partes, integração por substituição e convergência de séries numéricas.
- Duração da prova: 2 horas e 30 minutos sem recurso a calculadora gráfica.`,
    anonymizedText: `FACULDADE DE CIÊNCIAS - DEPARTAMENTO DE MATEMÁTICA
ANÁLISE MATEMÁTICA I - 1º ANO / 1º SEMESTRE (2026/2027)
Regulamento Pedagógico emitido em: 20 de Setembro de 2026.
Gabinete de Apoio Tutorial: Aluna [REDACTED_NAME] ([REDACTED_STUDENT_ID], [REDACTED_EMAIL]).

CALENDÁRIO DAS AVALIAÇÕES FORMAIS:
A frequência escrita decorrerá na data oficial estabelecida pela comissão pedagógica:
- 1ª Frequência Semestral: 14 de Novembro de 2026, com início pontual às 09h00 nas salas do Bloco B.
- Conteúdos: Primitivas por partes, integração por substituição e convergência de séries numéricas.
- Duração da prova: 2 horas e 30 minutos sem recurso a calculadora gráfica.`,
    redactionsCount: 3,
  },
  {
    id: 'mat-3',
    name: 'Sistemas_Digitais_Laboratorio_FPGA.pdf',
    size: '3.1 MB',
    format: 'pdf',
    subject: 'Sistemas Digitais',
    uploadedAt: '05 Nov 2026, 09:22',
    pagesCount: 26,
    topics: ['Máquinas de Estados (FSM)', 'VHDL', 'Placa DE10-Lite'],
    charCount: 18900,
    publicationDate: '2026-10-01',
    documentSummary: 'Manual prático de montagem e síntese de hardware para laboratório.',
    rawText: `SISTEMAS DIGITAIS - GUIA DE TRABALHOS PRÁTICOS EM LABORATÓRIO
Edição do Manual: 01 de Outubro de 2026
Inscrição de Turno Laboratorial: Estudante João Pereira, aluno nº 202308914.

Sessão de Demonstração em Bancada:
A demonstração em bancada da máquina de estados finitos (FSM) ocorrerá no dia 10 de Novembro de 2026 entre as 14h30 e as 17h00 no Laboratório I-204.
Cada grupo disporá de 15 minutos para carregamento da 'bitstream' no chip MAX 10 FPGA.`,
    anonymizedText: `SISTEMAS DIGITAIS - GUIA DE TRABALHOS PRÁTICOS EM LABORATÓRIO
Edição do Manual: 01 de Outubro de 2026
Inscrição de Turno Laboratorial: Estudante [REDACTED_NAME], aluno [REDACTED_STUDENT_ID].

Sessão de Demonstração em Bancada:
A demonstração em bancada da máquina de estados finitos (FSM) ocorrerá no dia 10 de Novembro de 2026 entre as 14h30 e as 17h00 no Laboratório I-204.
Cada grupo disporá de 15 minutos para carregamento da 'bitstream' no chip MAX 10 FPGA.`,
    redactionsCount: 2,
  },
];

export const INITIAL_DRAFT_EVENTS: DraftEvent[] = [
  {
    id: 'draft-1',
    title: 'Entrega da Milestone 1 (POO)',
    subject: 'Programação Orientada a Objetos',
    dueDate: '2026-11-08',
    time: '23:59',
    category: 'Entregas de Projeto',
    priority: 'Alta',
    confidenceScore: 97,
    publicationDate: '2026-09-15',
    sourceDocumentName: 'POO_Guiao_Projeto_Milestone1.docx',
    sourceSnippet: 'Atenção: A data deste enunciado é 15 de Setembro de 2026, contudo a submissão formal no Inforestudante encerra impreterivelmente no dia 08 de Novembro de 2026 às 23h59.',
    highlightPhrase: 'submissão formal no Inforestudante encerra impreterivelmente no dia 08 de Novembro de 2026 às 23h59',
    dateReasoning: 'Diferenciou com sucesso a data de publicação do guião (15/09/2026) da data limite de entrega da Milestone (08/11/2026) encontrada na Secção 4.',
    isConfirmed: false,
    weight: '30%',
    location: 'Plataforma Inforestudante',
  },
  {
    id: 'draft-2',
    title: '1ª Frequência Semestral de Análise Matemática I',
    subject: 'Análise Matemática I',
    dueDate: '2026-11-14',
    time: '09:00',
    category: 'Exames / Frequências',
    priority: 'Alta',
    confidenceScore: 94,
    publicationDate: '2026-09-20',
    sourceDocumentName: 'Analise_Matematica_I_Frequencia_Regulamento.pdf',
    sourceSnippet: 'A frequência escrita decorrerá na data oficial estabelecida pela comissão pedagógica: 1ª Frequência Semestral: 14 de Novembro de 2026, com início pontual às 09h00 nas salas do Bloco B.',
    highlightPhrase: '1ª Frequência Semestral: 14 de Novembro de 2026, com início pontual às 09h00',
    dateReasoning: 'Identificou evento de exame oficial no calendário avaliativo, distinguindo da data de aprovação do conselho pedagógico (20/09/2026).',
    isConfirmed: false,
    weight: '40%',
    location: 'Salas do Bloco B - FCUP',
  },
  {
    id: 'draft-3',
    title: 'Demonstração de Bancada FSM (Sistemas Digitais)',
    subject: 'Sistemas Digitais',
    dueDate: '2026-11-10',
    time: '14:30',
    category: 'Aulas Práticas / Labs',
    priority: 'Média',
    confidenceScore: 91,
    publicationDate: '2026-10-01',
    sourceDocumentName: 'Sistemas_Digitais_Laboratorio_FPGA.pdf',
    sourceSnippet: 'A demonstração em bancada da máquina de estados finitos (FSM) ocorrerá no dia 10 de Novembro de 2026 entre as 14h30 e as 17h00 no Laboratório I-204.',
    highlightPhrase: 'ocorrerá no dia 10 de Novembro de 2026 entre as 14h30 e as 17h00 no Laboratório I-204',
    dateReasoning: 'Reconheceu sessão prática com avaliação presencial no laboratório com intervalo horário explícito.',
    isConfirmed: false,
    weight: '20%',
    location: 'Laboratório I-204 (Hardware)',
  },
];

export const INITIAL_TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: 'evt-1',
    title: 'Aula Teórica: POO - Padrões de Desenho & Interfaces',
    subject: 'Programação Orientada a Objetos',
    date: '2026-11-06',
    startTime: '09:30',
    endTime: '11:30',
    category: 'Aulas Teóricas',
    priority: 'Normal',
    location: 'Anfiteatro B2 - FEUP',
    sourceType: 'ics',
    sourceDocumentName: 'Calendario_Semestral_Academico.ics',
    sourceSnippet: 'SUMMARY: POO - Aula Teórica (Polimorfismo & Interfaces) DTSTART: 20261106T093000',
    highlightPhrase: 'POO - Aula Teórica (Polimorfismo & Interfaces)',
    dateReasoning: 'Evento extraído de ficheiro estruturado .ics de calendário institucional.',
    confidenceScore: 100,
    publicationDate: '2026-09-01',
  },
  {
    id: 'evt-2',
    title: 'Sessão Prática: Análise Matemática I - Primitivas',
    subject: 'Análise Matemática I',
    date: '2026-11-06',
    startTime: '14:00',
    endTime: '16:00',
    category: 'Aulas Práticas / Labs',
    priority: 'Normal',
    location: 'Sala 1.04 - Matemática',
    sourceType: 'ics',
    sourceDocumentName: 'Calendario_Semestral_Academico.ics',
    sourceSnippet: 'SUMMARY: Análise Matemática I - Sessão de Problemas DTSTART: 20261106T140000',
    highlightPhrase: 'Análise Matemática I - Sessão de Problemas',
    dateReasoning: 'Importado diretamente de ficheiro de calendário local.',
    confidenceScore: 100,
    publicationDate: '2026-09-01',
  },
  {
    id: 'evt-3',
    title: 'Entrega da Milestone 1 (POO)',
    subject: 'Programação Orientada a Objetos',
    date: '2026-11-08',
    startTime: '23:59',
    endTime: '23:59',
    category: 'Entregas de Projeto',
    priority: 'Alta',
    location: 'Inforestudante / Moodle',
    sourceType: 'docx_extracted',
    sourceDocumentName: 'POO_Guiao_Projeto_Milestone1.docx',
    sourceSnippet: 'A submissão formal no Inforestudante encerra impreterivelmente no dia 08 de Novembro de 2026 às 23h59.',
    highlightPhrase: 'encerra impreterivelmente no dia 08 de Novembro de 2026 às 23h59',
    dateReasoning: 'Confirmado pelo estudante a partir da grelha de rascunho de IA com 97% de certeza.',
    confidenceScore: 97,
    publicationDate: '2026-09-15',
  },
  {
    id: 'evt-4',
    title: 'Laboratório: Sistemas Digitais - Teste em FPGA',
    subject: 'Sistemas Digitais',
    date: '2026-11-10',
    startTime: '14:30',
    endTime: '17:00',
    category: 'Aulas Práticas / Labs',
    priority: 'Média',
    location: 'Laboratório I-204',
    sourceType: 'pdf_extracted',
    sourceDocumentName: 'Sistemas_Digitais_Laboratorio_FPGA.pdf',
    sourceSnippet: 'A demonstração em bancada da máquina de estados finitos (FSM) ocorrerá no dia 10 de Novembro de 2026 entre as 14h30 e as 17h00 no Laboratório I-204.',
    highlightPhrase: 'ocorrerá no dia 10 de Novembro de 2026 entre as 14h30 e as 17h00',
    dateReasoning: 'Confirmado pelo utilizador após inspeção de fonte em PDF.',
    confidenceScore: 91,
    publicationDate: '2026-10-01',
  },
  {
    id: 'evt-5',
    title: '1ª Frequência Semestral de Análise Matemática I',
    subject: 'Análise Matemática I',
    date: '2026-11-14',
    startTime: '09:00',
    endTime: '11:30',
    category: 'Exames / Frequências',
    priority: 'Alta',
    location: 'Salas do Bloco B',
    sourceType: 'pdf_extracted',
    sourceDocumentName: 'Analise_Matematica_I_Frequencia_Regulamento.pdf',
    sourceSnippet: '1ª Frequência Semestral: 14 de Novembro de 2026, com início pontual às 09h00 nas salas do Bloco B.',
    highlightPhrase: '1ª Frequência Semestral: 14 de Novembro de 2026, com início pontual às 09h00',
    dateReasoning: 'Exame de alta ponderação (40%) extraído com semântica de avaliação formal.',
    confidenceScore: 94,
    publicationDate: '2026-09-20',
  },
];

export const INITIAL_MORNING_BRIEFING: MorningBriefing = {
  date: '2026-11-05',
  deliveryTime: '08:00',
  estimatedReadSeconds: 42,
  isOfflineCached: true,
  cachedAt: '05 Nov 2026, 08:00 (SQLite)',
  bullets: [
    {
      id: 'b-1',
      title: 'POO: Fechar Implementação de Interfaces & Testes',
      description: 'Restam apenas 3 dias para a submissão formal da Milestone 1. Priorize a escrita de testes unitários JUnit hoje de manhã.',
      priority: 'Alta',
      subject: 'Programação Orientada a Objetos',
      timeWindow: '09:30 - 11:30 (Bloco Recomendado)',
      sourceDocumentName: 'POO_Guiao_Projeto_Milestone1.docx',
      sourceSnippet: 'A submissão formal no Inforestudante encerra impreterivelmente no dia 08 de Novembro de 2026 às 23h59.',
      highlightPhrase: 'submissão formal no Inforestudante encerra impreterivelmente no dia 08 de Novembro de 2026 às 23h59',
      dateReasoning: 'Diferenciação precisa entre data do enunciado (15/09) e data de submissão (08/11).',
      confidenceScore: 97,
      publicationDate: '2026-09-15',
      completed: false,
    },
    {
      id: 'b-2',
      title: 'Análise Matemática: 3 Exercícios de Integrais Impróprios',
      description: 'Faltam 9 dias para a 1ª Frequência. Rever os apontamentos da aula e resolver os exercícios 4 a 8 da Ficha de Primitivas.',
      priority: 'Alta',
      subject: 'Análise Matemática I',
      timeWindow: '14:00 - 16:00 (Sessão Focada)',
      sourceDocumentName: 'Analise_Matematica_I_Frequencia_Regulamento.pdf',
      sourceSnippet: '1ª Frequência Semestral: 14 de Novembro de 2026, com início pontual às 09h00 nas salas do Bloco B.',
      highlightPhrase: '14 de Novembro de 2026, com início pontual às 09h00',
      dateReasoning: 'Avaliação presencial de alta importância curricular (40% da nota global).',
      confidenceScore: 94,
      publicationDate: '2026-09-20',
      completed: false,
    },
    {
      id: 'b-3',
      title: 'Sistemas Digitais: Simular FSM no Quartus Prime',
      description: 'Verificar se o diagrama de estados compila sem avisos críticos antes da sessão de laboratório marcada para dia 10.',
      priority: 'Média',
      subject: 'Sistemas Digitais',
      timeWindow: '16:30 - 18:00 (Preparação Prática)',
      sourceDocumentName: 'Sistemas_Digitais_Laboratorio_FPGA.pdf',
      sourceSnippet: 'A demonstração em bancada da máquina de estados finitos (FSM) ocorrerá no dia 10 de Novembro de 2026.',
      highlightPhrase: 'ocorrerá no dia 10 de Novembro de 2026 entre as 14h30 e as 17h00',
      dateReasoning: 'Reconheceu sessão de demonstração laboratorial com prazo de entrega.',
      confidenceScore: 91,
      publicationDate: '2026-10-01',
      completed: true,
    },
  ],
};

export const INITIAL_AUDIT_LOGS: AnonymizationAuditEntry[] = [
  {
    id: 'log-1',
    field: 'Student ID',
    redactedToken: '[REDACTED_STUDENT_ID]',
    snippet: 'Removido número de estudante "up202305812" em POO_Guiao_Projeto_Milestone1.docx',
    timestamp: '09:15:22',
  },
  {
    id: 'log-2',
    field: 'Full Name',
    redactedToken: '[REDACTED_NAME]',
    snippet: 'Removido nome de autor "Tiago Silva" antes de enviar para API de IA',
    timestamp: '09:15:22',
  },
  {
    id: 'log-3',
    field: 'Institutional Email',
    redactedToken: '[REDACTED_EMAIL]',
    snippet: 'Removido email institucional "up202305812@campus.up.pt"',
    timestamp: '09:15:23',
  },
  {
    id: 'log-4',
    field: 'Phone',
    redactedToken: '[REDACTED_PHONE]',
    snippet: 'Removido número de telefone "912345678"',
    timestamp: '09:15:23',
  },
];

/**
 * Calculates countdown string from a target date & time relative to reference time.
 * e.g. "3d 14h 22m" or "Hoje às 23:59"
 */
export function calculateCountdown(targetDate: string, targetTime: string = '23:59', referenceTimeMs: number = Date.now()): {
  formatted: string;
  isPast: boolean;
  isUrgent: boolean;
  days: number;
} {
  const target = new Date(`${targetDate}T${targetTime.length === 5 ? targetTime + ':00' : targetTime}`);
  const diffMs = target.getTime() - referenceTimeMs;

  if (diffMs <= 0) {
    return { formatted: 'Concluído / Expirado', isPast: true, isUrgent: false, days: 0 };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  let formatted = '';
  if (days > 0) {
    formatted = `${days}d ${hours}h`;
  } else if (hours > 0) {
    formatted = `${hours}h ${minutes}m`;
  } else {
    formatted = `${minutes}m`;
  }

  return {
    formatted,
    isPast: false,
    isUrgent: days <= 3,
    days,
  };
}

export interface DayOfWeekItem {
  id: number;
  name: string;
  short: string;
}

export const DAYS_OF_WEEK: DayOfWeekItem[] = [
  { id: 1, name: 'Segunda-feira', short: 'Seg' },
  { id: 2, name: 'Terça-feira', short: 'Ter' },
  { id: 3, name: 'Quarta-feira', short: 'Qua' },
  { id: 4, name: 'Quinta-feira', short: 'Qui' },
  { id: 5, name: 'Sexta-feira', short: 'Sex' },
  { id: 6, name: 'Sábado', short: 'Sáb' },
];

export const INITIAL_DEADLINES = [
  {
    id: 'dead-1',
    title: 'Entrega do Projeto POO — Milestone 1',
    subject: 'Programação Orientada a Objetos',
    dueDate: '2026-11-08',
    daysLeft: 3,
    type: 'Projeto' as const,
    priority: 'Alta' as const,
    weight: '25%',
    notes: 'Implementação das classes de domínio e diagrama UML no relatório.',
  },
  {
    id: 'dead-2',
    title: 'Frequência de Análise Matemática I',
    subject: 'Análise Matemática I',
    dueDate: '2026-11-14',
    daysLeft: 9,
    type: 'Frequência' as const,
    priority: 'Alta' as const,
    weight: '40%',
    notes: 'Integrais impróprios e séries de potências.',
  },
];

export const INITIAL_SCHEDULE = [
  {
    id: 'slot-1',
    dayOfWeek: 1,
    dayName: 'Segunda-feira',
    startTime: '09:00',
    endTime: '11:00',
    subject: 'Programação Orientada a Objetos',
    activity: 'Desenvolvimento de Código' as const,
    materialRef: 'POO_Guiao_Projeto_Milestone1.docx',
    notes: 'Codificação da arquitetura de classes.',
  },
  {
    id: 'slot-2',
    dayOfWeek: 2,
    dayName: 'Terça-feira',
    startTime: '14:30',
    endTime: '16:30',
    subject: 'Análise Matemática I',
    activity: 'Resolução de Exercícios' as const,
    materialRef: 'Analise_Matematica_I_Frequencia_Regulamento.pdf',
    notes: 'Exercícios de séries convergentes.',
  },
];

export const INITIAL_DAILY_TASKS = [
  {
    id: 'task-1',
    time: '09:30 - 11:30',
    duration: '2h 00m',
    subject: 'Programação Orientada a Objetos',
    title: 'Finalização da Milestone 1 & Testes Unitários',
    activity: 'Desenvolvimento de Código' as const,
    sourceMaterial: 'POO_Guiao_Projeto_Milestone1.docx',
    completed: false,
    priority: 'Alta' as const,
  },
];

export const INITIAL_RECOMMENDATIONS = [
  {
    id: 'rec-1',
    category: 'Foco Imediato' as const,
    title: 'Prioridade ao Projeto de POO',
    description: 'Dedique o primeiro bloco matinal com a mente fresca para fechar os testes unitários.',
    sourceMaterial: 'POO_Guiao_Projeto_Milestone1.docx',
  },
];

export function generateAutomatedSchedule(materials: any[], deadlines: any[]) {
  return INITIAL_SCHEDULE;
}

export function generateDailyPlanTasks(schedule: any[], materials: any[]) {
  return INITIAL_DAILY_TASKS;
}

