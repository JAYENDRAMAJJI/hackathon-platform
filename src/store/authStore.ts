import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'FACULTY' | 'ADMIN';
  approved?: boolean;
  status?: string;
  rejectionReason?: string;
  profileImage?: string;
  department?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (userUpdates: Partial<User>) => void;
}

const getInitialUser = (): User | null => {
  try {
    const raw = localStorage.getItem('auth_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const getInitialToken = (): string | null => {
  try {
    return localStorage.getItem('auth_token') || null;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: getInitialUser(),
  token: getInitialToken(),
  isAuthenticated: Boolean(getInitialToken() && getInitialUser()),
  login: (user, token) => {
    try {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));
    } catch (_) {}
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    } catch (_) {}
    set({ user: null, token: null, isAuthenticated: false });
  },
  updateUser: (userUpdates) => {
    set((state) => {
      if (!state.user) return state;
      const updated = { ...state.user, ...userUpdates };
      try {
        localStorage.setItem('auth_user', JSON.stringify(updated));
      } catch (_) {}
      return { user: updated };
    });
  },
}));
