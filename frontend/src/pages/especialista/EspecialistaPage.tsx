import { useState, useEffect } from 'react';
import { madresApi } from '../../api/MadresApi';
import { partosApi } from '../../api/partosApi';
import { reportesApi } from '../../api/reportesApi';
import { logsApi, type LogActividad } from '../../api/logsApi';
import { altasApi, type AltaMedica } from '../../api/altasApi';
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
}

export default function EspecialistaPage() {
  const [activeTab, setActiveTab] = useState<'informes' | 'logs' | 'autorizaciones'>('informes');
  
  // Estado para Informes
  const [filtros, setFiltros] = useState<FiltrosInforme>({
    fechaDesde: '',
    fechaHasta: '',
    tipoParto: '',
    profesional: '',
    comuna: '',
  });
  const [datosInforme, setDatosInforme] = useState<DatoInforme[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasGenerales>({
    totalPartos: 0, partosVaginales: 0, cesareas: 0, totalRN: 0, promedioApgar: 0, promedioPeso: 0,
  });
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Estado para Logs
  const [logs, setLogs] = useState<LogActividad[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Estado para Autorizaciones
  const [altasPendientes, setAltasPendientes] = useState<AltaMedica[]>([]);
  const [altasLoading, setAltasLoading] = useState(false);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  useEffect(() => {
    if (activeTab === 'logs') {
      cargarLogs();
    } else if (activeTab === 'autorizaciones') {
      cargarAltasPendientes();
    }
  }, [activeTab]);

  const cargarEstadisticas = async () => {
    try {
      const partos = await partosApi.getAll();
      const totalPartos = partos.length;
      const partosVaginales = partos.filter(p => p.tipo_parto === 'EUTOCICO').length;
      const cesareas = partos.filter(p => p.tipo_parto.includes('CESAREA')).length;
      
      let totalRN = 0, sumaApgar = 0, sumaPeso = 0, countRN = 0;
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
        totalPartos, partosVaginales, cesareas, totalRN,
        promedioApgar: countRN > 0 ? Math.round((sumaApgar / countRN) * 10) / 10 : 0,
        promedioPeso: countRN > 0 ? Math.round(sumaPeso / countRN) : 0,
      });
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const cargarLogs = async () => {
    setLogsLoading(true);
    try {
      const data = await logsApi.getAll();
      setLogs(data);
    } catch (error) {
      console.error('Error al cargar logs:', error);
    } finally {
      setLogsLoading(false);
    }
  };

  const cargarAltasPendientes = async () => {
    setAltasLoading(true);
    try {
      const data = await altasApi.getPendientes();
      setAltasPendientes(data);
    } catch (error) {
      console.error('Error al cargar altas:', error);
    } finally {
      setAltasLoading(false);
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

      if (filtros.fechaDesde) datosFiltrados = datosFiltrados.filter(d => d.fechaParto >= filtros.fechaDesde);
      if (filtros.fechaHasta) datosFiltrados = datosFiltrados.filter(d => d.fechaParto <= filtros.fechaHasta);
      if (filtros.tipoParto) datosFiltrados = datosFiltrados.filter(d => d.tipoParto === filtros.tipoParto);
      if (filtros.comuna) datosFiltrados = datosFiltrados.filter(d => d.comuna === filtros.comuna);
      if (filtros.profesional) datosFiltrados = datosFiltrados.filter(d => d.profesional.toLowerCase().includes(filtros.profesional.toLowerCase()));

      setDatosInforme(datosFiltrados);
      setMostrarResultados(true);
    } catch (error) {
      console.error('Error al generar informe:', error);
      alert('Error al cargar datos');
    } finally {
      setIsLoading(false);
    }
  };

  const exportarExcel = async () => {
    try { await reportesApi.descargarExcel(); } 
    catch { alert('Error al descargar Excel'); }
  };

  const exportarPDF = async () => {
    try { await reportesApi.descargarPDF(); } 
    catch { alert('Error al descargar PDF'); }
  };

  const exportarAuditoria = async () => {
    try { await logsApi.exportarAuditoriaPDF(); } 
    catch { alert('Error al descargar auditoría'); }
  };

  const handleAutorizar = async (alta: AltaMedica) => {
    if (!confirm(`¿Autorizar alta ID ${alta.id}?`)) return;
    try {
      await altasApi.autorizar(alta.id!);
      alert('Alta autorizada');
      cargarAltasPendientes();
    } catch {
      alert('Error al autorizar');
    }
  };

  const handleRechazar = async (alta: AltaMedica) => {
    const motivo = prompt('Motivo del rechazo:');
    if (!motivo) return;
    try {
      await altasApi.rechazar(alta.id!, motivo);
      alert('Alta rechazada');
      cargarAltasPendientes();
    } catch {
      alert('Error al rechazar');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>📋 Panel Especialista / Supervisor</h1>
        </div>

        {/* Tabs principales */}
        <div style={styles.mainTabs}>
          <button
            onClick={() => setActiveTab('informes')}
            style={{ ...styles.mainTabBtn, ...(activeTab === 'informes' ? styles.mainTabBtnActive : {}) }}
          >
            📊 Informes
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            style={{ ...styles.mainTabBtn, ...(activeTab === 'logs' ? styles.mainTabBtnActive : {}) }}
          >
            📜 Logs de Actividad
          </button>
          <button
            onClick={() => setActiveTab('autorizaciones')}
            style={{ ...styles.mainTabBtn, ...(activeTab === 'autorizaciones' ? styles.mainTabBtnActive : {}) }}
          >
            ✅ Autorizaciones
            {altasPendientes.length > 0 && (
              <span style={styles.badge}>{altasPendientes.length}</span>
            )}
          </button>
        </div>

        {/* Tab: Informes */}
        {activeTab === 'informes' && (
          <>
            {/* Estadísticas */}
            <div style={styles.statsGrid}>
              <div style={styles.statCard}><span style={styles.statIcon}>👶</span><div><span style={styles.statNumber}>{estadisticas.totalPartos}</span><span style={styles.statLabel}>Total Partos</span></div></div>
              <div style={styles.statCard}><span style={styles.statIcon}>🚼</span><div><span style={styles.statNumber}>{estadisticas.totalRN}</span><span style={styles.statLabel}>Recién Nacidos</span></div></div>
              <div style={styles.statCard}><span style={styles.statIcon}>💚</span><div><span style={styles.statNumber}>{estadisticas.partosVaginales}</span><span style={styles.statLabel}>Partos Vaginales</span></div></div>
              <div style={styles.statCard}><span style={styles.statIcon}>🏥</span><div><span style={styles.statNumber}>{estadisticas.cesareas}</span><span style={styles.statLabel}>Cesáreas</span></div></div>
              <div style={styles.statCard}><span style={styles.statIcon}>⭐</span><div><span style={styles.statNumber}>{estadisticas.promedioApgar}</span><span style={styles.statLabel}>Promedio APGAR</span></div></div>
              <div style={styles.statCard}><span style={styles.statIcon}>⚖️</span><div><span style={styles.statNumber}>{estadisticas.promedioPeso}g</span><span style={styles.statLabel}>Peso Promedio</span></div></div>
            </div>

            {/* Filtros */}
            <div style={styles.filtrosPanel}>
              <h2 style={styles.filtrosTitle}>🔍 Filtros del Informe</h2>
              <div style={styles.filtrosGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Fecha Desde</label>
                  <input type="date" name="fechaDesde" value={filtros.fechaDesde} onChange={handleFiltroChange} style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Fecha Hasta</label>
                  <input type="date" name="fechaHasta" value={filtros.fechaHasta} onChange={handleFiltroChange} style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Tipo de Parto</label>
                  <select name="tipoParto" value={filtros.tipoParto} onChange={handleFiltroChange} style={styles.input}>
                    <option value="">Todos</option>
                    <option value="EUTOCICO">Eutócico</option>
                    <option value="CESAREA URGENCIA">Cesárea Urgencia</option>
                    <option value="CESAREA ELECTIVA">Cesárea Electiva</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Comuna</label>
                  <select name="comuna" value={filtros.comuna} onChange={handleFiltroChange} style={styles.input}>
                    <option value="">Todas</option>
                    <option value="Chillán">Chillán</option>
                    <option value="Chillán Viejo">Chillán Viejo</option>
                    <option value="Pinto">Pinto</option>
                    <option value="Coihueco">Coihueco</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Profesional</label>
                  <input type="text" name="profesional" value={filtros.profesional} onChange={handleFiltroChange} style={styles.input} placeholder="Buscar..." />
                </div>
              </div>
              <div style={styles.filtrosBotones}>
                <button onClick={() => { setFiltros({ fechaDesde: '', fechaHasta: '', tipoParto: '', profesional: '', comuna: '' }); setMostrarResultados(false); }} style={styles.btnSecondary}>🗑️ Limpiar</button>
                <button onClick={generarInforme} disabled={isLoading} style={styles.btnPrimary}>{isLoading ? '⏳ Cargando...' : '📊 Generar Informe'}</button>
              </div>
            </div>

            {/* Resultados */}
            {mostrarResultados && (
              <div style={styles.resultadosPanel}>
                <div style={styles.resultadosHeader}>
                  <h2 style={styles.resultadosTitle}>📄 Resultados ({datosInforme.length})</h2>
                  <div style={styles.exportBtns}>
                    <button onClick={exportarExcel} style={styles.btnExcel}>📗 Excel</button>
                    <button onClick={exportarPDF} style={styles.btnPDF}>📕 PDF</button>
                  </div>
                </div>
                <div style={styles.tableContainer}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Fecha</th>
                        <th style={styles.th}>RUT</th>
                        <th style={styles.th}>Nombre</th>
                        <th style={styles.th}>Tipo Parto</th>
                        <th style={styles.th}>Profesional</th>
                        <th style={styles.th}>RN</th>
                        <th style={styles.th}>Peso</th>
                        <th style={styles.th}>APGAR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {datosInforme.map(d => (
                        <tr key={d.id} style={styles.tr}>
                          <td style={styles.td}>{d.fechaParto}</td>
                          <td style={styles.td}>{d.rut}</td>
                          <td style={styles.td}>{d.nombre}</td>
                          <td style={styles.td}><span style={{ ...styles.badge2, backgroundColor: d.tipoParto.includes('CESAREA') ? '#dc3545' : '#28a745' }}>{d.tipoParto}</span></td>
                          <td style={styles.td}>{d.profesional}</td>
                          <td style={styles.td}>{d.rn}</td>
                          <td style={styles.td}>{d.pesoRN}g</td>
                          <td style={styles.td}>{d.apgar1}/{d.apgar5}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Tab: Logs */}
        {activeTab === 'logs' && (
          <div style={styles.logsPanel}>
            <div style={styles.logsHeader}>
              <h2 style={styles.logsTitle}>📜 Registro de Actividad del Sistema</h2>
              <button onClick={exportarAuditoria} style={styles.btnPDF}>📕 Exportar PDF Auditoría</button>
            </div>
            {logsLoading ? (
              <p style={{ textAlign: 'center', padding: '40px' }}>⏳ Cargando logs...</p>
            ) : (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Fecha/Hora</th>
                      <th style={styles.th}>Usuario</th>
                      <th style={styles.th}>Rol</th>
                      <th style={styles.th}>Acción</th>
                      <th style={styles.th}>Módulo</th>
                      <th style={styles.th}>Descripción</th>
                      <th style={styles.th}>IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map(log => (
                      <tr key={log.id} style={styles.tr}>
                        <td style={styles.td}>{new Date(log.fecha_hora).toLocaleString()}</td>
                        <td style={styles.td}>{log.username}</td>
                        <td style={styles.td}><span style={styles.rolBadge}>{log.rol}</span></td>
                        <td style={styles.td}>{log.tipo_accion}</td>
                        <td style={styles.td}>{log.modulo}</td>
                        <td style={styles.td}>{log.descripcion}</td>
                        <td style={styles.td}>{log.ip_address || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab: Autorizaciones */}
        {activeTab === 'autorizaciones' && (
          <div style={styles.altasPanel}>
            <h2 style={styles.altasTitle}>✅ Altas Pendientes de Autorización</h2>
            {altasLoading ? (
              <p style={{ textAlign: 'center', padding: '40px' }}>⏳ Cargando...</p>
            ) : altasPendientes.length === 0 ? (
              <div style={styles.noAltas}>
                <span style={{ fontSize: '48px' }}>✨</span>
                <p>No hay altas pendientes de autorización</p>
              </div>
            ) : (
              <div style={styles.altasGrid}>
                {altasPendientes.map(alta => (
                  <div key={alta.id} style={styles.altaCard}>
                    <div style={styles.altaHeader}>
                      <span style={styles.altaTipo}>{alta.tipo}</span>
                      <span style={styles.altaId}>ID: {alta.id}</span>
                    </div>
                    <div style={styles.altaBody}>
                      <p><strong>Parto:</strong> #{alta.parto}</p>
                      <p><strong>Madre:</strong> {alta.madre_nombre || 'N/A'}</p>
                      <p><strong>Solicitado por:</strong> {alta.solicitante}</p>
                      <p><strong>Fecha:</strong> {alta.fecha_solicitud ? new Date(alta.fecha_solicitud).toLocaleString() : 'N/A'}</p>
                      {alta.observaciones && <p><strong>Obs:</strong> {alta.observaciones}</p>}
                    </div>
                    <div style={styles.altaActions}>
                      <button onClick={() => handleAutorizar(alta)} style={styles.btnAutorizar}>✅ Autorizar</button>
                      <button onClick={() => handleRechazar(alta)} style={styles.btnRechazar}>❌ Rechazar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: { fontFamily: "'Poppins', sans-serif", minHeight: 'calc(100vh - 60px)', padding: '20px' },
  content: { maxWidth: '1300px', margin: '0 auto' },
  header: { marginBottom: '20px' },
  title: { fontSize: '24px', fontWeight: 700, color: '#1a365d', margin: 0 },
  mainTabs: { display: 'flex', gap: '10px', marginBottom: '20px' },
  mainTabBtn: { padding: '12px 24px', border: '2px solid #007bff', borderRadius: '8px', backgroundColor: 'white', color: '#007bff', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Poppins', sans-serif", display: 'flex', alignItems: 'center', gap: '8px' },
  mainTabBtnActive: { backgroundColor: '#007bff', color: 'white' },
  badge: { backgroundColor: '#dc3545', color: 'white', borderRadius: '50%', padding: '2px 8px', fontSize: '12px', marginLeft: '5px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '15px', marginBottom: '20px' },
  statCard: { backgroundColor: '#e8f3ff', padding: '15px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' },
  statIcon: { fontSize: '28px' },
  statNumber: { display: 'block', fontSize: '22px', fontWeight: 700, color: '#1a365d' },
  statLabel: { fontSize: '11px', color: '#666' },
  filtrosPanel: { backgroundColor: '#e8f3ff', padding: '20px', borderRadius: '12px', marginBottom: '20px' },
  filtrosTitle: { fontSize: '16px', fontWeight: 600, color: '#1a365d', margin: '0 0 15px 0' },
  filtrosGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px', marginBottom: '15px' },
  formGroup: {},
  label: { display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 500, color: '#495057' },
  input: { width: '100%', padding: '8px 10px', border: '1px solid #c1d9e7', borderRadius: '6px', fontSize: '13px', fontFamily: "'Poppins', sans-serif", boxSizing: 'border-box', backgroundColor: 'white' },
  filtrosBotones: { display: 'flex', justifyContent: 'flex-end', gap: '10px' },
  btnSecondary: { padding: '8px 16px', border: '1px solid #c1d9e7', borderRadius: '6px', backgroundColor: 'white', cursor: 'pointer', fontSize: '13px', fontFamily: "'Poppins', sans-serif" },
  btnPrimary: { padding: '8px 20px', border: 'none', borderRadius: '6px', backgroundColor: '#007bff', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '13px', fontFamily: "'Poppins', sans-serif" },
  resultadosPanel: { backgroundColor: '#e8f3ff', borderRadius: '12px', overflow: 'hidden' },
  resultadosHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid #c1d9e7' },
  resultadosTitle: { fontSize: '16px', fontWeight: 600, color: '#1a365d', margin: 0 },
  exportBtns: { display: 'flex', gap: '10px' },
  btnExcel: { padding: '6px 14px', border: 'none', borderRadius: '6px', backgroundColor: '#28a745', color: 'white', fontWeight: 500, cursor: 'pointer', fontSize: '12px', fontFamily: "'Poppins', sans-serif" },
  btnPDF: { padding: '6px 14px', border: 'none', borderRadius: '6px', backgroundColor: '#dc3545', color: 'white', fontWeight: 500, cursor: 'pointer', fontSize: '12px', fontFamily: "'Poppins', sans-serif" },
  tableContainer: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { backgroundColor: '#1a365d', color: 'white', padding: '10px 8px', textAlign: 'left', fontSize: '11px', fontWeight: 600 },
  tr: { borderBottom: '1px solid #c1d9e7', backgroundColor: 'white' },
  td: { padding: '8px', fontSize: '12px', color: '#495057' },
  badge2: { display: 'inline-block', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 600, color: 'white' },
  logsPanel: { backgroundColor: '#e8f3ff', borderRadius: '12px', overflow: 'hidden' },
  logsHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid #c1d9e7' },
  logsTitle: { fontSize: '16px', fontWeight: 600, color: '#1a365d', margin: 0 },
  rolBadge: { display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 600, backgroundColor: '#6c757d', color: 'white' },
  altasPanel: { backgroundColor: '#e8f3ff', borderRadius: '12px', padding: '20px' },
  altasTitle: { fontSize: '18px', fontWeight: 600, color: '#1a365d', margin: '0 0 20px 0' },
  noAltas: { textAlign: 'center', padding: '60px', color: '#666' },
  altasGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
  altaCard: { backgroundColor: 'white', borderRadius: '10px', border: '2px solid #ffc107', overflow: 'hidden' },
  altaHeader: { backgroundColor: '#ffc107', padding: '10px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  altaTipo: { fontWeight: 600, color: '#856404' },
  altaId: { fontSize: '12px', color: '#856404' },
  altaBody: { padding: '15px', fontSize: '13px', color: '#495057' },
  altaActions: { padding: '10px 15px', borderTop: '1px solid #e0e6ed', display: 'flex', gap: '10px' },
  btnAutorizar: { flex: 1, padding: '8px', border: 'none', borderRadius: '6px', backgroundColor: '#28a745', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '12px', fontFamily: "'Poppins', sans-serif" },
  btnRechazar: { flex: 1, padding: '8px', border: 'none', borderRadius: '6px', backgroundColor: '#dc3545', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '12px', fontFamily: "'Poppins', sans-serif" },
};