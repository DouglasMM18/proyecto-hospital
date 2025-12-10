import { useState } from 'react';
import BuscarPaciente from '../../components/forms/BuscarPaciente';
import type { Madre } from '../../types/models';
import { partosApi, recienNacidosApi } from '../../api/partosApi';

interface DatosClinicosMADRE {
  grupo_sanguineo: string;
  factor_rh: string;
  alergias: string;
  antecedentes_medicos: string;
  antecedentes_obstetricos: string;
  gestas: number | '';
  partos: number | '';
  abortos: number | '';
  cesareas: number | '';
  hijos_vivos: number | '';
  control_prenatal: boolean;
  num_controles: number | '';
  patologias: {
    vih: boolean;
    diabetes_gestacional: boolean;
    preeclampsia: boolean;
    eclampsia: boolean;
    infeccion_ovular: boolean;
    otra: string;
  };
}

interface DatosParto {
  fecha: string;
  hora: string;
  tipo_parto: string;
  edad_gestacional: number | '';
  profesional_acargo: string;
  posicion_materna: string;
  estado_perineo: string;
  alumbramiento_dirigido: boolean;
  ligadura_tardia_cordon: boolean;
  apego_piel_piel: boolean;
  lactancia_primera_hora: boolean;
  complicaciones: string;
}

interface RecienNacido {
  id: number;
  sexo: string;
  peso_gramos: number | '';
  talla_cm: number | '';
  circunferencia_craneal: number | '';
  apgar_1: number | '';
  apgar_5: number | '';
  vacuna_bcg: boolean;
  vacuna_hepatitis_b: boolean;
  screening_auditivo: boolean;
  reanimacion: string;
  observaciones: string;
}

const initialDatosClinicos: DatosClinicosMADRE = {
  grupo_sanguineo: '',
  factor_rh: '',
  alergias: '',
  antecedentes_medicos: '',
  antecedentes_obstetricos: '',
  gestas: '',
  partos: '',
  abortos: '',
  cesareas: '',
  hijos_vivos: '',
  control_prenatal: false,
  num_controles: '',
  patologias: {
    vih: false,
    diabetes_gestacional: false,
    preeclampsia: false,
    eclampsia: false,
    infeccion_ovular: false,
    otra: '',
  },
};

const initialDatosParto: DatosParto = {
  fecha: '',
  hora: '',
  tipo_parto: '',
  edad_gestacional: '',
  profesional_acargo: '',
  posicion_materna: '',
  estado_perineo: '',
  alumbramiento_dirigido: false,
  ligadura_tardia_cordon: false,
  apego_piel_piel: false,
  lactancia_primera_hora: false,
  complicaciones: '',
};

const initialRecienNacido: RecienNacido = {
  id: 1,
  sexo: '',
  peso_gramos: '',
  talla_cm: '',
  circunferencia_craneal: '',
  apgar_1: '',
  apgar_5: '',
  vacuna_bcg: false,
  vacuna_hepatitis_b: false,
  screening_auditivo: false,
  reanimacion: 'ninguna',
  observaciones: '',
};

export default function EnfermeraPage() {
  const [madreSeleccionada, setMadreSeleccionada] = useState<Madre | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [datosClinicos, setDatosClinicos] = useState<DatosClinicosMADRE>(initialDatosClinicos);
  const [datosParto, setDatosParto] = useState<DatosParto>(initialDatosParto);
  const [recienNacidos, setRecienNacidos] = useState<RecienNacido[]>([{ ...initialRecienNacido }]);
  const [isLoading, setIsLoading] = useState(false);

  // Datos administrativos de la madre (solo lectura)
  const [datosAdmin] = useState({
    direccion: '',
    region: '',
    ciudad: '',
    comuna: '',
    telefono: '',
    correo: '',
    tipoPaciente: '',
    origenIngreso: '',
    cesfam: '',
  });

  const handlePacienteEncontrado = (madre: Madre | null) => {
    setMadreSeleccionada(madre);
    if (madre) {
      setActiveTab(0);
    }
  };

  const handleRutChange = () => {};

  const agregarRecienNacido = () => {
    if (recienNacidos.length < 4) {
      setRecienNacidos(prev => [
        ...prev,
        { ...initialRecienNacido, id: prev.length + 1 }
      ]);
    }
  };

  const eliminarRecienNacido = (index: number) => {
    if (recienNacidos.length > 1) {
      setRecienNacidos(prev => prev.filter((_, i) => i !== index));
      if (activeTab > recienNacidos.length) {
        setActiveTab(activeTab - 1);
      }
    }
  };

  const handleDatosClinicosChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name.startsWith('patologia_')) {
      const patologia = name.replace('patologia_', '');
      setDatosClinicos(prev => ({
        ...prev,
        patologias: {
          ...prev.patologias,
          [patologia]: type === 'checkbox' ? checked : value,
        },
      }));
    } else {
      setDatosClinicos(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleDatosPartoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setDatosParto(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleRecienNacidoChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setRecienNacidos(prev => prev.map((rn, i) =>
      i === index ? { ...rn, [name]: type === 'checkbox' ? checked : value } : rn
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!madreSeleccionada?.id) {
    alert('Debe seleccionar una paciente primero');
    return;
  }

  setIsLoading(true);

  try {
    // Crear el parto
    const partoData = {
      madre: madreSeleccionada.id,
      fecha: datosParto.fecha,
      hora: datosParto.hora,
      tipo_parto: datosParto.tipo_parto,
      edad_gestacional: Number(datosParto.edad_gestacional),
      profesional_acargo: datosParto.profesional_acargo,
      observaciones: datosParto.complicaciones,
    };

    const partoCreado = await partosApi.create(partoData);

    // Crear los recién nacidos
    for (const rn of recienNacidos) {
      const rnData = {
        parto: partoCreado.id!,
        sexo: rn.sexo,
        peso_gramos: Number(rn.peso_gramos),
        talla_cm: Number(rn.talla_cm),
        circunferencia_craneal: Number(rn.circunferencia_craneal) || undefined,
        apgar_1: Number(rn.apgar_1),
        apgar_5: Number(rn.apgar_5),
        vacuna_bcg: rn.vacuna_bcg,
        vacuna_hepatitis_b: rn.vacuna_hepatitis_b,
        screening_auditivo: rn.screening_auditivo,
        observaciones: rn.observaciones,
      };

      await recienNacidosApi.create(rnData);
    }

    alert('Registro clínico guardado correctamente');
    
    // Limpiar formulario
    setDatosClinicos(initialDatosClinicos);
    setDatosParto(initialDatosParto);
    setRecienNacidos([{ ...initialRecienNacido }]);
    setActiveTab(0);

  } catch (error) {
    console.error(error);
    alert('Error al guardar registro clínico');
  } finally {
    setIsLoading(false);
  }
};

  const tabs = [
    { id: 'clinicos', label: '🏥 Datos Clínicos' },
    ...recienNacidos.map((_, i) => ({
      id: `rn-${i}`,
      label: `👶 Parto - RN ${i + 1}`,
    })),
    { id: 'admin', label: '📋 Datos Administrativos' },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>👩‍⚕️ Registro Clínico - Enfermera</h1>

        <BuscarPaciente
          onPacienteEncontrado={handlePacienteEncontrado}
          onRutChange={handleRutChange}
        />

        {madreSeleccionada && (
          <div style={styles.pacienteInfo}>
            <span style={styles.pacienteNombre}>{madreSeleccionada.nombre_completo}</span>
            <span style={styles.pacienteRut}>RUT: {madreSeleccionada.rut}</span>
          </div>
        )}

        <div style={styles.tabsContainer}>
          <div style={styles.tabs}>
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(index)}
                style={{
                  ...styles.tabButton,
                  ...(activeTab === index ? styles.tabButtonActive : {}),
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {recienNacidos.length < 4 && (
            <button type="button" onClick={agregarRecienNacido} style={styles.btnAgregarRN}>
              ➕ Agregar RN
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={styles.tabContent}>
            {/* Tab: Datos Clínicos */}
            {activeTab === 0 && (
              <div style={styles.scrollContent}>
                <Section titulo="Información Sanguínea">
                  <div style={styles.formGrid}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Grupo Sanguíneo</label>
                      <select name="grupo_sanguineo" value={datosClinicos.grupo_sanguineo} onChange={handleDatosClinicosChange} style={styles.input}>
                        <option value="">Seleccione...</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="AB">AB</option>
                        <option value="O">O</option>
                      </select>
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Factor RH</label>
                      <select name="factor_rh" value={datosClinicos.factor_rh} onChange={handleDatosClinicosChange} style={styles.input}>
                        <option value="">Seleccione...</option>
                        <option value="positivo">Positivo (+)</option>
                        <option value="negativo">Negativo (-)</option>
                      </select>
                    </div>
                  </div>
                </Section>

                <Section titulo="Antecedentes">
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Alergias Conocidas</label>
                    <textarea name="alergias" value={datosClinicos.alergias} onChange={handleDatosClinicosChange} style={styles.textarea} placeholder="Ninguna conocida / Detallar alergias..." rows={2} />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Antecedentes Médicos</label>
                    <textarea name="antecedentes_medicos" value={datosClinicos.antecedentes_medicos} onChange={handleDatosClinicosChange} style={styles.textarea} placeholder="Enfermedades crónicas, cirugías previas..." rows={2} />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Antecedentes Obstétricos</label>
                    <textarea name="antecedentes_obstetricos" value={datosClinicos.antecedentes_obstetricos} onChange={handleDatosClinicosChange} style={styles.textarea} placeholder="Partos anteriores, complicaciones previas..." rows={2} />
                  </div>
                </Section>

                <Section titulo="Historia Obstétrica (GPAC)">
                  <div style={styles.formGrid4}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Gestas</label>
                      <input type="number" name="gestas" value={datosClinicos.gestas} onChange={handleDatosClinicosChange} style={styles.input} min={0} />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Partos</label>
                      <input type="number" name="partos" value={datosClinicos.partos} onChange={handleDatosClinicosChange} style={styles.input} min={0} />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Abortos</label>
                      <input type="number" name="abortos" value={datosClinicos.abortos} onChange={handleDatosClinicosChange} style={styles.input} min={0} />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Cesáreas</label>
                      <input type="number" name="cesareas" value={datosClinicos.cesareas} onChange={handleDatosClinicosChange} style={styles.input} min={0} />
                    </div>
                  </div>
                </Section>

                <Section titulo="Control Prenatal">
                  <div style={styles.formGrid}>
                    <div style={styles.formGroup}>
                      <label style={styles.checkboxLabel}>
                        <input type="checkbox" name="control_prenatal" checked={datosClinicos.control_prenatal} onChange={handleDatosClinicosChange} style={styles.checkbox} />
                        ¿Tuvo control prenatal?
                      </label>
                    </div>
                    {datosClinicos.control_prenatal && (
                      <div style={styles.formGroup}>
                        <label style={styles.label}>N° de Controles</label>
                        <input type="number" name="num_controles" value={datosClinicos.num_controles} onChange={handleDatosClinicosChange} style={styles.input} min={0} />
                      </div>
                    )}
                  </div>
                </Section>

                <Section titulo="Patologías del Embarazo">
                  <div style={styles.patologiasGrid}>
                    <label style={styles.checkboxLabel}>
                      <input type="checkbox" name="patologia_vih" checked={datosClinicos.patologias.vih} onChange={handleDatosClinicosChange} style={styles.checkbox} />
                      VIH
                    </label>
                    <label style={styles.checkboxLabel}>
                      <input type="checkbox" name="patologia_diabetes_gestacional" checked={datosClinicos.patologias.diabetes_gestacional} onChange={handleDatosClinicosChange} style={styles.checkbox} />
                      Diabetes Gestacional
                    </label>
                    <label style={styles.checkboxLabel}>
                      <input type="checkbox" name="patologia_preeclampsia" checked={datosClinicos.patologias.preeclampsia} onChange={handleDatosClinicosChange} style={styles.checkbox} />
                      Preeclampsia
                    </label>
                    <label style={styles.checkboxLabel}>
                      <input type="checkbox" name="patologia_eclampsia" checked={datosClinicos.patologias.eclampsia} onChange={handleDatosClinicosChange} style={styles.checkbox} />
                      Eclampsia
                    </label>
                    <label style={styles.checkboxLabel}>
                      <input type="checkbox" name="patologia_infeccion_ovular" checked={datosClinicos.patologias.infeccion_ovular} onChange={handleDatosClinicosChange} style={styles.checkbox} />
                      Infección Ovular
                    </label>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Otra Patología</label>
                    <input type="text" name="patologia_otra" value={datosClinicos.patologias.otra} onChange={handleDatosClinicosChange} style={styles.input} placeholder="Especificar..." />
                  </div>
                </Section>
              </div>
            )}

            {/* Tabs: Parto - RN */}
            {recienNacidos.map((rn, index) => (
              activeTab === index + 1 && (
                <div key={rn.id} style={styles.scrollContent}>
                  {recienNacidos.length > 1 && (
                    <div style={styles.rnHeader}>
                      <span style={styles.rnTitle}>Recién Nacido {index + 1} de {recienNacidos.length}</span>
                      <button type="button" onClick={() => eliminarRecienNacido(index)} style={styles.btnEliminarRN}>
                        🗑️ Eliminar RN
                      </button>
                    </div>
                  )}

                  <Section titulo="Datos del Parto">
                    <div style={styles.formGrid}>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Fecha del Parto</label>
                        <input type="date" name="fecha" value={datosParto.fecha} onChange={handleDatosPartoChange} style={styles.input} />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Hora del Parto</label>
                        <input type="time" name="hora" value={datosParto.hora} onChange={handleDatosPartoChange} style={styles.input} />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Tipo de Parto</label>
                        <select name="tipo_parto" value={datosParto.tipo_parto} onChange={handleDatosPartoChange} style={styles.input}>
                          <option value="">Seleccione...</option>
                          <option value="EUTOCICO">Eutócico (Vaginal Normal)</option>
                          <option value="CESAREA URGENCIA">Cesárea Urgencia</option>
                          <option value="CESAREA ELECTIVA">Cesárea Electiva</option>
                          <option value="FORCEPS">Fórceps</option>
                          <option value="VACUUM">Vacuum</option>
                        </select>
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Edad Gestacional (semanas)</label>
                        <input type="number" name="edad_gestacional" value={datosParto.edad_gestacional} onChange={handleDatosPartoChange} style={styles.input} min={20} max={45} />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Profesional a Cargo</label>
                        <input type="text" name="profesional_acargo" value={datosParto.profesional_acargo} onChange={handleDatosPartoChange} style={styles.input} />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Posición Materna</label>
                        <select name="posicion_materna" value={datosParto.posicion_materna} onChange={handleDatosPartoChange} style={styles.input}>
                          <option value="">Seleccione...</option>
                          <option value="litotomia">Litotomía</option>
                          <option value="cuclillas">Cuclillas</option>
                          <option value="lateral">Lateral</option>
                          <option value="semisentada">Semisentada</option>
                        </select>
                      </div>
                    </div>

                    <div style={styles.checkboxGrid}>
                      <label style={styles.checkboxLabel}>
                        <input type="checkbox" name="alumbramiento_dirigido" checked={datosParto.alumbramiento_dirigido} onChange={handleDatosPartoChange} style={styles.checkbox} />
                        Alumbramiento Dirigido
                      </label>
                      <label style={styles.checkboxLabel}>
                        <input type="checkbox" name="ligadura_tardia_cordon" checked={datosParto.ligadura_tardia_cordon} onChange={handleDatosPartoChange} style={styles.checkbox} />
                        Ligadura Tardía del Cordón
                      </label>
                      <label style={styles.checkboxLabel}>
                        <input type="checkbox" name="apego_piel_piel" checked={datosParto.apego_piel_piel} onChange={handleDatosPartoChange} style={styles.checkbox} />
                        Apego Piel a Piel
                      </label>
                      <label style={styles.checkboxLabel}>
                        <input type="checkbox" name="lactancia_primera_hora" checked={datosParto.lactancia_primera_hora} onChange={handleDatosPartoChange} style={styles.checkbox} />
                        Lactancia Primera Hora
                      </label>
                    </div>
                  </Section>

                  <Section titulo="Datos del Recién Nacido">
                    <div style={styles.formGrid}>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Sexo</label>
                        <select name="sexo" value={rn.sexo} onChange={(e) => handleRecienNacidoChange(index, e)} style={styles.input}>
                          <option value="">Seleccione...</option>
                          <option value="FEMENINO">Femenino</option>
                          <option value="MASCULINO">Masculino</option>
                          <option value="INDETERMINADO">Indeterminado</option>
                        </select>
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Peso (gramos)</label>
                        <input type="number" name="peso_gramos" value={rn.peso_gramos} onChange={(e) => handleRecienNacidoChange(index, e)} style={styles.input} min={500} max={6000} />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Talla (cm)</label>
                        <input type="number" name="talla_cm" value={rn.talla_cm} onChange={(e) => handleRecienNacidoChange(index, e)} style={styles.input} step="0.1" />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Circunferencia Craneal (cm)</label>
                        <input type="number" name="circunferencia_craneal" value={rn.circunferencia_craneal} onChange={(e) => handleRecienNacidoChange(index, e)} style={styles.input} step="0.1" />
                      </div>
                    </div>

                    <div style={styles.apgarContainer}>
                      <h4 style={styles.apgarTitle}>Puntaje APGAR</h4>
                      <div style={styles.apgarGrid}>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>APGAR 1 minuto</label>
                          <input type="number" name="apgar_1" value={rn.apgar_1} onChange={(e) => handleRecienNacidoChange(index, e)} style={styles.inputApgar} min={0} max={10} />
                        </div>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>APGAR 5 minutos</label>
                          <input type="number" name="apgar_5" value={rn.apgar_5} onChange={(e) => handleRecienNacidoChange(index, e)} style={styles.inputApgar} min={0} max={10} />
                        </div>
                      </div>
                    </div>
                  </Section>

                  <Section titulo="Vacunas y Procedimientos">
                    <div style={styles.checkboxGrid}>
                      <label style={styles.checkboxLabel}>
                        <input type="checkbox" name="vacuna_bcg" checked={rn.vacuna_bcg} onChange={(e) => handleRecienNacidoChange(index, e)} style={styles.checkbox} />
                        Vacuna BCG
                      </label>
                      <label style={styles.checkboxLabel}>
                        <input type="checkbox" name="vacuna_hepatitis_b" checked={rn.vacuna_hepatitis_b} onChange={(e) => handleRecienNacidoChange(index, e)} style={styles.checkbox} />
                        Vacuna Hepatitis B
                      </label>
                      <label style={styles.checkboxLabel}>
                        <input type="checkbox" name="screening_auditivo" checked={rn.screening_auditivo} onChange={(e) => handleRecienNacidoChange(index, e)} style={styles.checkbox} />
                        Screening Auditivo
                      </label>
                    </div>
                  </Section>

                  <Section titulo="Observaciones">
                    <textarea name="observaciones" value={rn.observaciones} onChange={(e) => handleRecienNacidoChange(index, e)} style={styles.textarea} placeholder="Observaciones del recién nacido..." rows={3} />
                  </Section>
                </div>
              )
            ))}

            {/* Tab: Datos Administrativos (Solo lectura) */}
            {activeTab === tabs.length - 1 && (
              <div style={styles.scrollContent}>
                <Section titulo="Datos Personales">
                  {madreSeleccionada ? (
                    <div style={styles.datosGrid}>
                      <DatoReadOnly label="RUT" valor={madreSeleccionada.rut} />
                      <DatoReadOnly label="Nombre Completo" valor={madreSeleccionada.nombre_completo} />
                      <DatoReadOnly label="Fecha de Nacimiento" valor={madreSeleccionada.fecha_nacimiento} />
                      <DatoReadOnly label="Nacionalidad" valor={madreSeleccionada.nacionalidad} />
                      <DatoReadOnly label="Migrante" valor={madreSeleccionada.es_migrante ? 'Sí' : 'No'} />
                      <DatoReadOnly label="Pueblo Originario" valor={madreSeleccionada.pueblo_originario ? 'Sí' : 'No'} />
                    </div>
                  ) : (
                    <p style={styles.noData}>Busque una paciente para ver sus datos.</p>
                  )}
                </Section>

                <Section titulo="Contacto y Ubicación">
                  {madreSeleccionada ? (
                    <div style={styles.datosGrid}>
                      <DatoReadOnly label="Dirección" valor={datosAdmin.direccion || 'No registrada'} />
                      <DatoReadOnly label="Comuna" valor={madreSeleccionada.comuna} />
                      <DatoReadOnly label="Teléfono" valor={datosAdmin.telefono || 'No registrado'} />
                      <DatoReadOnly label="Correo" valor={datosAdmin.correo || 'No registrado'} />
                    </div>
                  ) : (
                    <p style={styles.noData}>Busque una paciente para ver sus datos.</p>
                  )}
                </Section>

                <Section titulo="Datos de Ingreso">
                  {madreSeleccionada ? (
                    <div style={styles.datosGrid}>
                      <DatoReadOnly label="CESFAM" valor={madreSeleccionada.cesfam || 'No registrado'} />
                      <DatoReadOnly label="Tipo Paciente" valor={datosAdmin.tipoPaciente || 'No registrado'} />
                      <DatoReadOnly label="Origen Ingreso" valor={datosAdmin.origenIngreso || 'No registrado'} />
                    </div>
                  ) : (
                    <p style={styles.noData}>Busque una paciente para ver sus datos.</p>
                  )}
                </Section>
              </div>
            )}
          </div>

          <div style={styles.submitContainer}>
            <button type="submit" disabled={isLoading || !madreSeleccionada} style={styles.submitButton}>
              {isLoading ? '⏳ Guardando...' : '💾 Guardar Registro Clínico'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Section({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div style={styles.section}>
      <h3 style={styles.sectionTitle}>{titulo}</h3>
      {children}
    </div>
  );
}

function DatoReadOnly({ label, valor }: { label: string; valor: string }) {
  return (
    <div style={styles.datoReadOnly}>
      <span style={styles.datoLabel}>{label}</span>
      <span style={styles.datoValor}>{valor}</span>
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
    maxWidth: '1100px',
    margin: '0 auto',
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#1a365d',
    marginBottom: '20px',
  },
  pacienteInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#d4edda',
    padding: '12px 20px',
    borderRadius: '10px',
    marginBottom: '20px',
  },
  pacienteNombre: {
    fontWeight: 600,
    color: '#155724',
    fontSize: '16px',
  },
  pacienteRut: {
    color: '#155724',
    fontSize: '14px',
  },
  tabsContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    gap: '10px',
    flexWrap: 'wrap',
  },
  tabs: {
    display: 'flex',
    gap: '5px',
    flexWrap: 'wrap',
  },
  tabButton: {
    backgroundColor: '#e9ecef',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '8px 8px 0 0',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
    color: '#495057',
    fontFamily: "'Poppins', sans-serif",
  },
  tabButtonActive: {
    backgroundColor: '#007bff',
    color: 'white',
  },
  btnAgregarRN: {
    backgroundColor: '#17a2b8',
    color: 'white',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'Poppins', sans-serif",
  },
  tabContent: {
    backgroundColor: '#e8f3ff',
    borderRadius: '0 12px 12px 12px',
    boxShadow: '0 2px 10px rgba(0, 123, 255, 0.15)',
    minHeight: '500px',
  },
  scrollContent: {
    padding: '25px',
    maxHeight: '600px',
    overflowY: 'auto',
  },
  rnHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '10px',
    borderBottom: '2px solid #007bff',
  },
  rnTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#007bff',
  },
  btnEliminarRN: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer',
    fontFamily: "'Poppins', sans-serif",
  },
  section: {
    marginBottom: '25px',
  },
  sectionTitle: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#1a365d',
    marginBottom: '15px',
    paddingBottom: '8px',
    borderBottom: '1px solid #c1d9e7',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '15px',
    marginBottom: '15px',
  },
  formGrid4: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '15px',
    marginBottom: '15px',
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
    resize: 'vertical',
    backgroundColor: 'white',
  },
  checkboxGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
    marginBottom: '15px',
  },
  patologiasGrid: {
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
    cursor: 'pointer',
  },
  apgarContainer: {
    backgroundColor: '#fff3cd',
    padding: '15px',
    borderRadius: '10px',
    marginBottom: '15px',
  },
  apgarTitle: {
    margin: '0 0 10px 0',
    fontSize: '14px',
    fontWeight: 600,
    color: '#856404',
  },
  apgarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '15px',
  },
  inputApgar: {
    width: '100%',
    padding: '15px',
    border: '2px solid #ffc107',
    borderRadius: '8px',
    fontSize: '24px',
    fontWeight: 700,
    textAlign: 'center',
    fontFamily: "'Poppins', sans-serif",
    boxSizing: 'border-box',
  },
  datosGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '15px',
  },
  datoReadOnly: {
    backgroundColor: 'white',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #c1d9e7',
  },
  datoLabel: {
    display: 'block',
    fontSize: '11px',
    color: '#666',
    marginBottom: '4px',
    textTransform: 'uppercase',
  },
  datoValor: {
    fontSize: '15px',
    fontWeight: 500,
    color: '#1a365d',
  },
  noData: {
    textAlign: 'center',
    color: '#666',
    padding: '40px',
  },
  submitContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '20px 25px',
    borderTop: '1px solid #c1d9e7',
    backgroundColor: '#e8f3ff',
    borderRadius: '0 0 12px 12px',
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
};