
    import React from 'react';
    import { motion } from 'framer-motion';
    import { Input } from '@/components/ui/input';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
    import { Search, ShoppingCart, ScanLine, Trash2, Plus, Minus, CreditCard } from 'lucide-react';
    import { usePos } from '@/pages/pos/PosContext.jsx';
    import ProductoCard from '@/pages/pos/ProductoCard.jsx';
    import ScannedProductModal from '@/pages/pos/ScannedProductModal.jsx';
    import { useToast } from '@/components/ui/use-toast';

    const PosView = () => {
      const {
        searchTerm,
        handleSearch,
        filteredProductos,
        agregarAlCarrito,
        carrito,
        totalCarrito,
        eliminarDelCarrito,
        actualizarCantidadCarrito,
        manualScanCode,
        setManualScanCode,
        handleManualScan,
        procesarPagoYActualizarStock
      } = usePos();
      const { toast } = useToast();

      const handleProcederAlPago = () => {
        if (carrito.length === 0) {
          toast({
            title: "Carrito Vacío",
            description: "Agrega productos al carrito antes de proceder al pago.",
            variant: "destructive",
          });
          return;
        }
        procesarPagoYActualizarStock();
      };

      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)]"
        >
          <div className="lg:w-3/5 flex flex-col space-y-4 overflow-y-auto pr-2">
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Punto de Venta</h1>
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar productos por nombre o código..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-8 w-full"
                />
              </div>
            </div>
            <div className="flex gap-2">
                <Input 
                    placeholder="Escanear código de producto manualmente" 
                    value={manualScanCode}
                    onChange={(e) => setManualScanCode(e.target.value)}
                    className="flex-grow"
                />
                <Button onClick={handleManualScan} variant="outline" className="shrink-0">
                    <ScanLine className="mr-2 h-4 w-4"/> Buscar
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 pb-4">
              {filteredProductos.map(producto => (
                <ProductoCard key={producto.id} producto={producto} onAddToCart={() => agregarAlCarrito(producto)} />
              ))}
              {filteredProductos.length === 0 && (
                <p className="col-span-full text-center text-muted-foreground py-8">No se encontraron productos o están agotados.</p>
              )}
            </div>
          </div>

          <Card className="lg:w-2/5 flex flex-col shadow-xl h-full">
            <CardHeader>
              <CardTitle className="text-xl text-primary flex items-center">
                <ShoppingCart className="mr-2"/> Carrito de Compras
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto space-y-3">
              {carrito.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">El carrito está vacío.</p>
              ) : (
                carrito.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-2 rounded-md border bg-muted/30 hover:bg-muted/50">
                    <div>
                      <p className="font-medium">{item.nombre}</p>
                      <p className="text-xs text-muted-foreground">${parseFloat(item.precio).toFixed(2)} x {item.cantidad}</p>
                    </div>
                    <div className="flex items-center gap-2">
                       <Button size="icon" variant="ghost" onClick={() => actualizarCantidadCarrito(item.id, item.cantidad - 1)} className="h-7 w-7">
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-medium w-4 text-center">{item.cantidad}</span>
                      <Button size="icon" variant="ghost" onClick={() => actualizarCantidadCarrito(item.id, item.cantidad + 1)} className="h-7 w-7">
                        <Plus className="h-3 w-3" />
                      </Button>
                      <p className="font-semibold w-16 text-right">${(parseFloat(item.precio) * item.cantidad).toFixed(2)}</p>
                      <Button variant="ghost" size="icon" onClick={() => eliminarDelCarrito(item.id)} className="text-red-500 hover:text-red-700 h-7 w-7">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
            <CardFooter className="flex-col items-stretch space-y-2 pt-4 border-t">
              <div className="flex justify-between text-lg font-bold text-primary">
                <span>Total:</span>
                <span>${totalCarrito.toFixed(2)}</span>
              </div>
              <Button 
                onClick={handleProcederAlPago}
                disabled={carrito.length === 0} 
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90 text-white"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Proceder al Pago
              </Button>
            </CardFooter>
          </Card>
          <ScannedProductModal />
        </motion.div>
      );
    };

    export default PosView;
  