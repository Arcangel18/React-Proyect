
    import * as XLSX from 'xlsx';
    import { generateCodigoUnico } from '@/pages/equipos/equiposUtils.jsx';

    export const handleExportEquipos = (equipos, clientes, allUsers, toast) => {
      const dataToExport = equipos.map(equipo => {
        const cliente = clientes.find(c => c.id === equipo.clienteId);
        const tecnico = allUsers.find(u => u.id === equipo.tecnicoId);
        return {
          'ID Equipo': equipo.id,
          'Código Único': equipo.codigoUnico,
          'Marca': equipo.marca,
          'Modelo': equipo.modelo,
          'Serial': equipo.serial,
          'Descripción Problema': equipo.descripcionProblema,
          'Monto Reparación': equipo.montoReparacion,
          'Estado': equipo.estado,
          'Fecha Registro': equipo.fechaRegistro,
          'ID Cliente': equipo.clienteId,
          'Nombre Cliente': cliente ? cliente.nombreCompleto : 'N/A',
          'Cédula Cliente': cliente ? cliente.cedula : 'N/A',
          'Técnico Asignado': tecnico ? tecnico.nombreCompleto : 'N/A',
          'Categoría Almacén': equipo.categoriaAlmacen || 'N/A',
          'Ubicación Almacén': equipo.ubicacionAlmacen || 'N/A',
        };
      });
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Equipos");
      XLSX.writeFile(workbook, "equipos_exportados.xlsx");
      toast({ title: "Exportado", description: "Los datos de los equipos han sido exportados a Excel." });
    };

    export const handleImportEquipos = (event, equipos, setEquipos, clientes, allUsers, toast) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);
            
            if (json.length === 0) {
              toast({ title: "Archivo Vacío", description: "El archivo Excel no contiene datos.", variant: "destructive" });
              if(event.target) event.target.value = null;
              return;
            }

            const nuevosEquipos = json.map((row, index) => {
                const clienteExistentePorCedula = clientes.find(c => c.cedula === row['Cédula Cliente']);
                const clienteExistentePorNombre = clientes.find(c => c.nombreCompleto === row['Nombre Cliente']);
                let clienteId = clienteExistentePorCedula?.id || clienteExistentePorNombre?.id || `temp_cliente_${Date.now()}_${index}`;
                
                const tecnicoExistente = allUsers.find(u => u.nombreCompleto === row['Técnico Asignado']);

              return {
                id: row['ID Equipo'] || Date.now().toString() + index,
                codigoUnico: row['Código Único'] || generateCodigoUnico('IMP', 1, [...equipos, ...json.slice(0,index)]),
                marca: row['Marca'] || 'N/A',
                modelo: row['Modelo'] || 'N/A',
                serial: row['Serial'] || '',
                descripcionProblema: row['Descripción Problema'] || 'Importado desde Excel',
                montoReparacion: row['Monto Reparación']?.toString() || '0',
                estado: row['Estado'] || 'Pendiente',
                fechaRegistro: row['Fecha Registro'] || new Date().toISOString().slice(0,10),
                clienteId: clienteId,
                tecnicoId: tecnicoExistente ? tecnicoExistente.id : '',
                categoriaAlmacen: row['Categoría Almacén'] || '',
                ubicacionAlmacen: row['Ubicación Almacén'] || '',
              };
            }).filter(eq => eq.marca !== 'N/A'); 

            setEquipos(prev => [...prev, ...nuevosEquipos]);
            toast({ title: "Importación Exitosa", description: `${nuevosEquipos.length} equipos importados.` });
          } catch (error) {
            console.error("Error al importar:", error);
            toast({ title: "Error de Importación", description: "Hubo un problema al leer el archivo Excel. Asegúrese de que el formato sea correcto.", variant: "destructive" });
          } finally {
            if(event.target) event.target.value = null; 
          }
        };
        reader.readAsArrayBuffer(file);
      }
    };
  