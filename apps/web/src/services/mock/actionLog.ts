import type { InterventionLogEntry } from '@/types';

const STORAGE_KEY = 'retina_action_log';

export const actionLogService = {
  getLogs(): InterventionLogEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to read action log from localStorage', e);
    }
    return [];
  },

  logAction(entry: Omit<InterventionLogEntry, 'id' | 'timestamp' | 'status'>): InterventionLogEntry {
    const logs = this.getLogs();
    const newEntry: InterventionLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      action: entry.action,
      rationale: entry.rationale,
      interventionType: entry.interventionType,
      details: entry.details,
      status: 'logged',
    };
    
    const updated = [newEntry, ...logs].slice(0, 50); // Keep latest 50 entries
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save action log to localStorage', e);
    }
    return newEntry;
  },

  clearLogs(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
};
