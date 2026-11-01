import type { ApiProfile } from '@/types/api.types';
import { requireInventoryId } from '@/utils/inventoryValidation';
import { apiRequest, serviceError } from './apiClient';

export async function getCurrentProfile(signal?: AbortSignal): Promise<ApiProfile> {
  try { return await apiRequest<ApiProfile>('/auth/profile', { signal }); }
  catch (error) { throw serviceError(error, 'Não foi possível consultar o perfil autenticado.'); }
}

export async function getCurrentStoreId(signal?: AbortSignal): Promise<number> {
  try { return requireInventoryId(String((await getCurrentProfile(signal)).storeId)); }
  catch (error) { throw serviceError(error, 'A conta não possui uma loja válida.'); }
}
