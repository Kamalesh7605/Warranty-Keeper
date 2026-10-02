import { api } from './api';

export interface Session {
  username: string;
}

export const authApi = {
  me: () => api.get<Session>('/auth/me').then((r) => r.data),
  login: (username: string, password: string) =>
    api.post<Session>('/auth/login', { username, password }).then((r) => r.data),
  logout: () => api.post('/auth/logout').then(() => undefined),
};
