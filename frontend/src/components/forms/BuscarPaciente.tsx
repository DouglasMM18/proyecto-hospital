import { useState } from 'react';
import { madresApi } from '../../api/MadresApi';
import type { Madre } from '../../types/models';

interface Props {
  onPacienteEncontrado: (madre: Madre | null) => void;
  onRutChange?: (rut: string, dv: string) => void;
}

export default function BuscarPaciente({ onPacienteEncontrado, onRutChange }: Props) {
  const [rutInput, setRutInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error' | 'info'; texto: string } | null>(null);

  const formatearRut = (value: string) => {
    let rut = value.replace(/[^0-9kK]/g, '');
    if (rut.length > 1) {
      const dv = rut.slice(-1);
      let cuerpo = rut.slice(0, -1);
      cuerpo = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      rut = `${cuerpo}-${dv}`;
    }
    return rut.toUpperCase();
  };

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatearRut(e.target.value);
    setRutInput(formatted);
    
    if (onRutChange) {
      const parts = formatted.split('-');
      const cuerpo = parts[0]?.replace(/\./g, '') || '';
      const dv = parts[1] || '';
      onRutChange(cuerpo, dv);
    }
    
    setMensaje(null);
  };

  const buscarPaciente = async () => {
    if (rutInput.length < 3) {
      setMensaje({ tipo: 'error', texto: 'Ingrese un RUT válido' });
      return;
    }

    setIsLoading(true);
    setMensaje(null);

    try {
      const madre = await madresApi.buscarPorRut(rutInput);
      
      if (madre) {
        setMensaje({ tipo: 'success', texto: `Paciente encontrada: ${madre.nombre_completo}` });
        onPacienteEncontrado(madre);
      } else {
        setMensaje({ tipo: 'info', texto: 'Paciente no encontrada. Puede registrar una nueva.' });
        onPacienteEncontrado(null);
      }
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error al buscar paciente. Verifique la conexión.' });
      onPacienteEncontrado(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      buscarPaciente();
    }
  };

  return (
    <div style={styles.searchBox}>
      <div style={styles.searchRow}>
        <div style={styles.inputContainer}>
          <label style={styles.label}>RUT Paciente</label>
          <input
            type="text"
            value={rutInput}
            onChange={handleRutChange}
            onKeyPress={handleKeyPress}
            placeholder="12.345.678-9"
            style={styles.input}
            maxLength={12}
          />
        </div>
        <button
          type="button"
          onClick={buscarPaciente}
          disabled={isLoading}
          style={styles.searchBtn}
        >
          {isLoading ? '⏳' : '🔍'} Buscar
        </button>
      </div>

      {mensaje && (
        <div style={{
          ...styles.mensaje,
          backgroundColor: mensaje.tipo === 'success' ? '#d4edda' : mensaje.tipo === 'error' ? '#f8d7da' : '#cce5ff',
          color: mensaje.tipo === 'success' ? '#155724' : mensaje.tipo === 'error' ? '#721c24' : '#004085',
        }}>
          {mensaje.texto}
        </div>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  searchBox: {
    backgroundColor: '#e8f3ff',
    padding: '20px',
    borderRadius: '10px',
    marginBottom: '20px',
    border: '2px solid #007bff',
  },
  searchRow: {
    display: 'flex',
    gap: '15px',
    alignItems: 'flex-end',
  },
  inputContainer: {
    flex: 1,
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#1a365d',
  },
  input: {
    width: '100%',
    padding: '12px 15px',
    border: '1px solid #c1d9e7',
    borderRadius: '8px',
    fontSize: '16px',
    fontFamily: "'Poppins', sans-serif",
    boxSizing: 'border-box',
  },
  searchBtn: {
    padding: '12px 25px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'Poppins', sans-serif",
    whiteSpace: 'nowrap',
  },
  mensaje: {
    marginTop: '15px',
    padding: '10px 15px',
    borderRadius: '8px',
    fontSize: '14px',
  },
};