import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import logoHeader from '../assets/Logo.png';

const rolLabels: { [key: string]: string } = {
  'ADMINISTRADOR': 'Administrativo',
  'ENFERMERA': 'Enfermera',
  'MATRONA': 'Matrona',
  'SUPERVISOR': 'Especialista',
  'TI': 'Administrador TI',
};

export default function Layout() {
  const { logout, username, rol } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getModuloActual = () => {
    const path = location.pathname;
    if (path.includes('matrona')) return 'Registro Clínico';
    if (path.includes('especialista')) return 'Informes';
    if (path.includes('admin-ti')) return 'Gestión TI';
    return 'Admisión';
  };

  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <div style={styles.brand}>
          <img src={logoHeader} alt="Logo" style={styles.brandLogo} />
          <div>
            <div style={styles.brandTitle}>HHM - Neonatología</div>
            <div style={styles.brandModule}>{getModuloActual()}</div>
          </div>
        </div>
        <div style={styles.userInfo}>
          <div style={styles.userDetails}>
            <span style={styles.userName}>{username || 'Usuario'}</span>
            <span style={styles.userRol}>{rol ? rolLabels[rol] : ''}</span>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Cerrar Sesión
          </button>
        </div>
      </nav>
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #e0f2f7 0%, #c1d9e7 100%)',
    display: 'flex',
    flexDirection: 'column',
  },
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 2rem',
    backgroundColor: '#007bff',
    color: 'white',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 10px rgba(0, 123, 255, 0.3)',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  brandLogo: {
    height: '40px',
    width: 'auto',
  },
  brandTitle: {
    fontSize: '16px',
    fontWeight: 600,
  },
  brandModule: {
    fontSize: '12px',
    opacity: 0.9,
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  userDetails: {
    textAlign: 'right',
  },
  userName: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 600,
  },
  userRol: {
    fontSize: '11px',
    opacity: 0.9,
  },
  logoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.3)',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontFamily: "'Poppins', sans-serif",
    transition: 'all 0.2s',
  },
  main: {
    flex: 1,
  },
};