import type { ManagementReport } from '@/types/management-report.types';

const DATABASE_NAME = 'mottainai-management-reports';
const DATABASE_VERSION = 1;
const REPORTS_STORE = 'reports';
const RETENTION_MS = 365 * 24 * 60 * 60 * 1000;

function isExpired(report: ManagementReport, now = Date.now()): boolean {
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
      const database = request.result;
      if (!database.objectStoreNames.contains(REPORTS_STORE)) {
        database.createObjectStore(REPORTS_STORE, { keyPath: 'id' });
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

export async function getManagementReports(): Promise<ManagementReport[]> {
  let database: IDBDatabase | null = null;

  try {
    database = await openDatabase();
    return await new Promise<ManagementReport[]>((resolve, reject) => {
      const transaction = database!.transaction(REPORTS_STORE, 'readwrite');
      const store = transaction.objectStore(REPORTS_STORE);
      const request = store.getAll() as IDBRequest<ManagementReport[]>;
      let reports: ManagementReport[] = [];

      request.onsuccess = () => {
        reports = request.result;
        reports.filter((report) => isExpired(report)).forEach((report) => store.delete(report.id));
      };
      request.onerror = () => reject(request.error ?? new Error('Falha ao ler relatórios.'));
      transaction.oncomplete = () => resolve(
        reports
          .filter((report) => !isExpired(report))
          .sort((first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt)),
      );
      transaction.onerror = () => reject(transaction.error ?? new Error('Falha ao carregar relatórios.'));
      transaction.onabort = () => reject(transaction.error ?? new Error('Leitura dos relatórios cancelada.'));
    });
  } catch (error) {
    throw new Error('Não foi possível carregar os relatórios salvos neste navegador.', { cause: error });
  } finally {
    database?.close();
  }
}

export async function saveManagementReport(report: ManagementReport): Promise<ManagementReport> {
  let database: IDBDatabase | null = null;

  try {
    database = await openDatabase();
    return await new Promise<ManagementReport>((resolve, reject) => {
      const transaction = database!.transaction(REPORTS_STORE, 'readwrite');
      const store = transaction.objectStore(REPORTS_STORE);
      const request = store.getAll() as IDBRequest<ManagementReport[]>;

      request.onsuccess = () => {
        request.result
          .filter((storedReport) => isExpired(storedReport))
          .forEach((storedReport) => store.delete(storedReport.id));
        store.put(report);
      };
      request.onerror = () => reject(request.error ?? new Error('Falha ao preparar salvamento.'));
      transaction.oncomplete = () => resolve(report);
      transaction.onerror = () => reject(transaction.error ?? new Error('Falha ao salvar relatório.'));
      transaction.onabort = () => reject(transaction.error ?? new Error('Salvamento do relatório cancelado.'));
    });
  } catch (error) {
    throw new Error('Não foi possível salvar o relatório neste navegador.', { cause: error });
  } finally {
    database?.close();
  }
}
