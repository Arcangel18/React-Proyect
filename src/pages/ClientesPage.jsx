
    import React, { useState, useEffect, useCallback } from 'react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { PlusCircle, Edit, Trash2, Search, Info } from 'lucide-react';
    import { motion, AnimatePresence } from 'framer-motion';
    import useLocalStorage from '@/hooks/useLocalStorage';
    import { useToast } from '@/components/ui/use-toast';

    const initialFormData = {
      id: '',
      nombreCompleto: '',
      cedula: '',
      telefono: '',
      email: '',
      personaAutorizada: ''
    };

    const ClientesPage = () => {
      const [clientes, setClientes] = useLocalStorage('clientes', []);
      const [equipos] = useLocalStorage('equipos', []);
      const [searchTerm, setSearchTerm] = useState('');
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
      const [currentCliente, setCurrentCliente] = useState(null);
      const [selectedClienteDetails, setSelectedClienteDetails] = useState(null);
      const [formData, setFormData] = useState(initialFormData);
      const { toast } = useToast();

      const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
      }, []);

      const resetFormAndCloseModal = useCallback(() => {
        setFormData(initialFormData);
        setCurrentCliente(null);
        setIsModalOpen(false);
      }, []);

      const handleSubmit = useCallback((e) => {
        e.preventDefault();
        if (!formData.nombreCompleto || !formData.cedula || !formData.telefono) {
            toast({ title: "Campos Requeridos", description: "Nombre completo, cédula y teléfono son obligatorios.", variant: "destructive" });
            return;
        }
        if (currentCliente) {
          setClientes(prevClientes => prevClientes.map(c => c.id === currentCliente.id ? { ...formData, id: currentCliente.id } : c));
          toast({ title: "Cliente Actualizado", description: "El cliente ha sido actualizado exitosamente." });
        } else {
          setClientes(prevClientes => [...prevClientes, { ...formData, id: Date.now().toString() }]);
          toast({ title: "Cliente Agregado", description: "El nuevo cliente ha sido agregado exitosamente." });
        }
        resetFormAndCloseModal();
      }, [formData, currentCliente, setClientes, toast, resetFormAndCloseModal]);

      const handleEdit = useCallback((cliente) => {
        setCurrentCliente(cliente);
        setFormData(cliente);
        setIsModalOpen(true);
      }, []);

      const handleDelete = useCallback((id) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este cliente? Esto también podría afectar los equipos asociados.")) {
          setClientes(prevClientes => prevClientes.filter(c => c.id !== id));
          toast({ title: "Cliente Eliminado", description: "El cliente ha sido eliminado.", variant: "destructive" });
        }
      }, [setClientes, toast]);
      
      const handleViewDetails = useCallback((cliente) => {
        const equiposDelCliente = equipos.filter(eq => eq.clienteId === cliente.id);
        setSelectedClienteDetails({ ...cliente, equipos: equiposDelCliente });
        setIsDetailsModalOpen(true);
      }, [equipos]);


      const openNewClienteModal = useCallback(() => {
        setCurrentCliente(null);
        setFormData(initialFormData);
        setIsModalOpen(true);
      }, []);


      const filteredClientes = clientes.filter(cliente =>
        cliente.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.cedula.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cliente.email && cliente.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (cliente.telefono && cliente.telefono.toLowerCase().includes(searchTerm.toLowerCase()))
      );

      return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Gestión de Clientes</h1>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={openNewClienteModal} className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white">
                  <PlusCircle className="mr-2 h-4 w-4" /> Agregar Cliente
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px] glassmorphic">
                <DialogHeader>
                  <DialogTitle className="text-primary">{currentCliente ? 'Editar Cliente' : 'Agregar Nuevo Cliente'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="nombreCompleto">Nombre Completo <span className="text-red-500">*</span></Label>
                    <Input id="nombreCompleto" name="nombreCompleto" value={formData.nombreCompleto} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <Label htmlFor="cedula">Cédula (DNI) <span className="text-red-500">*</span></Label>
                    <Input id="cedula" name="cedula" value={formData.cedula} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <Label htmlFor="telefono">Teléfono <span className="text-red-500">*</span></Label>
                    <Input id="telefono" name="telefono" type="tel" value={formData.telefono} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <Label htmlFor="email">Email (Opcional)</Label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="personaAutorizada">Persona Autorizada a Recoger (Opcional)</Label>
                    <Input id="personaAutorizada" name="personaAutorizada" value={formData.personaAutorizada} onChange={handleInputChange} />
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                       <Button type="button" variant="outline" onClick={resetFormAndCloseModal}>Cancelar</Button>
                    </DialogClose>
                    <Button type="submit" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white">{currentCliente ? 'Guardar Cambios' : 'Agregar Cliente'}</Button>
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
                  placeholder="Buscar cliente por nombre, cédula, email o teléfono..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              <AnimatePresence>
                {filteredClientes.length > 0 ? (
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
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No se encontraron clientes. Puede agregar uno nuevo.
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
            <CardFooter>
              <div className="text-xs text-muted-foreground">
                Total de clientes: {filteredClientes.length}
              </div>
            </CardFooter>
          </Card>

          {/* Details Modal */}
           <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
            <DialogContent className="sm:max-w-lg glassmorphic">
              <DialogHeader>
                <DialogTitle className="text-primary">Detalles del Cliente y Equipos</DialogTitle>
              </DialogHeader>
              {selectedClienteDetails && (
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
              )}
            </DialogContent>
          </Dialog>

        </motion.div>
      );
    };

    export default ClientesPage;
  