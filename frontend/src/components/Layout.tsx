import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function Layout() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Determinar módulo actual
  const getModuloActual = () => {
    const path = location.pathname;
    if (path.includes('matrona')) return 'Matrona';
    if (path.includes('especialista')) return 'Especialista';
    if (path.includes('admin-ti')) return 'Administrador TI';
    return 'Administrativo';
  };

  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <div style={styles.brand}>
          <span style={styles.brandIcon}>🏥</span>
          <div>
            <div style={styles.brandTitle}>HHM - Neonatología</div>
            <div style={styles.brandModule}>{getModuloActual()}</div>
          </div>
        </div>
        <div style={styles.links}>
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
    backgroundColor: '#f5f7fa',
    display: 'flex',
    flexDirection: 'column',
  },
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 2rem',
    backgroundColor: '#1a365d',
    color: 'white',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  brandIcon: {
    fontSize: '28px',
  },
  brandTitle: {
    fontSize: '16px',
    fontWeight: 600,
  },
  brandModule: {
    fontSize: '12px',
    opacity: 0.8,
  },
  links: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'center',
  },
  logoutBtn: {
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontFamily: "'Poppins', sans-serif",
  },
  main: {
    flex: 1,
  },
};