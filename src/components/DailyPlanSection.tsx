import React, { useState } from 'react';
import { DailyTask, Recommendation, Deadline, StudyMaterial, ScheduleSlot } from '../types';
import {
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  Bell,
  ArrowRight,
  ShieldAlert,
  BookOpen,
  FileText,
  TrendingUp,
  Check
} from 'lucide-react';
import { Translations, Language } from '../translations';

interface DailyPlanSectionProps {
  materials: StudyMaterial[];
  schedule: ScheduleSlot[];
  isScheduleConfirmed: boolean;
  dailyTasks: DailyTask[];
  recommendations: Recommendation[];
  deadlines: Deadline[];
  isGlitchActive: boolean;
  onVerifySource: () => void;
  onToggleTask: (taskId: string) => void;
  onNavigateToMaterials: () => void;
  onNavigateToSchedule: () => void;
  notificationTime: string;
  onUpdateNotificationTime: (newTime: string) => void;
  t: Translations;
  language: Language;
}

export const DailyPlanSection: React.FC<DailyPlanSectionProps> = ({
  materials,
  schedule,
  isScheduleConfirmed,
  dailyTasks,
  recommendations,
  deadlines,
  isGlitchActive,
  onVerifySource,
  onToggleTask,
  onNavigateToMaterials,
  onNavigateToSchedule,
  notificationTime,
  onUpdateNotificationTime,
  t,
  language,
}) => {
  const [selectedTime, setSelectedTime] = useState(notificationTime);
  const [notificationSaved, setNotificationSaved] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStep, setVerificationStep] = useState<string | null>(null);

  const handleSaveNotificationTime = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateNotificationTime(selectedTime);
    setNotificationSaved(true);
    setTimeout(() => setNotificationSaved(false), 3000);
  };

  const handleVerifySourceClick = () => {
    setIsVerifying(true);
    setVerificationStep(t.verifyingStep1);

    setTimeout(() => {
      setVerificationStep(t.verifyingStep2);
    }, 450);

    setTimeout(() => {
      setVerificationStep(t.verifyingStep3);
    }, 900);

    setTimeout(() => {
      setIsVerifying(false);
      setVerificationStep(null);
      onVerifySource();
    }, 1300);
  };

  // ==========================================
  // RULE RN02: Empty state check
  // ==========================================
  if (materials.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs max-w-2xl mx-auto my-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          {t.rn02NoFilesTitle}
        </h3>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          {t.rn02NoFilesDesc}
        </p>
        <button
          onClick={onNavigateToMaterials}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs"
        >
          <BookOpen className="w-4 h-4" />
          <span>{t.goToMaterialsBtn}</span>
        </button>
      </div>
    );
  }

  if (!isScheduleConfirmed) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs max-w-2xl mx-auto my-6">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mx-auto mb-4">
          <Calendar className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          {t.rn02UnconfirmedTitle}
        </h3>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          {t.rn02UnconfirmedDesc}
        </p>
        <button
          onClick={onNavigateToSchedule}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs"
        >
          <Check className="w-4 h-4" />
          <span>{t.goToScheduleBtn}</span>
        </button>
      </div>
    );
  }

  // ==========================================
  // SECONDARY / NEGATIVE SCENARIO (Glitch state)
  // "The student goes to the 'Plano Atual' section and encounters a data glitch:
  // 'No tasks scheduled for today.' The student realizes the app is not working
  // correctly and clicks the 'Verify source' button."
  // ==========================================
  if (isGlitchActive) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-amber-300 p-8 shadow-xs max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>

          {/* EXACT GLITCH STRING REQUIRED BY SCENARIO 2 */}
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
            No tasks scheduled for today.
          </h2>

          <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
            {t.glitchDesc}
          </p>

          {isVerifying ? (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl max-w-md mx-auto text-center space-y-2 mb-4 animate-pulse">
              <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-900">{verificationStep}</p>
              <p className="text-[11px] text-slate-500">{t.verifyingWait}</p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {/* MANDATORY BUTTON: "Verify source" */}
              <button
                onClick={handleVerifySourceClick}
                className="px-6 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Verify source</span>
              </button>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-400">
            {t.glitchNotice}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN SCENARIO: Normal / Success Flow
  // ==========================================
  const completedCount = dailyTasks.filter((t) => t.completed).length;
  const progressPercent = dailyTasks.length > 0 ? Math.round((completedCount / dailyTasks.length) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Top Banner / Today's Date & Notification Time Picker */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded">
              {t.todayDateText}
            </span>
            <span className="text-xs text-slate-500">· {t.todayLabel}</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {t.planTitle}
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            {language === 'pt'
              ? `Gerado automaticamente a partir dos seus ${materials.length} ficheiros e ${deadlines.length} prazos académicos.`
              : `Automatically generated from your ${materials.length} files and ${deadlines.length} academic deadlines.`}
          </p>
        </div>

        {/* Time Picker & Re-verification Button ("Verify source") */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          {/* Time picker for receiving plan */}
          <form
            onSubmit={handleSaveNotificationTime}
            className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1.5"
          >
            <div className="flex items-center gap-1.5 pl-2 text-slate-600 text-xs">
              <Bell className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline font-medium">{t.notificationTimeLabel}</span>
            </div>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="px-2 py-1 text-xs font-mono font-medium border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
            <button
              type="submit"
              className="px-2.5 py-1 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shadow-2xs"
            >
              {t.saveNotificationBtn}
            </button>
          </form>

          {/* Re-verification button ("Verify source") */}
          <button
            onClick={handleVerifySourceClick}
            disabled={isVerifying}
            title="Recalcula e re-valida o plano a partir dos ficheiros em memória"
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200 whitespace-nowrap"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
            <span>Verify source</span>
          </button>
        </div>
      </div>

      {notificationSaved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{t.notificationSavedToast} {selectedTime}.</span>
        </div>
      )}

      {/* Progress & Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-medium text-slate-500">{t.todayProgress}</span>
          <div className="flex items-baseline justify-between mt-1 mb-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              {completedCount} {language === 'pt' ? 'de' : 'of'} {dailyTasks.length}
            </span>
            <span className="text-xs font-semibold text-indigo-600 font-mono">
              {progressPercent}% {t.completed}
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-medium text-slate-500">{t.totalPlannedHours}</span>
          <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
            {t.totalPlannedHoursVal}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t.threeFocusedSessions}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-medium text-slate-500">{t.nextCriticalDeadline}</span>
          <div className="text-base font-bold text-slate-900 mt-1 truncate">
            {deadlines[0]?.title || t.noneUpcoming}
          </div>
          <p className="text-xs text-rose-600 font-semibold mt-1">
            {deadlines[0] ? `${t.inDays} ${deadlines[0].daysLeft} ${t.daysRemaining} (${deadlines[0].dueDate})` : '-'}
          </p>
        </div>
      </div>

      {/* Main Content Layout: Tasks + Recommendations & Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Today's Tasks (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {t.recommendedTasksTitle}
              </h3>
              <p className="text-xs text-slate-500">
                {t.markAsCompletedHint}
              </p>
            </div>
            <span className="text-xs font-mono font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">
              {t.activeBlocksBadge}
            </span>
          </div>

          <div className="space-y-3.5">
            {dailyTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => onToggleTask(task.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  task.completed
                    ? 'bg-slate-50 border-slate-200 opacity-75'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => {}} // handled by parent onClick
                  className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {task.time}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      ({task.duration})
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      task.priority === 'Alta' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {task.priority === 'Alta' ? t.priorityHighBadge : t.priorityNormalBadge}
                    </span>
                  </div>

                  <h4 className={`text-sm font-bold ${task.completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                    {task.title}
                  </h4>

                  <p className="text-xs text-slate-600 mt-1">
                    {t.disciplineLabel}: <span className="font-semibold text-slate-800">{task.subject}</span>
                  </p>

                  <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5 truncate">
                    <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{t.originLabel}: </span>
                    <span className="font-mono text-slate-700 truncate" title={task.sourceMaterial}>
                      {task.sourceMaterial}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Recommendations & Deadlines (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Smart Recommendations */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">
                {t.pedagogicalRecsTitle}
              </h3>
            </div>

            <div className="space-y-4">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">
                      {rec.category}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">
                    {rec.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {rec.description}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono truncate">
                    {t.originLabel}: {rec.sourceMaterial}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Deadlines Radar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  {t.criticalDeadlinesRadarTitle}
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {deadlines.length} {t.registeredCount}
              </span>
            </div>

            <div className="space-y-3">
              {deadlines.map((d) => (
                <div
                  key={d.id}
                  className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3"
                >
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">
                      {d.title}
                    </h5>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {d.subject} · {d.type} ({d.weight})
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                      d.daysLeft <= 3 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {d.daysLeft} {d.daysLeft === 1 ? (language === 'pt' ? 'dia' : 'day') : t.daysRemaining}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {d.dueDate}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
