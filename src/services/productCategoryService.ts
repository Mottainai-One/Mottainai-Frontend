import type { ProductCategoryResponse } from '@/types/product-category-api.types';
import type { ApiPage } from '@/types/api.types';
import { apiRequest, serviceError } from './apiClient';

export async function getProductCategories(signal?: AbortSignal): Promise<ProductCategoryResponse[]> {
  try {
    const categories: ProductCategoryResponse[] = [];
    for (let page = 0; ; page += 1) {
      const result = await apiRequest<ApiPage<ProductCategoryResponse>>(`/product-categories?page=${page}&size=100`, { signal });
      categories.push(...result.content);
      if (result.last || result.content.length === 0) return categories;
    }
  } catch (error) { throw serviceError(error, 'Não foi possível consultar as categorias.'); }
}
