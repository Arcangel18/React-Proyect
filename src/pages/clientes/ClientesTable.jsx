
    import React from 'react';
    import { Button } from '@/components/ui/button';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { Edit, Trash2, Info } from 'lucide-react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { useClientes } from '@/pages/clientes/ClientesContext.jsx';

    const ClientesTable = () => {
      const { filteredClientes, handleEdit, handleDelete, handleViewDetails } = useClientes();

      if (filteredClientes.length === 0) {
        return (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-muted-foreground"
          >
            No se encontraron clientes. Puede agregar uno nuevo.
          </motion.div>
        );
      }

      return (
        <AnimatePresence>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre Completo</TableHead>
                <TableHead>Cédula</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClientes.map((cliente, index) => (
                <motion.tr 
                  key={cliente.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="hover:bg-muted/50"
                >
                  <TableCell>{cliente.nombreCompleto}</TableCell>
                  <TableCell>{cliente.cedula}</TableCell>
                  <TableCell>{cliente.telefono}</TableCell>
                  <TableCell>{cliente.email || 'N/A'}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => handleViewDetails(cliente)} className="text-purple-500 hover:text-purple-700">
                      <Info className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(cliente)} className="text-blue-500 hover:text-blue-700">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(cliente.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </AnimatePresence>
      );
    };

    export default ClientesTable;
  