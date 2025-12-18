import api from './axios';

export interface LogActividad {
  id: number;
  usuario: number | null;
  username: string;
  rol: string;
  tipo_accion: string;
  modulo: string;
  descripcion: string;
  fecha: string;
  ip_address: string | null;
}

export const logsApi = {
  getAll: async (): Promise<LogActividad[]> => {
    const response = await api.get('/api/logs/');
    return response.data;
  },

  exportarAuditoriaPDF: async (): Promise<void> => {
    // CORRECCIÓN: La ruta en urls.py es 'reportes/logs/'
    const response = await api.get('/api/reportes/logs/', {
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Auditoria.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};