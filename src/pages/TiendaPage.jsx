
    import React, { useState } from 'react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { PlusCircle, Edit, Trash2, QrCode, Search } from 'lucide-react';
    import QRCodeStyling from 'qrcode.react';
    import { motion, AnimatePresence } from 'framer-motion';
    import useLocalStorage from '@/hooks/useLocalStorage';
    import { useToast } from '@/components/ui/use-toast';

    const TiendaPage = () => {
      const [productos, setProductos] = useLocalStorage('productos', []);
      const [searchTerm, setSearchTerm] = useState('');
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [isQrModalOpen, setIsQrModalOpen] = useState(false);
      const [currentProducto, setCurrentProducto] = useState(null);
      const [selectedQrData, setSelectedQrData] = useState(null);
      const { toast } = useToast();

      const initialFormData = {
        id: '',
        nombre: '',
        descripcion: '',
        precio: '',
        cantidad: '',
        codigoProducto: ''
      };
      const [formData, setFormData] = useState(initialFormData);

      const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
      };

      const generateCodigoProducto = () => {
        return `PROD-${Date.now().toString().slice(-6)}`;
      };

      const handleSubmit = (e) => {
        e.preventDefault();
        if (currentProducto) {
          setProductos(productos.map(p => p.id === currentProducto.id ? { ...formData, id: currentProducto.id } : p));
          toast({ title: "Producto Actualizado", description: "El producto ha sido actualizado." });
        } else {
          const newProducto = { ...formData, id: Date.now().toString(), codigoProducto: formData.codigoProducto || generateCodigoProducto() };
          setProductos([...productos, newProducto]);
          toast({ title: "Producto Agregado", description: "El nuevo producto ha sido agregado a la tienda." });
        }
        resetFormAndCloseModal();
      };

      const handleEdit = (producto) => {
        setCurrentProducto(producto);
        setFormData(producto);
        setIsModalOpen(true);
      };

      const handleDelete = (id) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este producto?")) {
          setProductos(productos.filter(p => p.id !== id));
          toast({ title: "Producto Eliminado", description: "El producto ha sido eliminado.", variant: "destructive" });
        }
      };

      const handleShowQr = (producto) => {
        setSelectedQrData({ name: producto.nombre, code: producto.codigoProducto });
        setIsQrModalOpen(true);
      };
      
      const resetFormAndCloseModal = () => {
        setFormData(initialFormData);
        setCurrentProducto(null);
        setIsModalOpen(false);
      };

      const filteredProductos = productos.filter(producto =>
        producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.codigoProducto.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Inventario de Tienda</h1>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setCurrentProducto(null); setFormData(initialFormData); setIsModalOpen(true); }} className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white">
                  <PlusCircle className="mr-2 h-4 w-4" /> Agregar Producto
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px] glassmorphic">
                <DialogHeader>
                  <DialogTitle className="text-primary">{currentProducto ? 'Editar Producto' : 'Agregar Nuevo Producto'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="nombre">Nombre del Producto</Label>
                    <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <Label htmlFor="descripcion">Descripción</Label>
                    <Input id="descripcion" name="descripcion" value={formData.descripcion} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="precio">Precio ($)</Label>
                    <Input id="precio" name="precio" type="number" step="0.01" value={formData.precio} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <Label htmlFor="cantidad">Cantidad en Stock</Label>
                    <Input id="cantidad" name="cantidad" type="number" value={formData.cantidad} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <Label htmlFor="codigoProducto">Código de Producto (auto-generado si se deja vacío)</Label>
                    <Input id="codigoProducto" name="codigoProducto" value={formData.codigoProducto} onChange={handleInputChange} placeholder={generateCodigoProducto()} />
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                       <Button type="button" variant="outline" onClick={resetFormAndCloseModal}>Cancelar</Button>
                    </DialogClose>
                    <Button type="submit" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white">{currentProducto ? 'Guardar Cambios' : 'Agregar Producto'}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="shadow-xl">
            <CardHeader>
               <div className="flex items-center space-x-2">
                <Search className="text-muted-foreground" />
                <Input 
                  placeholder="Buscar producto..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              <AnimatePresence>
                {filteredProductos.length > 0 ? (
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
                          <TableCell>{producto.nombre}</TableCell>
                          <TableCell>${parseFloat(producto.precio).toFixed(2)}</TableCell>
                          <TableCell>{producto.cantidad}</TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button variant="ghost" size="icon" onClick={() => handleShowQr(producto)} className="text-purple-500 hover:text-purple-700">
                              <QrCode className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(producto)} className="text-blue-500 hover:text-blue-700">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(producto.id)} className="text-red-500 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No se encontraron productos.
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
            <CardFooter>
              <div className="text-xs text-muted-foreground">
                Total de productos: {filteredProductos.length}
              </div>
            </CardFooter>
          </Card>

          {/* QR Code Modal */}
          <Dialog open={isQrModalOpen} onOpenChange={setIsQrModalOpen}>
            <DialogContent className="sm:max-w-md glassmorphic">
              <DialogHeader>
                <DialogTitle className="text-primary">Código QR del Producto</DialogTitle>
              </DialogHeader>
              {selectedQrData && (
                <div className="flex flex-col items-center space-y-4 py-4">
                  <p className="font-semibold text-lg">{selectedQrData.name}</p>
                  <QRCodeStyling value={selectedQrData.code} size={200} level="H" />
                  <p className="text-sm text-muted-foreground">Código: {selectedQrData.code}</p>
                </div>
              )}
              <DialogFooter>
                <Button onClick={() => setIsQrModalOpen(false)} variant="outline">Cerrar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </motion.div>
      );
    };

    export default TiendaPage;
  