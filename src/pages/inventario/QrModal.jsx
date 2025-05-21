
    import React from 'react';
    import { Button } from '@/components/ui/button';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
    import QRCode from 'qrcode.react';
    import { useInventario } from '@/pages/inventario/InventarioContext.jsx';

    const QrModal = () => {
      const { isQrModalOpen, setIsQrModalOpen, selectedQrData } = useInventario();

      if (!selectedQrData) return null;

      return (
        <Dialog open={isQrModalOpen} onOpenChange={setIsQrModalOpen}>
          <DialogContent className="sm:max-w-md glassmorphic">
            <DialogHeader>
              <DialogTitle className="text-primary">Código QR del Producto</DialogTitle>
              <DialogDescription>
                Escanea este código para ver detalles del producto.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center space-y-4 py-4">
              <p className="font-semibold text-lg">{selectedQrData.name}</p>
              {selectedQrData.imageUrl && (
                 <img  src={selectedQrData.imageUrl} alt={selectedQrData.name} className="w-24 h-24 object-cover rounded-md border" src="https://images.unsplash.com/photo-1675023112817-52b789fd2ef0" />
              )}
              <QRCode value={JSON.stringify({ codigoProducto: selectedQrData.code, nombre: selectedQrData.name, precio: selectedQrData.price, imagenUrl: selectedQrData.imageUrl })} size={200} level="H" includeMargin={true} />
              <p className="text-sm text-muted-foreground">Código: {selectedQrData.code}</p>
              <p className="text-lg font-bold text-accent">${parseFloat(selectedQrData.price).toFixed(2)}</p>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsQrModalOpen(false)} variant="outline">Cerrar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };
    export default QrModal;
  