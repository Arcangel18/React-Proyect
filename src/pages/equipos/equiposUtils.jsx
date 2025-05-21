
    import React from 'react';

    export const estadoOptions = ['Pendiente', 'En Espera de Piezas', 'En Reparación', 'Reparado', 'Entregado', 'En Almacén'];
    
    export const categoriasAlmacen = [
      'Microondas', 'Abanicos', 'Air Fryer', 'Arroceras', 'Inversores', 'Televisores', 'Otros'
    ];

    export const ubicacionesAlmacenTV = [
      'TV 32 pulgadas', 'TV 40 pulgadas', 'TV 50 pulgadas', 'TV 60 pulgadas', 'TV 65 pulgadas', 'TV Delante del Local', 'TV Otro Tamaño'
    ];
    export const ubicacionesAlmacenGeneral = [
      'Estante A1', 'Estante A2', 'Estante B1', 'Estante B2', 'Zona de Espera', 'Otro'
    ];


    export const generateCodigoUnico = (prefijo = 'EO', numeroInicial = 1, equiposExistentes = []) => {
      let maxNumero = numeroInicial -1;
      equiposExistentes.forEach(eq => {
        if (eq.codigoUnico && eq.codigoUnico.startsWith(prefijo + '-')) {
          const numPart = parseInt(eq.codigoUnico.split('-')[1], 10);
          if (!isNaN(numPart) && numPart > maxNumero) {
            maxNumero = numPart;
          }
        }
      });
      return `${prefijo}-${(maxNumero + 1).toString().padStart(4, '0')}`;
    };

    export const getStatusColor = (status) => {
      switch (status) {
        case 'Pendiente': return 'bg-yellow-500';
        case 'En Espera de Piezas': return 'bg-orange-500';
        case 'En Reparación': return 'bg-blue-500';
        case 'Reparado': return 'bg-green-500';
        case 'Entregado': return 'bg-gray-500';
        case 'En Almacén': return 'bg-purple-500';
        default: return 'bg-gray-300';
      }
    };

    export const initialEquipoFormData = {
      id: '',
      clienteId: '',
      marca: '',
      codigoUnico: '',
      serial: '',
      modelo: '',
      descripcionProblema: '',
      montoReparacion: '',
      estado: 'Pendiente',
      fechaRegistro: new Date().toISOString().slice(0,10),
      categoriaAlmacen: '',
      ubicacionAlmacen: '',
      numeroInicioCodigo: '1',
      fechaEntrega: '',
      periodoGarantia: '',
    };

    export const calcularFechaVencimientoGarantia = (fechaEntrega, periodoGarantiaDias) => {
      if (!fechaEntrega || !periodoGarantiaDias) return null;
      const fecha = new Date(fechaEntrega);
      fecha.setDate(fecha.getDate() + parseInt(periodoGarantiaDias, 10));
      return fecha;
    };
  