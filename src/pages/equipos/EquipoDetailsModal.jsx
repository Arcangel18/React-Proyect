
    import React from 'react';
    import { Button } from '@/components/ui/button';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { getStatusColor } from '@/pages/equipos/equiposUtils.jsx';

    const EquipoDetailsModal = ({ isOpen, onClose, equipoDetails }) => {
      if (!equipoDetails) return null;

      const { cliente, tecnicoAsignado, ...equipo } = equipoDetails;

      return (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-lg glassmorphic">
            <DialogHeader>
              <DialogTitle className="text-primary">Detalles del Equipo: {equipo.codigoUnico}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
              <Card>
                <CardHeader><CardTitle className="text-lg text-accent">Información del Equipo</CardTitle></CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p><strong>Marca y Modelo:</strong> {equipo.marca} - {equipo.modelo}</p>
                  <p><strong>Serial:</strong> {equipo.serial || 'N/A'}</p>
                  <p><strong>Problema Reportado:</strong> {equipo.descripcionProblema}</p>
                  <p><strong>Estado:</strong> <span className={`px-1.5 py-0.5 text-xs font-medium text-white rounded-full ${getStatusColor(equipo.estado)}`}>{equipo.estado}</span></p>
                  <p><strong>Monto Reparación:</strong> ${parseFloat(equipo.montoReparacion || 0).toFixed(2)}</p>
                  <p><strong>Fecha de Registro:</strong> {new Date(equipo.fechaRegistro).toLocaleDateString()}</p>
                  <p><strong>Categoría Almacén:</strong> {equipo.categoriaAlmacen || 'N/A'}</p>
                  <p><strong>Ubicación Almacén:</strong> {equipo.ubicacionAlmacen || 'N/A'}</p>
                </CardContent>
              </Card>

              {cliente && (
                <Card>
                  <CardHeader><CardTitle className="text-lg text-accent">Información del Cliente</CardTitle></CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <p><strong>Nombre:</strong> {cliente.nombreCompleto}</p>
                    <p><strong>Cédula:</strong> {cliente.cedula}</p>
                    <p><strong>Teléfono:</strong> {cliente.telefono}</p>
                    <p><strong>Email:</strong> {cliente.email || 'N/A'}</p>
                    <p><strong>Autorizado a recoger:</strong> {cliente.personaAutorizada || 'N/A'}</p>
                  </CardContent>
                </Card>
              )}

              {tecnicoAsignado && (
                <Card>
                  <CardHeader><CardTitle className="text-lg text-accent">Información del Técnico Asignado</CardTitle></CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <p><strong>Nombre:</strong> {tecnicoAsignado.nombreCompleto}</p>
                    <p><strong>Rol:</strong> {tecnicoAsignado.rol}</p>
                    {tecnicoAsignado.especialidadCategoria && <p><strong>Especialidad:</strong> {tecnicoAsignado.especialidadCategoria}</p>}
                  </CardContent>
                </Card>
              )}

            </div>
            <DialogFooter>
              <Button onClick={onClose} variant="outline">Cerrar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };

    export default EquipoDetailsModal;
  