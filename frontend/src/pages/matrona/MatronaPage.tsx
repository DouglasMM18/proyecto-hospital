import { useState, useEffect } from 'react';
import EnfermeraPage from '../enfermera/EnfermeraPage';
import EspecialistaPage from '../especialista/EspecialistaPage';
import api from '../../api/axios';

export default function MatronaPage() {
  const [vistaActual, setVistaActual] = useState<'enfermera' | 'informes'>('enfermera');
  // Nuevo estado para controlar qué pestaña abrir en la vista de especialista
  const [tabInicialEspecialista, setTabInicialEspecialista] = useState<'informes' | 'logs' | 'autorizaciones'>('informes');
  const [altasPendientes, setAltasPendientes] = useState<number>(0);

  // --- BUSCAR NOTIFICACIONES (Altas Pendientes) ---
  useEffect(() => {
    const checkPendientes = async () => {
      try {
        const response = await api.get('/api/altas/');
        const pendientes = response.data.filter((alta: any) => alta.estado === 'PENDIENTE');
        setAltasPendientes(pendientes.length);
      } catch (error) {
        console.error("Error buscando notificaciones:", error);
      }
    };

    checkPendientes();
    // Actualizar cada 15 segundos para efecto tiempo real
    const interval = setInterval(checkPendientes, 15000);
    return () => clearInterval(interval);
  }, []);

  // Función para ir directo a las solicitudes
  const handleVerSolicitudes = () => {
    setTabInicialEspecialista('autorizaciones'); // Configura la pestaña
    setVistaActual('informes'); // Cambia la vista
  };

  const cambiarVista = (vista: 'enfermera' | 'informes') => {
    if (vista === 'informes') setTabInicialEspecialista('informes'); // Resetear a default
    setVistaActual(vista);
  };

  return (
    <div>
      {/* 🔔 BARRA DE NOTIFICACIÓN */}
      {altasPendientes > 0 && (
        <div style={styles.notificationBanner}>
          <div style={styles.notificationContent}>
            <span style={{ fontSize: '20px' }}>🔔</span>
            <div>
              <strong>¡Atención Matrona!</strong>
              <div style={{ fontSize: '14px' }}>
                Tienes <strong style={{ textDecoration: 'underline' }}>{altasPendientes} solicitud(es) de Alta Médica</strong> esperando tu aprobación.
              </div>
            </div>
          </div>
          <button 
            onClick={handleVerSolicitudes} 
            style={styles.notificationButton}
          >
            Ver Solicitudes →
          </button>
        </div>
      )}

      {/* Selector de vista */}
      <div style={styles.selectorContainer}>
        <div style={styles.selector}>
          <span style={styles.selectorLabel}>Vista:</span>
          
          <button
            onClick={() => cambiarVista('enfermera')}
            style={{
              ...styles.selectorBtn,
              ...(vistaActual === 'enfermera' ? styles.selectorBtnActive : {}),
            }}
          >
            🏥 Registro Clínico
          </button>

          <button
            onClick={() => cambiarVista('informes')}
            style={{
              ...styles.selectorBtn,
              ...(vistaActual === 'informes' ? styles.selectorBtnActive : {}),
              position: 'relative'
            }}
          >
            📊 Gestión e Informes
            
            {altasPendientes > 0 && (
              <span style={styles.badge}>
                {altasPendientes}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Vista seleccionada */}
      {vistaActual === 'enfermera' ? (
        <EnfermeraPage /> 
      ) : (
        // Pasamos la prop para que sepa qué tab abrir
        <EspecialistaPage initialTab={tabInicialEspecialista} /> 
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  selectorContainer: {
    backgroundColor: '#d6eaff',
    padding: '15px 20px',
    borderBottom: '2px solid #007bff',
  },
  selector: {
    maxWidth: '1100px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  selectorLabel: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#1a365d',
  },
  selectorBtn: {
    padding: '10px 20px',
    border: '2px solid #007bff',
    borderRadius: '8px',
    backgroundColor: 'white',
    color: '#007bff',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'Poppins', sans-serif",
    transition: 'all 0.2s',
  },
  selectorBtnActive: {
    backgroundColor: '#007bff',
    color: 'white',
  },
  notificationBanner: {
    backgroundColor: '#fff3cd',
    borderBottom: '1px solid #ffeeba',
    color: '#856404',
    padding: '15px 20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '30px',
    animation: 'slideDown 0.5s ease-out',
  },
  notificationContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  notificationButton: {
    backgroundColor: '#ffc107',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
    color: '#333',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
  },
  badge: {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    backgroundColor: '#dc3545',
    color: 'white',
    borderRadius: '50%',
    width: '22px',
    height: '22px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
    border: '2px solid white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
  }
};