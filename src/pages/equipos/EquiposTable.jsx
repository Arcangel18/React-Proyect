
    import React from 'react';
    import { Button } from '@/components/ui/button';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { Edit, Trash2, Eye, ShieldCheck, ShieldAlert, ShieldOff } from 'lucide-react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { getStatusColor, calcularFechaVencimientoGarantia } from '@/pages/equipos/equiposUtils.jsx';
    import { useAuth, ROLES } from '@/contexts/AuthContext';

    const EquiposTable = ({ equipos, clientes, handleEdit, handleDelete, handleViewDetails, allUsers }) => {
      const { user } = useAuth();
      const puedeModificar = user && (user.rol === ROLES.JEFE || user.rol === ROLES.SECRETARIA);

      const getClienteNombre = (clienteId) => {
        const cliente = clientes.find(c => c.id === clienteId);
        return cliente ? cliente.nombreCompleto : 'N/A';
      };

      const getTecnicoNombre = (tecnicoId) => {
        const tecnico = allUsers.find(u => u.id === tecnicoId);
        return tecnico ? tecnico.nombreCompleto : 'No asignado';
      };

      const GarantiaStatusIcon = ({ equipo }) => {
        if (!equipo.fechaEntrega || !equipo.periodoGarantia) {
          return <ShieldOff className="h-4 w-4 text-gray-400" title="Sin garantía registrada" />;
        }
        const fechaVencimiento = calcularFechaVencimientoGarantia(equipo.fechaEntrega, equipo.periodoGarantia);
        const hoy = new Date();
        hoy.setHours(0,0,0,0);
        
        if (fechaVencimiento < hoy) {
          return <ShieldOff className="h-4 w-4 text-red-500" title={`Garantía Vencida (${fechaVencimiento.toLocaleDateString()})`} />;
        }
        
        const diffTime = Math.abs(fechaVencimiento - hoy);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 7) {
          return <ShieldAlert className="h-4 w-4 text-yellow-500" title={`Garantía vence en ${diffDays} día(s) (${fechaVencimiento.toLocaleDateString()})`} />;
        }
        
        return <ShieldCheck className="h-4 w-4 text-green-500" title={`Garantía vigente hasta ${fechaVencimiento.toLocaleDateString()}`} />;
      };


      if (equipos.length === 0) {
        return (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-muted-foreground"
          >
            No se encontraron equipos que coincidan con la búsqueda.
          </motion.div>
        );
      }

      return (
        <AnimatePresence>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Marca/Modelo</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Técnico</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Garantía</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {equipos.map((equipo, index) => (
                  <motion.tr 
                    key={equipo.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="hover:bg-muted/50"
                  >
                    <TableCell className="font-medium">{equipo.codigoUnico}</TableCell>
                    <TableCell>{equipo.marca} {equipo.modelo}</TableCell>
                    <TableCell>{getClienteNombre(equipo.clienteId)}</TableCell>
                    <TableCell>{getTecnicoNombre(equipo.tecnicoId)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs font-semibold text-white rounded-full ${getStatusColor(equipo.estado)}`}>
                        {equipo.estado}
                      </span>
                    </TableCell>
                    <TableCell>
                      <GarantiaStatusIcon equipo={equipo} />
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => handleViewDetails(equipo)} className="text-blue-500 hover:text-blue-700" title="Ver Detalles">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {puedeModificar && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(equipo)} className="text-orange-500 hover:text-orange-700" title="Editar">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(equipo.id)} className="text-red-500 hover:text-red-700" title="Eliminar">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </AnimatePresence>
      );
    };

    export default EquiposTable;
  