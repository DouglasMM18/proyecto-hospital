import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import logo from '../assets/logo.png';
import api from '../api/axios'; // Asegúrate de importar tu instancia de axios

const testCredentials: { [key: string]: { user: string; pass: string; label: string } } = {
  administrador: { user: 'administrador_juan', pass: 'Juanadmin1234.', label: 'Administrativo' },
  enfermera: { user: 'enfermera_ana', pass: '3nfermera1234.', label: 'Enfermera' },
  matrona: { user: 'matrona_carla', pass: 'M4trona1234.', label: 'Matrona' },
  supervisor: { user: 'jefe_supervisor', pass: 'Sup3rvisor1234.', label: 'Especialista/Supervisor' },
  ti: { user: 'admin', pass: '123', label: 'Administrador TI' }, // Actualicé esto para ti
};

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  
  const navigate = useNavigate();
  // Mantenemos useAuthStore por si lo usas en otros lados, pero haremos el login manual aquí para asegurar
  const { setAccessToken } = useAuthStore(); 

  // Mapeo de roles actualizado
  const getRouteByRol = (rol: string) => {
    const r = rol?.toUpperCase();
    if (r === 'TI' || r === 'ADMIN_TI') return '/admin-ti';
    if (r === 'MATRONA') return '/matrona';
    if (r === 'ENFERMERA' || r === 'ENFERMERA/O' || r === 'TECNICO') return '/enfermera';
    if (r === 'MEDICO' || r === 'SUPERVISOR') return '/especialista';
    if (r === 'ADMISION' || r === 'ADMINISTRADOR') return '/administrativo';
    return '/';
  };

  const procesarLogin = async (user: string, pass: string) => {
    setLocalLoading(true);
    setLocalError('');
    try {
      // 1. Petición directa al backend
      const response = await api.post('/api/token/', { username: user, password: pass });
      
      const { access, refresh, rol, username: nombreUsuario } = response.data;

      // 2. GUARDAR DATOS EN LOCALSTORAGE (¡CRUCIAL!)
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user_rol', rol); // Esto es lo que lee App.tsx
      localStorage.setItem('username', nombreUsuario);

      // 3. Actualizar store global (si lo usas)
      if (setAccessToken) setAccessToken(access);

      // 4. Redirigir
      const ruta = getRouteByRol(rol);
      // Forzamos recarga para que App.tsx lea los nuevos datos del localStorage
      window.location.href = ruta; 

    } catch (err: any) {
      console.error(err);
      setLocalError('Credenciales incorrectas o error de conexión');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await procesarLogin(username, password);
  };

  const handleTestLogin = async () => {
    if (!selectedRole) {
      alert('Selecciona un rol.');
      return;
    }
    const creds = testCredentials[selectedRole];
    await procesarLogin(creds.user, creds.pass);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoContainer}>
             <img src={logo} alt="Logo" style={styles.logo} />
          </div>
          <h2 style={styles.hospitalName}>Hospital Herminda Martín</h2>
          <p style={styles.location}>Chillán, Chile</p>
        </div>

        <h1 style={styles.accessTitle}>Acceso Neonatología</h1>

        {localError && <div style={styles.error}>{localError}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <span style={styles.inputIcon}>👤</span>
            <input
              type="text"
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
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
              required
            />
          </div>

          <button type="submit" disabled={localLoading} style={styles.button}>
            {localLoading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        {/* Sección de pruebas */}
        <div style={styles.testSection}>
          <label style={styles.testLabel}>Prueba Rápida:</label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            style={styles.select}
          >
            <option value="">Seleccione rol...</option>
            {Object.entries(testCredentials).map(([key, value]) => (
              <option key={key} value={key}>{value.label}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleTestLogin}
            disabled={localLoading}
            style={{...styles.button, backgroundColor: '#6c757d'}}
          >
            Ingresar como Prueba
          </button>
        </div>
      </div>
    </div>
  );
}

// Estilos (Los mismos que tenías, sin cambios)
const styles: { [key: string]: React.CSSProperties } = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', margin: 0, padding: '20px', boxSizing: 'border-box', background: 'linear-gradient(135deg, #e0f2f7 0%, #c1d9e7 100%)', fontFamily: "'Poppins', sans-serif" },
  card: { backgroundColor: '#e8f3ff', padding: '50px 40px', borderRadius: '20px', boxShadow: '0 15px 40px rgba(0, 123, 255, 0.25)', width: '100%', maxWidth: '400px', boxSizing: 'border-box', textAlign: 'center' },
  header: { marginBottom: '30px' },
  logoContainer: { width: '140px', height: '140px', margin: '0 auto 15px', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  logo: { width: '100%', height: '100%', objectFit: 'contain' },
  hospitalName: { fontSize: '18px', color: '#495057', fontWeight: 600, margin: '0 0 5px 0', lineHeight: 1.2 },
  location: { fontSize: '13px', color: '#777', margin: 0 },
  accessTitle: { fontSize: '24px', fontWeight: 700, color: '#495057', marginBottom: '30px' },
  inputGroup: { position: 'relative', marginBottom: '20px' },
  inputIcon: { position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px' },
  input: { width: '100%', padding: '12px 12px 12px 45px', border: '1px solid #e0e6ed', borderRadius: '10px', boxSizing: 'border-box', fontFamily: "'Poppins', sans-serif", fontSize: '15px', color: '#495057', backgroundColor: 'white', outline: 'none' },
  button: { width: '100%', padding: '14px', border: 'none', borderRadius: '10px', fontFamily: "'Poppins', sans-serif", fontSize: '16px', fontWeight: 600, cursor: 'pointer', backgroundColor: '#007bff', color: 'white', boxShadow: '0 4px 10px rgba(0, 123, 255, 0.25)', marginBottom: '10px' },
  error: { backgroundColor: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px' },
  testSection: { marginTop: '30px', paddingTop: '25px', borderTop: '1px solid #e0e6ed', textAlign: 'left' },
  testLabel: { display: 'block', fontSize: '14px', fontWeight: 500, color: '#495057', marginBottom: '10px' },
  select: { width: '100%', padding: '12px 15px', border: '1px solid #e0e6ed', borderRadius: '10px', backgroundColor: 'white', fontFamily: "'Poppins', sans-serif", fontSize: '15px', color: '#495057', marginBottom: '15px', cursor: 'pointer', outline: 'none' },
};