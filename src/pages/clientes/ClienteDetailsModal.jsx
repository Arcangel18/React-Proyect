
    import React from 'react';
    import { Button } from '@/components/ui/button';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { useClientes } from '@/pages/clientes/ClientesContext.jsx';

    const ClienteDetailsModal = () => {
      const { isDetailsModalOpen, setIsDetailsModalOpen, selectedClienteDetails } = useClientes();

      if (!selectedClienteDetails) return null;

      return (
        <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
          <DialogContent className="sm:max-w-lg glassmorphic">
            <DialogHeader>
              <DialogTitle className="text-primary">Detalles del Cliente y Equipos</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
              <Card>
                <CardHeader><CardTitle className="text-lg text-accent">Información del Cliente</CardTitle></CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p><strong>Nombre Completo:</strong> {selectedClienteDetails.nombreCompleto}</p>
                  <p><strong>Cédula:</strong> {selectedClienteDetails.cedula}</p>
                  <p><strong>Teléfono:</strong> {selectedClienteDetails.telefono}</p>
                  <p><strong>Email:</strong> {selectedClienteDetails.email || 'N/A'}</p>
                  <p><strong>Autorizado a recoger:</strong> {selectedClienteDetails.personaAutorizada || 'N/A'}</p>
                </CardContent>
              </Card>
              
              <h3 className="text-md font-semibold text-accent mt-4">Equipos Registrados:</h3>
              {selectedClienteDetails.equipos && selectedClienteDetails.equipos.length > 0 ? (
                <div className="space-y-2">
                  {selectedClienteDetails.equipos.map(eq => (
                    <Card key={eq.id} className="bg-muted/50">
                        <CardContent className="pt-4 text-sm">
                        <p><strong>Código:</strong> {eq.codigoUnico}</p>
                        <p><strong>Marca:</strong> {eq.marca} - <strong>Modelo:</strong> {eq.modelo}</p>
                        <p><strong>Estado:</strong> {eq.estado}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Este cliente no tiene equipos registrados.</p>
              )}
              <DialogFooter>
                <Button onClick={() => setIsDetailsModalOpen(false)} variant="outline">Cerrar</Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      );
    };

    export default ClienteDetailsModal;
  