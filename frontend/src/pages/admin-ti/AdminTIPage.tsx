import { useState } from 'react';


interface Usuario {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  rol: 'administrativo' | 'matrona' | 'especialista' | 'admin_ti';
  is_active: boolean;
  date_joined: string;
  last_login: string | null;
}

// Datos simulados
const usuariosIniciales: Usuario[] = [
  {
    id: 1,
    username: 'admin.hospital',
    email: 'admin@hospital.cl',
    first_name: 'Juan',
    last_name: 'Pérez',
    rol: 'administrativo',
    is_active: true,
    date_joined: '2024-01-15',
    last_login: '2024-12-08',
  },
  {
    id: 2,
    username: 'matrona.turno',
    email: 'matrona@hospital.cl',
    first_name: 'María',
    last_name: 'González',
    rol: 'matrona',
    is_active: true,
    date_joined: '2024-02-20',
    last_login: '2024-12-07',
  },
  {
    id: 3,
    username: 'dr.especialista',
    email: 'doctor@hospital.cl',
    first_name: 'Carlos',
    last_name: 'Rodríguez',
    rol: 'especialista',
    is_active: true,
    date_joined: '2024-03-10',
    last_login: '2024-12-06',
  },
  {
    id: 4,
    username: 'ti.hospital',
    email: 'ti@hospital.cl',
    first_name: 'Andrea',
    last_name: 'Silva',
    rol: 'admin_ti',
    is_active: true,
    date_joined: '2024-01-01',
    last_login: '2024-12-08',
  },
];

const rolesLabels: { [key: string]: string } = {
  administrativo: 'Administrativo',
  matrona: 'Matrona',
  especialista: 'Especialista',
  admin_ti: 'Administrador TI',
};

type ModalType = 'crear' | 'editar' | 'password' | null;

export default function AdminTIPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>(usuariosIniciales);
  const [modalOpen, setModalOpen] = useState<ModalType>(null);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [busqueda, setBusqueda] = useState('');

  // Filtrar usuarios
  const usuariosFiltrados = usuarios.filter(u =>
    u.username.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.first_name.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.last_name.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.email.toLowerCase().includes(busqueda.toLowerCase())
  );

  const abrirModalCrear = () => {
    setUsuarioSeleccionado(null);
    setModalOpen('crear');
  };

  const abrirModalEditar = (usuario: Usuario) => {
    setUsuarioSeleccionado(usuario);
    setModalOpen('editar');
  };

  const abrirModalPassword = (usuario: Usuario) => {
    setUsuarioSeleccionado(usuario);
    setModalOpen('password');
  };

  const cerrarModal = () => {
    setModalOpen(null);
    setUsuarioSeleccionado(null);
  };

  const toggleActivo = (id: number) => {
    setUsuarios(prev =>
      prev.map(u => u.id === id ? { ...u, is_active: !u.is_active } : u)
    );
  };

  const guardarUsuario = (usuario: Usuario) => {
    if (modalOpen === 'crear') {
      const nuevoId = Math.max(...usuarios.map(u => u.id)) + 1;
      setUsuarios(prev => [...prev, { ...usuario, id: nuevoId, date_joined: new Date().toISOString().split('T')[0], last_login: null }]);
    } else {
      setUsuarios(prev => prev.map(u => u.id === usuario.id ? usuario : u));
    }
    cerrarModal();
  };

  const eliminarUsuario = (id: number) => {
    if (confirm('¿Está seguro de eliminar este usuario?')) {
      setUsuarios(prev => prev.filter(u => u.id !== id));
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>🔧 Gestión de Usuarios</h1>
          <p style={styles.subtitle}>Administración de cuentas y roles del sistema</p>
        </div>

        {/* Barra de acciones */}
        <div style={styles.actionBar}>
          <div style={styles.searchBox}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Buscar usuario..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <button onClick={abrirModalCrear} style={styles.btnCrear}>
            ➕ Nuevo Usuario
          </button>
        </div>

        {/* Tabla de usuarios */}
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Usuario</th>
                <th style={styles.th}>Nombre</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Rol</th>
                <th style={styles.th}>Estado</th>
                <th style={styles.th}>Último Acceso</th>
                <th style={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map(usuario => (
                <tr key={usuario.id} style={styles.tr}>
                  <td style={styles.td}>
                    <span style={styles.username}>{usuario.username}</span>
                  </td>
                  <td style={styles.td}>{usuario.first_name} {usuario.last_name}</td>
                  <td style={styles.td}>{usuario.email}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.rolBadge,
                      backgroundColor: usuario.rol === 'admin_ti' ? '#6f42c1' :
                        usuario.rol === 'matrona' ? '#e83e8c' :
                        usuario.rol === 'especialista' ? '#20c997' : '#007bff'
                    }}>
                      {rolesLabels[usuario.rol]}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span
                      onClick={() => toggleActivo(usuario.id)}
                      style={{
                        ...styles.estadoBadge,
                        backgroundColor: usuario.is_active ? '#28a745' : '#dc3545',
                        cursor: 'pointer',
                      }}
                    >
                      {usuario.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {usuario.last_login || 'Nunca'}
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

          {usuariosFiltrados.length === 0 && (
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
            <span style={styles.resumenLabel}>Inactivos</span>
          </div>
        </div>
      </div>

      {/* Modal */}
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

// Componente Modal
interface ModalProps {
  tipo: ModalType;
  usuario: Usuario | null;
  onClose: () => void;
  onSave: (usuario: Usuario) => void;
}

function ModalUsuario({ tipo, usuario, onClose, onSave }: ModalProps) {
  const [formData, setFormData] = useState<Partial<Usuario>>(
    usuario || {
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      rol: 'administrativo',
      is_active: true,
    }
  );
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (tipo === 'password') {
      if (password !== confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
      }
      if (password.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres');
        return;
      }
      // Aquí iría la llamada al API para cambiar contraseña
      alert('Contraseña actualizada correctamente');
      onClose();
      return;
    }

    onSave(formData as Usuario);
  };

  const titulo = tipo === 'crear' ? 'Nuevo Usuario' :
    tipo === 'editar' ? 'Editar Usuario' : 'Cambiar Contraseña';

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        <div style={modalStyles.header}>
          <h2 style={modalStyles.titulo}>{titulo}</h2>
          <button onClick={onClose} style={modalStyles.btnCerrar}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          {tipo !== 'password' ? (
            <div style={modalStyles.body}>
              <div style={modalStyles.formGrid}>
                <div style={modalStyles.formGroup}>
                  <label style={modalStyles.label}>Usuario</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username || ''}
                    onChange={handleChange}
                    style={modalStyles.input}
                    required
                    disabled={tipo === 'editar'}
                  />
                </div>

                <div style={modalStyles.formGroup}>
                  <label style={modalStyles.label}>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                    style={modalStyles.input}
                    required
                  />
                </div>

                <div style={modalStyles.formGroup}>
                  <label style={modalStyles.label}>Nombre</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name || ''}
                    onChange={handleChange}
                    style={modalStyles.input}
                    required
                  />
                </div>

                <div style={modalStyles.formGroup}>
                  <label style={modalStyles.label}>Apellido</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name || ''}
                    onChange={handleChange}
                    style={modalStyles.input}
                    required
                  />
                </div>

                <div style={{ ...modalStyles.formGroup, gridColumn: '1 / -1' }}>
                  <label style={modalStyles.label}>Rol</label>
                  <select
                    name="rol"
                    value={formData.rol || ''}
                    onChange={handleChange}
                    style={modalStyles.input}
                    required
                  >
                    <option value="administrativo">Administrativo</option>
                    <option value="matrona">Matrona</option>
                    <option value="especialista">Especialista</option>
                    <option value="admin_ti">Administrador TI</option>
                  </select>
                </div>

                {tipo === 'crear' && (
                  <>
                    <div style={modalStyles.formGroup}>
                      <label style={modalStyles.label}>Contraseña</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={modalStyles.input}
                        required
                        minLength={6}
                      />
                    </div>

                    <div style={modalStyles.formGroup}>
                      <label style={modalStyles.label}>Confirmar Contraseña</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        style={modalStyles.input}
                        required
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div style={modalStyles.body}>
              <p style={modalStyles.infoText}>
                Cambiar contraseña para: <strong>{usuario?.username}</strong>
              </p>
              <div style={modalStyles.formGrid}>
                <div style={modalStyles.formGroup}>
                  <label style={modalStyles.label}>Nueva Contraseña</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={modalStyles.input}
                    required
                    minLength={6}
                  />
                </div>

                <div style={modalStyles.formGroup}>
                  <label style={modalStyles.label}>Confirmar Contraseña</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={modalStyles.input}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          <div style={modalStyles.footer}>
            <button type="button" onClick={onClose} style={modalStyles.btnCancelar}>
              Cancelar
            </button>
            <button type="submit" style={modalStyles.btnGuardar}>
              {tipo === 'password' ? 'Cambiar Contraseña' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
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
  estadoBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 500,
    color: 'white',
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

// Estilos del Modal
const modalStyles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflow: 'auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #e0e6ed',
  },
  titulo: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 600,
    color: '#1a365d',
  },
  btnCerrar: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#666',
  },
  body: {
    padding: '20px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '15px',
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
    border: '1px solid #e0e6ed',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: "'Poppins', sans-serif",
    boxSizing: 'border-box',
  },
  infoText: {
    marginBottom: '20px',
    color: '#495057',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    padding: '20px',
    borderTop: '1px solid #e0e6ed',
  },
  btnCancelar: {
    padding: '10px 20px',
    border: '1px solid #e0e6ed',
    borderRadius: '8px',
    backgroundColor: 'white',
    cursor: 'pointer',
    fontFamily: "'Poppins', sans-serif",
  },
  btnGuardar: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#007bff',
    color: 'white',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'Poppins', sans-serif",
  },
};