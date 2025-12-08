import { useState } from 'react';
import api from '../../api/axios';
import type { Madre } from '../../types/models';

interface Props {
  onPacienteEncontrado: (madre: Madre | null) => void;
  onRutChange: (rut: string, dv: string) => void;
}

export default function BuscarPaciente({ onPacienteEncontrado, onRutChange }: Props) {
  const [run, setRun] = useState('');
  const [dv, setDv] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: 'success' | 'info' | 'error' } | null>(null);

  const calculateDV = (run: string): string => {
    const cleanRun = run.replace(/\./g, '');
    let M = 0, S = 1;
    let num = parseInt(cleanRun);
    for (; num; num = Math.floor(num / 10)) {
      S = (S + (num % 10) * (9 - M++ % 6)) % 11;
    }
    return S ? String(S - 1) : 'K';
  };

  const handleRunChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setRun(value);
    const calculatedDv = value.length >= 7 ? calculateDV(value) : '';
    setDv(calculatedDv);
    onRutChange(value, calculatedDv);
    setMensaje(null);
  };

  const buscarPaciente = async () => {
    if (run.length < 7) {
      setMensaje({ texto: 'Ingrese al menos 7 dígitos del RUN', tipo: 'error' });
      return;
    }

    setBuscando(true);
    setMensaje(null);

    try {
      const rutCompleto = `${run}-${dv}`;
      const response = await api.get(`/api/madres/?rut=${rutCompleto}`);
      
      if (response.data && response.data.length > 0) {
        const madre = response.data[0];
        onPacienteEncontrado(madre);
        setMensaje({ texto: 'Paciente encontrada. Datos cargados.', tipo: 'success' });
      } else {
        onPacienteEncontrado(null);
        setMensaje({ texto: 'Paciente no registrada. Complete los datos para nuevo ingreso.', tipo: 'info' });
      }
    } catch {
      setMensaje({ texto: 'Error al buscar paciente', tipo: 'error' });
    } finally {
      setBuscando(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.searchBox}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>RUN Paciente</label>
          <div style={styles.runGroup}>
            <input
              type="text"
              value={run}
              onChange={handleRunChange}
              placeholder="Ej: 12345678"
              style={styles.inputRun}
              maxLength={9}
            />
            <input
              type="text"
              value={dv}
              style={styles.inputDv}
              disabled
              placeholder="DV"
            />
            <button
              type="button"
              onClick={buscarPaciente}
              disabled={buscando || run.length < 7}
              style={{
                ...styles.btnBuscar,
                opacity: buscando || run.length < 7 ? 0.6 : 1
              }}
            >
              {buscando ? '🔄' : '🔍'} Buscar
            </button>
          </div>
        </div>
      </div>
      
      {mensaje && (
        <div style={{
          ...styles.mensaje,
          backgroundColor: mensaje.tipo === 'success' ? '#d4edda' : mensaje.tipo === 'info' ? '#e8f3ff' : '#fee2e2',
          color: mensaje.tipo === 'success' ? '#155724' : mensaje.tipo === 'info' ? '#004085' : '#dc2626',
        }}>
          {mensaje.tipo === 'success' && '✓ '}
          {mensaje.tipo === 'info' && 'ℹ '}
          {mensaje.tipo === 'error' && '⚠ '}
          {mensaje.texto}
        </div>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    marginBottom: '25px',
  },
  searchBox: {
    backgroundColor: '#e8f3ff',
    padding: '20px',
    borderRadius: '10px',
    border: '2px solid #007bff',
  },
  inputGroup: {},
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 600,
    color: '#495057',
    fontSize: '14px',
  },
  runGroup: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  inputRun: {
    flex: 1,
    maxWidth: '200px',
    padding: '12px',
    border: '1px solid #e0e6ed',
    borderRadius: '8px',
    fontSize: '16px',
    fontFamily: "'Poppins', sans-serif",
  },
  inputDv: {
    width: '50px',
    padding: '12px',
    border: '1px solid #e0e6ed',
    borderRadius: '8px',
    fontSize: '16px',
    textAlign: 'center',
    backgroundColor: '#f5f5f5',
    fontFamily: "'Poppins', sans-serif",
  },
  btnBuscar: {
    padding: '12px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'Poppins', sans-serif",
  },
  mensaje: {
    marginTop: '15px',
    padding: '12px 15px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
  },
};