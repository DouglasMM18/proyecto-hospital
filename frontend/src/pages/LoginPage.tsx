import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import logo from '../assets/logo.png';

const testCredentials: { [key: string]: { user: string; pass: string; label: string; redirect: string } } = {
  administrativo: { user: 'admin.hospital', pass: 'adm123', label: 'Administrativo', redirect: '/administrativo' },
  matrona: { user: 'matrona.turno', pass: 'matrona123', label: 'Matrona', redirect: '/matrona' },
  especialista: { user: 'dr.especialista', pass: 'esp123', label: 'Especialista', redirect: '/especialista' },
  admin: { user: 'ti.hospital', pass: 'ti123', label: 'Administrador TI', redirect: '/admin-ti' },
};

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const { login, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  // Determinar ruta según username
  const getRedirectPath = (user: string): string => {
    for (const key in testCredentials) {
      if (testCredentials[key].user === user) {
        return testCredentials[key].redirect;
      }
    }
    return '/'; // Por defecto al home
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login({ username, password });
    if (success) {
      const redirectPath = getRedirectPath(username);
      navigate(redirectPath);
    }
  };

  const handleTestLogin = async () => {
    if (!selectedRole) {
      alert('Por favor, selecciona un rol de prueba para ingresar.');
      return;
    }

    const credentials = testCredentials[selectedRole];
    const success = await login({ username: credentials.user, password: credentials.pass });
    if (success) {
      navigate(credentials.redirect);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoContainer}>
                <img src={logo} alt="Logo Hospital Herminda Martín" style={styles.logo} />
            </div>
          <h2 style={styles.hospitalName}>Hospital Herminda Martín</h2>
          <p style={styles.location}>Chillán, Chile</p>
        </div>

        <h1 style={styles.accessTitle}>Acceso Neonatología</h1>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <span style={styles.inputIcon}>👤</span>
            <input
              type="text"
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              autoComplete='off'
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <span style={styles.inputIcon}>🔒</span>
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              autoComplete='off'
              required
            />
          </div>

          <div style={styles.forgotPassword}>
            <a href="#" style={styles.forgotLink}>
              ¿Olvidé mi clave? Contactar encargado TI
            </a>
          </div>

          <button type="submit" disabled={isLoading} style={styles.button}>
            {isLoading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        {/* Sección de pruebas */}
        <div style={styles.testSection}>
          <label style={styles.testLabel}>Seleccionar Rol de Prueba:</label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            style={styles.select}
          >
            <option value="">Seleccione un rol...</option>
            {Object.entries(testCredentials).map(([key, value]) => (
              <option key={key} value={key}>
                {value.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleTestLogin}
            disabled={isLoading}
            style={styles.button}
          >
            {isLoading ? 'Ingresando...' : 'Ingresar con Rol Seleccionado'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    margin: 0,
    padding: '20px',
    boxSizing: 'border-box',
    background: 'linear-gradient(135deg, #e0f2f7 0%, #c1d9e7 100%)',
    fontFamily: "'Poppins', sans-serif",
  },
  card: {
    backgroundColor: '#e8f3ff',
    padding: '50px 40px',
    borderRadius: '20px',
    boxShadow: '0 15px 40px rgba(0, 123, 255, 0.25)',
    width: '100%',
    maxWidth: '400px',
    boxSizing: 'border-box',
    textAlign: 'center',
  },
  header: {
    marginBottom: '30px',
  },
  logoContainer: {
  width: '140px',
  height: '140px',
  margin: '0 auto 15px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
},
logo: {
  width: '100%',
  height: '100%',
  objectFit: 'contain',
},
  hospitalName: {
    fontSize: '18px',
    color: '#495057',
    fontWeight: 600,
    margin: '0 0 5px 0',
    lineHeight: 1.2,
  },
  location: {
    fontSize: '13px',
    color: '#777',
    margin: 0,
  },
  accessTitle: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#495057',
    marginBottom: '30px',
  },
  inputGroup: {
    position: 'relative',
    marginBottom: '20px',
  },
  inputIcon: {
    position: 'absolute',
    left: '15px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '16px',
  },
  input: {
    width: '100%',
    padding: '12px 12px 12px 45px',
    border: '1px solid #e0e6ed',
    borderRadius: '10px',
    boxSizing: 'border-box',
    fontFamily: "'Poppins', sans-serif",
    fontSize: '15px',
    color: '#495057',
    backgroundColor: 'white',
    outline: 'none',
  },
  forgotPassword: {
    textAlign: 'center',
    marginTop: '-10px',
    marginBottom: '25px',
  },
  forgotLink: {
    color: '#007bff',
    textDecoration: 'none',
    fontSize: '11px',
    fontWeight: 500,
  },
  button: {
    width: '100%',
    padding: '14px',
    border: 'none',
    borderRadius: '10px',
    fontFamily: "'Poppins', sans-serif",
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    backgroundColor: '#007bff',
    color: 'white',
    boxShadow: '0 4px 10px rgba(0, 123, 255, 0.25)',
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '10px',
    borderRadius: '10px',
    marginBottom: '20px',
    fontSize: '14px',
  },
  testSection: {
    marginTop: '30px',
    paddingTop: '25px',
    borderTop: '1px solid #e0e6ed',
    textAlign: 'left',
  },
  testLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 500,
    color: '#495057',
    marginBottom: '10px',
  },
  select: {
    width: '100%',
    padding: '12px 15px',
    border: '1px solid #e0e6ed',
    borderRadius: '10px',
    backgroundColor: 'white',
    fontFamily: "'Poppins', sans-serif",
    fontSize: '15px',
    color: '#495057',
    marginBottom: '15px',
    cursor: 'pointer',
    outline: 'none',
  },
};