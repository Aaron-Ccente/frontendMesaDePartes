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
import MesaDePartesForm from './components/admin/MesaDePartesForm';
import MesaDePartesLogin from './components/auth/MesaDePartesLogin';
import MesaDePartesDashboard from './components/mesadepartes/MesaDePartesDashboard';
import CrearOficio from './components/mesadepartes/CrearOficio';
import RespuestaOficio from './components/mesadepartes/RespuestaOficio';
import MesaDePartesResumen from './components/mesadepartes/MesaDePartesResumen';
import EspecialidadesManagement from './components/admin/SystemConfiguration/EspecialidadesManagement';
import GradosManagement from './components/admin/SystemConfiguration/GradosManagement';
import TurnosManagement from './components/admin/SystemConfiguration/TurnosManagement';

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
            <Route path="/mesadepartes/login" element={<MesaDePartesLogin />} />

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
              <Route path="mesadepartes/crear" element={<MesaDePartesForm />} />
              <Route path="mesadepartes/editar/:cip" element={<MesaDePartesForm />} />
              <Route path="documentos" element={<DocumentManagement />}  />
              <Route path="configuracion" element={<SystemConfiguration />}/>
              <Route path="configuracion/especialidades" element={<EspecialidadesManagement />} />
              <Route path="configuracion/grados" element={<GradosManagement />} />
              <Route path="configuracion/turnos" element={<TurnosManagement />} />
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

            {/* Perito Dashboard Routes */}
            <Route path="/mesadepartes/dashboard" element={
              <ProtectedRoute requireUserMesaDePartes={true}>
                <MesaDePartesDashboard />
              </ProtectedRoute>
            }>
              <Route index element={<MesaDePartesResumen />} />
              <Route path="crear/oficio" element={<CrearOficio />} />
              <Route path="respuestas/oficio" element={<RespuestaOficio />} />
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
