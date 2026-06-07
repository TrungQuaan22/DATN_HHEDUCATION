import { api } from '@/lib/api/axios';
import { LoginResponseData, RegisterResponseData, AuthUser } from '@/types/auth';

export const authApi = {
  async login(body: Record<string, any>): Promise<LoginResponseData> {
    const response = await api.post('/auth/login', body);
    return response.data.data;
  },

  async register(body: Record<string, any>): Promise<RegisterResponseData> {
    const response = await api.post('/auth/register', body);
    return response.data.data;
  },

  async getMe(): Promise<AuthUser> {
    const response = await api.get('/users/me');
    return response.data.data;
  },
};
