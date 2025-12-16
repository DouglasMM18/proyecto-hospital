import { useState } from 'react';
import BuscarPaciente from '../../components/forms/BuscarPaciente';
import { madresApi } from '../../api/MadresApi';
import type { Madre } from '../../types/models';

// Datos para los selects (en producción vendrían del backend)
const COMUNAS = ['Aisén', 'Algarrobo', 'Alhué', 'Alto Biobío', 'Alto del Carmen', 'Alto Hospicio', 
 'Ancud', 'Andacollo', 'Angol', 'Antártica', 'Antofagasta', 'Antuco', 
 'Arauco', 'Arica', 'Buin', 'Bulnes', 
 'Cabo de Hornos', 'Cabrero', 'Cabildo', 'Calama', 'Calbuco', 'Caldera', 
 'Calera', 'Calera de Tango', 'Calle Larga', 'Camarones', 'Camiña', 'Canela', 
 'Cañete', 'Carahue', 'Cartagena', 'Casablanca', 'Castro', 'Catemu', 
 'Cauquenes', 'Cerrillos', 'Cerro Navia', 'Chaitén', 'Chanco', 'Chañaral', 
 'Chiguayante', 'Chile Chico', 'Chillán', 'Chillán Viejo', 'Chimbarongo', 'Cholchol', 
 'Chonchi', 'Cisnes', 'Cobquecura', 'Cochamó', 'Cochrane', 'Codegua', 
 'Coelemu', 'Coihaique', 'Coihueco', 'Coinco', 'Colbún', 'Colchane', 
 'Colina', 'Collipulli', 'Coltauco', 'Combarbalá', 'Concón', 'Concepción', 
 'Constitución', 'Contulmo', 'Copiapó', 'Coquimbo', 'Coronel', 'Corral', 
 'Cunco', 'Curacautín', 'Curacaví', 'Curaco de Vélez', 'Curanilahue', 'Curarrehue', 
 'Curepto', 'Curicó', 'Dalcahue', 'Diego de Almagro', 'Doñihue', 
 'El Bosque', 'El Carmen', 'El Monte', 'El Quisco', 'El Tabo', 'Empedrado', 
 'Ercilla', 'Estación Central', 
 'Florida', 'Freire', 'Freirina', 'Fresia', 'Frutillar', 'Futrono', 
 'Galvarino', 'General Lagos', 'Gorbea', 'Graneros', 'Guaitecas', 
 'Hualaihué', 'Hualañé', 'Hualpén', 'Hualqui', 'Huara', 'Huasco', 
 'Huechuraba', 'Hijuelas', 
 'Illapel', 'Independencia', 'Iquique', 'Isla de Maipo', 'Isla de Pascua', 
 'Juan Fernández', 
 'La Cisterna', 'La Cruz', 'La Estrella', 'La Florida', 'La Granja', 'La Higuera', 
 'La Ligua', 'La Pintana', 'La Reina', 'La Serena', 'La Unión', 'Lago Ranco', 
 'Lago Verde', 'Laguna Blanca', 'Laja', 'Lampa', 'Lanco', 'Las Cabras', 
 'Las Condes', 'Lautaro', 'Lebu', 'Licantén', 'Limache', 'Linares', 
 'Litueche', 'Llaillay', 'Lo Barnechea', 'Lo Espejo', 'Lo Prado', 'Lolol', 
 'Loncoche', 'Longaví', 'Lonquimay', 'Los Álamos', 'Los Andes', 'Los Ángeles', 
 'Los Lagos', 'Los Muermos', 'Los Sauces', 'Los Vilos', 'Lota', 'Lumaco', 
 'Machalí', 'Macul', 'Máfil', 'Maipú', 'Malloa', 'Marchihue', 
 'María Elena', 'María Pinto', 'Mariquina', 'Maule', 'Maullín', 'Mejillones', 
 'Melipilla', 'Melipeuco', 'Molina', 'Monte Patria', 'Mostazal', 'Mulchén', 
 'Nacimiento', 'Nancagua', 'Natales', 'Navidad', 'Negrete', 'Ninhue', 
 'Ñiquén', 'Nogales', 'Nueva Imperial', 'Ñuñoa', 
 'O\'Higgins', 'Ollagüe', 'Olivar', 'Olmue', 'Osorno', 'Ovalle', 
 'Padre Hurtado', 'Padre Las Casas', 'Paiguano', 'Paine', 'Paillaco', 'Palena', 
 'Palmilla', 'Panguipulli', 'Panquehue', 'Papudo', 'Paredones', 'Parral', 
 'Pedro Aguirre Cerda', 'Pelarco', 'Pelluhue', 'Pemuco', 'Peñaflor', 'Peñalolén', 
 'Pencahue', 'Penco', 'Peralillo', 'Perquenco', 'Petorca', 'Peumo', 
 'Pica', 'Pichidegua', 'Pichilemu', 'Placilla', 'Pinto', 'Pirque', 
 'Pitrufquén', 'Portezuelo', 'Porvenir', 'Pozo Almonte', 'Primavera', 'Providencia', 
 'Pucón', 'Pudahuel', 'Puente Alto', 'Puerto Montt', 'Puerto Octay', 'Puerto Varas', 
 'Puchuncaví', 'Pumanque', 'Punitaqui', 'Punta Arenas', 'Purén', 'Purranque', 
 'Putaendo', 'Putre', 'Puyehue', 
 'Quellón', 'Quemchi', 'Quilaco', 'Quilicura', 'Quilleco', 'Quillón', 
 'Quillota', 'Quilpué', 'Quinchao', 'Quinta de Tilcoco', 'Quinta Normal', 'Quintero', 
 'Quirihue', 
 'Rancagua', 'Ránquil', 'Rauco', 'Recoleta', 'Rengo', 'Renaico', 
 'Renca', 'Requínoa', 'Retiro', 'Rinconada', 'Río Bueno', 'Río Hurtado', 
 'Río Ibáñez', 'Río Negro', 'Río Verde', 'Romeral', 
 'Saavedra', 'Sagrada Familia', 'Salamanca', 'San Antonio', 'San Bernardo', 'San Carlos', 
 'San Clemente', 'San Esteban', 'San Fabián', 'San Felipe', 'San Fernando', 'San Gregorio', 
 'San Ignacio', 'San Javier', 'San Joaquín', 'San José de Maipo', 'San Juan de la Costa', 'San Miguel', 
 'San Nicolás', 'San Pablo', 'San Pedro', 'San Pedro de Atacama', 'San Pedro de la Paz', 'San Rafael', 
 'San Ramón', 'San Vicente de Tagua Tagua', 'Santa Bárbara', 'Santa Cruz', 'Santa Juana', 'Santa María', 
 'Santiago', 'Santo Domingo', 'Sierra Gorda', 
 'Talagante', 'Talcahuano', 'Talca', 'Taltal', 'Temuco', 'Teno', 
 'Teodoro Schmidt', 'Tierra Amarilla', 'Tiltil', 'Timaukel', 'Tirúa', 'Tocopilla', 
 'Toltén', 'Tomé', 'Tortel', 'Torres del Paine', 'Traiguén', 'Treguaco', 
 'Tucapel', 
 'Valdivia', 'Vallenar', 'Valparaíso', 'Vichuquén', 'Vicuña', 'Victoria', 
 'Vilcún', 'Villa Alemana', 'Villa Alegre', 'Villarrica', 'Viña del Mar', 'Vitacura', 
 'Yerbas Buenas', 'Yumbel', 'Yungay', 
 'Zapallar'];

const CESFAM_LIST = [
  'CESFAM Alcaldesa Teresa Baldecchi Suazo (Chillán)', 
 'CESFAM Dr. Federico Puga Borne (Chillán)', 
 'CESFAM Isabel Riquelme (Chillán)', 
 'CESFAM Los Volcanes (Chillán)', 
 'CESFAM Quinchamalí (Chillán)', 
 'CESFAM San Ramón Nonato (Chillán)', 
 'CESFAM Sol de Oriente (Chillán)', 
 'CESFAM Ultraestación Dr. Raúl San Martín (Chillán)', 
 'CESFAM Violeta Parra (Chillán)', 
 'CESFAM Michelle Bachelet Jeria (Chillán Viejo)', 
 'Hospital Comunitario de Salud Familiar Bulnes', 
 'Hospital Comunitario de Salud Familiar El Carmen', 
 'CESFAM Pemuco', 
 'CESFAM Pinto', 
 'CESFAM Doctor Raúl San Martin (Quillón)', 
 'Hospital Comunitario de Salud Familiar San Ignacio', 
 'Hospital Comunitario de Salud Familiar Pedro Morales Campos (Yungay)', 
 'CESFAM Cobquecura', 
 'Hospital Comunitario de Salud Familiar Coelemu', 
 'CESFAM Ninhue', 
 'CESFAM Portezuelo', 
 'Hospital Comunitario de Salud Familiar Quirihue', 
 'CESFAM Ránquil', 
 'CESFAM Treguaco', 
 'CESFAM Dr. José Durán Trujillo (San Carlos)', 
 'CESFAM Alcaldesa Teresa Baldecchi Suazo (San Carlos)', 
 'CESFAM Coihueco', 
 'CESFAM Ñiquén (San Gregorio)', 
 'Hospital Comunitario de Salud Familiar San Fabián', 
 'CESFAM San Nicolás'];

const NACIONALIDADES = [
  'Chilena', 'Argentina', 'Peruana', 'Boliviana', 'Venezolana', 
  'Colombiana', 'Haitiana', 'Ecuatoriana', 'Brasileña', 'Otra'
];

const PUEBLOS_ORIGINARIOS = [
  'Aymara', 
 'Quechua', 
 'Likan Antay (Atacameño)', 
 'Colla', 
 'Diaguita', 
 'Rapa Nui', 
 'Mapuche', 
 'Kawésqar', 
 'Yagán (Yámana)', 
 'Chango', 
 'Selk\'nam',
 'Otro'
];

const REGIONES = [
 'Antofagasta','Arica y Parinacota', 'Atacama', 'Aysén del General Carlos Ibáñez del Campo','Biobío', 'Coquimbo', 'La Araucanía', 'Libertador General Bernardo O\'Higgins', 'Los Lagos', 'Los Ríos', 'Magallanes y de la Antártica Chilena','Maule', 'Metropolitana de Santiago','Ñuble', 'Tarapacá', 'Valparaíso'
];

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
  region: 'Ñuble',
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
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);
  const [madreExistente, setMadreExistente] = useState<Madre | null>(null);

  // Manejar paciente encontrado
  const handlePacienteEncontrado = (madre: Madre | null) => {
    if (madre) {
      setMadreExistente(madre);
      const nombrePartes = madre.nombre_completo?.split(' ') || [];
      setFormData(prev => ({
        ...prev,
        id: madre.id || null,
        nombre: nombrePartes[0] || '',
        apellidoPaterno: nombrePartes[1] || '',
        apellidoMaterno: nombrePartes.slice(2).join(' ') || '',
        fechaNacimiento: madre.fecha_nacimiento || '',
        comuna: madre.comuna || '',
        cesfam: madre.cesfam || '',
        nacionalidad: madre.nacionalidad || 'Chilena',
        esMigrante: madre.es_migrante || false,
        puebloOriginario: madre.pueblo_originario || false,
        direccion: madre.direccion || '',
        telefono: madre.telefono || '',
      }));
      setMensaje({ tipo: 'success', texto: 'Paciente cargada. Puede editar los datos.' });
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
        direccion: '',
        telefono: '',
      }));
    }
  };

  // Manejar cambio de RUT
  const handleRutChange = (run: string, dv: string) => {
    setFormData(prev => ({ ...prev, run, dv }));
    setMensaje(null);
  };

  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Cambiar pestaña (SIN enviar formulario)
  const cambiarTab = (index: number) => {
    setActiveTab(index);
  };

  // Enviar formulario (SOLO al hacer clic en Guardar)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.run || !formData.dv) {
      setMensaje({ tipo: 'error', texto: 'Debe buscar o ingresar un RUT válido' });
      return;
    }
    if (!formData.nombre || !formData.apellidoPaterno) {
      setMensaje({ tipo: 'error', texto: 'Nombre y apellido paterno son requeridos' });
      setActiveTab(0);
      return;
    }
    if (!formData.fechaNacimiento) {
      setMensaje({ tipo: 'error', texto: 'Fecha de nacimiento es requerida' });
      setActiveTab(0);
      return;
    }
    if (!formData.comuna) {
      setMensaje({ tipo: 'error', texto: 'Comuna es requerida' });
      setActiveTab(1);
      return;
    }

    setIsLoading(true);
    setMensaje(null);

    try {
      const rutCompleto = `${formData.run}-${formData.dv}`;
      
      const madreData = {
        rut: rutCompleto,
        nombre_completo: `${formData.nombre} ${formData.apellidoPaterno} ${formData.apellidoMaterno}`.trim(),
        fecha_nacimiento: formData.fechaNacimiento,
        comuna: formData.comuna,
        cesfam: formData.cesfam || null,
        nacionalidad: formData.nacionalidad,
        es_migrante: formData.esMigrante,
        pueblo_originario: formData.puebloOriginario,
        direccion: formData.direccion || null,
        telefono: formData.telefono || null,
      };

      if (madreExistente && madreExistente.id) {
        await madresApi.update(madreExistente.id, madreData);
        setMensaje({ tipo: 'success', texto: '✅ Paciente actualizada correctamente' });
      } else {
        await madresApi.create(madreData);
        setMensaje({ tipo: 'success', texto: '✅ Paciente registrada correctamente' });
      }

      // Limpiar formulario después de guardar
      setTimeout(() => {
        setFormData(initialFormData);
        setMadreExistente(null);
        setActiveTab(0);
        setMensaje(null);
      }, 2000);

    } catch (error: unknown) {
      console.error('Error al guardar:', error);
      const err = error as { response?: { data?: { rut?: string[]; detail?: string } } };
      if (err.response?.data?.rut) {
        setMensaje({ tipo: 'error', texto: 'Error: ' + err.response.data.rut[0] });
      } else if (err.response?.data?.detail) {
        setMensaje({ tipo: 'error', texto: 'Error: ' + err.response.data.detail });
      } else {
        setMensaje({ tipo: 'error', texto: 'Error al guardar. Verifique la conexión con el servidor.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Limpiar formulario
  const limpiarFormulario = () => {
    setFormData(initialFormData);
    setMadreExistente(null);
    setActiveTab(0);
    setMensaje(null);
  };

  const tabs = ['Datos Personales', 'Contacto y Ubicación', 'Datos de Ingreso'];

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>📋 Admisión de Pacientes</h1>

        {/* Mensaje de estado */}
        {mensaje && (
          <div style={{
            ...styles.mensaje,
            backgroundColor: mensaje.tipo === 'success' ? '#d4edda' : '#f8d7da',
            color: mensaje.tipo === 'success' ? '#155724' : '#721c24',
            borderColor: mensaje.tipo === 'success' ? '#c3e6cb' : '#f5c6cb',
          }}>
            {mensaje.texto}
          </div>
        )}

        {/* Buscador de paciente */}
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
                onClick={() => cambiarTab(index)}
                style={{
                  ...styles.tabButton,
                  ...(activeTab === index ? styles.tabButtonActive : {}),
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Formulario - onSubmit solo se dispara con el botón submit */}
          <form onSubmit={handleSubmit}>
            <div style={styles.tabContent}>
              
              {/* Tab 0: Datos Personales */}
              {activeTab === 0 && (
                <div style={styles.tabPane}>
                  <div style={styles.formGrid}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>RUN *</label>
                      <input
                        type="text"
                        value={formData.run && formData.dv ? `${formData.run}-${formData.dv}` : ''}
                        disabled
                        style={{ ...styles.input, backgroundColor: '#f0f0f0' }}
                        placeholder="Busque por RUT arriba"
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Nombre *</label>
                      <input 
                        type="text" 
                        name="nombre" 
                        value={formData.nombre} 
                        onChange={handleChange} 
                        style={styles.input} 
                        placeholder="Nombre"
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Apellido Paterno *</label>
                      <input 
                        type="text" 
                        name="apellidoPaterno" 
                        value={formData.apellidoPaterno} 
                        onChange={handleChange} 
                        style={styles.input} 
                        placeholder="Apellido paterno"
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
                        placeholder="Apellido materno"
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Fecha de Nacimiento *</label>
                      <input 
                        type="date" 
                        name="fechaNacimiento" 
                        value={formData.fechaNacimiento} 
                        onChange={handleChange} 
                        style={styles.input} 
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Nacionalidad</label>
                      <select 
                        name="nacionalidad" 
                        value={formData.nacionalidad} 
                        onChange={handleChange} 
                        style={styles.input}
                      >
                        {NACIONALIDADES.map(n => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <h3 style={styles.sectionTitle}>Condiciones Especiales</h3>
                  <div style={styles.checkboxGrid}>
                    <label style={styles.checkboxLabel}>
                      <input 
                        type="checkbox" 
                        name="esMigrante" 
                        checked={formData.esMigrante} 
                        onChange={handleChange} 
                        style={styles.checkbox} 
                      />
                      Migrante
                    </label>
                    <label style={styles.checkboxLabel}>
                      <input 
                        type="checkbox" 
                        name="puebloOriginario" 
                        checked={formData.puebloOriginario} 
                        onChange={handleChange} 
                        style={styles.checkbox} 
                      />
                      Pueblo Originario
                    </label>
                    <label style={styles.checkboxLabel}>
                      <input 
                        type="checkbox" 
                        name="privadaLibertad" 
                        checked={formData.privadaLibertad} 
                        onChange={handleChange} 
                        style={styles.checkbox} 
                      />
                      Privada de Libertad
                    </label>
                    <label style={styles.checkboxLabel}>
                      <input 
                        type="checkbox" 
                        name="transMasculino" 
                        checked={formData.transMasculino} 
                        onChange={handleChange} 
                        style={styles.checkbox} 
                      />
                      Trans Masculino
                    </label>
                    <label style={styles.checkboxLabel}>
                      <input 
                        type="checkbox" 
                        name="discapacidad" 
                        checked={formData.discapacidad} 
                        onChange={handleChange} 
                        style={styles.checkbox} 
                      />
                      Discapacidad
                    </label>
                  </div>

                  {formData.puebloOriginario && (
                    <div style={styles.conditionalSection}>
                      <label style={styles.label}>Tipo de Pueblo Originario</label>
                      <select 
                        name="puebloOriginarioTipo" 
                        value={formData.puebloOriginarioTipo} 
                        onChange={handleChange} 
                        style={styles.input}
                      >
                        <option value="">Seleccione...</option>
                        {PUEBLOS_ORIGINARIOS.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {formData.discapacidad && (
                    <div style={styles.conditionalSection}>
                      <label style={styles.label}>Tipo de Discapacidad</label>
                      <select 
                        name="discapacidadTipo" 
                        value={formData.discapacidadTipo} 
                        onChange={handleChange} 
                        style={styles.input}
                      >
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

              {/* Tab 1: Contacto y Ubicación */}
              {activeTab === 1 && (
                <div style={styles.tabPane}>
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
                        {REGIONES.map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
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
                        placeholder="Ciudad"
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Comuna *</label>
                      <select 
                        name="comuna" 
                        value={formData.comuna} 
                        onChange={handleChange} 
                        style={styles.input}
                      >
                        <option value="">Seleccione...</option>
                        {COMUNAS.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
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
                        placeholder="correo@ejemplo.com"
                      />
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
                      <select 
                        name="tipoPaciente" 
                        value={formData.tipoPaciente} 
                        onChange={handleChange} 
                        style={styles.input}
                      >
                        <option value="">Seleccione...</option>
                        <option value="GES">GES</option>
                        <option value="No GES">No GES</option>
                        <option value="FONASA A">FONASA A</option>
                        <option value="FONASA B">FONASA B</option>
                        <option value="FONASA C">FONASA C</option>
                        <option value="FONASA D">FONASA D</option>
                        <option value="ISAPRE">ISAPRE</option>
                        <option value="PRAIS">PRAIS</option>
                      </select>
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Origen Ingreso</label>
                      <select 
                        name="origenIngreso" 
                        value={formData.origenIngreso} 
                        onChange={handleChange} 
                        style={styles.input}
                      >
                        <option value="">Seleccione...</option>
                        <option value="Urgencia">Urgencia</option>
                        <option value="Derivación APS">Derivación APS</option>
                        <option value="Derivación Hospital">Derivación Hospital</option>
                        <option value="Programado">Programado</option>
                        <option value="Espontáneo">Espontáneo</option>
                      </select>
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>CESFAM Origen</label>
                      <select 
                        name="cesfam" 
                        value={formData.cesfam} 
                        onChange={handleChange} 
                        style={styles.input}
                      >
                        <option value="">Seleccione...</option>
                        {CESFAM_LIST.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <h3 style={styles.sectionTitle}>Plan de Parto</h3>
                  <div style={styles.radioGroup}>
                    <label style={styles.radioLabel}>
                      <input 
                        type="radio" 
                        name="planParto" 
                        value="si" 
                        checked={formData.planParto === 'si'} 
                        onChange={handleChange} 
                      /> 
                      Sí
                    </label>
                    <label style={styles.radioLabel}>
                      <input 
                        type="radio" 
                        name="planParto" 
                        value="no" 
                        checked={formData.planParto === 'no'} 
                        onChange={handleChange} 
                      /> 
                      No
                    </label>
                  </div>

                  <h3 style={styles.sectionTitle}>Visita Guiada</h3>
                  <div style={styles.radioGroup}>
                    <label style={styles.radioLabel}>
                      <input 
                        type="radio" 
                        name="visitaGuiada" 
                        value="si" 
                        checked={formData.visitaGuiada === 'si'} 
                        onChange={handleChange} 
                      /> 
                      Sí
                    </label>
                    <label style={styles.radioLabel}>
                      <input 
                        type="radio" 
                        name="visitaGuiada" 
                        value="no" 
                        checked={formData.visitaGuiada === 'no'} 
                        onChange={handleChange} 
                      /> 
                      No
                    </label>
                  </div>

                  <h3 style={styles.sectionTitle}>Acompañamiento Ley 20.584</h3>
                  <div style={styles.radioGroup}>
                    <label style={styles.radioLabel}>
                      <input 
                        type="radio" 
                        name="acompanamiento" 
                        value="si" 
                        checked={formData.acompanamiento === 'si'} 
                        onChange={handleChange} 
                      /> 
                      Sí
                    </label>
                    <label style={styles.radioLabel}>
                      <input 
                        type="radio" 
                        name="acompanamiento" 
                        value="no" 
                        checked={formData.acompanamiento === 'no'} 
                        onChange={handleChange} 
                      /> 
                      No
                    </label>
                  </div>

                  {formData.acompanamiento === 'no' && (
                    <div style={styles.conditionalSection}>
                      <label style={styles.label}>Motivo de No Acompañamiento</label>
                      <textarea 
                        name="motivoNoAcompanamiento" 
                        value={formData.motivoNoAcompanamiento} 
                        onChange={handleChange} 
                        style={styles.textarea} 
                        rows={2} 
                        placeholder="Indique el motivo..."
                      />
                    </div>
                  )}

                  {formData.acompanamiento === 'si' && (
                    <div style={styles.conditionalSection}>
                      <h4 style={styles.subTitle}>Datos del Acompañante</h4>
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
                            <option value="Hermana/o">Hermana/o</option>
                            <option value="Amiga/o">Amiga/o</option>
                            <option value="Doula">Doula</option>
                            <option value="Otro">Otro</option>
                          </select>
                        </div>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Nombre Acompañante</label>
                          <input 
                            type="text" 
                            name="nombreAcompanante" 
                            value={formData.nombreAcompanante} 
                            onChange={handleChange} 
                            style={styles.input} 
                            placeholder="Nombre completo"
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
                            placeholder="12.345.678-9"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Botones de navegación y acción */}
            <div style={styles.formActions}>
              <div style={styles.navButtons}>
                <button 
                  type="button" 
                  onClick={() => cambiarTab(Math.max(0, activeTab - 1))} 
                  disabled={activeTab === 0} 
                  style={{
                    ...styles.btnSecondary,
                    opacity: activeTab === 0 ? 0.5 : 1,
                    cursor: activeTab === 0 ? 'not-allowed' : 'pointer',
                  }}
                >
                  ← Anterior
                </button>
                
                {activeTab < tabs.length - 1 && (
                  <button 
                    type="button" 
                    onClick={() => cambiarTab(activeTab + 1)} 
                    style={styles.btnPrimary}
                  >
                    Siguiente →
                  </button>
                )}
              </div>

              <div style={styles.actionButtons}>
                <button 
                  type="button" 
                  onClick={limpiarFormulario} 
                  style={styles.btnSecondary}
                >
                  🗑️ Limpiar
                </button>
                
                {activeTab === tabs.length - 1 && (
                  <button 
                    type="submit" 
                    disabled={isLoading} 
                    style={{
                      ...styles.btnSuccess,
                      opacity: isLoading ? 0.7 : 1,
                    }}
                  >
                    {isLoading ? '⏳ Guardando...' : (madreExistente ? '💾 Actualizar Paciente' : '💾 Guardar Paciente')}
                  </button>
                )}
              </div>
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
  mensaje: {
    padding: '12px 20px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid',
    fontSize: '14px',
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
    cursor: 'pointer',
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
  navButtons: {
    display: 'flex',
    gap: '10px',
  },
  actionButtons: {
    display: 'flex',
    gap: '10px',
  },
  btnSecondary: {
    padding: '12px 20px',
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
    padding: '12px 20px',
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