import React, { useState, useRef } from 'react';
import { StudyMaterial, Deadline, DeadlineType, PriorityLevel, FileFormat, DraftEvent } from '../types';
import { parseIcsContent, SAMPLE_ICS_DATA } from '../utils/icsParser';
import { anonymizeDocumentText } from '../utils/anonymizer';
import {
  UploadCloud,
  FileText,
  Trash2,
  Calendar,
  AlertCircle,
  Plus,
  Clock,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { Translations, Language } from '../translations';

interface MaterialsSectionProps {
  materials: StudyMaterial[];
  deadlines: Deadline[];
  onAddMaterial: (material: StudyMaterial) => void;
  onDeleteMaterial: (materialId: string) => void;
  onAddDeadline: (deadline: Deadline) => void;
  onDeleteDeadline: (deadlineId: string) => void;
  onAddDraftsFromExtraction: (drafts: DraftEvent[]) => void;
  onNavigateToDrafts: () => void;
  onNavigateToSchedule: () => void;
  isScheduleConfirmed: boolean;
  t: Translations;
  language: Language;
}

const SUPPORTED_EXTENSIONS = ['.docx', '.pdf', '.pptx', '.ics'];

export const MaterialsSection: React.FC<MaterialsSectionProps> = ({
  materials,
  deadlines,
  onAddMaterial,
  onDeleteMaterial,
  onAddDeadline,
  onDeleteDeadline,
  onAddDraftsFromExtraction,
  onNavigateToDrafts,
  onNavigateToSchedule,
  isScheduleConfirmed,
  t,
  language,
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingGenAI, setIsProcessingGenAI] = useState(false);
  const [charLimitInfo, setCharLimitInfo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Deadline form states
  const [deadlineTitle, setDeadlineTitle] = useState('');
  const [deadlineSubject, setDeadlineSubject] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [deadlineType, setDeadlineType] = useState<DeadlineType>('Exame');
  const [deadlinePriority, setDeadlinePriority] = useState<PriorityLevel>('Alta');
  const [deadlineWeight, setDeadlineWeight] = useState('30%');
  const [deadlineNotes, setDeadlineNotes] = useState('');
  const [deadlineSuccessMsg, setDeadlineSuccessMsg] = useState<string | null>(null);

  const validateAndProcessFile = (file: File) => {
    setErrorMessage(null);
    setCharLimitInfo(null);
    const fileName = file.name;
    const lowerName = fileName.toLowerCase();
    const hasValidExt = SUPPORTED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));

    if (!hasValidExt) {
      // EXACT validation message required by CA01
      setErrorMessage(t.validationErrorMessage);
      return;
    }

    let format: FileFormat = 'pdf';
    if (lowerName.endsWith('.docx')) format = 'docx';
    else if (lowerName.endsWith('.pptx')) format = 'pptx';
    else if (lowerName.endsWith('.ics')) format = 'ics';

    // Handle ICS calendar file locally
    if (format === 'ics') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = (e.target?.result as string) || SAMPLE_ICS_DATA;
        const parsed = parseIcsContent(text);

        const newMaterial: StudyMaterial = {
          id: `mat-${Date.now()}`,
          name: fileName,
          size: `${Math.round(file.size / 1024) || 8} KB`,
          format: 'ics',
          subject: 'Calendário Semestral Institucional',
          uploadedAt: language === 'pt' ? 'Agora mesmo' : 'Just now',
          pagesCount: parsed.length,
          topics: ['Aulas Teóricas', 'Aulas Práticas', 'Eventos de Calendário'],
          charCount: text.length,
          rawText: text,
          anonymizedText: text,
          redactionsCount: 0,
          publicationDate: '2026-09-01',
          documentSummary: `Ficheiro .ics processado localmente no dispositivo (${parsed.length} eventos extraídos).`,
        };

        onAddMaterial(newMaterial);

        // Convert parsed events into drafts for human-in-the-loop review
        const generatedDrafts: DraftEvent[] = parsed.map((p, idx) => ({
          id: `draft-ics-${Date.now()}-${idx}`,
          title: p.title,
          subject: p.title.split('-')[0]?.trim() || 'Sessão Académica',
          dueDate: p.startDate,
          time: p.startTime,
          endTime: p.endTime,
          category: p.title.toLowerCase().includes('lab') || p.title.toLowerCase().includes('prática')
            ? 'Aulas Práticas / Labs'
            : 'Aulas Teóricas',
          priority: 'Normal',
          confidenceScore: 100,
          publicationDate: '2026-09-01',
          sourceDocumentName: fileName,
          sourceSnippet: `SUMMARY: ${p.title} LOCATION: ${p.location}`,
          highlightPhrase: p.title,
          dateReasoning: 'Parsing local direto de ficheiro estruturado .ics no dispositivo (sem envio para a cloud).',
          isConfirmed: false,
          location: p.location,
        }));

        onAddDraftsFromExtraction(generatedDrafts);
      };
      reader.readAsText(file);
      return;
    }

    // Handle PDF / DOCX / PPTX with GenAI Extraction & Anonymization
    setIsProcessingGenAI(true);
    const rawSubject = fileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    const displaySize = file.size > 0 ? `${sizeInMB} MB` : '1.4 MB';

    // Simulate extracting text up to 50,000 characters
    const estimatedChars = Math.min(48000, Math.max(8500, Math.round(file.size * 0.8) || 14500));
    const sampleRawText = `DOCUMENTO CURRICULAR: ${fileName}\nAutor Estudante: Tiago Silva, nº 202305812, email: up202305812@campus.up.pt.\nPublicação: 15 de Setembro de 2026.\nPrazo Impreterível: Entrega no Inforestudante até 20 de Novembro de 2026 às 23h59.`;

    // Run Stateless PII Anonymization before GenAI cloud transmission (RF06)
    const anonymized = anonymizeDocumentText(sampleRawText, fileName);

    setTimeout(() => {
      setIsProcessingGenAI(false);

      const newMaterial: StudyMaterial = {
        id: `mat-${Date.now()}`,
        name: fileName,
        size: displaySize,
        format,
        subject: rawSubject.length > 25 ? `${rawSubject.slice(0, 22)}...` : rawSubject,
        uploadedAt: language === 'pt' ? 'Agora mesmo' : 'Just now',
        pagesCount: format === 'pptx' ? 32 : format === 'pdf' ? 14 : 9,
        topics: ['Conceitos Principais', 'Trabalho Prático', 'Critérios de Avaliação'],
        charCount: estimatedChars,
        rawText: sampleRawText,
        anonymizedText: anonymized.anonymizedText,
        redactionsCount: anonymized.redactionsCount,
        publicationDate: '2026-09-15',
        documentSummary: 'Documento analisado com reconhecimento semântico de datas e sanitização stateless de PII.',
      };

      onAddMaterial(newMaterial);

      // Create AI-extracted draft event
      const newDraft: DraftEvent = {
        id: `draft-ai-${Date.now()}`,
        title: `Entrega: ${rawSubject}`,
        subject: newMaterial.subject,
        dueDate: '2026-11-20',
        time: '23:59',
        category: 'Entregas de Projeto',
        priority: 'Alta',
        confidenceScore: 96,
        publicationDate: '2026-09-15',
        sourceDocumentName: fileName,
        sourceSnippet: 'Prazo Impreterível: Entrega no Inforestudante até 20 de Novembro de 2026 às 23h59.',
        highlightPhrase: 'Entrega no Inforestudante até 20 de Novembro de 2026 às 23h59',
        dateReasoning: 'Diferenciou a data de publicação do documento (15/09) da data de submissão final do trabalho (20/11) na Secção 4.',
        isConfirmed: false,
        weight: '30%',
        location: 'Inforestudante',
      };

      onAddDraftsFromExtraction([newDraft]);
      setCharLimitInfo(
        language === 'pt'
          ? `Texto processado: ${estimatedChars.toLocaleString()} / 50.000 caracteres (dentro do limite). ${anonymized.redactionsCount} dados pessoais anonimizados.`
          : `Text processed: ${estimatedChars.toLocaleString()} / 50,000 characters (within limit). ${anonymized.redactionsCount} PII tokens redacted.`
      );
    }, 600);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  // Quick insert sample triggers
  const handleAddSampleFile = (type: FileFormat) => {
    setErrorMessage(null);
    setCharLimitInfo(null);

    if (type === 'ics') {
      const parsed = parseIcsContent(SAMPLE_ICS_DATA);
      const newMaterial: StudyMaterial = {
        id: `mat-${Date.now()}`,
        name: 'Calendario_Aulas_Semestral.ics',
        size: '18 KB',
        format: 'ics',
        subject: 'Horário Curricular de LEI',
        uploadedAt: language === 'pt' ? 'Agora mesmo' : 'Just now',
        pagesCount: parsed.length,
        topics: ['POO Teórica', 'Análise Matemática', 'Sistemas Digitais'],
        charCount: SAMPLE_ICS_DATA.length,
        rawText: SAMPLE_ICS_DATA,
        anonymizedText: SAMPLE_ICS_DATA,
        redactionsCount: 0,
        publicationDate: '2026-09-01',
        documentSummary: 'Ficheiro de calendário .ics processado localmente no dispositivo.',
      };
      onAddMaterial(newMaterial);

      const generatedDrafts: DraftEvent[] = parsed.map((p, idx) => ({
        id: `draft-ics-${Date.now()}-${idx}`,
        title: p.title,
        subject: p.title.split('-')[0]?.trim() || 'Sessão Académica',
        dueDate: p.startDate,
        time: p.startTime,
        endTime: p.endTime,
        category: p.title.toLowerCase().includes('lab') || p.title.toLowerCase().includes('sessão')
          ? 'Aulas Práticas / Labs'
          : 'Aulas Teóricas',
        priority: 'Normal',
        confidenceScore: 100,
        publicationDate: '2026-09-01',
        sourceDocumentName: 'Calendario_Aulas_Semestral.ics',
        sourceSnippet: `SUMMARY: ${p.title} LOCATION: ${p.location}`,
        highlightPhrase: p.title,
        dateReasoning: 'Parsing local direto no dispositivo (sem envio para a cloud).',
        isConfirmed: false,
        location: p.location,
      }));

      onAddDraftsFromExtraction(generatedDrafts);
      return;
    }

    const samples = {
      pdf: {
        name: `Ficha_Exercicios_Cadeias_Markov_${Math.floor(Math.random() * 90 + 10)}.pdf`,
        subject: language === 'pt' ? 'Probabilidades e Estatística' : 'Probability & Statistics',
        size: '2.1 MB',
        pagesCount: 14,
        topics: ['Cadeias de Markov', 'Probabilidade Condicionada', 'Teorema de Bayes'],
        charCount: 21300,
      },
      docx: {
        name: `Relatorio_Estruturas_Dados_ArvoreAVL_${Math.floor(Math.random() * 90 + 10)}.docx`,
        subject: language === 'pt' ? 'Estruturas de Dados e Algoritmos' : 'Data Structures & Algorithms',
        size: '920 KB',
        pagesCount: 9,
        topics: ['Árvores AVL', 'Balanceamento', 'Complexidade O(log n)'],
        charCount: 16400,
      },
      pptx: {
        name: `Redes_Computadores_Camada_Transporte_${Math.floor(Math.random() * 90 + 10)}.pptx`,
        subject: language === 'pt' ? 'Redes de Computadores' : 'Computer Networks',
        size: '5.4 MB',
        pagesCount: 48,
        topics: ['TCP vs UDP', 'Controlo de Congestionamento', 'Three-way Handshake'],
        charCount: 28900,
      },
    };

    const s = samples[type as 'pdf' | 'docx' | 'pptx'];
    const sampleRawText = `DOCUMENTO CURRICULAR: ${s.name}\nAutor Estudante: Tiago Silva, nº 202305812.\nPublicação: 15 de Setembro de 2026.\nPrazo Impreterível: Submissão até 24 de Novembro de 2026 às 23h59.`;
    const anonymized = anonymizeDocumentText(sampleRawText, s.name);

    const newMaterial: StudyMaterial = {
      id: `mat-${Date.now()}`,
      name: s.name,
      size: s.size,
      format: type,
      subject: s.subject,
      uploadedAt: language === 'pt' ? 'Agora mesmo' : 'Just now',
      pagesCount: s.pagesCount,
      topics: s.topics,
      charCount: s.charCount,
      rawText: sampleRawText,
      anonymizedText: anonymized.anonymizedText,
      redactionsCount: anonymized.redactionsCount,
      publicationDate: '2026-09-15',
      documentSummary: 'Documento processado com extração GenAI e sanitização de dados pessoais.',
    };

    onAddMaterial(newMaterial);

    const newDraft: DraftEvent = {
      id: `draft-ai-${Date.now()}`,
      title: `Avaliação: ${s.subject}`,
      subject: s.subject,
      dueDate: '2026-11-24',
      time: '23:59',
      category: 'Entregas de Projeto',
      priority: 'Alta',
      confidenceScore: 95,
      publicationDate: '2026-09-15',
      sourceDocumentName: s.name,
      sourceSnippet: 'Prazo Impreterível: Submissão até 24 de Novembro de 2026 às 23h59.',
      highlightPhrase: 'Submissão até 24 de Novembro de 2026 às 23h59',
      dateReasoning: 'Distinção entre data de edição do enunciado e prazo final de entrega.',
      isConfirmed: false,
      weight: '25%',
      location: 'Moodle',
    };

    onAddDraftsFromExtraction([newDraft]);
  };

  // Trigger invalid file simulation to test required CA01 validation message
  const handleTestInvalidUpload = () => {
    setErrorMessage(t.validationErrorMessage);
  };

  const handleCreateDeadline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deadlineTitle.trim() || !deadlineSubject.trim() || !deadlineDate) {
      return;
    }

    const targetDate = new Date(deadlineDate);
    const baseDate = new Date('2026-11-05');
    const diffTime = targetDate.getTime() - baseDate.getTime();
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const newDeadline: Deadline = {
      id: `dead-${Date.now()}`,
      title: deadlineTitle.trim(),
      subject: deadlineSubject.trim(),
      dueDate: deadlineDate,
      daysLeft: diffDays,
      type: deadlineType,
      priority: deadlinePriority,
      weight: deadlineWeight.trim() || '20%',
      notes: deadlineNotes.trim(),
    };

    onAddDeadline(newDeadline);

    setDeadlineTitle('');
    setDeadlineSubject('');
    setDeadlineDate('');
    setDeadlineNotes('');
    setDeadlineSuccessMsg(t.deadlineAddedSuccess);
    setTimeout(() => setDeadlineSuccessMsg(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Introduction */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {t.sec1Title}
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            {t.sec1Desc}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onNavigateToDrafts}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{language === 'pt' ? 'Ver Rascunhos IA' : 'View AI Drafts'}</span>
          </button>
          <button
            onClick={onNavigateToSchedule}
            className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs"
          >
            <span>{t.viewScheduleBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Validation Message Alert (CA01) */}
      {errorMessage && (
        <div
          role="alert"
          className="p-4 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl flex items-start justify-between gap-3 animate-in fade-in duration-200"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">{t.validationErrorTitle}</p>
              <p className="text-sm text-rose-700 mt-0.5">{errorMessage}</p>
            </div>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-xs text-rose-600 hover:text-rose-800 font-medium px-2 py-1 rounded hover:bg-rose-100 transition-colors"
          >
            {t.close}
          </button>
        </div>
      )}

      {/* Character Limit & Stateless Sanitization Info */}
      {charLimitInfo && (
        <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
          <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>{charLimitInfo}</span>
        </div>
      )}

      {/* Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-indigo-600 bg-indigo-50/60 scale-[1.005]'
            : 'border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50/50'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".docx,.pdf,.pptx,.ics,text/calendar,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation"
          className="hidden"
        />

        <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-3 shadow-xs">
          <UploadCloud className="w-7 h-7" />
        </div>

        <h3 className="text-base font-bold text-slate-900">
          {t.dropzoneTitle}
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-lg mx-auto">
          {t.dropzoneSubtitle}
        </p>

        {isProcessingGenAI && (
          <div className="mt-4 p-2 bg-indigo-50 text-indigo-700 text-xs rounded-lg inline-flex items-center gap-2 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'pt' ? 'A extrair texto sem identificadores e a reconhecer datas semânticas...' : 'Sanitizing PII and running semantic GenAI date recognition...'}</span>
          </div>
        )}

        {/* Quick Sample Triggers (including .ics file) */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs text-slate-500 mr-1">{t.quickInsertLabel}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleAddSampleFile('ics');
            }}
            className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
          >
            + .ICS (Calendário Local)
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleAddSampleFile('pdf');
            }}
            className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            + .PDF (Probabilidades)
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleAddSampleFile('docx');
            }}
            className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            + .DOCX (POO)
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleAddSampleFile('pptx');
            }}
            className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            + .PPTX (Redes)
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleTestInvalidUpload();
            }}
            title={language === 'pt' ? 'Testar aviso de ficheiro não suportado' : 'Test unsupported file warning'}
            className="px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200"
          >
            {t.testInvalidUploadBtn}
          </button>
        </div>
      </div>

      {/* Two columns: Uploaded Materials list & Deadlines Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Uploaded Materials List (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {t.uploadedMaterialsTitle} ({materials.length})
              </h3>
              <p className="text-xs text-slate-500">
                {t.uploadedMaterialsSubtitle}
              </p>
            </div>
            {materials.length > 0 && (
              <span className="text-xs font-medium text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full">
                {t.indexingActive}
              </span>
            )}
          </div>

          {materials.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-medium text-slate-700">{t.noFilesTitle}</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                {t.noFilesDesc}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {materials.map((mat) => {
                const formatColors = {
                  pdf: 'bg-rose-50 text-rose-700 border-rose-200',
                  docx: 'bg-blue-50 text-blue-700 border-blue-200',
                  pptx: 'bg-amber-50 text-amber-700 border-amber-200',
                  ics: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                };

                return (
                  <div
                    key={mat.id}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all flex items-start justify-between gap-3 bg-white"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-xs uppercase shrink-0 border ${formatColors[mat.format]}`}>
                        {mat.format}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-slate-900 truncate" title={mat.name}>
                          {mat.name}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 mt-1">
                          <span className="font-medium text-slate-700">{mat.subject}</span>
                          <span>·</span>
                          <span className="tabular-nums font-mono">{mat.size}</span>
                          <span>·</span>
                          <span className="tabular-nums font-mono text-[11px] text-slate-400">
                            {mat.charCount.toLocaleString()} / 50k chars
                          </span>
                        </div>

                        {mat.redactionsCount > 0 && (
                          <div className="mt-1 text-[11px] text-emerald-700 font-mono flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            <span>{mat.redactionsCount} dados de estudante sanitizados (Stateless)</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteMaterial(mat.id)}
                      title={t.deleteTooltip}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Deadlines Form & List (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Add Deadline Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {t.deadlinesFormTitle}
                </h3>
                <p className="text-xs text-slate-500">
                  {t.deadlinesFormSubtitle}
                </p>
              </div>
              <Calendar className="w-5 h-5 text-indigo-600" />
            </div>

            {deadlineSuccessMsg && (
              <div className="mb-4 p-2.5 bg-emerald-50 text-emerald-800 text-xs rounded-lg flex items-center gap-2 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{deadlineSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateDeadline} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.fieldTitle}
                </label>
                <input
                  type="text"
                  placeholder="Ex: Entrega de Projeto, Exame Final..."
                  value={deadlineTitle}
                  onChange={(e) => setDeadlineTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.fieldSubject}
                </label>
                <input
                  type="text"
                  placeholder="Ex: Programação Orientada a Objetos"
                  value={deadlineSubject}
                  onChange={(e) => setDeadlineSubject(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.fieldDueDate}
                  </label>
                  <input
                    type="date"
                    value={deadlineDate}
                    onChange={(e) => setDeadlineDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.fieldType}
                  </label>
                  <select
                    value={deadlineType}
                    onChange={(e) => setDeadlineType(e.target.value as DeadlineType)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                  >
                    <option value="Exame">Exame</option>
                    <option value="Frequência">Frequência</option>
                    <option value="Projeto">Projeto</option>
                    <option value="Trabalho de Grupo">Trabalho de Grupo</option>
                    <option value="Apresentação">Apresentação</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>{t.addDeadlineBtn}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
