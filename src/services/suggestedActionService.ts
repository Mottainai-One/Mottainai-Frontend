import type { ApiSuggestedAction, SuggestedActionDecision } from '@/types/alert-api.types';
import { apiRequest, serviceError } from './apiClient';
import { requireInventoryId } from '@/utils/inventoryValidation';
import { validateSuggestedDecision } from '@/utils/alertPresentation';

export async function getSuggestedActions(alertId: string, signal?: AbortSignal): Promise<ApiSuggestedAction[]> {
  try { return await apiRequest<ApiSuggestedAction[]>(`/alerts/${requireInventoryId(alertId)}/suggested-actions`, { signal }); }
  catch (error) { throw serviceError(error, 'Não foi possível consultar as ações sugeridas.'); }
}

export async function decideSuggestedAction(id: number, decision: SuggestedActionDecision): Promise<ApiSuggestedAction> {
  try {
    const actionId = requireInventoryId(String(id));
    validateSuggestedDecision(decision);
    return await apiRequest<ApiSuggestedAction>(`/suggested-actions/${actionId}/decision`, { method: 'POST', body: { decision } });
  } catch (error) { throw serviceError(error, 'Não foi possível registrar a decisão.'); }
}
