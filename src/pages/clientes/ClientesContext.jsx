
    import React, { createContext, useState, useCallback, useContext, useMemo } from 'react';
    import useLocalStorage from '@/hooks/useLocalStorage';
    import { useToast } from '@/components/ui/use-toast';

    const ClientesContext = createContext();

    export const initialClienteFormData = {
      id: '',
      nombreCompleto: '',
      cedula: '',
      telefono: '',
      email: '',
      personaAutorizada: ''
    };

    export const ClientesProvider = ({ children }) => {
      const [clientes, setClientes] = useLocalStorage('clientes', []);
      const [equipos] = useLocalStorage('equipos', []); 
      const [searchTerm, setSearchTerm] = useState('');
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
      const [currentCliente, setCurrentCliente] = useState(null);
      const [selectedClienteDetails, setSelectedClienteDetails] = useState(null);
      const [formData, setFormData] = useState(initialClienteFormData);
      const { toast } = useToast();

      const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
      }, []);

      const resetFormAndCloseModal = useCallback(() => {
        setFormData(initialClienteFormData);
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
        setFormData(initialClienteFormData);
        setIsModalOpen(true);
      }, []);

      const filteredClientes = useMemo(() => clientes.filter(cliente =>
        cliente.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.cedula.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cliente.email && cliente.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (cliente.telefono && cliente.telefono.toLowerCase().includes(searchTerm.toLowerCase()))
      ), [clientes, searchTerm]);

      const value = {
        clientes,
        setClientes,
        equipos,
        searchTerm,
        setSearchTerm,
        isModalOpen,
        setIsModalOpen,
        isDetailsModalOpen,
        setIsDetailsModalOpen,
        currentCliente,
        setCurrentCliente,
        selectedClienteDetails,
        setSelectedClienteDetails,
        formData,
        setFormData,
        handleInputChange,
        resetFormAndCloseModal,
        handleSubmit,
        handleEdit,
        handleDelete,
        handleViewDetails,
        openNewClienteModal,
        filteredClientes
      };

      return <ClientesContext.Provider value={value}>{children}</ClientesContext.Provider>;
    };

    export const useClientes = () => {
      const context = useContext(ClientesContext);
      if (!context) {
        throw new Error('useClientes must be used within a ClientesProvider');
      }
      return context;
    };
  