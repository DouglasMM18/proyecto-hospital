import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import BuscarPaciente from '../../components/forms/BuscarPaciente';
import type { Madre } from '../../types/models';

interface FormData {
  // Identificación
  id: number | null;
  run: string;
  dv: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  fechaNacimiento: string;
  nacionalidad: string;
  // Condiciones especiales
  esMigrante: boolean;
  puebloOriginario: boolean;
  puebloOriginarioTipo: string;
  privadaLibertad: boolean;
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
  // Ingreso
  tipoPaciente: string;
  origenIngreso: string;
  cesfam: string;
  planParto: string;
  visitaGuiada: string;
  // Acompañamiento
  tieneAcompanante: boolean;
  motivoSinAcompanante: string;
  parentescoAcompanante: string;
  nombreAcompanante: string;
  runAcompanante: string;
}

const initialFormData: FormData = {
  id: null,
  run: '', dv: '', nombre: '', apellidoPaterno: '', apellidoMaterno: '',
  fechaNacimiento: '', nacionalidad: '',
  esMigrante: false, puebloOriginario: false, puebloOriginarioTipo: '',
  privadaLibertad: false, transMasculino: false, discapacidad: false, discapacidadTipo: '',
  direccion: '', region: '', ciudad: '', comuna: '', telefono: '', correo: '',
  tipoPaciente: '', origenIngreso: '', cesfam: '', planParto: '', visitaGuiada: '',
  tieneAcompanante: true, motivoSinAcompanante: '', parentescoAcompanante: '',
  nombreAcompanante: '', runAcompanante: '',
};

export default function AdministrativoPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const navigate = useNavigate();

  const handlePacienteEncontrado = (madre: Madre | null) => {
    if (madre) {
      // Separar nombre completo en partes
      const nombrePartes = madre.nombre_completo.split(' ');
      const nombre = nombrePartes[0] || '';
      const apellidoPaterno = nombrePartes[1] || '';
      const apellidoMaterno = nombrePartes.slice(2).join(' ') || '';

      // Separar RUT
      const rutPartes = madre.rut.split('-');

      setFormData(prev => ({
        ...prev,
        id: madre.id,
        run: rutPartes[0] || '',
        dv: rutPartes[1] || '',
        nombre,
        apellidoPaterno,
        apellidoMaterno,
        fechaNacimiento: madre.fecha_nacimiento,
        comuna: madre.comuna,
        cesfam: madre.cesfam || '',
        nacionalidad: madre.nacionalidad,
        esMigrante: madre.es_migrante,
        puebloOriginario: madre.pueblo_originario,
      }));
      setModoEdicion(true);
    } else {
      setFormData(prev => ({ ...initialFormData, run: prev.run, dv: prev.dv }));
      setModoEdicion(false);
    }
  };

  const handleRutChange = (rut: string, dv: string) => {
    setFormData(prev => ({ ...prev, run: rut, dv }));
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        rut: `${formData.run}-${formData.dv}`,
        nombre_completo: `${formData.nombre} ${formData.apellidoPaterno} ${formData.apellidoMaterno}`.trim(),
        fecha_nacimiento: formData.fechaNacimiento,
        comuna: formData.comuna,
        cesfam: formData.cesfam || null,
        nacionalidad: formData.nacionalidad,
        es_migrante: formData.esMigrante,
        pueblo_originario: formData.puebloOriginario,
      };

      if (modoEdicion && formData.id) {
        await api.put(`/api/madres/${formData.id}/`, payload);
      } else {
        await api.post('/api/madres/', payload);
      }

      navigate('/');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error.response?.data?.detail || 'Error al guardar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { icon: '👤', label: 'Datos Personales' },
    { icon: '📍', label: 'Contacto y Ubicación' },
    { icon: '📋', label: 'Datos de Ingreso' },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <h1 style={styles.formTitle}>
          {modoEdicion ? '📝 Editar Ficha' : '📋 Nuevo Ingreso'} - Datos de la Madre
        </h1>

        <BuscarPaciente
          onPacienteEncontrado={handlePacienteEncontrado}
          onRutChange={handleRutChange}
        />

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
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Tab 1: Datos Personales */}
          <div style={{ display: activeTab === 0 ? 'block' : 'none' }}>
            <h2 style={styles.sectionTitle}>Identificación</h2>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>RUN</label>
                <div style={styles.runDisplay}>
                  <span style={styles.runText}>{formData.run || '--------'}</span>
                  <span style={styles.runSeparator}>-</span>
                  <span style={styles.runText}>{formData.dv || '-'}</span>
                </div>
                <small style={styles.hint}>Use el buscador de arriba para ingresar el RUN</small>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Apellido Paterno</label>
                <input
                  type="text"
                  name="apellidoPaterno"
                  value={formData.apellidoPaterno}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Apellido Materno</label>
                <input
                  type="text"
                  name="apellidoMaterno"
                  value={formData.apellidoMaterno}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Fecha de Nacimiento</label>
                <input
                  type="date"
                  name="fechaNacimiento"
                  value={formData.fechaNacimiento}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Nacionalidad</label>
                <select
                  name="nacionalidad"
                  value={formData.nacionalidad}
                  onChange={handleChange}
                  style={styles.input}
                  required
                >
                  <option value="">Seleccione...</option>
                  <option value="Chilena">Chilena</option>
                  <option value="Venezolana">Venezolana</option>
                  <option value="Haitiana">Haitiana</option>
                  <option value="Peruana">Peruana</option>
                  <option value="Colombiana">Colombiana</option>
                  <option value="Boliviana">Boliviana</option>
                  <option value="Otra">Otra</option>
                </select>
              </div>
            </div>

            <h2 style={styles.sectionTitle}>Condiciones Especiales</h2>
            <div style={styles.condicionesGrid}>
              {/* Fila 1 */}
              <div style={styles.condicionItem}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="esMigrante"
                    checked={formData.esMigrante}
                    onChange={handleChange}
                    style={styles.checkbox}
                  />
                  <span>Migrante</span>
                </label>
              </div>

              <div style={styles.condicionItem}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="puebloOriginario"
                    checked={formData.puebloOriginario}
                    onChange={handleChange}
                    style={styles.checkbox}
                  />
                  <span>Pueblo Originario</span>
                </label>
              </div>

              <div style={styles.condicionItem}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="privadaLibertad"
                    checked={formData.privadaLibertad}
                    onChange={handleChange}
                    style={styles.checkbox}
                  />
                  <span>Privada de Libertad</span>
                </label>
              </div>

              {/* Fila 2 */}
              <div style={styles.condicionItem}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="transMasculino"
                    checked={formData.transMasculino}
                    onChange={handleChange}
                    style={styles.checkbox}
                  />
                  <span>Trans Masculino</span>
                </label>
              </div>

              <div style={styles.condicionItem}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="discapacidad"
                    checked={formData.discapacidad}
                    onChange={handleChange}
                    style={styles.checkbox}
                  />
                  <span>Discapacidad</span>
                </label>
              </div>

              <div style={styles.condicionItem}></div>
            </div>

            {/* Selectores condicionales */}
            {formData.puebloOriginario && (
              <div style={styles.conditionalField}>
                <label style={styles.label}>Especifique Pueblo Originario</label>
                <select
                  name="puebloOriginarioTipo"
                  value={formData.puebloOriginarioTipo}
                  onChange={handleChange}
                  style={styles.input}
                >
                  <option value="">Seleccione...</option>
                  <option value="Mapuche">Mapuche</option>
                  <option value="Aymara">Aymara</option>
                  <option value="Rapa Nui">Rapa Nui</option>
                  <option value="Quechua">Quechua</option>
                  <option value="Diaguita">Diaguita</option>
                  <option value="Colla">Colla</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            )}

            {formData.discapacidad && (
              <div style={styles.conditionalField}>
                <label style={styles.label}>Tipo de Discapacidad</label>
                <select
                  name="discapacidadTipo"
                  value={formData.discapacidadTipo}
                  onChange={handleChange}
                  style={styles.input}
                >
                  <option value="">Seleccione...</option>
                  <option value="Fisica">Física</option>
                  <option value="Sensorial">Sensorial (Visual/Auditiva)</option>
                  <option value="Mental">Mental (Cognitiva/Psíquica)</option>
                  <option value="Multiple">Múltiple</option>
                </select>
              </div>
            )}
          </div>

          {/* Tab 2: Contacto y Ubicación */}
          <div style={{ display: activeTab === 1 ? 'block' : 'none' }}>
            <h2 style={styles.sectionTitle}>Ubicación</h2>
            <div style={styles.formGrid}>
              <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
                <label style={styles.label}>Dirección</label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Calle, número, depto/casa"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Región</label>
                <select
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  style={styles.input}
                >
                  <option value="">Seleccione...</option>
                  <option value="XVI">Ñuble (XVI)</option>
                  <option value="VIII">Bío Bío (VIII)</option>
                  <option value="VII">Maule (VII)</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Ciudad</label>
                <input
                  type="text"
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Comuna</label>
                <select
                  name="comuna"
                  value={formData.comuna}
                  onChange={handleChange}
                  style={styles.input}
                  required
                >
                  <option value="">Seleccione...</option>
                  <option value="Chillán">Chillán</option>
                  <option value="Chillán Viejo">Chillán Viejo</option>
                  <option value="Pinto">Pinto</option>
                  <option value="Coihueco">Coihueco</option>
                  <option value="San Carlos">San Carlos</option>
                  <option value="Ñiquén">Ñiquén</option>
                  <option value="San Fabián">San Fabián</option>
                </select>
              </div>
            </div>

            <h2 style={styles.sectionTitle}>Contacto</h2>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Teléfono</label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="+56 9 1234 5678"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Correo Electrónico</label>
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="ejemplo@correo.com"
                />
              </div>
            </div>
          </div>

          {/* Tab 3: Datos de Ingreso */}
          <div style={{ display: activeTab === 2 ? 'block' : 'none' }}>
            <h2 style={styles.sectionTitle}>Datos Administrativos</h2>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Tipo de Paciente</label>
                <select
                  name="tipoPaciente"
                  value={formData.tipoPaciente}
                  onChange={handleChange}
                  style={styles.input}
                >
                  <option value="">Seleccione...</option>
                  <option value="GES">GES</option>
                  <option value="NO_GES">No GES</option>
                  <option value="FONASA">FONASA</option>
                  <option value="ISAPRE">ISAPRE</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Origen del Ingreso</label>
                <select
                  name="origenIngreso"
                  value={formData.origenIngreso}
                  onChange={handleChange}
                  style={styles.input}
                >
                  <option value="">Seleccione...</option>
                  <option value="Urgencia">Urgencia</option>
                  <option value="Derivacion">Derivación</option>
                  <option value="Programado">Programado</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>CESFAM / Consultorio Origen</label>
                <input
                  type="text"
                  name="cesfam"
                  value={formData.cesfam}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Ej: CESFAM Ultra Estación"
                />
              </div>

              <div style={styles.formGroup}>
                <div style={styles.infoBox}>
                  <span style={styles.infoIcon}>✓</span>
                  La fecha y hora de ingreso se registran automáticamente (Trazabilidad)
                </div>
              </div>
            </div>

            <h2 style={styles.sectionTitle}>Planificación</h2>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Plan de Parto</label>
                <div style={styles.radioGroup}>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      checked={formData.planParto === 'SI'}
                      onChange={() => handleRadioChange('planParto', 'SI')}
                    />
                    Sí
                  </label>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      checked={formData.planParto === 'NO'}
                      onChange={() => handleRadioChange('planParto', 'NO')}
                    />
                    No
                  </label>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Visita Guiada</label>
                <div style={styles.radioGroup}>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      checked={formData.visitaGuiada === 'SI'}
                      onChange={() => handleRadioChange('visitaGuiada', 'SI')}
                    />
                    Sí
                  </label>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      checked={formData.visitaGuiada === 'NO'}
                      onChange={() => handleRadioChange('visitaGuiada', 'NO')}
                    />
                    No
                  </label>
                </div>
              </div>
            </div>

            <h2 style={styles.sectionTitle}>Acompañamiento Pre-Parto (Ley 20.584)</h2>
            <div style={styles.formGrid}>
              <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
                <div style={styles.radioGroup}>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      checked={formData.tieneAcompanante === true}
                      onChange={() => handleRadioChange('tieneAcompanante', true)}
                    />
                    Sí (Acompañada)
                  </label>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      checked={formData.tieneAcompanante === false}
                      onChange={() => handleRadioChange('tieneAcompanante', false)}
                    />
                    No (Sin acompañante)
                  </label>
                </div>
              </div>
            </div>

            {!formData.tieneAcompanante && (
              <div style={styles.conditionalSection}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Motivo Sin Acompañante</label>
                  <input
                    type="text"
                    name="motivoSinAcompanante"
                    value={formData.motivoSinAcompanante}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="Indique el motivo"
                  />
                </div>
              </div>
            )}

            {formData.tieneAcompanante && (
              <div style={styles.conditionalSection}>
                <h3 style={styles.subsectionTitle}>Datos del Acompañante</h3>
                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Parentesco</label>
                    <select
                      name="parentescoAcompanante"
                      value={formData.parentescoAcompanante}
                      onChange={handleChange}
                      style={styles.input}
                    >
                      <option value="">Seleccione...</option>
                      <option value="Pareja">Pareja</option>
                      <option value="Madre">Madre</option>
                      <option value="Padre">Padre</option>
                      <option value="Hermano/a">Hermano/a</option>
                      <option value="Amigo/a">Amigo/a</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Nombre Completo</label>
                    <input
                      type="text"
                      name="nombreAcompanante"
                      value={formData.nombreAcompanante}
                      onChange={handleChange}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>RUN Acompañante</label>
                    <input
                      type="text"
                      name="runAcompanante"
                      value={formData.runAcompanante}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="12345678-9"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Botón Submit */}
          <div style={styles.submitContainer}>
            <button type="submit" disabled={isLoading} style={styles.submitButton}>
              {isLoading ? '⏳ Guardando...' : '💾 Guardar Ficha Administrativa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
  fontFamily: "'Poppins', sans-serif",
  backgroundColor: '#f5f7fa',
  minHeight: 'calc(100vh - 60px)', // Resta la altura del header
  padding: '20px',
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
    fontSize: '22px',
    fontWeight: 700,
    color: '#007bff',
    marginBottom: '20px',
    paddingBottom: '10px',
    borderBottom: '2px solid #007bff',
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid #e0e6ed',
    marginBottom: '25px',
    gap: '5px',
  },
  tabButton: {
    backgroundColor: 'transparent',
    border: 'none',
    padding: '12px 20px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    color: '#495057',
    borderBottom: '3px solid transparent',
    transition: 'all 0.2s',
    fontFamily: "'Poppins', sans-serif",
  },
  tabButtonActive: {
    color: '#007bff',
    borderBottomColor: '#007bff',
    fontWeight: 600,
    backgroundColor: '#f0f7ff',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#495057',
    marginBottom: '15px',
    marginTop: '10px',
  },
  subsectionTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#495057',
    marginBottom: '15px',
  },
  formGrid: {
    display: 'grid',
    gap: '20px',
    gridTemplateColumns: 'repeat(2, 1fr)',
    marginBottom: '25px',
  },
  formGroup: {},
  label: {
    display: 'block',
    marginBottom: '6px',
    fontWeight: 500,
    color: '#495057',
    fontSize: '13px',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e0e6ed',
    borderRadius: '8px',
    boxSizing: 'border-box',
    fontFamily: "'Poppins', sans-serif",
    fontSize: '14px',
    transition: 'border-color 0.2s',
  },
  runDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '10px 12px',
    backgroundColor: '#f5f7fa',
    borderRadius: '8px',
    border: '1px solid #e0e6ed',
  },
  runText: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#495057',
  },
  runSeparator: {
    color: '#999',
  },
  hint: {
    fontSize: '11px',
    color: '#999',
    marginTop: '4px',
    display: 'block',
  },
  condicionesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '15px',
    marginBottom: '20px',
  },
  condicionItem: {
    padding: '12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #e0e6ed',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#495057',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  conditionalField: {
    maxWidth: '300px',
    marginBottom: '20px',
  },
  radioGroup: {
    display: 'flex',
    gap: '25px',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  conditionalSection: {
    marginTop: '15px',
    padding: '20px',
    backgroundColor: '#e8f3ff',
    borderRadius: '10px',
    border: '1px dashed #007bff',
  },
  infoBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    backgroundColor: '#d4edda',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#155724',
  },
  infoIcon: {
    fontSize: '16px',
  },
  submitContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '30px',
    paddingTop: '20px',
    borderTop: '1px solid #e0e6ed',
  },
  submitButton: {
    backgroundColor: '#28a745',
    color: 'white',
    padding: '14px 30px',
    border: 'none',
    borderRadius: '10px',
    fontWeight: 600,
    fontSize: '16px',
    cursor: 'pointer',
    fontFamily: "'Poppins', sans-serif",
    boxShadow: '0 4px 10px rgba(40, 167, 69, 0.3)',
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
  },
};