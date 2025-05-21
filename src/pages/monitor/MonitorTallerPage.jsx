
    import React, { useState, useEffect, useCallback } from 'react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { cn } from '@/lib/utils';
    import { PackageSearch, Construction, AlertTriangle, CheckCircle2, Wrench, User, Clock, ExternalLink, Expand, Moon, Sun } from 'lucide-react';
    import { getStatusColor as getEquipoStatusColor } from '@/pages/equipos/equiposUtils.jsx';

    const ESTADOS_MONITOR = {
      PENDIENTE: 'Pendiente',
      EN_REPARACION: 'En Reparación',
      ESPERA_PIEZAS: 'En Espera de Piezas',
      REPARADO: 'Reparado',
    };

    const estadoIconos = {
      [ESTADOS_MONITOR.PENDIENTE]: PackageSearch,
      [ESTADOS_MONITOR.EN_REPARACION]: Construction,
      [ESTADOS_MONITOR.ESPERA_PIEZAS]: AlertTriangle,
      [ESTADOS_MONITOR.REPARADO]: CheckCircle2,
    };
    
    const MonitorCard = ({ equipo, cliente, tecnico }) => {
      const IconoEstado = estadoIconos[equipo.estado] || Wrench;
      return (
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.4, type: "spring" }}
          className={cn(
            "rounded-xl shadow-2xl overflow-hidden border-2",
            equipo.estado === ESTADOS_MONITOR.PENDIENTE ? "border-blue-500 bg-blue-500/10" :
            equipo.estado === ESTADOS_MONITOR.EN_REPARACION ? "border-yellow-500 bg-yellow-500/10" :
            equipo.estado === ESTADOS_MONITOR.ESPERA_PIEZAS ? "border-red-500 bg-red-500/10" :
            equipo.estado === ESTADOS_MONITOR.REPARADO ? "border-green-500 bg-green-500/10" :
            "border-gray-500 bg-gray-500/10"
          )}
        >
          <div className={cn(
            "p-3 text-white flex items-center justify-between",
            getEquipoStatusColor(equipo.estado) 
          )}>
            <div className="flex items-center">
              <IconoEstado className="h-6 w-6 mr-2" />
              <h3 className="font-bold text-lg truncate">{equipo.marca} {equipo.modelo}</h3>
            </div>
            <span className="text-sm font-semibold px-2 py-0.5 rounded-full bg-white/20">{equipo.codigoUnico}</span>
          </div>
          <div className="p-4 space-y-2 bg-background/80 backdrop-blur-sm">
            <p className="text-sm text-muted-foreground truncate"><strong>Falla:</strong> {equipo.descripcionProblema}</p>
            {cliente && <p className="text-sm flex items-center"><User className="h-4 w-4 mr-1 text-primary"/> {cliente.nombreCompleto}</p>}
            {tecnico && <p className="text-sm flex items-center"><Wrench className="h-4 w-4 mr-1 text-primary"/> {tecnico.nombreCompleto}</p>}
            {!tecnico && equipo.estado !== ESTADOS_MONITOR.REPARADO && <p className="text-sm text-amber-600 flex items-center"><Wrench className="h-4 w-4 mr-1"/> Sin técnico asignado</p>}
            <p className="text-xs text-muted-foreground flex items-center"><Clock className="h-3 w-3 mr-1"/> Registrado: {new Date(equipo.fechaRegistro).toLocaleDateString()} {new Date(equipo.fechaRegistro).toLocaleTimeString()}</p>
          </div>
        </motion.div>
      );
    };

    const MonitorTallerPage = () => {
      const [internalEquipos, setInternalEquipos] = useState([]);
      const [internalClientes, setInternalClientes] = useState([]);
      const [internalUsuarios, setInternalUsuarios] = useState([]);
      const [currentTime, setCurrentTime] = useState(new Date());

      const refreshData = useCallback(() => {
        try {
          const storedEquipos = JSON.parse(localStorage.getItem('equipos') || '[]');
          const storedClientes = JSON.parse(localStorage.getItem('clientes') || '[]');
          const storedUsuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
          setInternalEquipos(Array.isArray(storedEquipos) ? storedEquipos : []);
          setInternalClientes(Array.isArray(storedClientes) ? storedClientes : []);
          setInternalUsuarios(Array.isArray(storedUsuarios) ? storedUsuarios : []);
        } catch (error) {
          console.error("Error parsing data from localStorage for monitor:", error);
          setInternalEquipos([]);
          setInternalClientes([]);
          setInternalUsuarios([]);
        }
        setCurrentTime(new Date());
      }, []);

      useEffect(() => {
        refreshData(); 
        const timer = setInterval(refreshData, 5000); 
        
        const handleStorageChange = (event) => {
          if (event.key === 'equipos' || event.key === 'clientes' || event.key === 'usuarios') {
            refreshData();
          }
        };

        window.addEventListener('storage', handleStorageChange);
        
        return () => {
          clearInterval(timer);
          window.removeEventListener('storage', handleStorageChange);
        };
      }, [refreshData]);

      const findCliente = (clienteId) => internalClientes.find(c => c.id === clienteId);
      const findTecnico = (tecnicoId) => internalUsuarios.find(u => u.id === tecnicoId && u.rol?.startsWith('tecnico'));

      const equiposFiltradosPorEstado = (estado) => 
        internalEquipos
          .filter(e => e.estado === estado)
          .sort((a,b) => new Date(a.fechaRegistro) - new Date(b.fechaRegistro));

      const columnas = [
        { titulo: 'Pendientes de Revisión', estado: ESTADOS_MONITOR.PENDIENTE, icono: PackageSearch, color: "text-blue-500" },
        { titulo: 'En Reparación', estado: ESTADOS_MONITOR.EN_REPARACION, icono: Construction, color: "text-yellow-500" },
        { titulo: 'En Espera de Piezas', estado: ESTADOS_MONITOR.ESPERA_PIEZAS, icono: AlertTriangle, color: "text-red-500" },
        { titulo: 'Listos para Entrega', estado: ESTADOS_MONITOR.REPARADO, icono: CheckCircle2, color: "text-green-500" },
      ];
      
      const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
          const theme = localStorage.getItem('theme');
           if (theme) return theme === 'dark';
           return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
      });

      useEffect(() => {
        if (isDarkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
         if (localStorage.getItem('theme') === null && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setIsDarkMode(true);
        }
      }, [isDarkMode]);

      const toggleDarkMode = () => {
        setIsDarkMode(prev => {
          const newMode = !prev;
          localStorage.setItem('theme', newMode ? 'dark' : 'light');
          return newMode;
        });
      };

      const openInNewWindow = () => {
        window.open(window.location.href, '_blank', 'popup=yes,width=1200,height=800,resizable=yes,scrollbars=yes');
      };
      
      const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
      };


      return (
        <div className={cn("min-h-screen p-4 sm:p-6 md:p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-background text-foreground", isDarkMode ? 'dark' : '')}>
          <header className="mb-6 flex flex-col sm:flex-row justify-between items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary">
                Monitor General del Taller
              </h1>
              <p className="text-lg text-muted-foreground">Estado de equipos en tiempo real</p>
            </div>
            <div className="flex flex-col items-end space-y-2 mt-2 sm:mt-0">
                <div className="flex items-center space-x-2">
                    <Button onClick={toggleDarkMode} variant="outline" size="icon" title={isDarkMode ? "Modo Claro" : "Modo Oscuro"}>
                        {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </Button>
                    <Button onClick={openInNewWindow} variant="outline" size="icon" title="Abrir en nueva ventana">
                        <ExternalLink className="h-5 w-5" />
                    </Button>
                     <Button onClick={toggleFullScreen} variant="outline" size="icon" title="Pantalla Completa">
                        <Expand className="h-5 w-5" />
                    </Button>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-semibold text-primary">{currentTime.toLocaleTimeString()}</p>
                    <p className="text-sm text-muted-foreground">{currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {columnas.map(columna => {
              const equiposColumna = equiposFiltradosPorEstado(columna.estado);
              const Icono = columna.icono;
              return (
                <Card key={columna.estado} className="bg-card/70 backdrop-blur-md shadow-xl border-0 overflow-hidden">
                  <CardHeader className={cn("border-b-2 p-3 sm:p-4", 
                    columna.estado === ESTADOS_MONITOR.PENDIENTE ? "border-blue-500" :
                    columna.estado === ESTADOS_MONITOR.EN_REPARACION ? "border-yellow-500" :
                    columna.estado === ESTADOS_MONITOR.ESPERA_PIEZAS ? "border-red-500" :
                    columna.estado === ESTADOS_MONITOR.REPARADO ? "border-green-500" :
                    "border-gray-500"
                  )}>
                    <CardTitle className={cn("text-xl sm:text-2xl font-semibold flex items-center", columna.color)}>
                      <Icono className="h-6 w-6 mr-2 sm:mr-3" />
                      {columna.titulo} ({equiposColumna.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4 h-[calc(100vh-18rem)] md:h-[calc(100vh-20rem)] overflow-y-auto">
                    <AnimatePresence>
                      {equiposColumna.length > 0 ? (
                        equiposColumna.map(equipo => (
                          <MonitorCard 
                            key={equipo.id} 
                            equipo={equipo} 
                            cliente={findCliente(equipo.clienteId)}
                            tecnico={findTecnico(equipo.tecnicoId)}
                          />
                        ))
                      ) : (
                        <motion.p 
                          initial={{opacity: 0}} animate={{opacity:1}}
                          className="text-center text-muted-foreground py-10 text-sm sm:text-base">
                          No hay equipos en este estado.
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              );
            })}
          </div>
           <footer className="text-center text-xs text-muted-foreground mt-8">
                Electrónica Oriental - Sistema de Gestión de Taller. Última actualización de datos: {currentTime.toLocaleTimeString()}
            </footer>
        </div>
      );
    };

    export default MonitorTallerPage;
  