import { apiFetch } from '../client';
import type { LoginPayload, RegisterPayload, TokenPair } from '../types';

const AUTH_BASE = 'users/';

export const authEndpoints = {
  login: (payload: LoginPayload) =>
    apiFetch<TokenPair>(`${AUTH_BASE}token/`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  register: (payload: RegisterPayload) =>
    apiFetch<TokenPair>(`${AUTH_BASE}register/`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
