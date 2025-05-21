
    import { generateCodigoUnico } from '@/pages/equipos/equiposUtils.jsx';
    import { ROLES } from '@/contexts/AuthContext';

    export const manageEquipoSubmitLogic = (formData, currentEquipo, equipos, setEquipos, toast, resetFormAndCloseModal, user) => {
      if (!formData.clienteId) {
        toast({ title: "Error", description: "Debe seleccionar un cliente.", variant: "destructive" });
        return;
      }
      if (!formData.marca || !formData.modelo || !formData.descripcionProblema) {
        toast({ title: "Campos Requeridos", description: "Marca, Modelo y Descripción son obligatorios.", variant: "destructive" });
        return;
      }

      let equipoModificado = { ...formData };

      if (equipoModificado.estado === 'Entregado' && (!equipoModificado.fechaEntrega || !equipoModificado.periodoGarantia)) {
        equipoModificado.fechaEntrega = new Date().toISOString().slice(0,10);
        equipoModificado.periodoGarantia = 30; 
        toast({ title: "Garantía Automática", description: "Fecha de entrega y garantía de 30 días aplicadas automáticamente." });
      }
      
      const tecnicoIdFinal = equipoModificado.tecnicoId === 'ninguno' ? '' : equipoModificado.tecnicoId;
      let equipoDataConTecnico = { 
        ...equipoModificado, 
        tecnicoId: tecnicoIdFinal,
        periodoGarantia: equipoModificado.periodoGarantia ? parseInt(equipoModificado.periodoGarantia, 10) : null,
        fechaEntrega: equipoModificado.fechaEntrega || null,
      };
      
      if (currentEquipo) {
        setEquipos(prevEquipos => prevEquipos.map(eq => eq.id === currentEquipo.id ? { ...equipoDataConTecnico, id: currentEquipo.id } : eq));
        toast({ title: "Equipo Actualizado", description: "El equipo ha sido actualizado exitosamente." });
      } else {
        const numeroInicio = parseInt(equipoDataConTecnico.numeroInicioCodigo, 10) || 1;
        const codigo = generateCodigoUnico('EO', numeroInicio, equipos);
        const newEquipo = { ...equipoDataConTecnico, id: Date.now().toString(), codigoUnico: codigo, fechaRegistro: new Date().toISOString().slice(0,10) };
        setEquipos(prevEquipos => [...prevEquipos, newEquipo]);
        toast({ title: "Equipo Agregado", description: `El nuevo equipo con código ${codigo} ha sido agregado.` });
      }
      resetFormAndCloseModal();
    };


    export const filterEquiposLogic = (equipos, clientes, allUsers, searchTerm, user) => {
      return equipos.filter(equipo => {
        const cliente = clientes.find(c => c.id === equipo.clienteId);
        const tecnico = allUsers.find(u => u.id === equipo.tecnicoId);
        const clienteNombre = cliente ? cliente.nombreCompleto : '';
        const tecnicoNombre = tecnico ? tecnico.nombreCompleto : '';
        const searchLower = searchTerm.toLowerCase();

        if (user && user.rol.startsWith('tecnico_') && !(user.rol === ROLES.JEFE || user.rol === ROLES.SECRETARIA)) {
            let tecnicoAsignadoAlEquipo = equipo.tecnicoId ? allUsers.find(u => u.id === equipo.tecnicoId) : null;
            
            if (!tecnicoAsignadoAlEquipo) { 
                if (equipo.categoriaAlmacen === 'Microondas' && user.rol === ROLES.TECNICO_MICROONDAS) tecnicoAsignadoAlEquipo = user;
                else if (equipo.categoriaAlmacen === 'Televisores' && user.rol === ROLES.TECNICO_TV) tecnicoAsignadoAlEquipo = user;
                else if (['Air Fryer', 'Arroceras', 'Inversores', 'Abanicos', 'Otros'].includes(equipo.categoriaAlmacen) && user.rol === ROLES.TECNICO_GENERAL) tecnicoAsignadoAlEquipo = user;
            }

            if (!tecnicoAsignadoAlEquipo || tecnicoAsignadoAlEquipo.id !== user.id) {
                 return false; 
            }
        }

        return (
          equipo.marca.toLowerCase().includes(searchLower) ||
          equipo.codigoUnico.toLowerCase().includes(searchLower) ||
          (equipo.serial && equipo.serial.toLowerCase().includes(searchLower)) ||
          equipo.modelo.toLowerCase().includes(searchLower) ||
          clienteNombre.toLowerCase().includes(searchLower) ||
          tecnicoNombre.toLowerCase().includes(searchLower) ||
          (equipo.estado && equipo.estado.toLowerCase().includes(searchLower)) ||
          (equipo.categoriaAlmacen && equipo.categoriaAlmacen.toLowerCase().includes(searchLower)) ||
          (equipo.ubicacionAlmacen && equipo.ubicacionAlmacen.toLowerCase().includes(searchLower))
        );
      });
    };

    export const updateEquipoStatusLogic = (equipoId, nuevoEstado, setEquipos, toast) => {
      if(!nuevoEstado || nuevoEstado === '') {
        toast({ title: "Error", description: "Debe seleccionar un estado válido.", variant: "destructive"});
        return;
      }
      setEquipos(prevEquipos => 
        prevEquipos.map(eq => {
          if (eq.id === equipoId) {
            const updatedEquipo = { ...eq, estado: nuevoEstado };
            if (nuevoEstado === 'Entregado' && (!updatedEquipo.fechaEntrega || !updatedEquipo.periodoGarantia)) {
              updatedEquipo.fechaEntrega = new Date().toISOString().slice(0,10);
              updatedEquipo.periodoGarantia = 30;
              toast({ title: "Garantía Automática", description: `Fecha de entrega y garantía de 30 días aplicadas al equipo ${updatedEquipo.codigoUnico}.` });
            }
            return updatedEquipo;
          }
          return eq;
        })
      );
      toast({ title: "Estado Actualizado", description: `El estado del equipo ha sido cambiado a "${nuevoEstado}".`});
    };
  