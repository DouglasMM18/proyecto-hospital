import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

interface MadreFormData {
  // Datos personales
  run: string;
  dv: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  fechaNacimiento: string;
  nacionalidad: string;
  inmigrante: boolean;
  privadaLibertad: boolean;
  puebloOriginario: boolean;
  puebloOriginarioTipo: string;
  transMasculino: boolean;
  discapacidad: boolean;
  discapacidadTipo: string;
  // Contacto
  direccion: string;
  region: string;
  ciudad: string;
  comuna: string;
  telefono: string;
  correo: string;
  // Datos ingreso
  tipoPaciente: string;
  origenIngreso: string;
  consultorioOrigen: string;
  planParto: string;
  visitaGuiada: string;
  acompanamiento: boolean;
  motivoNoAcomp: string;
  parentezcoAcomp: string;
  nombreAcomp: string;
  runAcomp: string;
}

const initialFormData: MadreFormData = {
  run: '', dv: '', nombre: '', apellidoPaterno: '', apellidoMaterno: '',
  fechaNacimiento: '', nacionalidad: '', inmigrante: false, privadaLibertad: false,
  puebloOriginario: false, puebloOriginarioTipo: '', transMasculino: false,
  discapacidad: false, discapacidadTipo: '', direccion: '', region: '', ciudad: '',
  comuna: '', telefono: '', correo: '', tipoPaciente: '', origenIngreso: '',
  consultorioOrigen: '', planParto: '', visitaGuiada: '', acompanamiento: true,
  motivoNoAcomp: '', parentezcoAcomp: '', nombreAcomp: '', runAcomp: '',
};

export default function MadreFormPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState<MadreFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRadioChange = (name: string, value: boolean | string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Cálculo del dígito verificador chileno
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
    const run = e.target.value.replace(/[^0-9]/g, '');
    setFormData(prev => ({
      ...prev,
      run,
      dv: run.length >= 7 ? calculateDV(run) : ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        rut: `${formData.run}-${formData.dv}`,
        nombre_completo: `${formData.nombre} ${formData.apellidoPaterno} ${formData.apellidoMaterno}`,
        fecha_nacimiento: formData.fechaNacimiento,
        comuna: formData.comuna,
        cesfam: formData.consultorioOrigen,
        nacionalidad: formData.nacionalidad,
        es_migrante: formData.inmigrante,
        pueblo_originario: formData.puebloOriginario,
      };

      await api.post('/api/madres/', payload);
      navigate('/madres');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error.response?.data?.detail || 'Error al guardar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = ['Datos Personales', 'Contacto y Ubicación', 'Datos de Ingreso'];

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <h1 style={styles.formTitle}>Registro de Ingreso - Datos de la Madre</h1>

        {/* Tabs */}
        <div style={styles.tabs}>
          {tabs.map((tab, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveTab(index)}
              style={{
                ...styles.tabButton,
                ...(activeTab === index ? styles.tabButtonActive : {})
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Tab 1: Datos Personales */}
          <div style={{ display: activeTab === 0 ? 'block' : 'none' }}>
            <h2 style={styles.sectionTitle}>Identificación y Contexto Social</h2>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>RUN</label>
                <div style={styles.runGroup}>
                  <input
                    type="text"
                    name="run"
                    value={formData.run}
                    onChange={handleRunChange}
                    placeholder="Ej: 12345678"
                    style={{ ...styles.input, flex: 1 }}
                    required
                  />
                  <input
                    type="text"
                    name="dv"
                    value={formData.dv}
                    style={{ ...styles.input, width: '50px', textAlign: 'center' }}
                    disabled
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Nombre</label>
                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} style={styles.input} required />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Apellido Paterno</label>
                <input type="text" name="apellidoPaterno" value={formData.apellidoPaterno} onChange={handleChange} style={styles.input} required />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Apellido Materno</label>
                <input type="text" name="apellidoMaterno" value={formData.apellidoMaterno} onChange={handleChange} style={styles.input} required />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Fecha de Nacimiento</label>
                <input type="date" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} style={styles.input} required />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Nacionalidad</label>
                <select name="nacionalidad" value={formData.nacionalidad} onChange={handleChange} style={styles.input} required>
                  <option value="">Seleccione...</option>
                  <option value="Chilena">Chilena</option>
                  <option value="Venezolana">Venezolana</option>
                  <option value="Haitiana">Haitiana</option>
                  <option value="Peruana">Peruana</option>
                  <option value="Otra">Otra</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Condiciones Especiales:</label>
                <div style={styles.checkboxGroup}>
                  <label style={styles.checkboxLabel}>
                    <input type="checkbox" name="inmigrante" checked={formData.inmigrante} onChange={handleChange} />
                    ¿Inmigrante?
                  </label>
                  <label style={styles.checkboxLabel}>
                    <input type="checkbox" name="privadaLibertad" checked={formData.privadaLibertad} onChange={handleChange} />
                    Privada de Libertad
                  </label>
                </div>
              </div>

              <div style={styles.formGroup}>
                <div style={styles.checkboxGroup}>
                  <label style={styles.checkboxLabel}>
                    <input type="checkbox" name="puebloOriginario" checked={formData.puebloOriginario} onChange={handleChange} />
                    ¿Pueblo Originario?
                  </label>
                  <label style={styles.checkboxLabel}>
                    <input type="checkbox" name="transMasculino" checked={formData.transMasculino} onChange={handleChange} />
                    Trans Masculino
                  </label>
                </div>
              </div>

              {formData.puebloOriginario && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Pueblo Originario</label>
                  <select name="puebloOriginarioTipo" value={formData.puebloOriginarioTipo} onChange={handleChange} style={styles.input}>
                    <option value="">Seleccione...</option>
                    <option value="Mapuche">Mapuche</option>
                    <option value="Aymara">Aymara</option>
                    <option value="Rapa Nui">Rapa Nui</option>
                    <option value="Quechua">Quechua</option>
                    <option value="Diaguita">Diaguita</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              )}

              <div style={styles.formGroup}>
                <label style={styles.checkboxLabel}>
                  <input type="checkbox" name="discapacidad" checked={formData.discapacidad} onChange={handleChange} />
                  ¿Tiene Discapacidad?
                </label>
              </div>

              {formData.discapacidad && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Tipo de Discapacidad</label>
                  <select name="discapacidadTipo" value={formData.discapacidadTipo} onChange={handleChange} style={styles.input}>
                    <option value="">Seleccione...</option>
                    <option value="Fisica">Física</option>
                    <option value="Sensorial">Sensorial (Visual/Auditiva)</option>
                    <option value="Mental">Mental (Cognitiva/Psíquica)</option>
                    <option value="Multiple">Múltiple</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Tab 2: Contacto */}
          <div style={{ display: activeTab === 1 ? 'block' : 'none' }}>
            <h2 style={styles.sectionTitle}>Ubicación y Contacto</h2>
            <div style={styles.formGrid}>
              <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
                <label style={styles.label}>Dirección</label>
                <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} style={styles.input} required />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Región</label>
                <select name="region" value={formData.region} onChange={handleChange} style={styles.input} required>
                  <option value="">Seleccione Región...</option>
                  <option value="16">Ñuble (XVI)</option>
                  <option value="08">Bío Bío (VIII)</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Ciudad</label>
                <input type="text" name="ciudad" value={formData.ciudad} onChange={handleChange} style={styles.input} required />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Comuna</label>
                <select name="comuna" value={formData.comuna} onChange={handleChange} style={styles.input} required>
                  <option value="">Seleccione Comuna...</option>
                  <option value="Chillán">Chillán</option>
                  <option value="Pinto">Pinto</option>
                  <option value="Coihueco">Coihueco</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Teléfono</label>
                <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="+569 xxxx xxxx" style={styles.input} required />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Correo Electrónico</label>
                <input type="email" name="correo" value={formData.correo} onChange={handleChange} style={styles.input} />
              </div>
            </div>
          </div>

          {/* Tab 3: Datos de Ingreso */}
          <div style={{ display: activeTab === 2 ? 'block' : 'none' }}>
            <h2 style={styles.sectionTitle}>Datos Administrativos y Plan de Atención</h2>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Tipo de Paciente</label>
                <select name="tipoPaciente" value={formData.tipoPaciente} onChange={handleChange} style={styles.input} required>
                  <option value="">Seleccione...</option>
                  <option value="GES">GES</option>
                  <option value="NO_GES">No GES</option>
                  <option value="PREVISIONAL">Previsional (ISAPRE/FONASA)</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Origen del Ingreso</label>
                <select name="origenIngreso" value={formData.origenIngreso} onChange={handleChange} style={styles.input} required>
                  <option value="">Seleccione...</option>
                  <option value="Urgencia">Urgencia</option>
                  <option value="Derivacion">Derivación</option>
                  <option value="Programado">Programado</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Consultorio/CESFAM Origen</label>
                <input type="text" name="consultorioOrigen" value={formData.consultorioOrigen} onChange={handleChange} placeholder="Ej: CESFAM Ultra Estación" style={styles.input} />
              </div>

              <div style={styles.formGroup}>
                <p style={styles.infoText}>
                  ✓ La Fecha y Hora de Ingreso se registrarán automáticamente al guardar los datos (Trazabilidad).
                </p>
              </div>
            </div>

            <h3 style={styles.subsectionTitle}>Planificación y Acompañamiento</h3>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Plan de Parto:</label>
                <div style={styles.radioGroup}>
                  <label style={styles.radioLabel}>
                    <input type="radio" name="planParto" checked={formData.planParto === 'SI'} onChange={() => handleRadioChange('planParto', 'SI')} /> Sí
                  </label>
                  <label style={styles.radioLabel}>
                    <input type="radio" name="planParto" checked={formData.planParto === 'NO'} onChange={() => handleRadioChange('planParto', 'NO')} /> No
                  </label>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Visita Guiada:</label>
                <div style={styles.radioGroup}>
                  <label style={styles.radioLabel}>
                    <input type="radio" name="visitaGuiada" checked={formData.visitaGuiada === 'SI'} onChange={() => handleRadioChange('visitaGuiada', 'SI')} /> Sí
                  </label>
                  <label style={styles.radioLabel}>
                    <input type="radio" name="visitaGuiada" checked={formData.visitaGuiada === 'NO'} onChange={() => handleRadioChange('visitaGuiada', 'NO')} /> No
                  </label>
                </div>
              </div>

              <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
                <label style={styles.label}>Acompañamiento Pre-Parto (Ley 20.584):</label>
                <div style={styles.radioGroup}>
                  <label style={styles.radioLabel}>
                    <input type="radio" name="acompanamiento" checked={formData.acompanamiento === true} onChange={() => handleRadioChange('acompanamiento', true)} /> Sí (Acompañado)
                  </label>
                  <label style={styles.radioLabel}>
                    <input type="radio" name="acompanamiento" checked={formData.acompanamiento === false} onChange={() => handleRadioChange('acompanamiento', false)} /> No (Sin Acompañante)
                  </label>
                </div>
              </div>
            </div>

            {!formData.acompanamiento && (
              <div style={styles.conditionalSection}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Motivo Parto No Acompañado</label>
                  <input type="text" name="motivoNoAcomp" value={formData.motivoNoAcomp} onChange={handleChange} style={styles.input} />
                </div>
              </div>
            )}

            {formData.acompanamiento && (
              <div style={styles.conditionalSection}>
                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Parentesco Acompañante</label>
                    <select name="parentezcoAcomp" value={formData.parentezcoAcomp} onChange={handleChange} style={styles.input}>
                      <option value="">Seleccione...</option>
                      <option value="Pareja">Pareja</option>
                      <option value="Madre">Madre</option>
                      <option value="Hermano">Hermano/a</option>
                      <option value="Amigo">Amigo/a</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Nombre Acompañante</label>
                    <input type="text" name="nombreAcomp" value={formData.nombreAcomp} onChange={handleChange} style={styles.input} />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>RUN Acompañante</label>
                    <input type="text" name="runAcomp" value={formData.runAcomp} onChange={handleChange} placeholder="Ej: 12345678-9" style={styles.input} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <button type="submit" disabled={isLoading} style={styles.submitButton}>
            {isLoading ? 'Guardando...' : '💾 Guardar Ficha Administrativa'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    fontFamily: "'Poppins', sans-serif",
    backgroundColor: '#f5f7fa',
    minHeight: '100vh',
    padding: '30px',
  },
  formContainer: {
    maxWidth: '1000px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
    padding: '30px',
  },
  formTitle: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#007bff',
    marginBottom: '25px',
    borderBottom: '2px solid #007bff',
    paddingBottom: '5px',
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid #e0e6ed',
    marginBottom: '20px',
  },
  tabButton: {
    backgroundColor: 'transparent',
    border: 'none',
    padding: '10px 20px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 500,
    color: '#495057',
    borderBottom: '3px solid transparent',
    transition: 'all 0.2s',
  },
  tabButtonActive: {
    color: '#007bff',
    borderBottomColor: '#007bff',
    fontWeight: 600,
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#495057',
    marginBottom: '20px',
  },
  subsectionTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#495057',
    marginTop: '30px',
    borderBottom: '1px solid #e0e6ed',
    paddingBottom: '10px',
  },
  formGrid: {
    display: 'grid',
    gap: '20px',
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  formGroup: {
    marginBottom: 0,
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 500,
    color: '#495057',
    fontSize: '14px',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e0e6ed',
    borderRadius: '8px',
    boxSizing: 'border-box',
    fontFamily: "'Poppins', sans-serif",
    fontSize: '15px',
  },
  runGroup: {
    display: 'flex',
    gap: '5px',
  },
  checkboxGroup: {
    display: 'flex',
    gap: '15px',
    padding: '10px 0',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    cursor: 'pointer',
  },
  radioGroup: {
    display: 'flex',
    gap: '20px',
    padding: '5px 0',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    cursor: 'pointer',
  },
  conditionalSection: {
    marginTop: '15px',
    padding: '15px',
    border: '1px dashed #e0e6ed',
    borderRadius: '8px',
    backgroundColor: '#e8f3ff',
  },
  infoText: {
    fontSize: '12px',
    color: '#28a745',
    fontWeight: 500,
  },
  submitButton: {
    backgroundColor: '#28a745',
    color: 'white',
    padding: '12px 25px',
    border: 'none',
    borderRadius: '10px',
    fontWeight: 600,
    fontSize: '16px',
    cursor: 'pointer',
    float: 'right',
    marginTop: '30px',
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '10px',
    borderRadius: '8px',
    marginBottom: '20px',
  },
};