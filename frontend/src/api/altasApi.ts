import api from './axios';

export interface AltaMedica {
  id?: number;
  tipo: 'MEDICA' | 'VOLUNTARIA';
  parto: number;
  solicitado_por?: number;
  fecha_solicitud?: string;
  estado: 'PENDIENTE' | 'AUTORIZADA' | 'RECHAZADA';
  autorizado_por?: number | null;
  fecha_autorizacion?: string | null;
  observaciones: string;
  // Campos extra del serializer
  madre_nombre?: string;
  solicitante?: string;
  autorizador?: string;
}

export const altasApi = {
  getAll: async (): Promise<AltaMedica[]> => {
    const response = await api.get('/api/altas/');
    return response.data;
  },

  getPendientes: async (): Promise<AltaMedica[]> => {
    const response = await api.get('/api/altas/');
    const altas: AltaMedica[] = response.data;
    return altas.filter(a => a.estado === 'PENDIENTE');
  },

  create: async (data: Partial<AltaMedica>): Promise<AltaMedica> => {
    const response = await api.post('/api/altas/', data);
    return response.data;
  },

  autorizar: async (id: number, observaciones: string = ''): Promise<AltaMedica> => {
    const response = await api.patch(`/api/altas/${id}/`, {
      estado: 'AUTORIZADA',
      observaciones,
    });
    return response.data;
  },

  rechazar: async (id: number, observaciones: string): Promise<AltaMedica> => {
    const response = await api.patch(`/api/altas/${id}/`, {
      estado: 'RECHAZADA',
      observaciones,
    });
    return response.data;
  },

  descargarPDF: async (id: number): Promise<void> => {
    const response = await api.get(`/api/reportes/alta/${id}/`, {
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Alta_${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};