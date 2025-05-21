
    import React, { createContext, useState, useCallback, useContext, useMemo } from 'react';
    import useLocalStorage from '@/hooks/useLocalStorage';
    import { useToast } from '@/components/ui/use-toast';
    
    const PosContext = createContext();

    export const PosProvider = ({ children }) => {
      const [productosInventario, setProductosInventario] = useLocalStorage('productosInventario', []);
      const [ventasRegistradas, setVentasRegistradas] = useLocalStorage('ventasRegistradas', []);
      const [carrito, setCarrito] = useState([]);
      const [searchTerm, setSearchTerm] = useState('');
      const [scannedProductModalOpen, setScannedProductModalOpen] = useState(false);
      const [scannedProductDetails, setScannedProductDetails] = useState(null);
      const [manualScanCode, setManualScanCode] = useState('');
      const { toast } = useToast();

      const handleSearch = useCallback((term) => {
        setSearchTerm(term.toLowerCase());
      }, []);

      const filteredProductos = useMemo(() => 
        productosInventario.filter(p => 
          (p.nombre.toLowerCase().includes(searchTerm) || 
          p.codigoProducto.toLowerCase().includes(searchTerm)) &&
          parseInt(p.cantidad) > 0 
        ), 
      [productosInventario, searchTerm]);

      const agregarAlCarrito = useCallback((producto, cantidad = 1) => {
        const productoEnInventario = productosInventario.find(p => p.id === producto.id);
        if (!productoEnInventario || parseInt(productoEnInventario.cantidad) < cantidad) {
          toast({ title: "Stock Insuficiente", description: `No hay suficiente stock para ${producto.nombre}. Disponible: ${productoEnInventario ? productoEnInventario.cantidad : 0}`, variant: "destructive" });
          return;
        }

        setCarrito(prev => {
          const existente = prev.find(item => item.id === producto.id);
          if (existente) {
            const nuevaCantidadTotal = existente.cantidad + cantidad;
            if (parseInt(productoEnInventario.cantidad) < nuevaCantidadTotal) {
              toast({ title: "Stock Insuficiente", description: `No puedes agregar más ${producto.nombre}. Stock disponible alcanzado.`, variant: "destructive" });
              return prev.map(item => item.id === producto.id ? { ...item, cantidad: parseInt(productoEnInventario.cantidad) } : item);
            }
            return prev.map(item => 
              item.id === producto.id ? { ...item, cantidad: nuevaCantidadTotal } : item
            );
          }
          return [...prev, { ...producto, cantidad }];
        });
        if (!carrito.find(item => item.id === producto.id && item.cantidad + cantidad > parseInt(productoEnInventario.cantidad))) {
            toast({ title: "Producto Agregado", description: `${producto.nombre} añadido al carrito.`});
        }
      }, [productosInventario, toast, carrito]);

      const eliminarDelCarrito = useCallback((productoId) => {
        setCarrito(prev => prev.filter(item => item.id !== productoId));
        toast({ title: "Producto Eliminado", description: "Producto eliminado del carrito.", variant: "destructive" });
      }, [toast]);
      
      const actualizarCantidadCarrito = useCallback((productoId, nuevaCantidad) => {
        const productoEnInventario = productosInventario.find(p => p.id === productoId);
        if (!productoEnInventario) return;

        if (nuevaCantidad <= 0) {
          eliminarDelCarrito(productoId);
          return;
        }
        if (parseInt(productoEnInventario.cantidad) < nuevaCantidad) {
          toast({ title: "Stock Insuficiente", description: `No hay suficiente stock para ${productoEnInventario.nombre}. Disponible: ${productoEnInventario.cantidad}`, variant: "destructive" });
          setCarrito(prev => prev.map(item => 
            item.id === productoId ? { ...item, cantidad: parseInt(productoEnInventario.cantidad) } : item
          ));
          return;
        }
        setCarrito(prev => prev.map(item => 
          item.id === productoId ? { ...item, cantidad: nuevaCantidad } : item
        ));
      }, [eliminarDelCarrito, productosInventario, toast]);

      const totalCarrito = useMemo(() => 
        carrito.reduce((acc, item) => acc + (parseFloat(item.precio) * item.cantidad), 0),
      [carrito]);

      const handleManualScan = useCallback(() => {
        if (!manualScanCode.trim()) {
            toast({ title: "Código Vacío", description: "Por favor, ingrese un código de producto.", variant: "destructive" });
            return;
        }
        const productoEncontrado = productosInventario.find(p => p.codigoProducto === manualScanCode.trim());
        if (productoEncontrado) {
          if (parseInt(productoEncontrado.cantidad) <= 0) {
            toast({ title: "Sin Stock", description: `El producto ${productoEncontrado.nombre} está agotado.`, variant: "destructive" });
            setManualScanCode('');
            return;
          }
          setScannedProductDetails(productoEncontrado);
          setScannedProductModalOpen(true);
          setManualScanCode(''); 
        } else {
          toast({ title: "Producto no encontrado", description: `No se encontró producto con el código ${manualScanCode}.`, variant: "destructive" });
        }
      }, [manualScanCode, productosInventario, toast]);

      const procesarPagoYActualizarStock = useCallback(() => {
        const nuevosProductosInventario = [...productosInventario];
        let ventaExitosa = true;

        for (const itemCarrito of carrito) {
          const productoIndex = nuevosProductosInventario.findIndex(p => p.id === itemCarrito.id);
          if (productoIndex !== -1) {
            const stockActual = parseInt(nuevosProductosInventario[productoIndex].cantidad);
            if (stockActual >= itemCarrito.cantidad) {
              nuevosProductosInventario[productoIndex].cantidad = (stockActual - itemCarrito.cantidad).toString();
            } else {
              toast({
                title: "Error de Stock",
                description: `No hay suficiente stock para ${itemCarrito.nombre} al momento de procesar.`,
                variant: "destructive",
              });
              ventaExitosa = false;
              break; 
            }
          } else {
             toast({
                title: "Error de Producto",
                description: `Producto ${itemCarrito.nombre} no encontrado en inventario al procesar.`,
                variant: "destructive",
              });
             ventaExitosa = false;
             break;
          }
        }

        if (ventaExitosa) {
          setProductosInventario(nuevosProductosInventario);
          
          const nuevaVenta = {
            id: `VENTA-${Date.now()}`,
            fecha: new Date().toISOString(),
            items: carrito.map(item => ({
              idProducto: item.id,
              nombre: item.nombre,
              cantidad: item.cantidad,
              precioUnitario: parseFloat(item.precio),
              subtotal: parseFloat(item.precio) * item.cantidad,
            })),
            totalVenta: totalCarrito,
          };
          setVentasRegistradas(prevVentas => [...prevVentas, nuevaVenta]);
          
          setCarrito([]);
          toast({
            title: "Pago Procesado Exitosamente",
            description: `Venta registrada. Monto total: $${totalCarrito.toFixed(2)}. Stock actualizado.`,
          });
        } else {
           // No se limpia el carrito si la venta no fue exitosa para que el usuario pueda ajustar
        }
      }, [carrito, productosInventario, setProductosInventario, totalCarrito, toast, setVentasRegistradas]);


      const value = {
        productosInventario,
        setProductosInventario, 
        carrito,
        setCarrito,
        searchTerm,
        setSearchTerm,
        handleSearch,
        filteredProductos,
        agregarAlCarrito,
        eliminarDelCarrito,
        actualizarCantidadCarrito,
        totalCarrito,
        scannedProductModalOpen,
        setScannedProductModalOpen,
        scannedProductDetails,
        setScannedProductDetails,
        manualScanCode,
        setManualScanCode,
        handleManualScan,
        procesarPagoYActualizarStock,
        ventasRegistradas
      };

      return <PosContext.Provider value={value}>{children}</PosContext.Provider>;
    };

    export const usePos = () => {
      const context = useContext(PosContext);
      if (!context) {
        throw new Error('usePos must be used within a PosProvider');
      }
      return context;
    };
  