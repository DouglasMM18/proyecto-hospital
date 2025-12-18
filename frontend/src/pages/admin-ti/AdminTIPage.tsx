import { useState, useEffect } from 'react';
import api from '../../api/axios';

// Interfaz adaptada a lo que devuelve Django
interface Usuario {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  rol: string; 
  is_active: boolean;
  last_login: string | null;
  date_joined?: string; 
}

// Mapa de roles Backend -> Texto legible
const rolesLabels: { [key: string]: string } = {
  ADMINISTRADOR: 'Administrativo (Admisión)',
  MATRONA: 'Matrona',
  ENFERMERA: 'Enfermera/o',
  ESPECIALISTA: 'Especialista',
  SUPERVISOR: 'Supervisor',
  TI: 'Administrador TI',
  administrativo: 'Administrativo',
  admin_ti: 'TI',
};

type ModalType = 'crear' | 'editar' | 'password' | null;

export default function AdminTIPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState<ModalType>(null);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [busqueda, setBusqueda] = useState('');

  // --- CARGAR DATOS REALES DEL BACKEND ---
  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
        setIsLoading(true);
        const response = await api.get('/api/users/');
        setUsuarios(response.data);
    } catch (err) {
        console.error("Error al cargar usuarios:", err);
        setError("No se pudieron cargar los usuarios del sistema.");
    } finally {
        setIsLoading(false);
    }
  };

  // Filtrar usuarios (Búsqueda local)
  const usuariosFiltrados = usuarios.filter(u =>
    u.username.toLowerCase().includes(busqueda.toLowerCase()) ||
    (u.first_name && u.first_name.toLowerCase().includes(busqueda.toLowerCase())) ||
    (u.last_name && u.last_name.toLowerCase().includes(busqueda.toLowerCase())) ||
    (u.email && u.email.toLowerCase().includes(busqueda.toLowerCase()))
  );

  // --- FUNCIONES DE MODALES (Alerts para la Demo) ---
  const abrirModalCrear = () => {
    alert("⚠️ Para la presentación: La creación de usuarios se realiza desde el Panel Django Admin por seguridad.");
  };

  const abrirModalEditar = (usuario: Usuario) => {
    alert(`Editar usuario ${usuario.username}: Funcionalidad gestionada en Django Admin.`);
  };

  const abrirModalPassword = (usuario: Usuario) => {
    alert("El cambio de contraseña requiere permisos de Superusuario.");
  };

  const eliminarUsuario = (id: number) => {
    if (confirm('Esta acción requiere permisos de Administrador de Base de Datos.')) {
       // Nada por ahora
    }
  };

  const cerrarModal = () => {
    setModalOpen(null);
    setUsuarioSeleccionado(null);
  };

  // --- LÓGICA DEL INTERRUPTOR ACTIVO/BLOQUEADO ---
  const toggleActivo = async (usuario: Usuario) => {
    // 1. Preguntar confirmación
    const accion = usuario.is_active ? "BLOQUEAR" : "ACTIVAR";
    if (!window.confirm(`¿Estás seguro que deseas ${accion} al usuario ${usuario.username}?`)) {
        return;
    }

    try {
        // 2. Llamada al Backend (Endpoint que creamos en views.py)
        // Nota: Asumo que la ruta es /api/users/{id}/toggle_estado/ 
        // Si usaste 'usuarios' en urls.py, cambia 'users' por 'usuarios' aquí.
        const response = await api.post(`/api/users/${usuario.id}/toggle_estado/`);

        // 3. Actualizar la tabla localmente sin recargar
        setUsuarios(prev => prev.map(u => 
            u.id === usuario.id 
                ? { ...u, is_active: response.data.is_active } 
                : u
        ));

        // Feedback visual simple (opcional, ya que el botón cambia de color)
        // alert(`Usuario ${usuario.username} ${response.data.is_active ? 'Activado' : 'Bloqueado'} correctamente.`);

    } catch (error) {
        console.error("Error cambiando estado:", error);
        alert("Error al intentar cambiar el estado. Revisa la consola o permisos.");
    }
  };


  // Función auxiliar para colores de badges
  const getRolColor = (rol: string) => {
      const r = rol?.toUpperCase();
      if (r === 'ADMINISTRADOR') return '#6f42c1'; // Morado
      if (r === 'MATRONA') return '#e83e8c';      // Rosa
      if (r === 'ENFERMERA') return '#007bff';     // Azul
      if (r === 'TI') return '#20c997';            // Verde
      if (r === 'SUPERVISOR') return '#fd7e14';    // Naranja
      return '#6c757d'; // Gris default
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleDateString('es-CL', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  // Funciones dummy para TypeScript (ya que no usamos el modal ahora)
  const guardarUsuario = (usuario: Usuario) => cerrarModal();


  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>🔧 Gestión de Usuarios (TI)</h1>
          <p style={styles.subtitle}>Usuarios reales registrados en Base de Datos (PostgreSQL)</p>
        </div>

        {/* Barra de acciones */}
        <div style={styles.actionBar}>
          <div style={styles.searchBox}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Buscar por nombre, rut o correo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <button onClick={abrirModalCrear} style={styles.btnCrear}>
            ➕ Nuevo Usuario
          </button>
        </div>

        {error && <div style={{padding: '15px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '20px'}}>{error}</div>}

        {/* Tabla de usuarios */}
        <div style={styles.tableContainer}>
          {isLoading ? (
              <div style={{padding: '40px', textAlign: 'center', color: '#666'}}>Cargando usuarios desde el servidor...</div>
          ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Usuario</th>
                <th style={styles.th}>Nombre Completo</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Rol (Perfil)</th>
                <th style={styles.th}>Estado (Click para cambiar)</th>
                <th style={styles.th}>Último Acceso</th>
                <th style={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map(usuario => (
                <tr key={usuario.id} style={styles.tr}>
                  <td style={styles.td}>#{usuario.id}</td>
                  <td style={styles.td}>
                    <span style={styles.username}>{usuario.username}</span>
                  </td>
                  <td style={styles.td}>{usuario.first_name} {usuario.last_name}</td>
                  <td style={styles.td}>{usuario.email || 'Sin correo'}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.rolBadge,
                      backgroundColor: getRolColor(usuario.rol)
                    }}>
                      {rolesLabels[usuario.rol] || usuario.rol}
                    </span>
                  </td>
                  
                  {/* --- AQUÍ ESTÁ EL BOTÓN INTELIGENTE --- */}
                  <td style={styles.td}>
                    <button
                      onClick={() => toggleActivo(usuario)}
                      title={usuario.is_active ? "Click para Bloquear" : "Click para Activar"}
                      style={{
                        ...styles.btnEstado, // Usamos el estilo base de botón
                        backgroundColor: usuario.is_active ? '#28a745' : '#dc3545',
                        // Efectos visuales para que parezca clickeable
                        cursor: 'pointer',
                        transform: 'scale(1)',
                        transition: 'all 0.1s ease',
                      }}
                      onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                      onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      {usuario.is_active ? '✅ Activo' : '⛔ Bloqueado'}
                    </button>
                  </td>

                  <td style={styles.td}>
                    {formatDate(usuario.last_login)}
                  </td>
                  <td style={styles.td}>
                    <div style={styles.acciones}>
                      <button
                        onClick={() => abrirModalEditar(usuario)}
                        style={styles.btnAccion}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => abrirModalPassword(usuario)}
                        style={styles.btnAccion}
                        title="Cambiar contraseña"
                      >
                        🔑
                      </button>
                      <button
                        onClick={() => eliminarUsuario(usuario.id)}
                        style={{ ...styles.btnAccion, ...styles.btnEliminar }}
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}

          {!isLoading && usuariosFiltrados.length === 0 && (
            <div style={styles.noResults}>
              No se encontraron usuarios
            </div>
          )}
        </div>

        {/* Resumen */}
        <div style={styles.resumen}>
          <div style={styles.resumenItem}>
            <span style={styles.resumenNumero}>{usuarios.length}</span>
            <span style={styles.resumenLabel}>Total Usuarios</span>
          </div>
          <div style={styles.resumenItem}>
            <span style={{ ...styles.resumenNumero, color: '#28a745' }}>
              {usuarios.filter(u => u.is_active).length}
            </span>
            <span style={styles.resumenLabel}>Activos</span>
          </div>
          <div style={styles.resumenItem}>
            <span style={{ ...styles.resumenNumero, color: '#dc3545' }}>
              {usuarios.filter(u => !u.is_active).length}
            </span>
            <span style={styles.resumenLabel}>Bloqueados</span>
          </div>
        </div>
      </div>

      {/* Modal - Lo mantenemos oculto */}
      {modalOpen && (
        <ModalUsuario
          tipo={modalOpen}
          usuario={usuarioSeleccionado}
          onClose={cerrarModal}
          onSave={guardarUsuario}
        />
      )}
    </div>
  );
}

// Componente Modal (Sin cambios)
interface ModalProps {
  tipo: ModalType;
  usuario: Usuario | null;
  onClose: () => void;
  onSave: (usuario: Usuario) => void;
}

function ModalUsuario({tipo, usuario, onClose, onSave}: ModalProps) {
  return null; 
}

// Estilos principales
const styles: { [key: string]: React.CSSProperties } = {
  container: {
  fontFamily: "'Poppins', sans-serif",
  minHeight: 'calc(100vh - 60px)',
  padding: '20px',
 },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '25px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#1a365d',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    margin: '5px 0 0 0',
  },
  actionBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    gap: '15px',
    flexWrap: 'wrap',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '0 15px',
    border: '1px solid #e0e6ed',
    flex: 1,
    maxWidth: '400px',
  },
  searchIcon: {
    fontSize: '16px',
    marginRight: '10px',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    padding: '12px 0',
    fontSize: '14px',
    width: '100%',
    fontFamily: "'Poppins', sans-serif",
  },
  btnCrear: {
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'Poppins', sans-serif",
  },
  tableContainer: {
  backgroundColor: '#e8f3ff',
  borderRadius: '12px',
  boxShadow: '0 2px 10px rgba(0, 123, 255, 0.15)',
  overflow: 'hidden',
 },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    backgroundColor: '#1a365d',
    color: 'white',
    padding: '15px 12px',
    textAlign: 'left',
    fontSize: '13px',
    fontWeight: 600,
  },
  tr: {
    borderBottom: '1px solid #e0e6ed',
  },
  td: {
    padding: '12px',
    fontSize: '14px',
    color: '#495057',
  },
  username: {
    fontWeight: 600,
    color: '#1a365d',
  },
  rolBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 500,
    color: 'white',
  },
  // ESTILO NUEVO PARA EL BOTÓN
  btnEstado: {
    display: 'inline-block',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 600,
    color: 'white',
    border: 'none',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  acciones: {
    display: 'flex',
    gap: '8px',
  },
  btnAccion: {
    backgroundColor: '#f0f0f0',
    border: 'none',
    padding: '8px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  btnEliminar: {
    backgroundColor: '#fee2e2',
  },
  noResults: {
    padding: '40px',
    textAlign: 'center',
    color: '#666',
  },
  resumen: {
    display: 'flex',
    gap: '20px',
    marginTop: '20px',
  },
  resumenItem: {
  backgroundColor: '#e8f3ff',
  padding: '20px',
  borderRadius: '10px',
  boxShadow: '0 2px 10px rgba(0, 123, 255, 0.1)',
  textAlign: 'center',
  flex: 1,
 },
  resumenNumero: {
    display: 'block',
    fontSize: '28px',
    fontWeight: 700,
    color: '#1a365d',
  },
  resumenLabel: {
    fontSize: '13px',
    color: '#666',
  },
};