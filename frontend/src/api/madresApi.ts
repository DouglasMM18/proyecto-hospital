import api from './axios';
import type { Madre } from '../types/models';

export const madresApi = {
  getAll: async (): Promise<Madre[]> => {
    const response = await api.get('/api/madres/');
    return response.data;
  },

  getById: async (id: number): Promise<Madre> => {
    const response = await api.get(`/api/madres/${id}/`);
    return response.data;
  },

  // Búsqueda por RUT usando el endpoint con query param
  buscarPorRut: async (rut: string): Promise<Madre | null> => {
    try {
      // El backend ahora soporta búsqueda por hash
      const rutLimpio = rut.replace(/\./g, '').replace(/-/g, '').toUpperCase().trim();
      const response = await api.get(`/api/madres/?rut=${rutLimpio}`);
      const madres: Madre[] = response.data;
      return madres.length > 0 ? madres[0] : null;
    } catch {
      return null;
    }
  },

  create: async (data: Partial<Madre>): Promise<Madre> => {
    const response = await api.post('/api/madres/', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Madre>): Promise<Madre> => {
    const response = await api.put(`/api/madres/${id}/`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/madres/${id}/`);
  },
};