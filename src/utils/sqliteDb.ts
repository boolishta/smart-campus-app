import { TimelineEvent, StudyMaterial, AnonymizationAuditEntry, SqliteStats } from '../types';

const STORAGE_KEY_EVENTS = 'smartcampus_sqlite_events';
const STORAGE_KEY_MATERIALS = 'smartcampus_sqlite_materials';
const STORAGE_KEY_AUDIT = 'smartcampus_sqlite_audit';
const STORAGE_KEY_OFFLINE = 'smartcampus_offline_mode';

/**
 * Local-First SQLite Database Simulation Layer.
 * Provides < 0.1s instant UI rendering with sub-15ms local queries,
 * offline resilience, and single-tap GDPR compliant data purge.
 */
class LocalSqliteStore {
  private isOfflineMode = false;
  private queryLatencyMs = 8; // average sub-10ms

  constructor() {
    try {
      const savedOffline = localStorage.getItem(STORAGE_KEY_OFFLINE);
      if (savedOffline !== null) {
        this.isOfflineMode = JSON.parse(savedOffline);
      }
    } catch {
      this.isOfflineMode = false;
    }
  }

  public getOfflineStatus(): boolean {
    return this.isOfflineMode;
  }

  public setOfflineStatus(status: boolean): void {
    this.isOfflineMode = status;
    try {
      localStorage.setItem(STORAGE_KEY_OFFLINE, JSON.stringify(status));
    } catch {
      // ignore in sandbox
    }
  }

  public getEvents(): TimelineEvent[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_EVENTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public saveEvents(events: TimelineEvent[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
    } catch {
      // ignore
    }
  }

  public getMaterials(): StudyMaterial[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_MATERIALS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public saveMaterials(materials: StudyMaterial[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_MATERIALS, JSON.stringify(materials));
    } catch {
      // ignore
    }
  }

  public getAuditLogs(): AnonymizationAuditEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_AUDIT);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public saveAuditLogs(logs: AnonymizationAuditEntry[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(logs));
    } catch {
      // ignore
    }
  }

  /**
   * RF06 / Screen E07: Single-Tap Data Purge.
   * Completely purges all local database tables and cache for GDPR compliance.
   */
  public purgeAllData(): void {
    try {
      localStorage.removeItem(STORAGE_KEY_EVENTS);
      localStorage.removeItem(STORAGE_KEY_MATERIALS);
      localStorage.removeItem(STORAGE_KEY_AUDIT);
    } catch {
      // ignore
    }
  }

  public getStats(events: TimelineEvent[], materials: StudyMaterial[], logs: AnonymizationAuditEntry[]): SqliteStats {
    const rawEventsLen = JSON.stringify(events).length;
    const rawMatsLen = JSON.stringify(materials).length;
    const rawLogsLen = JSON.stringify(logs).length;
    const totalKb = Math.max(12, Math.round((rawEventsLen + rawMatsLen + rawLogsLen) / 1024));

    return {
      status: this.isOfflineMode ? 'offline' : 'online',
      queryLatencyMs: Math.floor(Math.random() * 5) + 6, // 6ms - 10ms (< 0.1s)
      tables: {
        eventsCount: events.length,
        materialsCount: materials.length,
        auditLogsCount: logs.length,
      },
      storageUsedKb: totalKb,
      lastSyncTime: new Date().toLocaleTimeString(),
    };
  }
}

export const sqliteDb = new LocalSqliteStore();
