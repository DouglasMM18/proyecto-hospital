import api from './axios';
import type { Madre } from '../types/models';

export const madresApi = {
  // Listar todas las madres
  getAll: async (): Promise<Madre[]> => {
    const response = await api.get('/api/madres/');
    return response.data;
  },

  // Obtener madre por ID
  getById: async (id: number): Promise<Madre> => {
    const response = await api.get(`/api/madres/${id}/`);
    return response.data;
  },

  // Buscar madre por RUT
  buscarPorRut: async (rut: string): Promise<Madre | null> => {
    try {
      const response = await api.get('/api/madres/');
      const madres: Madre[] = response.data;
      const rutLimpio = rut.replace(/\./g, '').toUpperCase().trim();
      const madre = madres.find(m => m.rut.replace(/\./g, '').toUpperCase().trim() === rutLimpio);
      return madre || null;
    } catch {
      return null;
    }
  },

  // Crear madre
  create: async (data: Partial<Madre>): Promise<Madre> => {
    const response = await api.post('/api/madres/', data);
    return response.data;
  },

  // Actualizar madre
  update: async (id: number, data: Partial<Madre>): Promise<Madre> => {
    const response = await api.put(`/api/madres/${id}/`, data);
    return response.data;
  },

  // Eliminar madre
  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/madres/${id}/`);
  },
};