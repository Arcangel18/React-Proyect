
    import { calcularFechaVencimientoGarantia } from '@/pages/equipos/equiposUtils.jsx';

    export const checkGarantiasLogic = (equipos, clientes) => {
      const alertasGarantia = [];
      const garantiasVencidasHoy = [];
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      equipos.forEach(equipo => {
        if (equipo.fechaEntrega && equipo.periodoGarantia) {
          const fechaVencimiento = calcularFechaVencimientoGarantia(equipo.fechaEntrega, equipo.periodoGarantia);
          if (fechaVencimiento) {
            const cliente = clientes.find(c => c.id === equipo.clienteId);
            const diffTime = fechaVencimiento.getTime() - hoy.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (fechaVencimiento.getTime() === hoy.getTime()) {
              garantiasVencidasHoy.push({
                ...equipo,
                clienteNombre: cliente ? cliente.nombreCompleto : 'N/A',
                fechaVencimiento: fechaVencimiento.toLocaleDateString(),
                diasRestantes: 0,
              });
            }
            
            if (diffDays === 2) { 
              alertasGarantia.push({
                ...equipo,
                clienteNombre: cliente ? cliente.nombreCompleto : 'N/A',
                fechaVencimiento: fechaVencimiento.toLocaleDateString(),
                diasRestantes: diffDays,
              });
            }
          }
        }
      });
      alertasGarantia.sort((a,b) => a.diasRestantes - b.diasRestantes);
      return { alertasGarantia, garantiasVencidasHoy };
    };

    export const checkLowStockLogic = (productos, umbral = 5) => {
      const alertas = productos.filter(p => parseInt(p.cantidad, 10) <= umbral && parseInt(p.cantidad, 10) > 0);
      const productosConBajoStockHoy = alertas.filter(p => parseInt(p.cantidad, 10) <= umbral);
      return { alertasBajoStock: alertas, productosConBajoStockHoy };
    };
  