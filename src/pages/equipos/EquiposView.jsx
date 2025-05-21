
    import React, { useEffect } from 'react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
    import { PlusCircle, Search, Upload, Download, AlertTriangle, ShieldCheck, ShieldOff } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { useEquipos } from '@/pages/equipos/EquiposContext.jsx';
    import EquipoForm from '@/pages/equipos/EquipoForm.jsx';
    import EquiposTable from '@/pages/equipos/EquiposTable.jsx';
    import EquipoDetailsModal from '@/pages/equipos/EquipoDetailsModal.jsx';
    import { useAuth, ROLES } from '@/contexts/AuthContext';
    import { useToast } from '@/components/ui/use-toast';

    const EquiposView = () => {
      const {
        equipos,
        clientes,
        searchTerm,
        setSearchTerm,
        isModalOpen,
        setIsModalOpen,
        currentEquipo,
        fileInputRef,
        handleSubmit,
        openNewEquipoModal,
        handleExportToExcel,
        handleImportFromExcel,
        filteredEquipos,
        handleEdit,
        handleDelete,
        handleViewDetails,
        isDetailsModalOpen,
        setIsDetailsModalOpen,
        selectedEquipoDetails,
        alertasGarantia,
        garantiasVencidasHoy
      } = useEquipos();
      const { user, users: allUsers } = useAuth();
      const { toast } = useToast();

      const puedeCrearYModificar = user && (user.rol === ROLES.JEFE || user.rol === ROLES.SECRETARIA);

      useEffect(() => {
        if (garantiasVencidasHoy.length > 0 && puedeCrearYModificar) {
          toast({
            title: "Alerta de Garantías Vencidas",
            description: `${garantiasVencidasHoy.length} equipo(s) tienen garantías que vencen hoy. Revísalos.`,
            variant: "destructive",
            duration: 10000,
          });
        }
      }, [garantiasVencidasHoy, toast, puedeCrearYModificar]);


      return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="flex flex-wrap justify-between items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Gestión de Equipos</h1>
            {puedeCrearYModificar && (
                <div className="flex gap-2 flex-wrap">
                <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                    <Upload className="mr-2 h-4 w-4" /> Importar Excel
                </Button>
                <input type="file" ref={fileInputRef} onChange={handleImportFromExcel} accept=".xlsx, .xls" style={{ display: 'none' }} />
                <Button onClick={handleExportToExcel} variant="outline">
                    <Download className="mr-2 h-4 w-4" /> Exportar Excel
                </Button>
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                    <Button onClick={openNewEquipoModal} className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white">
                        <PlusCircle className="mr-2 h-4 w-4" /> Registrar Equipo
                    </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl glassmorphic">
                    <DialogHeader>
                        <DialogTitle className="text-primary">{currentEquipo ? 'Editar Equipo' : 'Registrar Nuevo Equipo'}</DialogTitle>
                    </DialogHeader>
                    <EquipoForm
                        handleSubmit={handleSubmit}
                        clientes={clientes}
                    />
                    </DialogContent>
                </Dialog>
                </div>
            )}
          </div>

          {puedeCrearYModificar && alertasGarantia.length > 0 && (
            <Card className="border-yellow-500 bg-yellow-500/10 shadow-lg">
              <CardHeader>
                <CardTitle className="text-yellow-700 dark:text-yellow-400 flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5" /> Alertas de Garantía Próximas a Vencer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm">
                  {alertasGarantia.map(alerta => (
                    <li key={alerta.id} className="flex justify-between items-center p-1 rounded hover:bg-yellow-500/20">
                      <span>Equipo <span className="font-semibold">{alerta.codigoUnico}</span> ({alerta.marca} {alerta.modelo}) para <span className="font-semibold">{alerta.clienteNombre}</span></span>
                      <span className="text-yellow-600 dark:text-yellow-500 font-medium">Vence en {alerta.diasRestantes} día(s) ({alerta.fechaVencimiento})</span>
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
                  placeholder={user?.rol.startsWith('tecnico_') ? "Buscar en mis equipos asignados..." : "Buscar equipo (marca, código, cliente, técnico...)" }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-md"
                />
              </div>
            </CardHeader>
            <CardContent>
              <EquiposTable
                equipos={filteredEquipos}
                clientes={clientes}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                handleViewDetails={handleViewDetails}
                allUsers={allUsers}
              />
            </CardContent>
             <CardFooter>
              <div className="text-xs text-muted-foreground">
                Mostrando {filteredEquipos.length} de {equipos.length} equipos {user?.rol.startsWith('tecnico_') ? '(asignados a ti)' : '(totales)'}.
              </div>
            </CardFooter>
          </Card>

          <EquipoDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            equipoDetails={selectedEquipoDetails}
          />
        </motion.div>
      );
    };

    export default EquiposView;
  