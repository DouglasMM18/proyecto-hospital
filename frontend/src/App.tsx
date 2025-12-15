import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import AdministrativoPage from './pages/administrativo/AdministrativoPage';
import AdminTIPage from './pages/admin-ti/AdminTIPage';
import MatronaPage from './pages/matrona/MatronaPage';
import EnfermeraPage from './pages/enfermera/EnfermeraPage';
import EspecialistaPage from './pages/especialista/EspecialistaPage';

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
          <Route index element={<AdministrativoPage />} />
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