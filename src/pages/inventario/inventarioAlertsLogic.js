
    export const checkLowStockLogic = (productos, umbral = 5) => {
        const alertas = productos.filter(p => {
            const cantidad = parseInt(p.cantidad, 10);
            return !isNaN(cantidad) && cantidad <= umbral && cantidad >= 0; 
        });
        
        const productosConBajoStockHoy = alertas.filter(p => parseInt(p.cantidad, 10) <= umbral);
      
        return { alertasBajoStock: alertas, productosConBajoStockHoy };
      };
  