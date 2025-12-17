import api from './axios';

export interface UserData {
  id?: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  rol_actual?: string;
  password?: string; // Solo para crear
  rol?: string;      // Solo para crear
  is_active?: boolean;
  last_login?: string;
}

export const usersApi = {
  // Obtener todos los usuarios
  getAll: async (): Promise<UserData[]> => {
    const response = await api.get('/api/users/');
    return response.data;
  },

  // Crear usuario nuevo (Con Rol)
  create: async (data: UserData): Promise<UserData> => {
    const response = await api.post('/api/users/', data);
    return response.data;
  },

  // Borrar usuario
  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/users/${id}/`);
  }
};