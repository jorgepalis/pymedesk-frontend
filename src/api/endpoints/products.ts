import { apiFetch, withAuth } from '../client';
import type {
  CreateProductPayload,
  Product,
  UpdateProductPayload,
} from '../types';

const PRODUCTS_BASE = 'products/';

export const productEndpoints = {
  list: () => apiFetch<Product[]>(PRODUCTS_BASE, withAuth()),
  detail: (productId: number) =>
    apiFetch<Product>(`${PRODUCTS_BASE}${productId}/`, withAuth()),
  create: (payload: CreateProductPayload) =>
    apiFetch<Product>(PRODUCTS_BASE, {
      ...withAuth({
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    }),
  update: (productId: number, payload: UpdateProductPayload) =>
    apiFetch<Product>(`${PRODUCTS_BASE}${productId}/`, {
      ...withAuth({
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    }),
};
