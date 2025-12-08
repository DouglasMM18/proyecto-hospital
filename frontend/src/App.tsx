import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import AdministrativoPage from './pages/administrativo/AdministrativoPage';

// Páginas placeholder (las desarrollamos después)
const MatronaPage = () => <div style={{ padding: '20px' }}><h1>👩‍⚕️ Módulo Matrona</h1><p>En desarrollo...</p></div>;
const EspecialistaPage = () => <div style={{ padding: '20px' }}><h1>👨‍⚕️ Módulo Especialista</h1><p>En desarrollo...</p></div>;
const AdminTIPage = () => <div style={{ padding: '20px' }}><h1>🔧 Módulo Administrador TI</h1><p>En desarrollo...</p></div>;

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
          <Route path="matrona" element={<MatronaPage />} />
          <Route path="especialista" element={<EspecialistaPage />} />
          <Route path="admin-ti" element={<AdminTIPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;