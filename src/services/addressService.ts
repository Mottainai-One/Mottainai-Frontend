import type { AddressResponse } from '@/types/address-api.types';
import type { ApiPage } from '@/types/api.types';
import { apiRequest, serviceError } from './apiClient';

export async function getAddresses(signal?: AbortSignal): Promise<AddressResponse[]> {
  try {
    const addresses: AddressResponse[] = [];
    for (let page = 0; ; page += 1) {
      const result = await apiRequest<ApiPage<AddressResponse>>(`/addresses?page=${page}&size=100`, { signal });
      addresses.push(...result.content);
      if (result.last || result.content.length === 0) return addresses;
    }
  } catch (error) { throw serviceError(error, 'Não foi possível carregar os endereços.'); }
}

export async function getAddress(id: number): Promise<AddressResponse> {
  try { return await apiRequest<AddressResponse>(`/addresses/${id}`); }
  catch (error) { throw serviceError(error, 'Não foi possível carregar o endereço.'); }
}
