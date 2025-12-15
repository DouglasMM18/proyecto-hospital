import { useState, useEffect } from 'react';
import { madresApi } from '../../api/MadresApi';
import { partosApi } from '../../api/partosApi';
import { reportesApi } from '../../api/reportesApi';
import type { Madre, Parto } from '../../types/models';

interface DatoInforme {
  id: number;
  rut: string;
  nombre: string;
  comuna: string;
  fechaParto: string;
  tipoParto: string;
  profesional: string;
  rn: number;
  pesoRN: number;
  apgar1: number;
  apgar5: number;
}

interface EstadisticasGenerales {
  totalPartos: number;
  partosVaginales: number;
  cesareas: number;
  totalRN: number;
  promedioApgar: number;
  promedioPeso: number;
}

interface FiltrosInforme {
  fechaDesde: string;
  fechaHasta: string;
  tipoParto: string;
  profesional: string;
  comuna: string;
  tipoInforme: string;
}

const tiposInforme = [
  { value: 'partos', label: 'Registro de Partos', icon: '👶' },
  { value: 'madres', label: 'Registro de Madres', icon: '👩' },
  { value: 'estadisticas', label: 'Estadísticas Generales', icon: '📊' },
  { value: 'profesionales', label: 'Por Profesional', icon: '👨‍⚕️' },
  { value: 'comunas', label: 'Por Comuna', icon: '📍' },
];

export default function EspecialistaPage() {
  const [filtros, setFiltros] = useState<FiltrosInforme>({
    fechaDesde: '',
    fechaHasta: '',
    tipoParto: '',
    profesional: '',
    comuna: '',
    tipoInforme: 'partos',
  });
  const [datosInforme, setDatosInforme] = useState<DatoInforme[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasGenerales>({
    totalPartos: 0,
    partosVaginales: 0,
    cesareas: 0,
    totalRN: 0,
    promedioApgar: 0,
    promedioPeso: 0,
  });
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Cargar estadísticas al montar
  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      const partos = await partosApi.getAll();
      
      const totalPartos = partos.length;
      const partosVaginales = partos.filter(p => p.tipo_parto === 'EUTOCICO').length;
      const cesareas = partos.filter(p => p.tipo_parto.includes('CESAREA')).length;
      
      let totalRN = 0;
      let sumaApgar = 0;
      let sumaPeso = 0;
      let countRN = 0;

      partos.forEach(parto => {
        if (parto.recien_nacidos) {
          totalRN += parto.recien_nacidos.length;
          parto.recien_nacidos.forEach(rn => {
            sumaApgar += rn.apgar_5;
            sumaPeso += rn.peso_gramos;
            countRN++;
          });
        }
      });

      setEstadisticas({
        totalPartos,
        partosVaginales,
        cesareas,
        totalRN,
        promedioApgar: countRN > 0 ? Math.round((sumaApgar / countRN) * 10) / 10 : 0,
        promedioPeso: countRN > 0 ? Math.round(sumaPeso / countRN) : 0,
      });
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const handleFiltroChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const generarInforme = async () => {
    setIsLoading(true);

    try {
      const partos: Parto[] = await partosApi.getAll();
      const madres: Madre[] = await madresApi.getAll();

      let datosFiltrados: DatoInforme[] = partos.map(parto => {
        const madre = madres.find(m => m.id === parto.madre);
        const rn = parto.recien_nacidos?.[0];
        return {
          id: parto.id || 0,
          rut: madre?.rut || 'N/A',
          nombre: madre?.nombre_completo || 'N/A',
          comuna: madre?.comuna || 'N/A',
          fechaParto: parto.fecha,
          tipoParto: parto.tipo_parto,
          profesional: parto.profesional_acargo,
          rn: parto.recien_nacidos?.length || 0,
          pesoRN: rn?.peso_gramos || 0,
          apgar1: rn?.apgar_1 || 0,
          apgar5: rn?.apgar_5 || 0,
        };
      });

      // Aplicar filtros
      if (filtros.fechaDesde) {
        datosFiltrados = datosFiltrados.filter(d => d.fechaParto >= filtros.fechaDesde);
      }
      if (filtros.fechaHasta) {
        datosFiltrados = datosFiltrados.filter(d => d.fechaParto <= filtros.fechaHasta);
      }
      if (filtros.tipoParto) {
        datosFiltrados = datosFiltrados.filter(d => d.tipoParto === filtros.tipoParto);
      }
      if (filtros.comuna) {
        datosFiltrados = datosFiltrados.filter(d => d.comuna === filtros.comuna);
      }
      if (filtros.profesional) {
        datosFiltrados = datosFiltrados.filter(d => 
          d.profesional.toLowerCase().includes(filtros.profesional.toLowerCase())
        );
      }

      setDatosInforme(datosFiltrados);
      setMostrarResultados(true);
    } catch (error) {
      console.error('Error al generar informe:', error);
      alert('Error al cargar datos. Verifique la conexión con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const limpiarFiltros = () => {
    setFiltros({
      fechaDesde: '',
      fechaHasta: '',
      tipoParto: '',
      profesional: '',
      comuna: '',
      tipoInforme: 'partos',
    });
    setMostrarResultados(false);
    setDatosInforme([]);
  };

  const exportarExcel = async () => {
    setIsExporting(true);
    try {
      await reportesApi.descargarExcel();
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      alert('Error al descargar Excel');
    } finally {
      setIsExporting(false);
    }
  };

  const exportarPDF = async () => {
    setIsExporting(true);
    try {
      await reportesApi.descargarPDF();
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      alert('Error al descargar PDF');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>📋 Generación de Informes</h1>
          <p style={styles.subtitle}>Módulo Especialista - Reportes y Estadísticas</p>
        </div>

        {/* Tarjetas de estadísticas */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <span style={styles.statIcon}>👶</span>
            <div>
              <span style={styles.statNumber}>{estadisticas.totalPartos}</span>
              <span style={styles.statLabel}>Total Partos</span>
            </div>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statIcon}>🚼</span>
            <div>
              <span style={styles.statNumber}>{estadisticas.totalRN}</span>
              <span style={styles.statLabel}>Recién Nacidos</span>
            </div>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statIcon}>💚</span>
            <div>
              <span style={styles.statNumber}>{estadisticas.partosVaginales}</span>
              <span style={styles.statLabel}>Partos Vaginales</span>
            </div>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statIcon}>🏥</span>
            <div>
              <span style={styles.statNumber}>{estadisticas.cesareas}</span>
              <span style={styles.statLabel}>Cesáreas</span>
            </div>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statIcon}>⭐</span>
            <div>
              <span style={styles.statNumber}>{estadisticas.promedioApgar}</span>
              <span style={styles.statLabel}>Promedio APGAR</span>
            </div>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statIcon}>⚖️</span>
            <div>
              <span style={styles.statNumber}>{estadisticas.promedioPeso}g</span>
              <span style={styles.statLabel}>Peso Promedio</span>
            </div>
          </div>
        </div>

        {/* Panel de filtros */}
        <div style={styles.filtrosPanel}>
          <h2 style={styles.filtrosTitle}>🔍 Filtros del Informe</h2>

          {/* Tipo de informe */}
          <div style={styles.tipoInformeGrid}>
            {tiposInforme.map(tipo => (
              <button
                key={tipo.value}
                type="button"
                onClick={() => setFiltros(prev => ({ ...prev, tipoInforme: tipo.value }))}
                style={{
                  ...styles.tipoInformeBtn,
                  ...(filtros.tipoInforme === tipo.value ? styles.tipoInformeBtnActive : {}),
                }}
              >
                <span style={styles.tipoInformeIcon}>{tipo.icon}</span>
                <span>{tipo.label}</span>
              </button>
            ))}
          </div>

          <div style={styles.filtrosGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Fecha Desde</label>
              <input
                type="date"
                name="fechaDesde"
                value={filtros.fechaDesde}
                onChange={handleFiltroChange}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Fecha Hasta</label>
              <input
                type="date"
                name="fechaHasta"
                value={filtros.fechaHasta}
                onChange={handleFiltroChange}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Tipo de Parto</label>
              <select
                name="tipoParto"
                value={filtros.tipoParto}
                onChange={handleFiltroChange}
                style={styles.input}
              >
                <option value="">Todos</option>
                <option value="EUTOCICO">Eutócico</option>
                <option value="CESAREA URGENCIA">Cesárea Urgencia</option>
                <option value="CESAREA ELECTIVA">Cesárea Electiva</option>
                <option value="FORCEPS">Fórceps</option>
                <option value="VACUUM">Vacuum</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Comuna</label>
              <select
                name="comuna"
                value={filtros.comuna}
                onChange={handleFiltroChange}
                style={styles.input}
              >
                <option value="">Todas</option>
                <option value="Chillán">Chillán</option>
                <option value="Chillán Viejo">Chillán Viejo</option>
                <option value="Pinto">Pinto</option>
                <option value="Coihueco">Coihueco</option>
                <option value="San Carlos">San Carlos</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Profesional</label>
              <input
                type="text"
                name="profesional"
                value={filtros.profesional}
                onChange={handleFiltroChange}
                style={styles.input}
                placeholder="Buscar por nombre..."
              />
            </div>
          </div>

          <div style={styles.filtrosBotones}>
            <button type="button" onClick={limpiarFiltros} style={styles.btnLimpiar}>
              🗑️ Limpiar Filtros
            </button>
            <button type="button" onClick={generarInforme} disabled={isLoading} style={styles.btnGenerar}>
              {isLoading ? '⏳ Generando...' : '📊 Generar Informe'}
            </button>
          </div>
        </div>

        {/* Resultados */}
        {mostrarResultados && (
          <div style={styles.resultadosPanel}>
            <div style={styles.resultadosHeader}>
              <h2 style={styles.resultadosTitle}>
                📄 Resultados del Informe
                <span style={styles.resultadosCount}>({datosInforme.length} registros)</span>
              </h2>
              <div style={styles.exportBtns}>
                <button type="button" onClick={exportarExcel} disabled={isExporting} style={styles.btnExcel}>
                  {isExporting ? '⏳' : '📗'} Exportar Excel
                </button>
                <button type="button" onClick={exportarPDF} disabled={isExporting} style={styles.btnPDF}>
                  {isExporting ? '⏳' : '📕'} Exportar PDF
                </button>
              </div>
            </div>

            {datosInforme.length > 0 ? (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Fecha</th>
                      <th style={styles.th}>RUT Madre</th>
                      <th style={styles.th}>Nombre</th>
                      <th style={styles.th}>Comuna</th>
                      <th style={styles.th}>Tipo Parto</th>
                      <th style={styles.th}>Profesional</th>
                      <th style={styles.th}>RN</th>
                      <th style={styles.th}>Peso (g)</th>
                      <th style={styles.th}>APGAR 1'</th>
                      <th style={styles.th}>APGAR 5'</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datosInforme.map(dato => (
                      <tr key={dato.id} style={styles.tr}>
                        <td style={styles.td}>{dato.fechaParto}</td>
                        <td style={styles.td}>{dato.rut}</td>
                        <td style={styles.td}>{dato.nombre}</td>
                        <td style={styles.td}>{dato.comuna}</td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.tipoBadge,
                            backgroundColor: dato.tipoParto.includes('CESAREA') ? '#dc3545' : '#28a745',
                          }}>
                            {dato.tipoParto}
                          </span>
                        </td>
                        <td style={styles.td}>{dato.profesional}</td>
                        <td style={styles.td}>{dato.rn}</td>
                        <td style={styles.td}>{dato.pesoRN}</td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.apgarBadge,
                            backgroundColor: dato.apgar1 >= 7 ? '#28a745' : dato.apgar1 >= 4 ? '#ffc107' : '#dc3545',
                          }}>
                            {dato.apgar1}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.apgarBadge,
                            backgroundColor: dato.apgar5 >= 7 ? '#28a745' : dato.apgar5 >= 4 ? '#ffc107' : '#dc3545',
                          }}>
                            {dato.apgar5}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={styles.noResults}>
                <span style={styles.noResultsIcon}>🔍</span>
                <p>No se encontraron registros con los filtros aplicados.</p>
              </div>
            )}

            {/* Resumen */}
            {datosInforme.length > 0 && (
              <div style={styles.resumenInforme}>
                <h3 style={styles.resumenTitle}>📈 Resumen del Informe</h3>
                <div style={styles.resumenGrid}>
                  <div style={styles.resumenItem}>
                    <span style={styles.resumenLabel}>Total Registros</span>
                    <span style={styles.resumenValor}>{datosInforme.length}</span>
                  </div>
                  <div style={styles.resumenItem}>
                    <span style={styles.resumenLabel}>Partos Vaginales</span>
                    <span style={styles.resumenValor}>
                      {datosInforme.filter(d => d.tipoParto === 'EUTOCICO').length}
                    </span>
                  </div>
                  <div style={styles.resumenItem}>
                    <span style={styles.resumenLabel}>Cesáreas</span>
                    <span style={styles.resumenValor}>
                      {datosInforme.filter(d => d.tipoParto.includes('CESAREA')).length}
                    </span>
                  </div>
                  <div style={styles.resumenItem}>
                    <span style={styles.resumenLabel}>Total RN</span>
                    <span style={styles.resumenValor}>
                      {datosInforme.reduce((acc, d) => acc + d.rn, 0)}
                    </span>
                  </div>
                  <div style={styles.resumenItem}>
                    <span style={styles.resumenLabel}>Peso Promedio</span>
                    <span style={styles.resumenValor}>
                      {datosInforme.length > 0 
                        ? Math.round(datosInforme.reduce((acc, d) => acc + d.pesoRN, 0) / datosInforme.filter(d => d.pesoRN > 0).length) 
                        : 0}g
                    </span>
                  </div>
                  <div style={styles.resumenItem}>
                    <span style={styles.resumenLabel}>APGAR 5' Promedio</span>
                    <span style={styles.resumenValor}>
                      {datosInforme.length > 0 
                        ? (datosInforme.reduce((acc, d) => acc + d.apgar5, 0) / datosInforme.filter(d => d.apgar5 > 0).length).toFixed(1) 
                        : 0}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    fontFamily: "'Poppins', sans-serif",
    minHeight: 'calc(100vh - 60px)',
    padding: '20px',
  },
  content: {
    maxWidth: '1300px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '25px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#1a365d',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    margin: '5px 0 0 0',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '15px',
    marginBottom: '25px',
  },
  statCard: {
    backgroundColor: '#e8f3ff',
    padding: '15px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 123, 255, 0.12)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  statIcon: {
    fontSize: '28px',
  },
  statNumber: {
    display: 'block',
    fontSize: '22px',
    fontWeight: 700,
    color: '#1a365d',
  },
  statLabel: {
    fontSize: '11px',
    color: '#666',
  },
  filtrosPanel: {
    backgroundColor: '#e8f3ff',
    padding: '25px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0, 123, 255, 0.15)',
    marginBottom: '25px',
  },
  filtrosTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#1a365d',
    margin: '0 0 20px 0',
  },
  tipoInformeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '10px',
    marginBottom: '25px',
  },
  tipoInformeBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '5px',
    padding: '15px 10px',
    border: '2px solid #c1d9e7',
    borderRadius: '10px',
    backgroundColor: 'white',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 500,
    color: '#495057',
    fontFamily: "'Poppins', sans-serif",
    transition: 'all 0.2s',
  },
  tipoInformeBtnActive: {
    borderColor: '#007bff',
    backgroundColor: '#d6eaff',
    color: '#007bff',
  },
  tipoInformeIcon: {
    fontSize: '24px',
  },
  filtrosGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '15px',
    marginBottom: '20px',
  },
  formGroup: {},
  label: {
    display: 'block',
    marginBottom: '5px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#495057',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #c1d9e7',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: "'Poppins', sans-serif",
    boxSizing: 'border-box',
    backgroundColor: 'white',
  },
  filtrosBotones: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
  },
  btnLimpiar: {
    padding: '10px 20px',
    border: '1px solid #c1d9e7',
    borderRadius: '8px',
    backgroundColor: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    fontFamily: "'Poppins', sans-serif",
  },
  btnGenerar: {
    padding: '10px 25px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#007bff',
    color: 'white',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '14px',
    fontFamily: "'Poppins', sans-serif",
  },
  resultadosPanel: {
    backgroundColor: '#e8f3ff',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0, 123, 255, 0.15)',
    overflow: 'hidden',
  },
  resultadosHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 25px',
    borderBottom: '1px solid #c1d9e7',
  },
  resultadosTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#1a365d',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  resultadosCount: {
    fontSize: '14px',
    fontWeight: 400,
    color: '#666',
  },
  exportBtns: {
    display: 'flex',
    gap: '10px',
  },
  btnExcel: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#28a745',
    color: 'white',
    fontWeight: 500,
    cursor: 'pointer',
    fontSize: '13px',
    fontFamily: "'Poppins', sans-serif",
  },
  btnPDF: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#dc3545',
    color: 'white',
    fontWeight: 500,
    cursor: 'pointer',
    fontSize: '13px',
    fontFamily: "'Poppins', sans-serif",
  },
  tableContainer: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    backgroundColor: '#1a365d',
    color: 'white',
    padding: '12px 10px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  tr: {
    borderBottom: '1px solid #c1d9e7',
    backgroundColor: 'white',
  },
  td: {
    padding: '10px',
    fontSize: '13px',
    color: '#495057',
  },
  tipoBadge: {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 600,
    color: 'white',
  },
  apgarBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 600,
    color: 'white',
    minWidth: '30px',
    textAlign: 'center',
  },
  noResults: {
    padding: '60px',
    textAlign: 'center',
    color: '#666',
    backgroundColor: 'white',
  },
  noResultsIcon: {
    fontSize: '48px',
    display: 'block',
    marginBottom: '15px',
  },
  resumenInforme: {
    padding: '25px',
    borderTop: '1px solid #c1d9e7',
    backgroundColor: '#d6eaff',
  },
  resumenTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#1a365d',
    margin: '0 0 15px 0',
  },
  resumenGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '15px',
  },
  resumenItem: {
    backgroundColor: 'white',
    padding: '15px',
    borderRadius: '8px',
    textAlign: 'center',
  },
  resumenLabel: {
    display: 'block',
    fontSize: '11px',
    color: '#666',
    marginBottom: '5px',
  },
  resumenValor: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#1a365d',
  },
};