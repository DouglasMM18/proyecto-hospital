import { useState } from 'react';
import EnfermeraPage from '../enfermera/EnfermeraPage';
import EspecialistaPage from '../especialista/EspecialistaPage';

export default function MatronaPage() {
  const [vistaActual, setVistaActual] = useState<'enfermera' | 'informes'>('enfermera');

  return (
    <div>
      {/* Selector de vista */}
      <div style={styles.selectorContainer}>
        <div style={styles.selector}>
          <span style={styles.selectorLabel}>Vista:</span>
          <button
            onClick={() => setVistaActual('enfermera')}
            style={{
              ...styles.selectorBtn,
              ...(vistaActual === 'enfermera' ? styles.selectorBtnActive : {}),
            }}
          >
            🏥 Registro Clínico
          </button>
          <button
            onClick={() => setVistaActual('informes')}
            style={{
              ...styles.selectorBtn,
              ...(vistaActual === 'informes' ? styles.selectorBtnActive : {}),
            }}
          >
            📊 Generar Informes
          </button>
        </div>
      </div>

      {/* Vista seleccionada */}
      {vistaActual === 'enfermera' ? <EnfermeraPage /> : <EspecialistaPage />}
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
};