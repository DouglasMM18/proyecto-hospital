import api from './axios';

export interface Alta {
  id?: number;
  tipo: string;
  parto: number;
  estado?: string;
  solicitado_por?: number;
  autorizado_por?: number;
  fecha_solicitud?: string;
  fecha_autorizacion?: string;
  observaciones?: string;
  madre_nombre?: string;
  solicitante?: string;
  autorizador?: string;
}

// Alias para compatibilidad
export type AltaMedica = Alta;

export const altasApi = {
  getAll: async (): Promise<Alta[]> => {
    const response = await api.get('/api/altas/');
    return response.data;
  },

  getPendientes: async (): Promise<Alta[]> => {
    const response = await api.get('/api/altas/');
    return response.data.filter((a: Alta) => a.estado === 'PENDIENTE');
  },

  getById: async (id: number): Promise<Alta> => {
    const response = await api.get(`/api/altas/${id}/`);
    return response.data;
  },

  create: async (data: Partial<Alta>): Promise<Alta> => {
    const response = await api.post('/api/altas/', data);
    return response.data;
  },

  autorizar: async (id: number, observaciones?: string): Promise<Alta> => {
    const response = await api.patch(`/api/altas/${id}/`, {
      estado: 'AUTORIZADA',
      observaciones: observaciones || '',
    });
    return response.data;
  },

  rechazar: async (id: number, observaciones?: string): Promise<Alta> => {
    const response = await api.patch(`/api/altas/${id}/`, {
      estado: 'RECHAZADA',
      observaciones: observaciones || '',
    });
    return response.data;
  },

  descargarPDF: async (id: number): Promise<Blob> => {
    const response = await api.get(`/api/reportes/alta/${id}/`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default altasApi;