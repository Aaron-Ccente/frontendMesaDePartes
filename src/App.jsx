import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Auth Components
import AdminLogin from './components/auth/AdminLogin';
import AdminRegister from './components/auth/AdminRegister';
import PeritoLogin from './components/auth/PeritoLogin';

// Dashboard Components
import AdminDashboard from './components/admin/AdminDashboard';
import DashboardStats from './components/admin/DashboardStats';
import UserManagement from './components/admin/UserManagement';
import Administradores from './components/admin/Administradores';
import DocumentManagement from './components/admin/DocumentManagement';
import SystemConfiguration from './components/admin/SystemConfiguration';
import PeritoForm from './components/admin/PeritoForm';
import AdminForm from './components/admin/AdminForm';

// Perito Components
import PeritoDashboard from './components/perito/PeritoDashboard';
import PeritoResumen from './components/perito/PeritoResumen';
import PeritoDocumentos from './components/perito/PeritoDocumentos';
import PeritoCasos from './components/perito/PeritoCasos';
import PeritoPerfil from './components/perito/PeritoPerfil';
import MesaDePartes from './components/admin/MesaDePartes';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Auth Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/register" element={<AdminRegister />} />
            <Route path="/login" element={<PeritoLogin />} />

            {/* Dashboard Routes with nested navigation - Protected */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }>
              <Route index element={<DashboardStats />} />
              <Route path="usuarios" element={<UserManagement />} />
              <Route path="usuarios/crear" element={<PeritoForm />} />
              <Route path="usuarios/editar/:cip" element={<PeritoForm />} />
              <Route path="administradores" element={<Administradores />} />
              <Route path="administradores/crear" element={<AdminForm />} />
              <Route path="administradores/editar/:cip" element={<AdminForm />} />
              <Route path="mesadepartes" element={<MesaDePartes />} />
              <Route path="documentos" element={<DocumentManagement />} />
              <Route path="configuracion" element={<SystemConfiguration />} />
            </Route>

            {/* Perito Dashboard Routes */}
            <Route path="/perito/dashboard" element={
              <ProtectedRoute requirePerito={true}>
                <PeritoDashboard />
              </ProtectedRoute>
            }>
              <Route index element={<PeritoResumen />} />
              <Route path="documentos" element={<PeritoDocumentos />} />
              <Route path="casos" element={<PeritoCasos />} />
              <Route path="perfil" element={<PeritoPerfil />} />
            </Route>

            {/* Redirects */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
