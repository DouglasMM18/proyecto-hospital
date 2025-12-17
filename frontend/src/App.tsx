import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import AdministrativoPage from './pages/administrativo/AdministrativoPage';
import AdminTIPage from './pages/admin-ti/AdminTIPage';
import MatronaPage from './pages/matrona/MatronaPage';
import EnfermeraPage from './pages/enfermera/EnfermeraPage';
import EspecialistaPage from './pages/especialista/EspecialistaPage';

// --- COMPONENTE DESPACHADOR ---
// Este componente decide a dónde mandarte según tu rol
const HomeDispatcher = () => {
  // Obtenemos el rol guardado en el navegador (asegúrate que en el Login lo guardes así)
  const rol = localStorage.getItem('user_rol')?.toUpperCase(); 

  switch (rol) {
    case 'TI':
    case 'ADMIN_TI':
      return <Navigate to="/admin-ti" replace />;
    
    case 'MATRONA':
      return <Navigate to="/matrona" replace />;
    
    case 'ENFERMERA':
    case 'ENFERMERA/O':
    case 'TECNICO':
      return <Navigate to="/enfermera" replace />;
    
    case 'MEDICO':
    case 'ESPECIALISTA':
    case 'SUPERVISOR':
      return <Navigate to="/especialista" replace />;
    
    case 'ADMISION':
    case 'ADMINISTRADOR':
      return <Navigate to="/administrativo" replace />; // O simplemente renderizar <AdministrativoPage />
      
    default:
      // Si no tiene rol o es desconocido, lo mandamos a administrativo o login
      return <AdministrativoPage />;
  }
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* AQUÍ ESTÁ EL CAMBIO: Usamos el Dispatcher en el index */}
          <Route index element={<HomeDispatcher />} />
          
          <Route path="administrativo" element={<AdministrativoPage />} />
          <Route path="enfermera" element={<EnfermeraPage />} />
          <Route path="matrona" element={<MatronaPage />} />
          <Route path="especialista" element={<EspecialistaPage />} />
          <Route path="admin-ti" element={<AdminTIPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;