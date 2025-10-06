'use client';

import { useCallback, useState } from 'react';
import { authEndpoints } from '@/api/endpoints/auth';
import { userEndpoints } from '@/api/endpoints/users';
import type { LoginPayload, RegisterPayload, TokenPair, UserProfile } from '@/api/types';
import { ApiError } from '@/api/client';
import { useNotifications } from '@/components/feedback/NotificationsProvider';

const ACCESS_TOKEN_KEY = 'pymedesk.accessToken';
const REFRESH_TOKEN_KEY = 'pymedesk.refreshToken';
const ME_STORAGE_KEY = 'pymedesk.me';

const storeTokens = ({ access, refresh }: TokenPair) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
};

const clearTokens = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

const hasTokens = (): boolean => {
  if (typeof window === 'undefined') return false;
  return Boolean(localStorage.getItem(ACCESS_TOKEN_KEY) && localStorage.getItem(REFRESH_TOKEN_KEY));
};

const storeProfile = (profile: UserProfile) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ME_STORAGE_KEY, JSON.stringify(profile));
};

const getStoredProfile = (): UserProfile | null => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(ME_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
};

const clearProfile = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ME_STORAGE_KEY);
};

const resolveErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof ApiError) {
    return error.message || fallback;
  }
  if (error instanceof Error) {
    return error.message || fallback;
  }
  return fallback;
};

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(() => getStoredProfile());
  const { notify } = useNotifications();

  const persistProfile = useCallback((me: UserProfile) => {
    storeProfile(me);
    setProfile(me);
  }, []);

  const dropProfile = useCallback(() => {
    clearProfile();
    setProfile(null);
  }, []);

  const fetchProfile = useCallback(async () => {
    const me = await userEndpoints.me();
    persistProfile(me);
    return me; 
  }, [persistProfile]);

  const login = useCallback(async ({ email, password }: LoginPayload): Promise<UserProfile> => {
    setLoading(true);
    setError(null);

    try {
      const data = await authEndpoints.login({ email, password });
      storeTokens(data);
      try {
        const me = await fetchProfile();
        return me;
      } catch (profileError) {
        clearTokens();
        dropProfile();
        throw profileError;
      }
    } catch (err) {
      const message = resolveErrorMessage(err, 'Error desconocido al iniciar sesión.');
      setError(message);
      notify(message, { tone: 'error' });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchProfile, dropProfile, notify]);

  const register = useCallback(async ({ email, name, password }: RegisterPayload): Promise<UserProfile> => {
    setLoading(true);
    setError(null);

    try {
      const data = await authEndpoints.register({ email, name, password });
      storeTokens(data);
      try {
        const me = await fetchProfile();
        return me;
      } catch (profileError) {
        clearTokens();
        dropProfile();
        throw profileError;
      }
    } catch (err) {
      const message = resolveErrorMessage(err, 'Error desconocido al registrar.');
      setError(message);
      notify(message, { tone: 'error' });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchProfile, dropProfile, notify]);

  const logout = useCallback(() => {
    clearTokens();
    dropProfile();
  }, [dropProfile]);

  const isAuthenticated = useCallback(() => hasTokens(), []);

  return {
    login,
    register,
    logout,
    loading,
    error,
    isAuthenticated,
    refreshProfile: fetchProfile,
    profile,
  };
};

export const authStorage = {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  ME_STORAGE_KEY,
  clear: () => {
    clearTokens();
    clearProfile();
  },
  hasTokens,
  getProfile: getStoredProfile,
};
