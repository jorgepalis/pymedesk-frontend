import { apiFetch, withAuth } from '../client';
import type { UserProfile } from '../types';

export const userEndpoints = {
  me: () => apiFetch<UserProfile>('users/me/', withAuth({ method: 'GET' })),
};
