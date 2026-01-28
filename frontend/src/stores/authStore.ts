import { create } from 'zustand';
import { User } from '@/types';
import { Permisos } from '@/types/usuario';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  permisos: Permisos | null;
  setUser: (user: User | null) => void;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updatePermisos: (permisos: Permisos) => void;
}

// Función para cargar el usuario desde localStorage
const loadUserFromStorage = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};

export const useAuthStore = create<AuthState>(set => ({
  user: loadUserFromStorage(),
  isAuthenticated: !!localStorage.getItem('access_token'),
  permisos: loadUserFromStorage()?.permisos || null,

  setUser: (user: User | null) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
    set({ user, isAuthenticated: !!user, permisos: user?.permisos || null });
  },

  login: (user: User, accessToken: string, refreshToken: string) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, isAuthenticated: true, permisos: user.permisos || null });
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    set({ user: null, isAuthenticated: false, permisos: null });
  },

  updatePermisos: (permisos: Permisos) => {
    set(state => {
      if (state.user) {
        const updatedUser = { ...state.user, permisos };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return { user: updatedUser, permisos };
      }
      return state;
    });
  },
}));
