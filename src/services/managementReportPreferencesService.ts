import type { ManagementReportFormat } from '@/types/management-report.types';
import type { StoredManagementReportPreferences } from '@/types/management-report-preferences.types';

const STORAGE_KEY = 'relatorios_gerenciais_v1';
const LEGACY_STORAGE_KEY = 'mottainai.management-reports.preferences';
const DEFAULT_PREFERENCES: StoredManagementReportPreferences = {
  format: 'csv',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isStoredPreferences(value: unknown): value is StoredManagementReportPreferences {
  return isRecord(value)
    && (value.format === 'pdf' || value.format === 'csv');
}

function isLegacyStoredPreferences(value: unknown): value is { _versao: 1; format: ManagementReportFormat } {
  return isRecord(value)
    && value._versao === 1
    && (value.format === 'pdf' || value.format === 'csv');
}

function removeStoredPreferences(key = STORAGE_KEY): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // A preferência inválida é ignorada mesmo se o navegador bloquear a remoção.
  }
}

export async function getManagementReportPreferences(): Promise<StoredManagementReportPreferences> {
  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    if (storedValue) {
      let parsedValue: unknown;
      try {
        parsedValue = JSON.parse(storedValue) as unknown;
      } catch {
        removeStoredPreferences();
        parsedValue = null;
      }

      if (isStoredPreferences(parsedValue)) {
        removeStoredPreferences(LEGACY_STORAGE_KEY);
        return parsedValue;
      }
      removeStoredPreferences();
    }

    const legacyValue = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!legacyValue) return DEFAULT_PREFERENCES;

    let parsedLegacyValue: unknown;
    try {
      parsedLegacyValue = JSON.parse(legacyValue) as unknown;
    } catch {
      removeStoredPreferences(LEGACY_STORAGE_KEY);
      return DEFAULT_PREFERENCES;
    }

    if (!isLegacyStoredPreferences(parsedLegacyValue)) {
      removeStoredPreferences(LEGACY_STORAGE_KEY);
      return DEFAULT_PREFERENCES;
    }

    const migratedPreferences = { format: parsedLegacyValue.format };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedPreferences));
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    return migratedPreferences;
  } catch (error) {
    throw new Error('Não foi possível carregar a preferência de formato salva.', { cause: error });
  }
}

export async function saveManagementReportPreference(
  format: ManagementReportFormat,
): Promise<StoredManagementReportPreferences> {
  const preferences: StoredManagementReportPreferences = {
    format,
  };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    return preferences;
  } catch (error) {
    throw new Error('Não foi possível salvar a preferência de formato neste navegador.', { cause: error });
  }
}
