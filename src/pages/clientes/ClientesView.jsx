
    import React from 'react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
    import { PlusCircle, Search } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { useClientes } from '@/pages/clientes/ClientesContext.jsx';
    import ClienteForm from '@/pages/clientes/ClienteForm.jsx';
    import ClientesTable from '@/pages/clientes/ClientesTable.jsx';
    import ClienteDetailsModal from '@/pages/clientes/ClienteDetailsModal.jsx';

    const ClientesView = () => {
      const {
        searchTerm,
        setSearchTerm,
        isModalOpen,
        setIsModalOpen,
        currentCliente,
        openNewClienteModal,
        filteredClientes,
        clientes
      } = useClientes();

      return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="flex flex-wrap justify-between items-center gap-4">
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
                <ClienteForm />
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
              <ClientesTable />
            </CardContent>
            <CardFooter>
              <div className="text-xs text-muted-foreground">
                Mostrando {filteredClientes.length} de {clientes.length} clientes.
              </div>
            </CardFooter>
          </Card>

          <ClienteDetailsModal />
        </motion.div>
      );
    };

    export default ClientesView;
  