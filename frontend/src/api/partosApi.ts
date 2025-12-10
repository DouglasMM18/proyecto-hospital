import api from './axios';

export interface Parto {
  id?: number;
  madre: number;
  fecha: string;
  hora: string;
  tipo_parto: string;
  edad_gestacional: number;
  profesional_acargo: string;
  observaciones?: string;
  recien_nacidos?: RecienNacido[];
}

export interface RecienNacido {
  id?: number;
  parto?: number;
  sexo: string;
  peso_gramos: number;
  talla_cm: number;
  circunferencia_craneal?: number;
  apgar_1: number;
  apgar_5: number;
  vacuna_bcg: boolean;
  vacuna_hepatitis_b: boolean;
  screening_auditivo: boolean;
  profilaxis_ocular?: boolean;
  observaciones?: string;
}

export const partosApi = {
  getAll: async (): Promise<Parto[]> => {
    const response = await api.get('/api/partos/');
    return response.data;
  },

  getById: async (id: number): Promise<Parto> => {
    const response = await api.get(`/api/partos/${id}/`);
    return response.data;
  },

  getByMadreId: async (madreId: number): Promise<Parto[]> => {
    const response = await api.get('/api/partos/');
    const partos: Parto[] = response.data;
    return partos.filter(p => p.madre === madreId);
  },

  create: async (data: Omit<Parto, 'id'>): Promise<Parto> => {
    const response = await api.post('/api/partos/', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Parto>): Promise<Parto> => {
    const response = await api.put(`/api/partos/${id}/`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/partos/${id}/`);
  },
};

export const recienNacidosApi = {
  getAll: async (): Promise<RecienNacido[]> => {
    const response = await api.get('/api/recien-nacidos/');
    return response.data;
  },

  create: async (data: Omit<RecienNacido, 'id'>): Promise<RecienNacido> => {
    const response = await api.post('/api/recien-nacidos/', data);
    return response.data;
  },

  update: async (id: number, data: Partial<RecienNacido>): Promise<RecienNacido> => {
    const response = await api.put(`/api/recien-nacidos/${id}/`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/recien-nacidos/${id}/`);
  },
};