import type { StoreSummary } from '@/types/store-api.types';
import type { ApiPage } from '@/types/api.types';
import { apiRequest, serviceError } from './apiClient';

export async function getStores(signal?: AbortSignal): Promise<StoreSummary[]> {
  try {
    const stores: StoreSummary[] = [];
    for (let page = 0; ; page += 1) {
      const result = await apiRequest<ApiPage<StoreSummary>>(`/stores?page=${page}&size=100`, { signal });
      stores.push(...result.content);
      if (result.last || result.content.length === 0) return stores;
    }
  } catch (error) { throw serviceError(error, 'Não foi possível consultar as lojas.'); }
}
