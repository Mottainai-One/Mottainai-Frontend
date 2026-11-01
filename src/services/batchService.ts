import type { BatchResponse } from '@/types/batch-api.types';
import { apiRequest, serviceError } from './apiClient';

export async function getBatches(signal?: AbortSignal): Promise<BatchResponse[]> {
  try { return await apiRequest<BatchResponse[]>('/batches', { signal }); }
  catch (error) { throw serviceError(error, 'Não foi possível consultar os lotes.'); }
}
