
    import React, { createContext, useState, useCallback, useContext, useMemo, useRef, useEffect } from 'react';
    import useLocalStorage from '@/hooks/useLocalStorage';
    import { useToast } from '@/components/ui/use-toast';
    import { initialEquipoFormData } from '@/pages/equipos/equiposUtils.jsx';
    import { useAuth } from '@/contexts/AuthContext';
    import { handleImportEquipos, handleExportEquipos } from '@/pages/equipos/equiposExcelActions.js';
    import { filterEquiposLogic, manageEquipoSubmitLogic, updateEquipoStatusLogic } from '@/pages/equipos/equiposDataActions.js';
    import { checkGarantiasLogic } from '@/pages/equipos/equiposAlertsLogic.js';

    const EquiposContext = createContext();

    export const EquiposProvider = ({ children }) => {
      const { user, users: allUsers } = useAuth();
      const [equipos, setEquipos] = useLocalStorage('equipos', []);
      const [clientes] = useLocalStorage('clientes', []);
      const [searchTerm, setSearchTerm] = useState('');
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
      const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
      const [currentEquipo, setCurrentEquipo] = useState(null);
      const [selectedEquipoDetails, setSelectedEquipoDetails] = useState(null);
      const [equipoToUpdateStatus, setEquipoToUpdateStatus] = useState(null);
      const { toast } = useToast();
      const [formData, setFormData] = useState({...initialEquipoFormData, tecnicoId: 'ninguno'});
      const fileInputRef = useRef(null);

      const tecnicosParaAsignacion = useMemo(() => allUsers.filter(u => u.rol.startsWith('tecnico_')), [allUsers]);

      const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
      }, []);

      const handleSelectChange = useCallback((name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
      }, []);
      
      const resetFormAndCloseModal = useCallback(() => {
        setFormData({...initialEquipoFormData, tecnicoId: 'ninguno'});
        setCurrentEquipo(null);
        setIsModalOpen(false);
      }, []);

      const handleSubmit = useCallback((e) => {
        e.preventDefault();
        manageEquipoSubmitLogic(formData, currentEquipo, equipos, setEquipos, toast, resetFormAndCloseModal, user);
      }, [formData, currentEquipo, equipos, setEquipos, toast, resetFormAndCloseModal, user]);

      const handleEdit = useCallback((equipo) => {
        setCurrentEquipo(equipo);
        const formFriendlyEquipo = {
          ...equipo,
          tecnicoId: equipo.tecnicoId || 'ninguno',
          montoReparacion: equipo.montoReparacion || '',
          periodoGarantia: equipo.periodoGarantia || '',
          fechaEntrega: equipo.fechaEntrega || '',
          categoriaAlmacen: equipo.categoriaAlmacen || 'no_aplica',
          ubicacionAlmacen: equipo.ubicacionAlmacen || 'no_aplica',
        };
        setFormData(formFriendlyEquipo);
        setIsModalOpen(true);
      }, []);

      const handleDelete = useCallback((id) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este equipo?")) {
          setEquipos(prevEquipos => prevEquipos.filter(eq => eq.id !== id));
          toast({ title: "Equipo Eliminado", description: "El equipo ha sido eliminado.", variant: "destructive" });
        }
      }, [setEquipos, toast]);

      const handleViewDetails = useCallback((equipo) => {
        const cliente = clientes.find(c => c.id === equipo.clienteId);
        const tecnicoAsignado = allUsers.find(u => u.id === equipo.tecnicoId);
        setSelectedEquipoDetails({ ...equipo, cliente, tecnicoAsignado });
        setIsDetailsModalOpen(true);
      }, [clientes, allUsers]);
      
      const openChangeStatusModal = useCallback((equipo) => {
        setEquipoToUpdateStatus(equipo);
        setIsStatusModalOpen(true);
      }, []);

      const handleChangeStatus = useCallback((equipoId, nuevoEstado) => {
        updateEquipoStatusLogic(equipoId, nuevoEstado, setEquipos, toast);
        setIsStatusModalOpen(false);
        setEquipoToUpdateStatus(null);
      }, [setEquipos, toast]);


      const openNewEquipoModal = useCallback(() => {
        setCurrentEquipo(null);
        setFormData({...initialEquipoFormData, tecnicoId: 'ninguno'});
        setIsModalOpen(true);
      }, []);
      
      const exportToExcel = useCallback(() => {
        handleExportEquipos(equipos, clientes, allUsers, toast);
      }, [equipos, clientes, allUsers, toast]);

      const importFromExcel = useCallback((event) => {
        handleImportEquipos(event, equipos, setEquipos, clientes, allUsers, toast);
      }, [equipos, setEquipos, clientes, allUsers, toast]);


      const filteredEquipos = useMemo(() => filterEquiposLogic(equipos, clientes, allUsers, searchTerm, user), 
        [equipos, clientes, allUsers, searchTerm, user]
      );

      const { alertasGarantia, garantiasVencidasHoy } = useMemo(() => checkGarantiasLogic(equipos, clientes), [equipos, clientes]);
       
      const toastGarantiaMostrada = useRef(false);

      useEffect(() => {
        if(user && (user.rol === 'jefe' || user.rol === 'secretaria')) {
            if (alertasGarantia.length > 0 && !toastGarantiaMostrada.current) {
                alertasGarantia.forEach(alerta => {
                    toast({
                        title: "Alerta de Garantía Próxima a Vencer",
                        description: `Equipo ${alerta.codigoUnico} (${alerta.clienteNombre}) vence garantía en 2 días (${alerta.fechaVencimiento}).`,
                        variant: "default",
                        duration: 15000,
                    });
                });
                toastGarantiaMostrada.current = true; 
                setTimeout(() => { toastGarantiaMostrada.current = false; }, 60 * 60 * 1000); // Reset after 1 hour
            }
        }
      }, [alertasGarantia, toast, user]);


      const value = {
        equipos,
        setEquipos,
        clientes,
        searchTerm,
        setSearchTerm,
        isModalOpen,
        setIsModalOpen,
        isDetailsModalOpen,
        setIsDetailsModalOpen,
        isStatusModalOpen,
        setIsStatusModalOpen,
        currentEquipo,
        setCurrentEquipo,
        selectedEquipoDetails,
        setSelectedEquipoDetails,
        equipoToUpdateStatus,
        setEquipoToUpdateStatus,
        formData,
        setFormData,
        fileInputRef,
        handleInputChange,
        handleSelectChange,
        resetFormAndCloseModal,
        handleSubmit,
        handleEdit,
        handleDelete,
        handleViewDetails,
        openChangeStatusModal,
        handleChangeStatus,
        openNewEquipoModal,
        handleExportToExcel: exportToExcel,
        handleImportFromExcel: importFromExcel,
        filteredEquipos,
        tecnicosParaAsignacion,
        alertasGarantia,
        garantiasVencidasHoy
      };

      return <EquiposContext.Provider value={value}>{children}</EquiposContext.Provider>;
    };

    export const useEquipos = () => {
      const context = useContext(EquiposContext);
      if (!context) {
        throw new Error('useEquipos must be used within an EquiposProvider');
      }
      return context;
    };
  