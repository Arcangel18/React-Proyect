
    import React, { useState, useMemo, useCallback } from 'react';
    import useLocalStorage from '@/hooks/useLocalStorage';
    import { useAuth, ROLES } from '@/contexts/AuthContext';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Button } from '@/components/ui/button';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
    import { motion, AnimatePresence } from 'framer-motion';
    import { Wrench, User, ClipboardList, PackageSearch, Construction, AlertTriangle, CheckCircle2, Edit3 } from 'lucide-react';
    import { getStatusColor as getEquipoStatusColor, estadoOptions } from '@/pages/equipos/equiposUtils.jsx';
    import { useToast } from '@/components/ui/use-toast';
    import { updateEquipoStatusLogic } from '@/pages/equipos/equiposDataActions';

    const TecnicoEquipoCard = ({ equipo, cliente, onCambiarEstado }) => {
      const { user } = useAuth();
      const puedeCambiarEstado = user && (
        user.rol === ROLES.JEFE || 
        user.rol === ROLES.SECRETARIA ||
        (equipo.tecnicoId === user.id) || 
        (!equipo.tecnicoId && user.rol === ROLES.TECNICO_MICROONDAS && equipo.categoriaAlmacen === 'Microondas') ||
        (!equipo.tecnicoId && user.rol === ROLES.TECNICO_TV && equipo.categoriaAlmacen === 'Televisores') ||
        (!equipo.tecnicoId && user.rol === ROLES.TECNICO_GENERAL && ['Air Fryer', 'Arroceras', 'Inversores', 'Abanicos', 'Otros'].includes(equipo.categoriaAlmacen))
      );

      const estadoIconos = {
        'Pendiente': PackageSearch,
        'En Reparación': Construction,
        'En Espera de Piezas': AlertTriangle,
        'Reparado': CheckCircle2,
        'Entregado': CheckCircle2,
        'En Almacén': PackageSearch,
      };
      const IconoEstado = estadoIconos[equipo.estado] || Wrench;

      return (
        <motion.div 
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-card p-4 rounded-lg shadow-lg border border-border hover:shadow-xl transition-shadow"
        >
          <div className="flex justify-between items-start mb-2">
            <div className="truncate">
              <h3 className="font-semibold text-lg text-primary truncate">{equipo.marca} {equipo.modelo}</h3>
              <p className="text-sm text-muted-foreground">{equipo.codigoUnico}</p>
            </div>
            <span className={`px-2 py-1 text-xs font-medium text-white rounded-full ${getEquipoStatusColor(equipo.estado)} flex items-center`}>
              <IconoEstado className="h-3 w-3 mr-1" /> {equipo.estado}
            </span>
          </div>
          <p className="text-sm mt-1 text-foreground/80 truncate"><strong>Falla:</strong> {equipo.descripcionProblema}</p>
          {cliente && <p className="text-sm mt-1 flex items-center"><User className="h-4 w-4 mr-1 text-accent"/> {cliente.nombreCompleto}</p>}
          <p className="text-xs text-muted-foreground mt-1">Registrado: {new Date(equipo.fechaRegistro).toLocaleDateString()}</p>
          {puedeCambiarEstado && equipo.estado !== 'Entregado' && (
             <Button variant="outline" size="sm" className="mt-3 w-full text-primary border-primary hover:bg-primary/10" onClick={() => onCambiarEstado(equipo)}>
              <Edit3 className="h-4 w-4 mr-2" /> Cambiar Estado
            </Button>
          )}
        </motion.div>
      );
    };

    const TecnicosPage = () => {
      const { user, users: allUsers } = useAuth();
      const [equipos, setEquipos] = useLocalStorage('equipos', []);
      const [clientes] = useLocalStorage('clientes', []);
      const [selectedTecnicoId, setSelectedTecnicoId] = useState(user && user.rol.startsWith('tecnico_') ? user.id : 'todos');
      const { toast } = useToast();

      const [isModalOpen, setIsModalOpen] = useState(false);
      const [equipoParaCambiarEstado, setEquipoParaCambiarEstado] = useState(null);
      const [nuevoEstadoSeleccionado, setNuevoEstadoSeleccionado] = useState('');

      const tecnicos = useMemo(() => allUsers.filter(u => u.rol.startsWith('tecnico_')), [allUsers]);

      const handleOpenModalCambioEstado = (equipo) => {
        setEquipoParaCambiarEstado(equipo);
        setNuevoEstadoSeleccionado(equipo.estado || 'Pendiente');
        setIsModalOpen(true);
      };

      const handleConfirmCambioEstado = () => {
        if (equipoParaCambiarEstado && nuevoEstadoSeleccionado && nuevoEstadoSeleccionado !== '') {
          updateEquipoStatusLogic(equipoParaCambiarEstado.id, nuevoEstadoSeleccionado, setEquipos, toast);
          setIsModalOpen(false);
          setEquipoParaCambiarEstado(null);
        } else {
          toast({title: "Error", description: "Debe seleccionar un nuevo estado válido.", variant: "destructive"})
        }
      };

      const equiposDelTecnico = useMemo(() => {
        const tecnicoActualEsJefeOSec = user.rol === ROLES.JEFE || user.rol === ROLES.SECRETARIA;
        
        if (!tecnicoActualEsJefeOSec && selectedTecnicoId !== user.id) {
             return []; 
        }

        return equipos.filter(eq => {
          if (tecnicoActualEsJefeOSec && selectedTecnicoId === 'todos') return true;
          
          const tecnicoSeleccionadoParaFiltrar = allUsers.find(u => u.id === selectedTecnicoId);
          if (!tecnicoSeleccionadoParaFiltrar) return false; // No hay técnico seleccionado o no se encontró

          if (eq.tecnicoId === tecnicoSeleccionadoParaFiltrar.id) return true; 
          if (!eq.tecnicoId) { 
            if (tecnicoSeleccionadoParaFiltrar.rol === ROLES.TECNICO_MICROONDAS && eq.categoriaAlmacen === 'Microondas') return true;
            if (tecnicoSeleccionadoParaFiltrar.rol === ROLES.TECNICO_TV && eq.categoriaAlmacen === 'Televisores') return true;
            if (tecnicoSeleccionadoParaFiltrar.rol === ROLES.TECNICO_GENERAL && ['Air Fryer', 'Arroceras', 'Inversores', 'Abanicos', 'Otros'].includes(eq.categoriaAlmacen)) return true;
          }
          return false;
        }).map(eq => ({
          ...eq,
          cliente: clientes.find(c => c.id === eq.clienteId)
        })).sort((a,b) => new Date(a.fechaRegistro) - new Date(b.fechaRegistro));
      }, [equipos, clientes, selectedTecnicoId, user, allUsers]);

      const nombreTecnicoSeleccionado = selectedTecnicoId === 'todos' 
        ? "Todos los Técnicos / No Asignados" 
        : tecnicos.find(t => t.id === selectedTecnicoId)?.nombreCompleto || "Desconocido";

      const showSelector = user && (user.rol === ROLES.JEFE || user.rol === ROLES.SECRETARIA);

      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex flex-wrap justify-between items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              {showSelector ? "Equipos por Técnico" : `Mis Equipos Asignados`}
            </h1>
            {showSelector && (
              <Select value={selectedTecnicoId} onValueChange={setSelectedTecnicoId}>
                <SelectTrigger className="w-full md:w-auto md:min-w-[250px]">
                  <SelectValue placeholder="Seleccionar Técnico..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los Técnicos / No Asignados</SelectItem>
                  {tecnicos.map(tec => (
                    <SelectItem key={tec.id} value={tec.id}>
                      {tec.nombreCompleto} ({tec.especialidadCategoria || tec.rol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ClipboardList className="mr-2 h-6 w-6 text-primary" />
                Equipos para: {user.rol.startsWith('tecnico_') && !showSelector ? user.nombreCompleto : nombreTecnicoSeleccionado} ({equiposDelTecnico.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {equiposDelTecnico.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {equiposDelTecnico.map(equipo => (
                      <TecnicoEquipoCard 
                        key={equipo.id} 
                        equipo={equipo} 
                        cliente={equipo.cliente}
                        onCambiarEstado={handleOpenModalCambioEstado}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  {selectedTecnicoId === 'todos' && showSelector ? 'No hay equipos registrados o sin asignar.' : 
                   (selectedTecnicoId || (user.rol.startsWith('tecnico_') && !showSelector)) ? 'No hay equipos asignados o correspondientes a este técnico.' : 'Seleccione un técnico para ver sus equipos.'
                  }
                </p>
              )}
            </CardContent>
          </Card>
          
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cambiar Estado del Equipo: {equipoParaCambiarEstado?.codigoUnico}</DialogTitle>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <p>Equipo: <span className="font-semibold">{equipoParaCambiarEstado?.marca} {equipoParaCambiarEstado?.modelo}</span></p>
                <p>Estado Actual: <span className="font-semibold">{equipoParaCambiarEstado?.estado}</span></p>
                <div>
                  <label htmlFor="nuevoEstado" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nuevo Estado
                  </label>
                  <Select value={nuevoEstadoSeleccionado} onValueChange={setNuevoEstadoSeleccionado}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar nuevo estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {estadoOptions.filter(opt => opt !== equipoParaCambiarEstado?.estado && opt !== '').map(option => (
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

    export default TecnicosPage;
  