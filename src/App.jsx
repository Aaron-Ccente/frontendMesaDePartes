import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { Toaster } from 'sonner';

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
import CasoDetail from './components/perito/CasoDetail';
import PeritoPerfil from './components/perito/PeritoPerfil';
import CasosExtraccion from './components/perito/casos/CasosExtraccion';
import CasosAnalisisTM from './components/perito/casos/CasosAnalisisTM';
import CasosExtraccionAnalisis from './components/perito/casos/CasosExtraccionAnalisis';
import CasosAnalisisINST from './components/perito/casos/CasosAnalisisINST';
import CasosAnalisisLAB from './components/perito/casos/CasosAnalisisLAB';
import CasosConsolidacion from './components/perito/casos/CasosConsolidacion';
import ProcedimientoExtraccion from './components/perito/procedimientos/ProcedimientoExtraccion';
import ProcedimientoAnalisisTM from './components/perito/procedimientos/ProcedimientoAnalisisTM';
import ProcedimientoAnalisisINST from './components/perito/procedimientos/ProcedimientoAnalisisINST';
import ProcedimientoAnalisisLAB from './components/perito/procedimientos/ProcedimientoAnalisisLAB';
import ProcedimientoConsolidacionLAB from './components/perito/procedimientos/ProcedimientoConsolidacionLAB';
import ProcedimientoConsolidacion from './components/perito/procedimientos/ProcedimientoConsolidacion';


import MesaDePartes from './components/admin/MesaDePartes';
import MesaDePartesForm from './components/admin/MesaDePartesForm';
import MesaDePartesLogin from './components/auth/MesaDePartesLogin';
import MesaDePartesDashboard from './components/mesadepartes/MesaDePartesDashboard';
import CrearOficio from './components/mesadepartes/CrearOficio';
import RespuestaOficio from './components/mesadepartes/RespuestaOficio';
import SeguimientoCasos from './components/mesadepartes/SeguimientoCasos';
import SeguimientoDetalle from './components/mesadepartes/SeguimientoDetalle';
import MesaDePartesResumen from './components/mesadepartes/MesaDePartesResumen';
import CasosCulminados from './components/mesadepartes/CasosCulminados';
import EspecialidadesManagement from './components/admin/SystemConfiguration/EspecialidadesManagement';
import GradosManagement from './components/admin/SystemConfiguration/GradosManagement';
import TurnosManagement from './components/admin/SystemConfiguration/TurnosManagement';

import TiposExamenManagement from './components/admin/SystemConfiguration/TiposExamenManagement.jsx';
import TiposDePrioridadManagement from './components/admin/SystemConfiguration/TiposDePrioridadManagement.jsx';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster richColors position="top-center" />
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
              <Route path="documentos" element={<DocumentManagement />} />
              <Route path="configuracion" element={<SystemConfiguration />} />
              <Route path="configuracion/especialidades" element={<EspecialidadesManagement />} />
              <Route path="configuracion/grados" element={<GradosManagement />} />
              <Route path="configuracion/turnos" element={<TurnosManagement />} />
              <Route path="configuracion/tipos-examen" element={<TiposExamenManagement />} />
              <Route path="configuracion/prioridades" element={<TiposDePrioridadManagement />} />
            </Route>

            {/* Perito Dashboard Routes */}
            <Route path="/perito/dashboard" element={
              <ProtectedRoute requirePerito={true}>
                <PeritoDashboard />
              </ProtectedRoute>
            }>
              <Route index element={<PeritoResumen />} />
              <Route path="documentos" element={<PeritoDocumentos />} />
              <Route path="mis-casos/extraccion" element={<CasosExtraccion />} />
              <Route path="mis-casos/analisis-tm" element={<CasosAnalisisTM />} />
              <Route path="mis-casos/extraccion-y-analisis" element={<CasosExtraccionAnalisis />} />
              <Route path="mis-casos/analisis-inst" element={<CasosAnalisisINST />} />
              <Route path="mis-casos/analisis-lab" element={<CasosAnalisisLAB />} />
              <Route path="mis-casos/consolidacion" element={<CasosConsolidacion />} />
              <Route path="casos/:id" element={<CasoDetail />} />
              <Route path="procedimiento/extraccion/:id" element={<ProcedimientoExtraccion />} />
              <Route path="procedimiento/analisis-tm/:id" element={<ProcedimientoAnalisisTM />} />
              <Route path="procedimiento/analisis-inst/:id" element={<ProcedimientoAnalisisINST />} />
              <Route path="procedimiento/analisis-lab/:id" element={<ProcedimientoAnalisisLAB />} />
              <Route path="procedimiento/consolidacion-lab/:id" element={<ProcedimientoConsolidacionLAB />} />
              <Route path="procedimiento/consolidar/:id" element={<ProcedimientoConsolidacion />} />
              <Route path="perfil" element={<PeritoPerfil />} />
            </Route>

            {/* Mesa de Partes Dashboard Routes */}
            <Route path="/mesadepartes/dashboard" element={
              <ProtectedRoute requireUserMesaDePartes={true}>
                <MesaDePartesDashboard />
              </ProtectedRoute>
            }>
              <Route index element={<MesaDePartesResumen />} />
              <Route path="crear/oficio" element={<CrearOficio />} />
              <Route path="seguimiento/casos" element={<SeguimientoCasos />} />
              <Route path="casos-culminados" element={<CasosCulminados />} />
              <Route path="seguimiento/casos/:id" element={<SeguimientoDetalle />} />
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