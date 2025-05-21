
    import React, { useState, useMemo, useCallback } from 'react';
    import useLocalStorage from '@/hooks/useLocalStorage';
    import { useAuth, ROLES } from '@/contexts/AuthContext';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
    import { Button } from '@/components/ui/button';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
    import { motion, AnimatePresence } from 'framer-motion';
    import { Wrench, PackageSearch, Construction, AlertTriangle, CheckCircle2, User, Clock, Edit3 } from 'lucide-react';
    import { cn } from '@/lib/utils';
    import { getStatusColor as getEquipoStatusColor, estadoOptions } from '@/pages/equipos/equiposUtils.jsx';
    import { useToast } from '@/components/ui/use-toast';
    import { updateEquipoStatusLogic } from '@/pages/equipos/equiposDataActions';

    const EquipoCard = ({ equipo, cliente, tecnico, onCambiarEstado }) => {
      const { user } = useAuth();
      const puedeCambiarEstado = user && (
        user.rol === ROLES.JEFE || 
        user.rol === ROLES.SECRETARIA ||
        (equipo.tecnicoId === user.id) || 
        (!equipo.tecnicoId && user.rol === ROLES.TECNICO_MICROONDAS && equipo.categoriaAlmacen === 'Microondas') ||
        (!equipo.tecnicoId && user.rol === ROLES.TECNICO_TV && equipo.categoriaAlmacen === 'Televisores') ||
        (!equipo.tecnicoId && user.rol === ROLES.TECNICO_GENERAL && ['Air Fryer', 'Arroceras', 'Inversores', 'Abanicos', 'Otros'].includes(equipo.categoriaAlmacen))
      );

      return (
        <motion.div
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-card p-4 rounded-lg shadow-lg border border-border hover:shadow-xl transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg text-primary truncate">{equipo.marca} {equipo.modelo}</h3>
              <p className="text-sm text-muted-foreground">{equipo.codigoUnico}</p>
            </div>
            <span className={`px-2 py-1 text-xs font-medium text-white rounded-full ${getEquipoStatusColor(equipo.estado)}`}>
              {equipo.estado}
            </span>
          </div>
          <p className="text-sm mt-2 text-foreground/80 truncate"><strong>Falla:</strong> {equipo.descripcionProblema}</p>
          {cliente && <p className="text-sm mt-1 flex items-center"><User className="h-4 w-4 mr-1 text-accent"/> {cliente.nombreCompleto}</p>}
          {tecnico && <p className="text-sm mt-1 flex items-center"><Wrench className="h-4 w-4 mr-1 text-accent"/> {tecnico.nombreCompleto}</p>}
          {!tecnico && equipo.estado !== 'Reparado' && equipo.estado !== 'Entregado' && <p className="text-sm text-amber-600 flex items-center"><Wrench className="h-4 w-4 mr-1"/> Sin técnico asignado</p>}
          <p className="text-xs text-muted-foreground mt-1 flex items-center"><Clock className="h-3 w-3 mr-1"/> {new Date(equipo.fechaRegistro).toLocaleDateString()}</p>
          {puedeCambiarEstado && equipo.estado !== 'Entregado' && (
            <Button variant="outline" size="sm" className="mt-3 w-full text-primary border-primary hover:bg-primary/10" onClick={() => onCambiarEstado(equipo)}>
              <Edit3 className="h-4 w-4 mr-2" /> Cambiar Estado
            </Button>
          )}
        </motion.div>
      );
    };

    const EstadoEquiposPage = () => {
      const [equipos, setEquipos] = useLocalStorage('equipos', []);
      const [clientes] = useLocalStorage('clientes', []);
      const [usuarios] = useLocalStorage('usuarios', []);
      const { user } = useAuth();
      const { toast } = useToast();

      const [isModalOpen, setIsModalOpen] = useState(false);
      const [selectedEquipo, setSelectedEquipo] = useState(null);
      const [nuevoEstado, setNuevoEstado] = useState('');

      const handleOpenModal = (equipo) => {
        setSelectedEquipo(equipo);
        setNuevoEstado(equipo.estado || 'Pendiente');
        setIsModalOpen(true);
      };

      const handleConfirmCambioEstado = () => {
        if (selectedEquipo && nuevoEstado && nuevoEstado !== '') {
          updateEquipoStatusLogic(selectedEquipo.id, nuevoEstado, setEquipos, toast);
          setIsModalOpen(false);
          setSelectedEquipo(null);
        } else {
          toast({title: "Error", description: "Debe seleccionar un nuevo estado válido.", variant: "destructive"})
        }
      };

      const equiposFiltrados = useMemo(() => {
        if (!user) return {};

        const todosLosEquipos = equipos.map(eq => ({
          ...eq,
          cliente: clientes.find(c => c.id === eq.clienteId),
          tecnico: usuarios.find(u => u.id === eq.tecnicoId && u.rol.startsWith('tecnico_'))
        }));

        let equiposVisibles = todosLosEquipos;

        if (user.rol.startsWith('tecnico_') && user.rol !== ROLES.JEFE && user.rol !== ROLES.SECRETARIA) {
          equiposVisibles = todosLosEquipos.filter(eq => {
            if (eq.tecnicoId === user.id) return true; 
            if (!eq.tecnicoId) { 
              if (user.rol === ROLES.TECNICO_MICROONDAS && eq.categoriaAlmacen === 'Microondas') return true;
              if (user.rol === ROLES.TECNICO_TV && eq.categoriaAlmacen === 'Televisores') return true;
              if (user.rol === ROLES.TECNICO_GENERAL && ['Air Fryer', 'Arroceras', 'Inversores', 'Abanicos', 'Otros'].includes(eq.categoriaAlmacen)) return true;
            }
            return false;
          });
        }

        return {
          pendientes: equiposVisibles.filter(e => e.estado === 'Pendiente').sort((a,b) => new Date(a.fechaRegistro) - new Date(b.fechaRegistro)),
          enReparacion: equiposVisibles.filter(e => e.estado === 'En Reparación').sort((a,b) => new Date(a.fechaRegistro) - new Date(b.fechaRegistro)),
          esperaPiezas: equiposVisibles.filter(e => e.estado === 'En Espera de Piezas').sort((a,b) => new Date(a.fechaRegistro) - new Date(b.fechaRegistro)),
          reparados: equiposVisibles.filter(e => e.estado === 'Reparado').sort((a,b) => new Date(a.fechaRegistro) - new Date(b.fechaRegistro)),
          entregados: equiposVisibles.filter(e => e.estado === 'Entregado').sort((a,b) => new Date(a.fechaRegistro) - new Date(b.fechaRegistro)),
          enAlmacen: equiposVisibles.filter(e => e.estado === 'En Almacén').sort((a,b) => new Date(a.fechaRegistro) - new Date(b.fechaRegistro)),
        };
      }, [equipos, clientes, usuarios, user]);
      
      const tabsData = [
        { value: "pendientes", label: "Pendientes", icono: PackageSearch, data: equiposFiltrados.pendientes },
        { value: "enReparacion", label: "En Reparación", icono: Construction, data: equiposFiltrados.enReparacion },
        { value: "esperaPiezas", label: "Espera Piezas", icono: AlertTriangle, data: equiposFiltrados.esperaPiezas },
        { value: "reparados", label: "Reparados", icono: CheckCircle2, data: equiposFiltrados.reparados },
        { value: "entregados", label: "Entregados", icono: CheckCircle2, data: equiposFiltrados.entregados },
        { value: "enAlmacen", label: "En Almacén", icono: PackageSearch, data: equiposFiltrados.enAlmacen },
      ];

      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Estado de Equipos en Taller</h1>
          
          <Tabs defaultValue="pendientes" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {tabsData.map(tab => (
                <TabsTrigger key={tab.value} value={tab.value} className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <tab.icono className="mr-2 h-4 w-4" /> {tab.label} ({tab.data?.length || 0})
                </TabsTrigger>
              ))}
            </TabsList>

            {tabsData.map(tab => (
              <TabsContent key={tab.value} value={tab.value}>
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <tab.icono className="mr-2 h-5 w-5 text-primary" /> {tab.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="min-h-[200px]">
                    {tab.data && tab.data.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <AnimatePresence>
                          {tab.data.map(equipo => (
                            <EquipoCard 
                              key={equipo.id} 
                              equipo={equipo} 
                              cliente={equipo.cliente} 
                              tecnico={equipo.tecnico}
                              onCambiarEstado={handleOpenModal}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No hay equipos en estado "{tab.label}".</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cambiar Estado del Equipo: {selectedEquipo?.codigoUnico}</DialogTitle>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <p>Equipo: <span className="font-semibold">{selectedEquipo?.marca} {selectedEquipo?.modelo}</span></p>
                <p>Estado Actual: <span className="font-semibold">{selectedEquipo?.estado}</span></p>
                <div>
                  <label htmlFor="nuevoEstado" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nuevo Estado
                  </label>
                  <Select value={nuevoEstado} onValueChange={setNuevoEstado}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar nuevo estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {estadoOptions.filter(opt => opt !== selectedEquipo?.estado && opt !== '').map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button onClick={handleConfirmCambioEstado} className="bg-primary hover:bg-primary/90">Confirmar Cambio</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

        </motion.div>
      );
    };

    export default EstadoEquiposPage;
  