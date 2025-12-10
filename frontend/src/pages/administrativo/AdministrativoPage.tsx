import { useState } from 'react';
import BuscarPaciente from '../../components/forms/BuscarPaciente';
import { madresApi } from '../../api/MadresApi';
import type { Madre } from '../../types/models';

interface FormData {
  id: number | null;
  run: string;
  dv: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  fechaNacimiento: string;
  comuna: string;
  cesfam: string;
  nacionalidad: string;
  esMigrante: boolean;
  puebloOriginario: boolean;
  puebloOriginarioTipo: string;
  privadaLibertad: boolean;
  transMasculino: boolean;
  discapacidad: boolean;
  discapacidadTipo: string;
  direccion: string;
  region: string;
  ciudad: string;
  telefono: string;
  correo: string;
  tipoPaciente: string;
  origenIngreso: string;
  planParto: string;
  visitaGuiada: string;
  acompanamiento: string;
  motivoNoAcompanamiento: string;
  parentescoAcompanante: string;
  nombreAcompanante: string;
  runAcompanante: string;
}

const initialFormData: FormData = {
  id: null,
  run: '',
  dv: '',
  nombre: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  fechaNacimiento: '',
  comuna: '',
  cesfam: '',
  nacionalidad: 'Chilena',
  esMigrante: false,
  puebloOriginario: false,
  puebloOriginarioTipo: '',
  privadaLibertad: false,
  transMasculino: false,
  discapacidad: false,
  discapacidadTipo: '',
  direccion: '',
  region: '',
  ciudad: '',
  telefono: '',
  correo: '',
  tipoPaciente: '',
  origenIngreso: '',
  planParto: '',
  visitaGuiada: '',
  acompanamiento: '',
  motivoNoAcompanamiento: '',
  parentescoAcompanante: '',
  nombreAcompanante: '',
  runAcompanante: '',
};

export default function AdministrativoPage() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [madreExistente, setMadreExistente] = useState<Madre | null>(null);

  const handlePacienteEncontrado = (madre: Madre | null) => {
    if (madre) {
      setMadreExistente(madre);
      const nombrePartes = madre.nombre_completo.split(' ');
      setFormData(prev => ({
        ...prev,
        id: madre.id || null,
        nombre: nombrePartes[0] || '',
        apellidoPaterno: nombrePartes[1] || '',
        apellidoMaterno: nombrePartes.slice(2).join(' ') || '',
        fechaNacimiento: madre.fecha_nacimiento,
        comuna: madre.comuna,
        cesfam: madre.cesfam || '',
        nacionalidad: madre.nacionalidad,
        esMigrante: madre.es_migrante,
        puebloOriginario: madre.pueblo_originario,
      }));
    } else {
      setMadreExistente(null);
      setFormData(prev => ({
        ...prev,
        id: null,
        nombre: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        fechaNacimiento: '',
        comuna: '',
        cesfam: '',
        nacionalidad: 'Chilena',
        esMigrante: false,
        puebloOriginario: false,
      }));
    }
  };

  const handleRutChange = (run: string, dv: string) => {
    setFormData(prev => ({ ...prev, run, dv }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const rutCompleto = formData.run && formData.dv ? `${formData.run}-${formData.dv}` : '';
      
      const madreData = {
        rut: rutCompleto,
        nombre_completo: `${formData.nombre} ${formData.apellidoPaterno} ${formData.apellidoMaterno}`.trim(),
        fecha_nacimiento: formData.fechaNacimiento,
        comuna: formData.comuna,
        cesfam: formData.cesfam || null,
        nacionalidad: formData.nacionalidad,
        es_migrante: formData.esMigrante,
        pueblo_originario: formData.puebloOriginario,
        direccion: formData.direccion,
        telefono: formData.telefono,
      };

      if (madreExistente && madreExistente.id) {
        await madresApi.update(madreExistente.id, madreData);
        alert('Paciente actualizada correctamente');
      } else {
        await madresApi.create(madreData);
        alert('Paciente registrada correctamente');
      }

      // Limpiar
      setFormData(initialFormData);
      setMadreExistente(null);

    } catch (error: unknown) {
      const err = error as { response?: { data?: { rut?: string[] } } };
      if (err.response?.data?.rut) {
        alert('Error: ' + err.response.data.rut[0]);
      } else {
        alert('Error al guardar paciente');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = ['Datos Personales', 'Contacto y Ubicación', 'Datos de Ingreso'];

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>📋 Admisión de Pacientes</h1>

        <BuscarPaciente
          onPacienteEncontrado={handlePacienteEncontrado}
          onRutChange={handleRutChange}
        />

        <div style={styles.formContainer}>
          {/* Tabs */}
          <div style={styles.tabs}>
            {tabs.map((tab, index) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(index)}
                style={{
                  ...styles.tabButton,
                  ...(activeTab === index ? styles.tabButtonActive : {}),
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div style={styles.tabContent}>
              {/* Tab 0: Datos Personales */}
              {activeTab === 0 && (
                <div style={styles.tabPane}>
                  <div style={styles.formGrid}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>RUN</label>
                      <input
                        type="text"
                        value={formData.run && formData.dv ? `${formData.run}-${formData.dv}` : ''}
                        disabled
                        style={{ ...styles.input, backgroundColor: '#f0f0f0' }}
                        placeholder="Busque por RUT arriba"
                      />
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
                      <input type="text" name="apellidoMaterno" value={formData.apellidoMaterno} onChange={handleChange} style={styles.input} />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Fecha de Nacimiento</label>
                      <input type="date" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} style={styles.input} required />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Nacionalidad</label>
                      <select name="nacionalidad" value={formData.nacionalidad} onChange={handleChange} style={styles.input}>
                        <option value="Chilena">Chilena</option>
                        <option value="Argentina">Argentina</option>
                        <option value="Peruana">Peruana</option>
                        <option value="Boliviana">Boliviana</option>
                        <option value="Venezolana">Venezolana</option>
                        <option value="Colombiana">Colombiana</option>
                        <option value="Haitiana">Haitiana</option>
                        <option value="Otra">Otra</option>
                      </select>
                    </div>
                  </div>

                  <h3 style={styles.sectionTitle}>Condiciones Especiales</h3>
                  <div style={styles.checkboxGrid}>
                    <label style={styles.checkboxLabel}>
                      <input type="checkbox" name="esMigrante" checked={formData.esMigrante} onChange={handleChange} style={styles.checkbox} />
                      Migrante
                    </label>
                    <label style={styles.checkboxLabel}>
                      <input type="checkbox" name="puebloOriginario" checked={formData.puebloOriginario} onChange={handleChange} style={styles.checkbox} />
                      Pueblo Originario
                    </label>
                    <label style={styles.checkboxLabel}>
                      <input type="checkbox" name="privadaLibertad" checked={formData.privadaLibertad} onChange={handleChange} style={styles.checkbox} />
                      Privada de Libertad
                    </label>
                    <label style={styles.checkboxLabel}>
                      <input type="checkbox" name="transMasculino" checked={formData.transMasculino} onChange={handleChange} style={styles.checkbox} />
                      Trans Masculino
                    </label>
                    <label style={styles.checkboxLabel}>
                      <input type="checkbox" name="discapacidad" checked={formData.discapacidad} onChange={handleChange} style={styles.checkbox} />
                      Discapacidad
                    </label>
                  </div>

                  {formData.puebloOriginario && (
                    <div style={styles.conditionalSection}>
                      <label style={styles.label}>Tipo de Pueblo Originario</label>
                      <select name="puebloOriginarioTipo" value={formData.puebloOriginarioTipo} onChange={handleChange} style={styles.input}>
                        <option value="">Seleccione...</option>
                        <option value="Mapuche">Mapuche</option>
                        <option value="Aymara">Aymara</option>
                        <option value="Rapa Nui">Rapa Nui</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>
                  )}

                  {formData.discapacidad && (
                    <div style={styles.conditionalSection}>
                      <label style={styles.label}>Tipo de Discapacidad</label>
                      <select name="discapacidadTipo" value={formData.discapacidadTipo} onChange={handleChange} style={styles.input}>
                        <option value="">Seleccione...</option>
                        <option value="Física">Física</option>
                        <option value="Visual">Visual</option>
                        <option value="Auditiva">Auditiva</option>
                        <option value="Intelectual">Intelectual</option>
                        <option value="Psíquica">Psíquica</option>
                        <option value="Múltiple">Múltiple</option>
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 1: Contacto */}
              {activeTab === 1 && (
                <div style={styles.tabPane}>
                  <div style={styles.formGrid}>
                    <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
                      <label style={styles.label}>Dirección</label>
                      <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} style={styles.input} />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Región</label>
                      <select name="region" value={formData.region} onChange={handleChange} style={styles.input}>
                        <option value="">Seleccione...</option>
                        <option value="Ñuble">Ñuble</option>
                        <option value="Biobío">Biobío</option>
                        <option value="Maule">Maule</option>
                      </select>
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Ciudad</label>
                      <input type="text" name="ciudad" value={formData.ciudad} onChange={handleChange} style={styles.input} />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Comuna</label>
                      <select name="comuna" value={formData.comuna} onChange={handleChange} style={styles.input} required>
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
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Teléfono</label>
                      <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} style={styles.input} placeholder="+56 9 1234 5678" />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Correo Electrónico</label>
                      <input type="email" name="correo" value={formData.correo} onChange={handleChange} style={styles.input} />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Datos de Ingreso */}
              {activeTab === 2 && (
                <div style={styles.tabPane}>
                  <div style={styles.formGrid}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Tipo Paciente</label>
                      <select name="tipoPaciente" value={formData.tipoPaciente} onChange={handleChange} style={styles.input}>
                        <option value="">Seleccione...</option>
                        <option value="GES">GES</option>
                        <option value="No GES">No GES</option>
                        <option value="FONASA">FONASA</option>
                        <option value="ISAPRE">ISAPRE</option>
                      </select>
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Origen Ingreso</label>
                      <select name="origenIngreso" value={formData.origenIngreso} onChange={handleChange} style={styles.input}>
                        <option value="">Seleccione...</option>
                        <option value="Urgencia">Urgencia</option>
                        <option value="Derivación">Derivación</option>
                        <option value="Programado">Programado</option>
                      </select>
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>CESFAM Origen</label>
                      <input type="text" name="cesfam" value={formData.cesfam} onChange={handleChange} style={styles.input} />
                    </div>
                  </div>

                  <h3 style={styles.sectionTitle}>Plan de Parto</h3>
                  <div style={styles.radioGroup}>
                    <label style={styles.radioLabel}>
                      <input type="radio" name="planParto" value="si" checked={formData.planParto === 'si'} onChange={handleChange} /> Sí
                    </label>
                    <label style={styles.radioLabel}>
                      <input type="radio" name="planParto" value="no" checked={formData.planParto === 'no'} onChange={handleChange} /> No
                    </label>
                  </div>

                  <h3 style={styles.sectionTitle}>Visita Guiada</h3>
                  <div style={styles.radioGroup}>
                    <label style={styles.radioLabel}>
                      <input type="radio" name="visitaGuiada" value="si" checked={formData.visitaGuiada === 'si'} onChange={handleChange} /> Sí
                    </label>
                    <label style={styles.radioLabel}>
                      <input type="radio" name="visitaGuiada" value="no" checked={formData.visitaGuiada === 'no'} onChange={handleChange} /> No
                    </label>
                  </div>

                  <h3 style={styles.sectionTitle}>Acompañamiento Ley 20.584</h3>
                  <div style={styles.radioGroup}>
                    <label style={styles.radioLabel}>
                      <input type="radio" name="acompanamiento" value="si" checked={formData.acompanamiento === 'si'} onChange={handleChange} /> Sí
                    </label>
                    <label style={styles.radioLabel}>
                      <input type="radio" name="acompanamiento" value="no" checked={formData.acompanamiento === 'no'} onChange={handleChange} /> No
                    </label>
                  </div>

                  {formData.acompanamiento === 'no' && (
                    <div style={styles.conditionalSection}>
                      <label style={styles.label}>Motivo de No Acompañamiento</label>
                      <textarea name="motivoNoAcompanamiento" value={formData.motivoNoAcompanamiento} onChange={handleChange} style={styles.textarea} rows={2} />
                    </div>
                  )}

                  {formData.acompanamiento === 'si' && (
                    <div style={styles.conditionalSection}>
                      <h4 style={styles.subTitle}>Datos del Acompañante</h4>
                      <div style={styles.formGrid}>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Parentesco</label>
                          <select name="parentescoAcompanante" value={formData.parentescoAcompanante} onChange={handleChange} style={styles.input}>
                            <option value="">Seleccione...</option>
                            <option value="Pareja">Pareja</option>
                            <option value="Madre">Madre</option>
                            <option value="Padre">Padre</option>
                            <option value="Hermana/o">Hermana/o</option>
                            <option value="Amiga/o">Amiga/o</option>
                            <option value="Otro">Otro</option>
                          </select>
                        </div>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Nombre Acompañante</label>
                          <input type="text" name="nombreAcompanante" value={formData.nombreAcompanante} onChange={handleChange} style={styles.input} />
                        </div>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>RUN Acompañante</label>
                          <input type="text" name="runAcompanante" value={formData.runAcompanante} onChange={handleChange} style={styles.input} placeholder="12.345.678-9" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Botones */}
            <div style={styles.formActions}>
              <button type="button" onClick={() => setActiveTab(Math.max(0, activeTab - 1))} disabled={activeTab === 0} style={styles.btnSecondary}>
                ← Anterior
              </button>
              {activeTab < tabs.length - 1 ? (
                <button type="button" onClick={() => setActiveTab(activeTab + 1)} style={styles.btnPrimary}>
                  Siguiente →
                </button>
              ) : (
                <button type="submit" disabled={isLoading} style={styles.btnSuccess}>
                  {isLoading ? '⏳ Guardando...' : '💾 Guardar Paciente'}
                </button>
              )}
            </div>
          </form>
        </div>
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
    maxWidth: '1000px',
    margin: '0 auto',
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#1a365d',
    marginBottom: '20px',
  },
  formContainer: {
    backgroundColor: '#e8f3ff',
    borderRadius: '12px',
    boxShadow: '0 5px 20px rgba(0, 123, 255, 0.15)',
    overflow: 'hidden',
  },
  tabs: {
    display: 'flex',
    borderBottom: '2px solid #007bff',
  },
  tabButton: {
    flex: 1,
    padding: '15px',
    border: 'none',
    backgroundColor: '#d6eaff',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    color: '#495057',
    fontFamily: "'Poppins', sans-serif",
    transition: 'all 0.2s',
  },
  tabButtonActive: {
    backgroundColor: '#007bff',
    color: 'white',
  },
  tabContent: {
    padding: '25px',
  },
  tabPane: {},
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
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
  textarea: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #c1d9e7',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: "'Poppins', sans-serif",
    boxSizing: 'border-box',
    backgroundColor: 'white',
    resize: 'vertical',
  },
  sectionTitle: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#1a365d',
    marginBottom: '15px',
    marginTop: '20px',
    paddingBottom: '8px',
    borderBottom: '1px solid #c1d9e7',
  },
  subTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#495057',
    marginBottom: '15px',
  },
  checkboxGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
    marginBottom: '15px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#495057',
    cursor: 'pointer',
  },
  checkbox: {
    width: '18px',
    height: '18px',
  },
  radioGroup: {
    display: 'flex',
    gap: '20px',
    marginBottom: '15px',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#495057',
    cursor: 'pointer',
  },
  conditionalSection: {
    backgroundColor: '#d6eaff',
    padding: '15px',
    borderRadius: '8px',
    marginTop: '15px',
    border: '1px dashed #007bff',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '20px 25px',
    borderTop: '1px solid #c1d9e7',
    backgroundColor: '#d6eaff',
  },
  btnSecondary: {
    padding: '12px 25px',
    border: '1px solid #007bff',
    borderRadius: '8px',
    backgroundColor: 'white',
    color: '#007bff',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'Poppins', sans-serif",
  },
  btnPrimary: {
    padding: '12px 25px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#007bff',
    color: 'white',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'Poppins', sans-serif",
  },
  btnSuccess: {
    padding: '12px 25px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#28a745',
    color: 'white',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'Poppins', sans-serif",
  },
};