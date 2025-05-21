
    import React from 'react';
    import { Button } from '@/components/ui/button';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
    import { usePos } from '@/pages/pos/PosContext.jsx';
    import { ShoppingCart, Package } from 'lucide-react';

    const ScannedProductModal = () => {
      const { 
        scannedProductModalOpen, 
        setScannedProductModalOpen, 
        scannedProductDetails, 
        agregarAlCarrito 
      } = usePos();

      if (!scannedProductDetails) return null;

      const handleAddToCartAndClose = () => {
        agregarAlCarrito(scannedProductDetails);
        setScannedProductModalOpen(false);
      };

      return (
        <Dialog open={scannedProductModalOpen} onOpenChange={setScannedProductModalOpen}>
          <DialogContent className="sm:max-w-md glassmorphic">
            <DialogHeader>
              <DialogTitle className="text-primary flex items-center">
                <Package className="mr-2"/>Detalles del Producto
              </DialogTitle>
              <DialogDescription>
                Información del producto escaneado o buscado.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-3">
              {scannedProductDetails.imagenUrl && (
                <div className="w-full aspect-video rounded-md overflow-hidden bg-muted">
                  <img  
                    src={scannedProductDetails.imagenUrl} 
                    alt={scannedProductDetails.nombre} 
                    className="w-full h-full object-contain"
                   src="https://images.unsplash.com/photo-1635865165118-917ed9e20936" />
                </div>
              )}
              <h3 className="text-xl font-semibold">{scannedProductDetails.nombre}</h3>
              <p className="text-sm text-muted-foreground">{scannedProductDetails.descripcion || "Sin descripción."}</p>
              <div className="flex justify-between items-center">
                <p className="text-2xl font-bold text-accent">${parseFloat(scannedProductDetails.precio).toFixed(2)}</p>
                <p className="text-sm">Stock: {scannedProductDetails.cantidad}</p>
              </div>
              <p className="text-xs text-muted-foreground">Código: {scannedProductDetails.codigoProducto}</p>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setScannedProductModalOpen(false)}>Cerrar</Button>
              <Button onClick={handleAddToCartAndClose} className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white" disabled={scannedProductDetails.cantidad <= 0}>
                <ShoppingCart className="mr-2 h-4 w-4" /> {scannedProductDetails.cantidad > 0 ? "Agregar al Carrito" : "Agotado"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };

    export default ScannedProductModal;
  