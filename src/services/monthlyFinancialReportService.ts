import type { MonthlyFinancialReport } from '@/types/monthly-financial-report.types';

const DATABASE_NAME = 'mottainai-monthly-financial-reports';
const DATABASE_VERSION = 1;
const REPORTS_STORE = 'reports';
const RETENTION_MS = 365 * 24 * 60 * 60 * 1000;

function isExpired(report: MonthlyFinancialReport, now = Date.now()): boolean {
  const createdAt = Date.parse(report.createdAt);
  return !Number.isFinite(createdAt) || createdAt < now - RETENTION_MS;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('Este navegador não oferece armazenamento IndexedDB.'));
      return;
    }

    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(REPORTS_STORE)) {
        request.result.createObjectStore(REPORTS_STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => {
      const database = request.result;
      database.onversionchange = () => database.close();
      resolve(database);
    };
    request.onerror = () => reject(request.error ?? new Error('Falha ao abrir o armazenamento.'));
    request.onblocked = () => reject(new Error('O armazenamento está bloqueado por outra aba.'));
  });
}

export async function getMonthlyFinancialReports(): Promise<MonthlyFinancialReport[]> {
  let database: IDBDatabase | null = null;
  try {
    database = await openDatabase();
    return await new Promise<MonthlyFinancialReport[]>((resolve, reject) => {
      const transaction = database!.transaction(REPORTS_STORE, 'readwrite');
      const store = transaction.objectStore(REPORTS_STORE);
      const request = store.getAll() as IDBRequest<MonthlyFinancialReport[]>;
      let reports: MonthlyFinancialReport[] = [];
      request.onsuccess = () => {
        reports = request.result;
        reports.filter((report) => isExpired(report)).forEach((report) => store.delete(report.id));
      };
      request.onerror = () => reject(request.error ?? new Error('Falha ao ler relatórios.'));
      transaction.oncomplete = () => resolve(reports
        .filter((report) => !isExpired(report))
        .sort((first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt)));
      transaction.onerror = () => reject(transaction.error ?? new Error('Falha ao carregar relatórios.'));
      transaction.onabort = () => reject(transaction.error ?? new Error('Leitura cancelada.'));
    });
  } catch (error) {
    throw new Error('Não foi possível carregar relatórios financeiros salvos neste navegador.', { cause: error });
  } finally {
    database?.close();
  }
}

export async function saveMonthlyFinancialReport(
  report: MonthlyFinancialReport,
): Promise<MonthlyFinancialReport> {
  let database: IDBDatabase | null = null;
  try {
    database = await openDatabase();
    return await new Promise<MonthlyFinancialReport>((resolve, reject) => {
      const transaction = database!.transaction(REPORTS_STORE, 'readwrite');
      const store = transaction.objectStore(REPORTS_STORE);
      const request = store.getAll() as IDBRequest<MonthlyFinancialReport[]>;
      request.onsuccess = () => {
        request.result.filter((item) => isExpired(item)).forEach((item) => store.delete(item.id));
        store.put(report);
      };
      request.onerror = () => reject(request.error ?? new Error('Falha ao preparar salvamento.'));
      transaction.oncomplete = () => resolve(report);
      transaction.onerror = () => reject(transaction.error ?? new Error('Falha ao salvar relatório.'));
      transaction.onabort = () => reject(transaction.error ?? new Error('Salvamento cancelado.'));
    });
  } catch (error) {
    throw new Error('Não foi possível salvar o relatório financeiro neste navegador.', { cause: error });
  } finally {
    database?.close();
  }
}
