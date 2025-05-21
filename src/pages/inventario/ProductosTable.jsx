
    import React from 'react';
    import { Button } from '@/components/ui/button';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { Edit, Trash2, QrCode } from 'lucide-react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { useInventario } from '@/pages/inventario/InventarioContext.jsx';

    const ProductosTable = () => {
      const { filteredProductos, handleEdit, handleDelete, handleShowQr } = useInventario();

      if (filteredProductos.length === 0) {
        return (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-muted-foreground"
          >
            No se encontraron productos en el inventario.
          </motion.div>
        );
      }

      return (
        <AnimatePresence>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProductos.map((producto, index) => (
                <motion.tr 
                  key={producto.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="hover:bg-muted/50"
                >
                  <TableCell>{producto.codigoProducto}</TableCell>
                  <TableCell className="font-medium">{producto.nombre}</TableCell>
                  <TableCell>${parseFloat(producto.precio).toFixed(2)}</TableCell>
                  <TableCell>{producto.cantidad}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => handleShowQr(producto)} className="text-purple-500 hover:text-purple-700" title="Ver QR">
                      <QrCode className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(producto)} className="text-blue-500 hover:text-blue-700" title="Editar">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(producto.id)} className="text-red-500 hover:text-red-700" title="Eliminar">
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

    export default ProductosTable;
  