export type Language = 'pt' | 'en';

export interface Translations {
  appName: string;
  prototypeBadge: string;
  appSubtitle: string;
  // 5-Stage Stepper
  step1: string;
  step2: string;
  step3: string;
  step4: string;
  step5: string;
  // Navigation Screens
  tabMaterials: string;
  tabDrafts: string;
  tabTimeline: string;
  tabBriefing: string;
  tabPrivacy: string;
  statusConfirmed: string;
  statusPending: string;
  sqliteActive: string;
  // Test Scenario Bar
  testBarTitle: string;
  testBarSubtitle: string;
  scenario1Btn: string;
  scenario2Btn: string;
  testRn02Btn: string;
  resetBtn: string;
  scenario1Tooltip: string;
  scenario2Tooltip: string;
  testRn02Tooltip: string;
  // Section 1: Materials
  sec1Title: string;
  sec1Desc: string;
  viewScheduleBtn: string;
  validationErrorTitle: string;
  validationErrorMessage: string;
  close: string;
  dropzoneTitle: string;
  dropzoneSubtitle: string;
  quickInsertLabel: string;
  testInvalidUploadBtn: string;
  uploadedMaterialsTitle: string;
  uploadedMaterialsSubtitle: string;
  indexingActive: string;
  noFilesTitle: string;
  noFilesDesc: string;
  deleteTooltip: string;
  deadlinesFormTitle: string;
  deadlinesFormSubtitle: string;
  deadlineAddedSuccess: string;
  fieldTitle: string;
  fieldSubject: string;
  fieldDueDate: string;
  fieldType: string;
  fieldPriority: string;
  fieldWeight: string;
  fieldNotes: string;
  addDeadlineBtn: string;
  registeredDeadlinesTitle: string;
  noDeadlines: string;
  daysRemaining: string;
  // Draft Onboarding Banner
  draftOnboardingBanner: string;
  draftUncommittedNotice: string;
  // Section 2: Schedule / Timeline
  sec2Title: string;
  scheduleConfirmedBadge: string;
  schedulePendingBadge: string;
  scheduleConfirmedDesc: string;
  schedulePendingDesc: string;
  recalculateScheduleBtn: string;
  confirmScheduleBtn: string;
  viewCurrentPlanBtn: string;
  viewGrid: string;
  viewDay: string;
  addStudyBlockBtn: string;
  todayBadge: string;
  sessionCount: string;
  sessionsCount: string;
  noBlocksPlanned: string;
  edit: string;
  remove: string;
  materialLabel: string;
  // Slot edit modal
  editBlockTitle: string;
  manualAdjustment: string;
  startTime: string;
  endTime: string;
  activityType: string;
  associatedMaterial: string;
  sessionNotes: string;
  removeBlock: string;
  cancel: string;
  saveChanges: string;
  // Add block modal
  addSessionTitle: string;
  dayOfWeek: string;
  addBlockSubmit: string;
  // Section 3: Daily Plan / Morning Briefing
  todayDateText: string;
  todayLabel: string;
  planTitle: string;
  planDesc: string;
  notificationTimeLabel: string;
  saveNotificationBtn: string;
  verifySourceBtn: string;
  notificationSavedToast: string;
  todayProgress: string;
  completed: string;
  totalPlannedHours: string;
  totalPlannedHoursVal: string;
  threeFocusedSessions: string;
  nextCriticalDeadline: string;
  noneUpcoming: string;
  inDays: string;
  recommendedTasksTitle: string;
  markAsCompletedHint: string;
  activeBlocksBadge: string;
  priorityHighBadge: string;
  priorityNormalBadge: string;
  disciplineLabel: string;
  originLabel: string;
  pedagogicalRecsTitle: string;
  criticalDeadlinesRadarTitle: string;
  registeredCount: string;
  // Glitch state & Empty state
  rn02NoFilesTitle: string;
  rn02NoFilesDesc: string;
  goToMaterialsBtn: string;
  rn02UnconfirmedTitle: string;
  rn02UnconfirmedDesc: string;
  goToScheduleBtn: string;
  glitchTitle: string; // "No tasks scheduled for today."
  glitchDesc: string;
  glitchNotice: string;
  verifyingStep1: string;
  verifyingStep2: string;
  verifyingStep3: string;
  verifyingWait: string;
  // File change modal
  rn01ModalTitle: string;
  rn01AddedDesc: string;
  rn01DeletedDesc: string;
  rn01Question: string;
  rn01ImpactTitle: string;
  rn01ImpactDesc: string;
  rn01KeepCurrentBtn: string;
  rn01UpdateScheduleBtn: string;
  // Source Verification Modal
  sourceAuditTitle: string;
  sourceAuditSubtitle: string;
  sourceVerifiedBadge: string;
  sourceAuditSnippetTitle: string;
  sourceAuditSnippetBadge: string;
  sourceAuditFooter: string;
  closeAuditBtn: string;
  // Toasts
  toastScheduleConfirmed: string;
  toastSlotUpdated: string;
  toastSlotDeleted: string;
  toastSlotAdded: string;
  toastRegenerated: string;
  toastVerifiedSuccess: string;
  toastScenario1: string;
  toastScenario2: string;
  toastRn02: string;
  toastReset: string;
  toastFileChangeAuto: string;
  toastFileChangeKept: string;
  // Footer
  footerMemory: string;
  footerSupportedFormats: string;
  languageSelectLabel: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  pt: {
    appName: 'SmartCampus',
    prototypeBadge: 'Protótipo PT',
    appSubtitle: 'Planeamento Automatizado de Estudos Universitários',
    step1: '1. Carregar',
    step2: '2. Rever',
    step3: '3. Editar',
    step4: '4. Confirmar',
    step5: '5. Cronograma Final',
    tabMaterials: 'Carregar Materiais',
    tabDrafts: 'Rascunhos de IA',
    tabTimeline: 'Cronograma Semanal',
    tabBriefing: 'Resumo Matinal',
    tabPrivacy: 'Privacidade & Dados',
    statusConfirmed: 'Confirmado',
    statusPending: 'Pendente',
    sqliteActive: 'Guardado Localmente',
    testBarTitle: 'Painel de Teste & Demonstração:',
    testBarSubtitle: 'Alterne entre os cenários de teste do protótipo',
    scenario1Btn: 'Cenário 1 (Sucesso)',
    scenario2Btn: 'Cenário 2 (Simular Glitch)',
    testRn02Btn: 'Testar Estado Vazio',
    resetBtn: 'Repor Dados',
    scenario1Tooltip: 'Carrega dados padrão completos e navega para o Resumo Matinal',
    scenario2Tooltip: 'Simula a falha de dados no Plano Atual para testar o botão "Verify source"',
    testRn02Tooltip: 'Esvazia materiais para testar regra de estado vazio',
    sec1Title: '1. Carregamento & Processamento de Materiais',
    sec1Desc: 'Carregue calendários (.ics) e documentos de apoio (.pdf, .docx, .pptx) até 50.000 caracteres com proteção de privacidade e processamento local.',
    viewScheduleBtn: 'Ver Cronograma',
    validationErrorTitle: 'Erro de Validação de Ficheiro',
    validationErrorMessage: 'Formato de arquivo não suportado. Carregue docx, pdf ou pptx.',
    close: 'Fechar',
    dropzoneTitle: 'Arraste ficheiros .ics, .pdf, .docx, .pptx ou clique para selecionar',
    dropzoneSubtitle: 'Formatos suportados: .ics (calendário local), .docx, .pdf, .pptx (limite: 50.000 caracteres)',
    quickInsertLabel: 'Inserção rápida para teste:',
    testInvalidUploadBtn: 'Testar Erro (.png / .exe)',
    uploadedMaterialsTitle: 'Materiais & Calendários Carregados',
    uploadedMaterialsSubtitle: 'Ficheiros processados no seu dispositivo com dados pessoais protegidos',
    indexingActive: 'Processado Localmente',
    noFilesTitle: 'Nenhum ficheiro carregado ainda',
    noFilesDesc: 'Arraste um ficheiro ICS, PDF, DOCX ou PPTX na área acima para iniciar o planeamento.',
    deleteTooltip: 'Eliminar este ficheiro e atualizar o planeamento',
    deadlinesFormTitle: 'Definir Prazos & Avaliações',
    deadlinesFormSubtitle: 'Datas limite para balanceamento de horas de estudo',
    deadlineAddedSuccess: 'Prazo adicionado com sucesso!',
    fieldTitle: 'Título da Avaliação / Entrega',
    fieldSubject: 'Unidade Curricular / Disciplina',
    fieldDueDate: 'Data Limite',
    fieldType: 'Tipo de Avaliação',
    fieldPriority: 'Prioridade',
    fieldWeight: 'Ponderação (% Nota)',
    fieldNotes: 'Observações / Matéria Alvo',
    addDeadlineBtn: 'Adicionar Prazo',
    registeredDeadlinesTitle: 'Prazos Registados',
    noDeadlines: 'Nenhum prazo configurado',
    daysRemaining: 'dias restantes',
    draftOnboardingBanner: '⚠️ Rascunho Temporário: Reveja os eventos extraídos abaixo. Edite quaisquer detalhes e clique em "Confirm Events" ("Confirmar Horário") para gravar no seu calendário offline.',
    draftUncommittedNotice: 'As datas permanecem como rascunhos provisórios não confirmados até à sua validação manual.',
    sec2Title: '2. Cronograma Unificado & Horário de Estudo',
    scheduleConfirmedBadge: '✓ Horário Confirmado',
    schedulePendingBadge: '⚠ Rascunhos Pendentes',
    scheduleConfirmedDesc: 'O horário está sincronizado com o calendário local e funciona perfeitamente sem ligação à internet.',
    schedulePendingDesc: 'Existem rascunhos de IA por confirmar. Clique em "Confirm Events" ("Confirmar Horário") para guardar no seu calendário.',
    recalculateScheduleBtn: 'Recalcular Horário',
    confirmScheduleBtn: 'Confirmar Horário',
    viewCurrentPlanBtn: 'Ver Resumo Matinal',
    viewGrid: 'Grelha Semanal Completa',
    viewDay: 'Vista Diária Detalhada',
    addStudyBlockBtn: '+ Adicionar Evento',
    todayBadge: 'Hoje',
    sessionCount: 'sessão',
    sessionsCount: 'sessões',
    noBlocksPlanned: 'Sem blocos planeados',
    edit: 'Editar',
    remove: 'Remover',
    materialLabel: 'Material',
    editBlockTitle: 'Editar Evento do Cronograma',
    manualAdjustment: 'Ajuste manual da sessão',
    startTime: 'Hora de Início',
    endTime: 'Hora de Fim',
    activityType: 'Tipo de Atividade',
    associatedMaterial: 'Material de Apoio Associado',
    sessionNotes: 'Notas e Objetivos da Sessão',
    removeBlock: 'Remover Bloco',
    cancel: 'Cancelar',
    saveChanges: 'Guardar Alteração',
    addSessionTitle: 'Adicionar Sessão de Estudo',
    dayOfWeek: 'Dia da Semana',
    addBlockSubmit: 'Adicionar Bloco',
    todayDateText: 'Quinta-feira, 05 de Novembro de 2026',
    todayLabel: 'Hoje',
    planTitle: 'Resumo Matinal & Plano do Dia',
    planDesc: 'Resumo conciso gerado a partir dos seus ficheiros e prazos com tempo de leitura inferior a 1 minuto.',
    notificationTimeLabel: 'Hora de Envio:',
    saveNotificationBtn: 'Gravar',
    verifySourceBtn: 'Verify source',
    notificationSavedToast: 'Hora de envio do resumo matinal atualizada para as',
    todayProgress: 'Progresso de Hoje',
    completed: 'Concluído',
    totalPlannedHours: 'Horas Totais Planeadas',
    totalPlannedHoursVal: '5h 30m',
    threeFocusedSessions: 'Divididas em 3 sessões focadas',
    nextCriticalDeadline: 'Próxima Entrega Crítica',
    noneUpcoming: 'Nenhuma próxima',
    inDays: 'Em',
    recommendedTasksTitle: '3 Prioridades Diárias para Hoje',
    markAsCompletedHint: 'Marque como concluído à medida que estuda',
    activeBlocksBadge: '3 Blocos Ativos',
    priorityHighBadge: 'Prioritário',
    priorityNormalBadge: 'Normal',
    disciplineLabel: 'Disciplina',
    originLabel: 'Origem',
    pedagogicalRecsTitle: 'Recomendações de Estudo',
    criticalDeadlinesRadarTitle: 'Prazos Críticos & Avaliações',
    registeredCount: 'Registados',
    rn02NoFilesTitle: 'Não é Possível Gerar o Plano Diário',
    rn02NoFilesDesc: 'Nenhum material de estudo foi carregado. Carregue documentos de apoio (.docx, .pdf, .pptx) para calendarizar as sessões.',
    goToMaterialsBtn: 'Ir para Carregamento de Materiais',
    rn02UnconfirmedTitle: 'Eventos Aguardando Confirmação',
    rn02UnconfirmedDesc: 'Existem eventos extraídos por IA na grelha de rascunhos. Reveja os detalhes e clique em "Confirm Events" ("Confirmar Horário") para validar.',
    goToScheduleBtn: 'Ir para Rascunhos e Confirmar',
    glitchTitle: 'No tasks scheduled for today.',
    glitchDesc: 'Ocorreu uma inconsistência de sincronização no plano diário. Nenhuma tarefa foi agendada para hoje.',
    glitchNotice: 'Cenário de Teste 2 Ativo: Clique no botão "Verify source" para reanalisar as fontes e restaurar o plano.',
    verifyingStep1: '1/3: A analisar integridade dos ficheiros carregados...',
    verifyingStep2: '2/3: A recalcular blocos no horário e resolver prazos...',
    verifyingStep3: '3/3: A gerar tarefas diárias e recomendações de estudo...',
    verifyingWait: 'A forçar recalculação e sincronização com ficheiros...',
    rn01ModalTitle: 'Atualizar Cronograma?',
    rn01AddedDesc: 'foi adicionado aos materiais de estudo.',
    rn01DeletedDesc: 'foi removido dos materiais de estudo.',
    rn01Question: 'Deseja recalcular e gerar automaticamente o cronograma atualizado?',
    rn01ImpactTitle: 'Impacto no Planeamento:',
    rn01ImpactDesc: 'A recalculação redistribui as sessões semanais priorizando entregas iminentes e ponderações curriculares.',
    rn01KeepCurrentBtn: 'Manter Atual',
    rn01UpdateScheduleBtn: 'Recalcular Cronograma',
    sourceAuditTitle: 'Auditoria de Fonte Original (Verify Source)',
    sourceAuditSubtitle: 'Verificação visual do documento original de onde a data foi extraída.',
    sourceVerifiedBadge: 'Fonte Verificada',
    sourceAuditSnippetTitle: 'Excerto do Documento com Realce:',
    sourceAuditSnippetBadge: 'Texto Fonte Confirmado',
    sourceAuditFooter: 'Permite auditar e validar a origem de cada prazo diretamente no documento.',
    closeAuditBtn: 'Fechar Auditoria',
    toastScheduleConfirmed: 'Eventos confirmados com sucesso e guardados no seu calendário offline.',
    toastSlotUpdated: 'Evento atualizado no calendário local.',
    toastSlotDeleted: 'Evento removido do cronograma.',
    toastSlotAdded: 'Novo evento adicionado ao cronograma.',
    toastRegenerated: 'Cronograma recalculado a partir dos materiais e prazos.',
    toastVerifiedSuccess: 'Fonte verificada com sucesso! O plano diário foi recalculado e restaurado.',
    toastScenario1: 'Cenário 1 carregado: Materiais presentes, horário confirmado e Plano Atual exibido.',
    toastScenario2: 'Cenário 2 ativado: Mensagem "No tasks scheduled for today." exibida. Clique em "Verify source" para corrigir.',
    toastRn02: 'Materiais removidos para validar o estado vazio.',
    toastReset: 'Aplicação reposta aos dados padrão de teste.',
    toastFileChangeAuto: 'Novo horário gerado! Confirme os eventos para validar.',
    toastFileChangeKept: 'Horário atual mantido sem alterações.',
    footerMemory: 'Protótipo Local-First Offline',
    footerSupportedFormats: 'Formatos suportados: .ics, .docx, .pdf, .pptx',
    languageSelectLabel: 'Idioma / Language',
  },
  en: {
    appName: 'SmartCampus',
    prototypeBadge: 'Prototype EN',
    appSubtitle: 'Automated Study Planning for University Students',
    step1: '1. Upload',
    step2: '2. Review',
    step3: '3. Edit',
    step4: '4. Confirm',
    step5: '5. Final Timeline',
    tabMaterials: 'Upload Materials',
    tabDrafts: 'AI Drafts',
    tabTimeline: 'Weekly Schedule',
    tabBriefing: 'Morning Briefing',
    tabPrivacy: 'Privacy & Data',
    statusConfirmed: 'Confirmed',
    statusPending: 'Pending',
    sqliteActive: 'Saved Locally',
    testBarTitle: 'Testing & Demo Panel:',
    testBarSubtitle: 'Switch between prototype evaluation scenarios',
    scenario1Btn: 'Scenario 1 (Success Flow)',
    scenario2Btn: 'Scenario 2 (Simulate Glitch)',
    testRn02Btn: 'Test Empty State',
    resetBtn: 'Reset Data',
    scenario1Tooltip: 'Loads default test data and opens Morning Briefing',
    scenario2Tooltip: 'Simulates data glitch in Current Plan to test "Verify source" button',
    testRn02Tooltip: 'Clears materials to test empty state behavior',
    sec1Title: '1. Import & Material Processing',
    sec1Desc: 'Upload calendar files (.ics) and course documents (.pdf, .docx, .pptx) up to 50,000 characters with privacy protection and local processing.',
    viewScheduleBtn: 'View Schedule',
    validationErrorTitle: 'File Validation Error',
    validationErrorMessage: 'Unsupported file format. Please upload docx, pdf, or pptx.',
    close: 'Close',
    dropzoneTitle: 'Drag .ics, .pdf, .docx, or .pptx files here or click to browse',
    dropzoneSubtitle: 'Supported formats: .ics (local calendar), .docx, .pdf, .pptx (limit: 50,000 chars)',
    quickInsertLabel: 'Quick sample insert for testing:',
    testInvalidUploadBtn: 'Test Error (.png / .exe)',
    uploadedMaterialsTitle: 'Uploaded Materials & Calendars',
    uploadedMaterialsSubtitle: 'Locally parsed files with personal student identifiers protected',
    indexingActive: 'Parsed Locally',
    noFilesTitle: 'No materials uploaded yet',
    noFilesDesc: 'Drop an ICS, PDF, DOCX, or PPTX in the box above to initiate automated planning.',
    deleteTooltip: 'Delete this file and update study plan',
    deadlinesFormTitle: 'Set Deadlines & Exams',
    deadlinesFormSubtitle: 'Target dates for study workload balancing',
    deadlineAddedSuccess: 'Deadline added successfully!',
    fieldTitle: 'Title of Exam / Assessment',
    fieldSubject: 'Course / Subject',
    fieldDueDate: 'Due Date',
    fieldType: 'Assessment Type',
    fieldPriority: 'Priority',
    fieldWeight: 'Weight (% Grade)',
    fieldNotes: 'Notes / Target Topics',
    addDeadlineBtn: 'Add Deadline',
    registeredDeadlinesTitle: 'Registered Deadlines',
    noDeadlines: 'No deadlines configured',
    daysRemaining: 'days left',
    draftOnboardingBanner: "⚠️ Temporary Draft: Review extracted events below. Edit any details, then click 'Confirm Events' to save to your offline calendar.",
    draftUncommittedNotice: 'Dates remain uncommitted temporary drafts until you manually confirm them.',
    sec2Title: '2. Unified Schedule & Study Timetable',
    scheduleConfirmedBadge: '✓ Schedule Confirmed',
    schedulePendingBadge: '⚠ Pending Drafts',
    scheduleConfirmedDesc: 'The schedule is cached in your local calendar and works completely offline.',
    schedulePendingDesc: 'Uncommitted AI drafts exist. Click "Confirm Events" ("Confirmar Horário") to commit to your calendar.',
    recalculateScheduleBtn: 'Recalculate Schedule',
    confirmScheduleBtn: 'Confirm Events',
    viewCurrentPlanBtn: 'View Morning Briefing',
    viewGrid: 'Full Weekly Grid',
    viewDay: 'Detailed Day View',
    addStudyBlockBtn: '+ Add Event',
    todayBadge: 'Today',
    sessionCount: 'session',
    sessionsCount: 'sessions',
    noBlocksPlanned: 'No blocks scheduled',
    edit: 'Edit',
    remove: 'Remove',
    materialLabel: 'Material',
    editBlockTitle: 'Edit Timeline Event',
    manualAdjustment: 'Manual session adjustment',
    startTime: 'Start Time',
    endTime: 'End Time',
    activityType: 'Activity Type',
    associatedMaterial: 'Associated Study Material',
    sessionNotes: 'Session Goals & Notes',
    removeBlock: 'Remove Block',
    cancel: 'Cancel',
    saveChanges: 'Save Changes',
    addSessionTitle: 'Add Study Session',
    dayOfWeek: 'Day of Week',
    addBlockSubmit: 'Add Block',
    todayDateText: 'Thursday, November 05, 2026',
    todayLabel: 'Today',
    planTitle: 'Morning Text Briefing & Daily Plan',
    planDesc: 'Concise daily briefing highlighting top academic priorities (reading time < 1 minute).',
    notificationTimeLabel: 'Delivery Time:',
    saveNotificationBtn: 'Save',
    verifySourceBtn: 'Verify source',
    notificationSavedToast: 'Morning text briefing delivery time updated to',
    todayProgress: "Today's Progress",
    completed: 'Completed',
    totalPlannedHours: 'Total Planned Hours',
    totalPlannedHoursVal: '5h 30m',
    threeFocusedSessions: 'Divided into 3 focused sessions',
    nextCriticalDeadline: 'Next Critical Deadline',
    noneUpcoming: 'None upcoming',
    inDays: 'In',
    recommendedTasksTitle: "Today's Top 3 Daily Priorities",
    markAsCompletedHint: 'Check off tasks as you finish study blocks',
    activeBlocksBadge: '3 Active Blocks',
    priorityHighBadge: 'Priority',
    priorityNormalBadge: 'Normal',
    disciplineLabel: 'Course',
    originLabel: 'Source',
    pedagogicalRecsTitle: 'Study Recommendations',
    criticalDeadlinesRadarTitle: 'Critical Deadlines & Exams',
    registeredCount: 'Registered',
    rn02NoFilesTitle: 'Unable to Generate Daily Plan',
    rn02NoFilesDesc: 'No study materials have been uploaded. Please upload course documents (.docx, .pdf, .pptx) to schedule sessions.',
    goToMaterialsBtn: 'Go to Material Upload',
    rn02UnconfirmedTitle: 'Events Pending Confirmation',
    rn02UnconfirmedDesc: 'AI-extracted draft events are waiting in preview. Review the details and tap "Confirm Events" ("Confirmar Horário") to validate.',
    goToScheduleBtn: 'Go to Drafts and Confirm',
    glitchTitle: 'No tasks scheduled for today.',
    glitchDesc: 'A synchronization discrepancy occurred in the daily plan. No study tasks were indexed for today.',
    glitchNotice: 'Test Scenario 2 Active: Clicking "Verify source" will re-analyze source files, recalculate schedule, and restore tasks.',
    verifyingStep1: '1/3: Analyzing integrity of uploaded study files...',
    verifyingStep2: '2/3: Recalculating timetable blocks and deadlines...',
    verifyingStep3: '3/3: Generating daily tasks and recommendations...',
    verifyingWait: 'Forcing recalculation and file synchronization...',
    rn01ModalTitle: 'Recalculate Schedule?',
    rn01AddedDesc: 'was added to study materials.',
    rn01DeletedDesc: 'was removed from study materials.',
    rn01Question: 'Would you like to automatically recalculate the schedule?',
    rn01ImpactTitle: 'Impact on Planning:',
    rn01ImpactDesc: 'Recalculation redistributes weekly blocks prioritizing upcoming deadlines and courses with higher academic weight.',
    rn01KeepCurrentBtn: 'Keep Current',
    rn01UpdateScheduleBtn: 'Recalculate Schedule',
    sourceAuditTitle: 'Original Source Audit (Verify Source)',
    sourceAuditSubtitle: 'Visual audit of the original document where this date was extracted.',
    sourceVerifiedBadge: 'Source Verified',
    sourceAuditSnippetTitle: 'Document Excerpt with Highlight:',
    sourceAuditSnippetBadge: 'Source Text Highlighted',
    sourceAuditFooter: 'Allows auditing and verifying each deadline origin directly in the original document.',
    closeAuditBtn: 'Close Audit',
    toastScheduleConfirmed: 'Events confirmed successfully and saved to your offline calendar.',
    toastSlotUpdated: 'Event updated in local calendar.',
    toastSlotDeleted: 'Event removed from timetable.',
    toastSlotAdded: 'New event added to timetable.',
    toastRegenerated: 'Schedule recalculated from materials and deadlines.',
    toastVerifiedSuccess: 'Source verified successfully! Daily plan has been recalculated and restored.',
    toastScenario1: 'Scenario 1 loaded: Materials present, schedule confirmed, and Current Plan displayed.',
    toastScenario2: 'Scenario 2 active: "No tasks scheduled for today." displayed. Click "Verify source" to resolve.',
    toastRn02: 'Materials cleared to validate empty state behavior.',
    toastReset: 'Application reset to default test state.',
    toastFileChangeAuto: 'New schedule generated! Please confirm events to validate.',
    toastFileChangeKept: 'Current schedule kept without changes.',
    footerMemory: 'Local-First Offline Prototype',
    footerSupportedFormats: 'Supported formats: .ics, .docx, .pdf, .pptx',
    languageSelectLabel: 'Language',
  },
};
