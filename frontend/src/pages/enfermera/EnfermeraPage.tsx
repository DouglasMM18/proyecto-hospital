import { useState, useEffect } from 'react';
import BuscarPaciente from '../../components/forms/BuscarPaciente';
import type { Madre } from '../../types/models';
import { partosApi, recienNacidosApi } from '../../api/partosApi';
import { altasApi } from '../../api/altasApi';

interface DatosParto {
  fecha: string;
  hora: string;
  tipo_parto: string;
  edad_gestacional: number | '';
  profesional_acargo: string;
  observaciones: string;
}

interface RecienNacidoForm {
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
  profilaxis_ocular: boolean;
  observaciones: string;
}

interface AltaPendiente {
  id?: number;
  tipo: string;
  estado?: string;
  parto: number;
  madre_nombre?: string;
  fecha_solicitud?: string;
}

const initialDatosParto: DatosParto = {
  fecha: new Date().toISOString().split('T')[0],
  hora: new Date().toTimeString().slice(0, 5),
  tipo_parto: '',
  edad_gestacional: '',
  profesional_acargo: '',
  observaciones: '',
};

const initialRecienNacido: RecienNacidoForm = {
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
  profilaxis_ocular: false,
  observaciones: '',
};

const TIPOS_PARTO = [
  { value: 'EUTOCICO', label: 'Eutócico (Normal)' },
  { value: 'CESAREA URGENCIA', label: 'Cesárea Urgencia' },
  { value: 'CESAREA ELECTIVA', label: 'Cesárea Electiva' },
  { value: 'FORCEPS', label: 'Fórceps' },
  { value: 'VACUUM', label: 'Vacuum' },
];

export default function EnfermeraPage() {
  const [madreSeleccionada, setMadreSeleccionada] = useState<Madre | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [datosParto, setDatosParto] = useState<DatosParto>(initialDatosParto);
  const [recienNacidos, setRecienNacidos] = useState<RecienNacidoForm[]>([{ ...initialRecienNacido }]);
  const [isLoading, setIsLoading] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error' | 'info'; texto: string } | null>(null);
  
  // Para solicitud de alta
  const [mostrarModalAlta, setMostrarModalAlta] = useState(false);
  const [partoParaAlta, setPartoParaAlta] = useState<number | undefined>(undefined);
  const [tipoAlta, setTipoAlta] = useState('MEDICA');
  const [altasPendientes, setAltasPendientes] = useState<AltaPendiente[]>([]);

  // Cargar altas pendientes
  useEffect(() => {
    cargarAltasPendientes();
  }, []);

  const cargarAltasPendientes = async () => {
    try {
      const response = await altasApi.getAll();
      const pendientes = response.filter((a) => a.estado === 'PENDIENTE');
      setAltasPendientes(pendientes);
    } catch (error) {
      console.error('Error cargando altas:', error);
    }
  };

  const handlePacienteEncontrado = (madre: Madre | null) => {
    setMadreSeleccionada(madre);
    if (madre) {
      setActiveTab(0);
      setMensaje({ tipo: 'success', texto: `Paciente seleccionada: ${madre.nombre_completo}` });
    }
  };

  const handleRutChange = () => {
    setMensaje(null);
  };

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

  const handleDatosPartoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDatosParto(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRecienNacidoChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setRecienNacidos(prev => prev.map((rn, i) =>
      i === index ? { ...rn, [name]: type === 'checkbox' ? checked : value } : rn
    ));
  };

  const validarFormulario = (): boolean => {
    if (!madreSeleccionada?.id) {
      setMensaje({ tipo: 'error', texto: '❌ Debe seleccionar una paciente primero' });
      return false;
    }
    if (!datosParto.fecha || !datosParto.hora) {
      setMensaje({ tipo: 'error', texto: '❌ Fecha y hora del parto son requeridos' });
      setActiveTab(0);
      return false;
    }
    if (!datosParto.tipo_parto) {
      setMensaje({ tipo: 'error', texto: '❌ Debe seleccionar el tipo de parto' });
      setActiveTab(0);
      return false;
    }
    if (!datosParto.edad_gestacional) {
      setMensaje({ tipo: 'error', texto: '❌ La edad gestacional es requerida' });
      setActiveTab(0);
      return false;
    }
    if (!datosParto.profesional_acargo) {
      setMensaje({ tipo: 'error', texto: '❌ El profesional a cargo es requerido' });
      setActiveTab(0);
      return false;
    }

    // Validar recién nacidos
    for (let i = 0; i < recienNacidos.length; i++) {
      const rn = recienNacidos[i];
      if (!rn.sexo) {
        setMensaje({ tipo: 'error', texto: `❌ RN ${i + 1}: Debe seleccionar el sexo` });
        setActiveTab(i + 1);
        return false;
      }
      if (!rn.peso_gramos || Number(rn.peso_gramos) < 100) {
        setMensaje({ tipo: 'error', texto: `❌ RN ${i + 1}: El peso debe ser mayor a 100g` });
        setActiveTab(i + 1);
        return false;
      }
      if (!rn.talla_cm || Number(rn.talla_cm) < 10) {
        setMensaje({ tipo: 'error', texto: `❌ RN ${i + 1}: La talla debe ser mayor a 10cm` });
        setActiveTab(i + 1);
        return false;
      }
      if (rn.apgar_1 === '' || rn.apgar_5 === '') {
        setMensaje({ tipo: 'error', texto: `❌ RN ${i + 1}: Los puntajes APGAR son requeridos` });
        setActiveTab(i + 1);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) return;

    setIsLoading(true);
    setMensaje(null);

    try {
      // 1. Crear el parto
      const partoData = {
        madre: madreSeleccionada!.id!,
        fecha: datosParto.fecha,
        hora: datosParto.hora,
        tipo_parto: datosParto.tipo_parto,
        edad_gestacional: Number(datosParto.edad_gestacional),
        profesional_acargo: datosParto.profesional_acargo,
        observaciones: datosParto.observaciones || undefined,
      };

      const partoCreado = await partosApi.create(partoData);
      console.log('Parto creado:', partoCreado);

      if (partoCreado && partoCreado.id) {
        setPartoParaAlta(partoCreado.id);
        console.log('partoParaAlta guardado:', partoCreado.id);
      }

      // 2. Crear los recién nacidos
      for (const rn of recienNacidos) {
        const rnData = {
          parto: partoCreado.id!,
          sexo: rn.sexo,
          peso_gramos: Number(rn.peso_gramos),
          talla_cm: Number(rn.talla_cm),
          circunferencia_craneal: rn.circunferencia_craneal ? Number(rn.circunferencia_craneal) : undefined,
          apgar_1: Number(rn.apgar_1),
          apgar_5: Number(rn.apgar_5),
          vacuna_bcg: rn.vacuna_bcg,
          vacuna_hepatitis_b: rn.vacuna_hepatitis_b,
          screening_auditivo: rn.screening_auditivo,
          profilaxis_ocular: rn.profilaxis_ocular,
          observaciones: rn.observaciones || undefined,
        };

        await recienNacidosApi.create(rnData);
      }

      setMensaje({ tipo: 'success', texto: '✅ Registro clínico guardado correctamente' });

      // Limpiar formulario después de 2 segundos
      setTimeout(() => {
        setDatosParto(initialDatosParto);
        setRecienNacidos([{ ...initialRecienNacido }]);
        setActiveTab(0);
      }, 2000);

    } catch (error: unknown) {
      console.error('Error al guardar:', error);
      const err = error as { response?: { data?: { detail?: string } } };
      setMensaje({ 
        tipo: 'error', 
        texto: `❌ Error: ${err.response?.data?.detail || 'No se pudo guardar el registro'}` 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Solicitar alta médica
  const handleSolicitarAlta = async () => {
    console.log('=== SOLICITANDO ALTA ===');
    console.log('partoParaAlta:', partoParaAlta);
    console.log('tipoAlta:', tipoAlta);
    
    if (!partoParaAlta) {
      setMensaje({ tipo: 'error', texto: '❌ No hay parto registrado para solicitar alta' });
      return;
    }

    const dataToSend = {
      tipo: tipoAlta,
      parto: partoParaAlta,
      observaciones: '',
    };
    
    console.log('Datos a enviar:', dataToSend);

    try {
      const response = await altasApi.create(dataToSend);
      console.log('Respuesta:', response);
      
      setMensaje({ tipo: 'success', texto: '✅ Solicitud de alta enviada correctamente' });
      setMostrarModalAlta(false);
      setPartoParaAlta(undefined);
      cargarAltasPendientes();
    } catch (error: unknown) {
      console.error('Error completo:', error);
      const err = error as { response?: { data?: Record<string, string[]> } };
      const errorMsg = err.response?.data 
        ? Object.values(err.response.data).flat().join(', ')
        : 'Error desconocido';
      setMensaje({ tipo: 'error', texto: `❌ Error: ${errorMsg}` });
    }
  };

  const tabs = [
    { id: 'parto', label: '🏥 Datos del Parto' },
    ...recienNacidos.map((_, i) => ({
      id: `rn-${i}`,
      label: `👶 RN ${i + 1}`,
    })),
    { id: 'admin', label: '📋 Info Paciente' },
    { id: 'altas', label: `📤 Altas (${altasPendientes.length})` },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>👩‍⚕️ Registro Clínico - Enfermera</h1>

        {mensaje && (
          <div style={{
            ...styles.mensaje,
            backgroundColor: mensaje.tipo === 'success' ? '#d4edda' : mensaje.tipo === 'error' ? '#f8d7da' : '#cce5ff',
            color: mensaje.tipo === 'success' ? '#155724' : mensaje.tipo === 'error' ? '#721c24' : '#004085',
          }}>
            {mensaje.texto}
          </div>
        )}

        <BuscarPaciente
          onPacienteEncontrado={handlePacienteEncontrado}
          onRutChange={handleRutChange}
        />

        {madreSeleccionada && (
          <div style={styles.pacienteInfo}>
            <span style={styles.pacienteNombre}>✅ {madreSeleccionada.nombre_completo}</span>
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
          {recienNacidos.length < 4 && activeTab > 0 && activeTab <= recienNacidos.length && (
            <button type="button" onClick={agregarRecienNacido} style={styles.btnAgregarRN}>
              ➕ Agregar RN (Gemelar)
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={styles.tabContent}>
            <div style={styles.scrollContent}>
              
              {/* Tab 0: Datos del Parto */}
              {activeTab === 0 && (
                <div>
                  <Section titulo="Información del Parto">
                    <div style={styles.formGrid}>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Fecha *</label>
                        <input
                          type="date"
                          name="fecha"
                          value={datosParto.fecha}
                          onChange={handleDatosPartoChange}
                          style={styles.input}
                          required
                        />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Hora *</label>
                        <input
                          type="time"
                          name="hora"
                          value={datosParto.hora}
                          onChange={handleDatosPartoChange}
                          style={styles.input}
                          required
                        />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Tipo de Parto *</label>
                        <select
                          name="tipo_parto"
                          value={datosParto.tipo_parto}
                          onChange={handleDatosPartoChange}
                          style={styles.input}
                          required
                        >
                          <option value="">Seleccione...</option>
                          {TIPOS_PARTO.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Edad Gestacional (semanas) *</label>
                        <input
                          type="number"
                          name="edad_gestacional"
                          value={datosParto.edad_gestacional}
                          onChange={handleDatosPartoChange}
                          style={styles.input}
                          min={20}
                          max={45}
                          placeholder="37"
                          required
                        />
                      </div>
                      <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
                        <label style={styles.label}>Profesional a Cargo *</label>
                        <input
                          type="text"
                          name="profesional_acargo"
                          value={datosParto.profesional_acargo}
                          onChange={handleDatosPartoChange}
                          style={styles.input}
                          placeholder="Nombre del profesional"
                          required
                        />
                      </div>
                      <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
                        <label style={styles.label}>Observaciones / Complicaciones</label>
                        <textarea
                          name="observaciones"
                          value={datosParto.observaciones}
                          onChange={handleDatosPartoChange}
                          style={styles.textarea}
                          rows={3}
                          placeholder="Observaciones clínicas relevantes..."
                        />
                      </div>
                    </div>
                  </Section>
                </div>
              )}

              {/* Tabs de Recién Nacidos */}
              {recienNacidos.map((rn, index) => (
                activeTab === index + 1 && (
                  <div key={rn.id}>
                    <div style={styles.rnHeader}>
                      <span style={styles.rnTitle}>👶 Recién Nacido {index + 1}</span>
                      {recienNacidos.length > 1 && (
                        <button
                          type="button"
                          onClick={() => eliminarRecienNacido(index)}
                          style={styles.btnEliminarRN}
                        >
                          🗑️ Eliminar RN
                        </button>
                      )}
                    </div>

                    <Section titulo="Datos Biométricos">
                      <div style={styles.formGrid}>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Sexo *</label>
                          <select
                            name="sexo"
                            value={rn.sexo}
                            onChange={(e) => handleRecienNacidoChange(index, e)}
                            style={styles.input}
                            required
                          >
                            <option value="">Seleccione...</option>
                            <option value="FEMENINO">Femenino</option>
                            <option value="MASCULINO">Masculino</option>
                            <option value="INDETERMINADO">Indeterminado</option>
                          </select>
                        </div>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Peso (gramos) *</label>
                          <input
                            type="number"
                            name="peso_gramos"
                            value={rn.peso_gramos}
                            onChange={(e) => handleRecienNacidoChange(index, e)}
                            style={styles.input}
                            min={100}
                            max={7000}
                            placeholder="3200"
                            required
                          />
                        </div>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Talla (cm) *</label>
                          <input
                            type="number"
                            name="talla_cm"
                            value={rn.talla_cm}
                            onChange={(e) => handleRecienNacidoChange(index, e)}
                            style={styles.input}
                            min={10}
                            max={70}
                            step={0.1}
                            placeholder="50"
                            required
                          />
                        </div>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Circunferencia Craneal (cm)</label>
                          <input
                            type="number"
                            name="circunferencia_craneal"
                            value={rn.circunferencia_craneal}
                            onChange={(e) => handleRecienNacidoChange(index, e)}
                            style={styles.input}
                            min={20}
                            max={50}
                            step={0.1}
                            placeholder="34"
                          />
                        </div>
                      </div>
                    </Section>

                    <Section titulo="Evaluación APGAR">
                      <div style={styles.apgarContainer}>
                        <div style={styles.apgarGrid}>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>APGAR 1 minuto *</label>
                            <input
                              type="number"
                              name="apgar_1"
                              value={rn.apgar_1}
                              onChange={(e) => handleRecienNacidoChange(index, e)}
                              style={styles.inputApgar}
                              min={0}
                              max={10}
                              required
                            />
                          </div>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>APGAR 5 minutos *</label>
                            <input
                              type="number"
                              name="apgar_5"
                              value={rn.apgar_5}
                              onChange={(e) => handleRecienNacidoChange(index, e)}
                              style={styles.inputApgar}
                              min={0}
                              max={10}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </Section>

                    <Section titulo="Vacunas y Procedimientos">
                      <div style={styles.checkboxGrid}>
                        <label style={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            name="vacuna_bcg"
                            checked={rn.vacuna_bcg}
                            onChange={(e) => handleRecienNacidoChange(index, e)}
                            style={styles.checkbox}
                          />
                          Vacuna BCG
                        </label>
                        <label style={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            name="vacuna_hepatitis_b"
                            checked={rn.vacuna_hepatitis_b}
                            onChange={(e) => handleRecienNacidoChange(index, e)}
                            style={styles.checkbox}
                          />
                          Vacuna Hepatitis B
                        </label>
                        <label style={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            name="screening_auditivo"
                            checked={rn.screening_auditivo}
                            onChange={(e) => handleRecienNacidoChange(index, e)}
                            style={styles.checkbox}
                          />
                          Screening Auditivo
                        </label>
                        <label style={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            name="profilaxis_ocular"
                            checked={rn.profilaxis_ocular}
                            onChange={(e) => handleRecienNacidoChange(index, e)}
                            style={styles.checkbox}
                          />
                          Profilaxis Ocular
                        </label>
                      </div>
                    </Section>

                    <Section titulo="Observaciones">
                      <textarea
                        name="observaciones"
                        value={rn.observaciones}
                        onChange={(e) => handleRecienNacidoChange(index, e)}
                        style={styles.textarea}
                        rows={3}
                        placeholder="Observaciones del recién nacido..."
                      />
                    </Section>
                  </div>
                )
              ))}

              {/* Tab Info Paciente */}
              {activeTab === recienNacidos.length + 1 && (
                <div>
                  <Section titulo="Datos de la Paciente">
                    {madreSeleccionada ? (
                      <div style={styles.datosGrid}>
                        <DatoReadOnly label="Nombre" valor={madreSeleccionada.nombre_completo || '-'} />
                        <DatoReadOnly label="RUT" valor={madreSeleccionada.rut || '-'} />
                        <DatoReadOnly label="Fecha Nacimiento" valor={madreSeleccionada.fecha_nacimiento || '-'} />
                        <DatoReadOnly label="Nacionalidad" valor={madreSeleccionada.nacionalidad || '-'} />
                        <DatoReadOnly label="Comuna" valor={madreSeleccionada.comuna || '-'} />
                        <DatoReadOnly label="CESFAM" valor={madreSeleccionada.cesfam || 'No registrado'} />
                        <DatoReadOnly label="Teléfono" valor={madreSeleccionada.telefono || 'No registrado'} />
                        <DatoReadOnly label="Dirección" valor={madreSeleccionada.direccion || 'No registrada'} />
                      </div>
                    ) : (
                      <p style={styles.noData}>Busque una paciente para ver sus datos.</p>
                    )}
                  </Section>
                </div>
              )}

              {/* Tab Altas */}
              {activeTab === recienNacidos.length + 2 && (
                <div>
                  <Section titulo="Solicitar Alta Médica">
                    {partoParaAlta ? (
                      <div style={styles.altaBox}>
                        <p>Parto registrado: <strong>#{partoParaAlta}</strong></p>
                        <button
                          type="button"
                          onClick={() => setMostrarModalAlta(true)}
                          style={styles.btnSolicitarAlta}
                        >
                          📤 Solicitar Alta Médica
                        </button>
                      </div>
                    ) : (
                      <p style={styles.noData}>
                        Primero debe registrar un parto para solicitar el alta.
                      </p>
                    )}
                  </Section>

                  <Section titulo="Mis Solicitudes de Alta Pendientes">
                    {altasPendientes.length > 0 ? (
                      <div style={styles.altasGrid}>
                        {altasPendientes.map(alta => (
                          <div key={alta.id} style={styles.altaCard}>
                            <div style={styles.altaCardHeader}>
                              <span style={styles.altaTipo}>{alta.tipo}</span>
                              <span style={styles.altaEstado}>⏳ {alta.estado}</span>
                            </div>
                            <p style={styles.altaInfo}>Parto #{alta.parto}</p>
                            <p style={styles.altaInfo}>Madre: {alta.madre_nombre || 'N/A'}</p>
                            <p style={styles.altaFecha}>
                              Solicitada: {alta.fecha_solicitud ? new Date(alta.fecha_solicitud).toLocaleDateString() : '-'}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={styles.noData}>No hay solicitudes de alta pendientes.</p>
                    )}
                  </Section>
                </div>
              )}

            </div>
          </div>

          <div style={styles.submitContainer}>
            <button 
              type="submit" 
              disabled={isLoading || !madreSeleccionada} 
              style={{
                ...styles.submitButton,
                opacity: isLoading || !madreSeleccionada ? 0.6 : 1,
                cursor: isLoading || !madreSeleccionada ? 'not-allowed' : 'pointer',
              }}
            >
              {isLoading ? '⏳ Guardando...' : '💾 Guardar Registro Clínico'}
            </button>
          </div>
        </form>

        {/* Modal Solicitar Alta */}
        {mostrarModalAlta && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <h3 style={styles.modalTitle}>📤 Solicitar Alta Médica</h3>
              <p>Parto: <strong>#{partoParaAlta}</strong></p>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Tipo de Alta</label>
                <select
                  value={tipoAlta}
                  onChange={(e) => setTipoAlta(e.target.value)}
                  style={styles.input}
                >
                  <option value="MEDICA">Médica</option>
                  <option value="VOLUNTARIA">Voluntaria</option>
                </select>
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setMostrarModalAlta(false)}
                  style={styles.btnCancelar}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSolicitarAlta}
                  style={styles.btnConfirmar}
                >
                  ✅ Enviar Solicitud
                </button>
              </div>
            </div>
          </div>
        )}
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
  container: { fontFamily: "'Poppins', sans-serif", minHeight: 'calc(100vh - 60px)', padding: '20px' },
  content: { maxWidth: '1100px', margin: '0 auto' },
  title: { fontSize: '24px', fontWeight: 700, color: '#1a365d', marginBottom: '20px' },
  mensaje: { padding: '12px 20px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' },
  pacienteInfo: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#d4edda', padding: '12px 20px', borderRadius: '10px', marginBottom: '20px' },
  pacienteNombre: { fontWeight: 600, color: '#155724', fontSize: '16px' },
  pacienteRut: { color: '#155724', fontSize: '14px' },
  tabsContainer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0', gap: '10px', flexWrap: 'wrap' },
  tabs: { display: 'flex', gap: '5px', flexWrap: 'wrap' },
  tabButton: { backgroundColor: '#e9ecef', border: 'none', padding: '10px 16px', borderRadius: '8px 8px 0 0', cursor: 'pointer', fontSize: '13px', fontWeight: 500, color: '#495057', fontFamily: "'Poppins', sans-serif" },
  tabButtonActive: { backgroundColor: '#007bff', color: 'white' },
  btnAgregarRN: { backgroundColor: '#17a2b8', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Poppins', sans-serif" },
  tabContent: { backgroundColor: '#e8f3ff', borderRadius: '0 12px 12px 12px', boxShadow: '0 2px 10px rgba(0, 123, 255, 0.15)', minHeight: '500px' },
  scrollContent: { padding: '25px', maxHeight: '600px', overflowY: 'auto' },
  rnHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '10px', borderBottom: '2px solid #007bff' },
  rnTitle: { fontSize: '16px', fontWeight: 600, color: '#007bff' },
  btnEliminarRN: { backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontFamily: "'Poppins', sans-serif" },
  section: { marginBottom: '25px' },
  sectionTitle: { fontSize: '15px', fontWeight: 600, color: '#1a365d', marginBottom: '15px', paddingBottom: '8px', borderBottom: '1px solid #c1d9e7' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginBottom: '15px' },
  formGroup: {},
  label: { display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 500, color: '#495057' },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #c1d9e7', borderRadius: '8px', fontSize: '14px', fontFamily: "'Poppins', sans-serif", boxSizing: 'border-box', backgroundColor: 'white' },
  textarea: { width: '100%', padding: '10px 12px', border: '1px solid #c1d9e7', borderRadius: '8px', fontSize: '14px', fontFamily: "'Poppins', sans-serif", boxSizing: 'border-box', resize: 'vertical', backgroundColor: 'white' },
  checkboxGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '15px' },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#495057', cursor: 'pointer' },
  checkbox: { width: '18px', height: '18px', cursor: 'pointer' },
  apgarContainer: { backgroundColor: '#fff3cd', padding: '20px', borderRadius: '10px', marginBottom: '15px' },
  apgarGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' },
  inputApgar: { width: '100%', padding: '15px', border: '2px solid #ffc107', borderRadius: '8px', fontSize: '28px', fontWeight: 700, textAlign: 'center', fontFamily: "'Poppins', sans-serif", boxSizing: 'border-box', backgroundColor: 'white' },
  datosGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' },
  datoReadOnly: { backgroundColor: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #c1d9e7' },
  datoLabel: { display: 'block', fontSize: '11px', color: '#666', marginBottom: '4px', textTransform: 'uppercase' },
  datoValor: { fontSize: '15px', fontWeight: 500, color: '#1a365d' },
  noData: { textAlign: 'center', color: '#666', padding: '40px' },
  submitContainer: { display: 'flex', justifyContent: 'flex-end', padding: '20px 25px', borderTop: '1px solid #c1d9e7', backgroundColor: '#e8f3ff', borderRadius: '0 0 12px 12px' },
  submitButton: { backgroundColor: '#28a745', color: 'white', padding: '14px 30px', border: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '16px', cursor: 'pointer', fontFamily: "'Poppins', sans-serif", boxShadow: '0 4px 10px rgba(40, 167, 69, 0.3)' },
  // Altas
  altaBox: { backgroundColor: '#d4edda', padding: '20px', borderRadius: '10px', textAlign: 'center' },
  btnSolicitarAlta: { backgroundColor: '#28a745', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Poppins', sans-serif", marginTop: '10px' },
  altasGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' },
  altaCard: { backgroundColor: 'white', padding: '15px', borderRadius: '10px', border: '1px solid #ffc107' },
  altaCardHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' },
  altaTipo: { fontWeight: 600, color: '#1a365d' },
  altaEstado: { fontSize: '12px', color: '#856404', backgroundColor: '#fff3cd', padding: '2px 8px', borderRadius: '4px' },
  altaInfo: { fontSize: '13px', color: '#495057', margin: '5px 0' },
  altaFecha: { fontSize: '11px', color: '#6c757d' },
  // Modal
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '400px', maxWidth: '90%' },
  modalTitle: { fontSize: '18px', fontWeight: 600, color: '#1a365d', marginBottom: '20px' },
  modalActions: { display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' },
  btnCancelar: { padding: '10px 20px', border: '1px solid #6c757d', borderRadius: '8px', backgroundColor: 'white', color: '#6c757d', cursor: 'pointer', fontFamily: "'Poppins', sans-serif" },
  btnConfirmar: { padding: '10px 20px', border: 'none', borderRadius: '8px', backgroundColor: '#28a745', color: 'white', cursor: 'pointer', fontFamily: "'Poppins', sans-serif", fontWeight: 600 },
};