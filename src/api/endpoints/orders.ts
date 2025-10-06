import { apiFetch, withAuth } from '../client';
import type { CreateOrderPayload, Order } from '../types';

const ORDERS_BASE = 'orders/';

export const orderEndpoints = {
  list: () => apiFetch<Order[]>(ORDERS_BASE, withAuth()),
  create: (payload: CreateOrderPayload) =>
    apiFetch<Order>(ORDERS_BASE, {
      ...withAuth({
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    }),
};
