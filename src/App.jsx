
    import React from 'react';
    import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
    import Layout from '@/components/Layout';
    import LoginPage from '@/pages/auth/LoginPage';
    import ProtectedRoute from '@/pages/auth/ProtectedRoute';
    import { AuthProvider, useAuth, ROLES } from '@/contexts/AuthContext';

    import ClientesPage from '@/pages/clientes/ClientesPage';
    import EquiposPage from '@/pages/equipos/EquiposPage';
    import EstadoEquiposPage from '@/pages/estado-equipos/EstadoEquiposPage';
    import ReportesPage from '@/pages/ReportesPage';
    import TecnicosPage from '@/pages/TecnicosPage';
    import InventarioPage from '@/pages/inventario/InventarioPage';
    import PuntoDeVentaPage from '@/pages/pos/PuntoDeVentaPage';
    import GestionEmpleadosPage from '@/pages/admin/GestionEmpleadosPage';
    import MonitorTallerPage from '@/pages/monitor/MonitorTallerPage';
    import FacturacionPage from '@/pages/facturacion/FacturacionPage';
    import { Toaster } from '@/components/ui/toaster';

    const AppRoutes = () => {
      const { user } = useAuth();

      if (!user) {
        return (
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/monitor-taller" element={<MonitorTallerPage />} /> 
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        );
      }

      return (
        <Routes>
          <Route path="/monitor-taller" element={<MonitorTallerPage />} />
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<Navigate to="/clientes" replace />} />
                <Route path="/login" element={<Navigate to="/clientes" replace />} />
                
                <Route path="/clientes" element={<ProtectedRoute roles={[ROLES.JEFE, ROLES.SECRETARIA]}><ClientesPage /></ProtectedRoute>} />
                <Route path="/equipos" element={<ProtectedRoute roles={[ROLES.JEFE, ROLES.SECRETARIA, ROLES.TECNICO_MICROONDAS, ROLES.TECNICO_TV, ROLES.TECNICO_GENERAL]}><EquiposPage /></ProtectedRoute>} />
                <Route path="/estado-equipos" element={<ProtectedRoute roles={[ROLES.JEFE, ROLES.SECRETARIA, ROLES.TECNICO_MICROONDAS, ROLES.TECNICO_TV, ROLES.TECNICO_GENERAL]}><EstadoEquiposPage /></ProtectedRoute>} />
                <Route path="/inventario" element={<ProtectedRoute roles={[ROLES.JEFE, ROLES.SECRETARIA]}><InventarioPage /></ProtectedRoute>} />
                <Route path="/pos" element={<ProtectedRoute roles={[ROLES.JEFE, ROLES.SECRETARIA]}><PuntoDeVentaPage /></ProtectedRoute>} />
                <Route path="/reportes" element={<ProtectedRoute roles={[ROLES.JEFE, ROLES.SECRETARIA]}><ReportesPage /></ProtectedRoute>} />
                <Route path="/tecnicos" element={<ProtectedRoute roles={[ROLES.JEFE, ROLES.SECRETARIA, ROLES.TECNICO_MICROONDAS, ROLES.TECNICO_TV, ROLES.TECNICO_GENERAL]}><TecnicosPage /></ProtectedRoute>} />
                <Route path="/admin/empleados" element={<ProtectedRoute roles={[ROLES.JEFE]}><GestionEmpleadosPage /></ProtectedRoute>} />
                <Route path="/facturacion" element={<ProtectedRoute roles={[ROLES.JEFE, ROLES.SECRETARIA]}><FacturacionPage /></ProtectedRoute>} />
                
                <Route path="*" element={<Navigate to="/clientes" replace />} />
              </Routes>
            </Layout>
          } />
        </Routes>
      );
    };

    function App() {
      return (
        <Router>
          <AuthProvider>
            <AppRoutes />
            <Toaster />
          </AuthProvider>
        </Router>
      );
    }

    export default App;
  