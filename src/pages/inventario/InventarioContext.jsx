
    import React, { createContext, useState, useCallback, useContext, useMemo } from 'react';
    import useLocalStorage from '@/hooks/useLocalStorage';
    import { useToast } from '@/components/ui/use-toast';
    import { checkLowStockLogic } from '@/pages/inventario/inventarioAlertsLogic.js';

    const InventarioContext = createContext();

    export const initialProductoFormData = {
      id: '',
      nombre: '',
      descripcion: '',
      precio: '',
      cantidad: '',
      codigoProducto: '',
      imagenUrl: ''
    };

    export const InventarioProvider = ({ children }) => {
      const [productos, setProductos] = useLocalStorage('productosInventario', []);
      const [searchTerm, setSearchTerm] = useState('');
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [isQrModalOpen, setIsQrModalOpen] = useState(false);
      const [currentProducto, setCurrentProducto] = useState(null);
      const [selectedQrData, setSelectedQrData] = useState(null);
      const [formData, setFormData] = useState(initialProductoFormData);
      const { toast } = useToast();

      const generateCodigoProducto = useCallback((nombre) => {
        const prefijo = nombre.substring(0, 3).toUpperCase();
        return `PROD-${prefijo}-${Date.now().toString().slice(-4)}`;
      }, []);
      
      const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
      }, []);

      const resetFormAndCloseModal = useCallback(() => {
        setFormData(initialProductoFormData);
        setCurrentProducto(null);
        setIsModalOpen(false);
      }, []);

      const handleSubmit = useCallback((e) => {
        e.preventDefault();
        if (!formData.nombre || !formData.precio || !formData.cantidad) {
          toast({ title: "Campos Requeridos", description: "Nombre, precio y cantidad son obligatorios.", variant: "destructive" });
          return;
        }

        const codigo = formData.codigoProducto || generateCodigoProducto(formData.nombre);
        
        if (currentProducto) {
          setProductos(prev => prev.map(p => p.id === currentProducto.id ? { ...formData, codigoProducto: codigo, id: currentProducto.id } : p));
          toast({ title: "Producto Actualizado", description: "El producto ha sido actualizado." });
        } else {
          const newProducto = { ...formData, id: Date.now().toString(), codigoProducto: codigo };
          setProductos(prev => [...prev, newProducto]);
          toast({ title: "Producto Agregado", description: "El nuevo producto ha sido agregado al inventario." });
        }
        resetFormAndCloseModal();
      }, [formData, currentProducto, productos, setProductos, toast, resetFormAndCloseModal, generateCodigoProducto]);

      const handleEdit = useCallback((producto) => {
        setCurrentProducto(producto);
        setFormData(producto);
        setIsModalOpen(true);
      }, []);

      const handleDelete = useCallback((id) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este producto del inventario?")) {
          setProductos(prev => prev.filter(p => p.id !== id));
          toast({ title: "Producto Eliminado", description: "El producto ha sido eliminado del inventario.", variant: "destructive" });
        }
      }, [setProductos, toast]);

      const handleShowQr = useCallback((producto) => {
        setSelectedQrData({ name: producto.nombre, code: producto.codigoProducto, imageUrl: producto.imagenUrl, price: producto.precio });
        setIsQrModalOpen(true);
      }, []);
      
      const openNewProductoModal = useCallback(() => {
        setCurrentProducto(null);
        setFormData(initialProductoFormData);
        setIsModalOpen(true);
      }, []);

      const filteredProductos = useMemo(() => productos.filter(p =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(searchTerm.toLowerCase())) ||
        p.codigoProducto.toLowerCase().includes(searchTerm.toLowerCase())
      ), [productos, searchTerm]);

      const { alertasBajoStock, productosConBajoStockHoy } = useMemo(() => checkLowStockLogic(productos, 5), [productos]);

      const value = {
        productos,
        setProductos,
        searchTerm,
        setSearchTerm,
        isModalOpen,
        setIsModalOpen,
        isQrModalOpen,
        setIsQrModalOpen,
        currentProducto,
        setCurrentProducto,
        selectedQrData,
        setSelectedQrData,
        formData,
        setFormData,
        handleInputChange,
        resetFormAndCloseModal,
        handleSubmit,
        handleEdit,
        handleDelete,
        handleShowQr,
        openNewProductoModal,
        filteredProductos,
        generateCodigoProducto,
        alertasBajoStock,
        productosConBajoStockHoy
      };

      return <InventarioContext.Provider value={value}>{children}</InventarioContext.Provider>;
    };

    export const useInventario = () => {
      const context = useContext(InventarioContext);
      if (!context) {
        throw new Error('useInventario must be used within an InventarioProvider');
      }
      return context;
    };
  