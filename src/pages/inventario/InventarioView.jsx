
    import React, { useEffect } from 'react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
    import { PlusCircle, Search, AlertTriangle } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { useInventario } from '@/pages/inventario/InventarioContext.jsx';
    import ProductoForm from '@/pages/inventario/ProductoForm.jsx';
    import ProductosTable from '@/pages/inventario/ProductosTable.jsx';
    import QrModal from '@/pages/inventario/QrModal.jsx';
    import { useToast } from '@/components/ui/use-toast';

    const InventarioView = () => {
      const {
        searchTerm,
        setSearchTerm,
        isModalOpen,
        setIsModalOpen,
        currentProducto,
        openNewProductoModal,
        filteredProductos,
        productos,
        alertasBajoStock, 
        productosConBajoStockHoy 
      } = useInventario();
      const { toast } = useToast();

      useEffect(() => {
        if (productosConBajoStockHoy.length > 0) {
          toast({
            title: "Alerta de Bajo Stock",
            description: `${productosConBajoStockHoy.length} producto(s) tienen bajo stock (5 o menos unidades). Revísalos.`,
            variant: "destructive",
            duration: 10000,
          });
        }
      }, [productosConBajoStockHoy, toast]);


      return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="flex flex-wrap justify-between items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Gestión de Inventario</h1>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={openNewProductoModal} className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white">
                  <PlusCircle className="mr-2 h-4 w-4" /> Agregar Producto
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px] glassmorphic">
                <DialogHeader>
                  <DialogTitle className="text-primary">{currentProducto ? 'Editar Producto' : 'Agregar Nuevo Producto'}</DialogTitle>
                </DialogHeader>
                <ProductoForm />
              </DialogContent>
            </Dialog>
          </div>

          {alertasBajoStock.length > 0 && (
            <Card className="border-orange-500 bg-orange-500/10 shadow-lg">
              <CardHeader>
                <CardTitle className="text-orange-700 dark:text-orange-400 flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5" /> Alertas de Bajo Stock (Menos de 5 unidades)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm">
                  {alertasBajoStock.map(producto => (
                    <li key={producto.id} className="flex justify-between items-center p-1 rounded hover:bg-orange-500/20">
                      <span>Producto: <span className="font-semibold">{producto.nombre}</span> (Código: {producto.codigoProducto})</span>
                      <span className="text-orange-600 dark:text-orange-500 font-medium">Stock Actual: {producto.cantidad}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-xl">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Search className="text-muted-foreground" />
                <Input 
                  placeholder="Buscar producto por nombre, código..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              <ProductosTable />
            </CardContent>
            <CardFooter>
              <div className="text-xs text-muted-foreground">
                Mostrando {filteredProductos.length} de {productos.length} tipos de productos.
              </div>
            </CardFooter>
          </Card>
          <QrModal />
        </motion.div>
      );
    };

    export default InventarioView;
  