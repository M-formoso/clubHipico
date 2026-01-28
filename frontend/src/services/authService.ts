import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    rol: string;
  };
}

export const authService = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/login', {
      username,
      password,
    });
    return data;
  },

  register: async (registerData: RegisterData): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/register', registerData);
    return data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  getCurrentUser: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },

  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    await api.put('/auth/change-password', {
      old_password: oldPassword,
      new_password: newPassword,
    });
  },

  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await api.post('/auth/reset-password', {
      token,
      new_password: newPassword,
    });
  },
};
