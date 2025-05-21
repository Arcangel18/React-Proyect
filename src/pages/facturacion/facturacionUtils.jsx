
    export const generarNumeroFactura = (facturasExistentes) => {
      const prefijo = 'FAC-EO-';
      let maxNumero = 0;
      if (facturasExistentes && facturasExistentes.length > 0) {
        facturasExistentes.forEach(factura => {
          if (factura.numeroFactura && factura.numeroFactura.startsWith(prefijo)) {
            const numPart = parseInt(factura.numeroFactura.substring(prefijo.length), 10);
            if (!isNaN(numPart) && numPart > maxNumero) {
              maxNumero = numPart;
            }
          }
        });
      }
      return `${prefijo}${(maxNumero + 1).toString().padStart(5, '0')}`;
    };
  