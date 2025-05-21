
    import React from 'react';
    import { Navigate, useLocation } from 'react-router-dom';
    import { useAuth } from '@/contexts/AuthContext';
    import { AlertTriangle } from 'lucide-react';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

    const ProtectedRoute = ({ children, roles }) => {
      const { user } = useAuth();
      const location = useLocation();

      if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
      }

      if (roles && !roles.includes(user.rol)) {
        return (
          <div className="flex items-center justify-center h-full p-4">
            <Card className="w-full max-w-md text-center shadow-xl bg-destructive/10 border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center justify-center">
                  <AlertTriangle className="mr-2 h-8 w-8" /> Acceso Denegado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-destructive-foreground">No tienes permiso para acceder a esta página.</p>
                <p className="text-sm text-muted-foreground mt-2">Contacta al administrador si crees que esto es un error.</p>
              </CardContent>
            </Card>
          </div>
        );
      }

      return children;
    };

    export default ProtectedRoute;
  