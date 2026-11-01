import type { TaxProfileResponse } from '@/types/tax-profile-api.types';
import type { ApiPage } from '@/types/api.types';
import { apiRequest, serviceError } from './apiClient';

export async function getTaxProfiles(signal?: AbortSignal): Promise<TaxProfileResponse[]> {
  try {
    const profiles: TaxProfileResponse[] = [];
    for (let page = 0; ; page += 1) {
      const result = await apiRequest<ApiPage<TaxProfileResponse>>(`/tax-profiles?page=${page}&size=100`, { signal });
      profiles.push(...result.content);
      if (result.last || result.content.length === 0) return profiles;
    }
  } catch (error) { throw serviceError(error, 'Não foi possível consultar os perfis fiscais.'); }
}
