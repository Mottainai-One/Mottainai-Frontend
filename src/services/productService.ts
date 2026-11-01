import type { CatalogProduct, CatalogProductForm } from '@/types/catalog-product.types';
import type { ApiPage } from '@/types/api.types';
import { toCatalogProductPayload } from '@/utils/catalogProductValidation';
import { apiRequest, serviceError } from './apiClient';

export async function getProducts(signal?: AbortSignal): Promise<CatalogProduct[]> {
  try {
    const products: CatalogProduct[] = [];
    for (let page = 0; ; page += 1) {
      const result = await apiRequest<ApiPage<CatalogProduct>>(`/products?page=${page}&size=100`, { signal });
      products.push(...result.content);
      if (result.last || result.content.length === 0) return products;
    }
  } catch (error) { throw serviceError(error, 'Não foi possível consultar os produtos.'); }
}

export async function getProduct(id: string, signal?: AbortSignal): Promise<CatalogProduct> {
  try {
    if (!/^[1-9]\d*$/.test(id)) throw new Error('O identificador do produto é inválido.');
    return await apiRequest<CatalogProduct>(`/products/${id}`, { signal });
  } catch (error) { throw serviceError(error, 'Não foi possível consultar o produto.'); }
}

export async function createProduct(form: CatalogProductForm): Promise<CatalogProduct> {
  try {
    const body = toCatalogProductPayload(form);
    return await apiRequest<CatalogProduct>('/products', { method: 'POST', body });
  } catch (error) { throw serviceError(error, 'Não foi possível cadastrar o produto.'); }
}
