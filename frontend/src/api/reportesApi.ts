import api from './axios';

export const reportesApi = {
  descargarExcel: async (): Promise<void> => {
    const response = await api.get('/api/reportes/excel/', {
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Reporte_Partos.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  descargarPDF: async (): Promise<void> => {
    const response = await api.get('/api/reportes/pdf/', {
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Reporte_REM.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};