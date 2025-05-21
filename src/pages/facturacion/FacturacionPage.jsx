
    import React, { useState, useMemo, useRef, useCallback } from 'react';
    import useLocalStorage from '@/hooks/useLocalStorage';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter as UiDialogFooter } from '@/components/ui/dialog';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { Search, Printer, PlusCircle, FileText, Eye } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { useToast } from '@/components/ui/use-toast';
    import { initialFacturaData, FacturaForm, FacturaPrintView } from '@/pages/facturacion/facturacionComponents.jsx';
    import { generarNumeroFactura } from '@/pages/facturacion/facturacionUtils.jsx';
    
    const FacturaActions = ({ onView, onEdit }) => (
        <div className="flex justify-end items-center space-x-1">
            <Button variant="ghost" size="icon" onClick={onView} title="Ver/Imprimir Factura" className="hover:bg-blue-100 p-1">
                <Eye className="h-4 w-4 text-blue-500" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onEdit} title="Editar Factura" className="hover:bg-orange-100 p-1">
                <FileText className="h-4 w-4 text-orange-500" />
            </Button>
        </div>
    );

    const FacturaTableRow = React.memo(({ factura, cliente, equipo, onView, onEdit }) => (
        <TableRow className="hover:bg-muted/50 transition-colors">
            <TableCell className="font-medium py-3 px-4">{factura.numeroFactura}</TableCell>
            <TableCell className="py-3 px-4">{new Date(factura.fechaEmision).toLocaleDateString()}</TableCell>
            <TableCell className="py-3 px-4">{cliente?.nombreCompleto || 'N/A'}</TableCell>
            <TableCell className="py-3 px-4">{equipo?.codigoUnico || 'N/A'}</TableCell>
            <TableCell className="text-right py-3 px-4">${parseFloat(factura.montoTotal).toFixed(2)}</TableCell>
            <TableCell className="py-3 px-4">
                <FacturaActions onView={() => onView(factura)} onEdit={() => onEdit(factura)} />
            </TableCell>
        </TableRow>
    ));
    
    const FacturacionTable = ({ facturas, clientes, equipos, onView, onEdit }) => {
        if (facturas.length === 0) {
            return <p className="text-center py-12 text-lg text-muted-foreground">No se encontraron facturas. Puede crear una nueva.</p>;
        }
        return (
            <div className="overflow-x-auto rounded-lg border">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="py-3 px-4">No. Factura</TableHead>
                            <TableHead className="py-3 px-4">Fecha</TableHead>
                            <TableHead className="py-3 px-4">Cliente</TableHead>
                            <TableHead className="py-3 px-4">Equipo (Código)</TableHead>
                            <TableHead className="text-right py-3 px-4">Monto ($)</TableHead>
                            <TableHead className="text-right py-3 px-4">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {facturas.map(factura => {
                            const cliente = clientes.find(c => c.id === factura.clienteId);
                            const equipo = equipos.find(e => e.id === factura.equipoId);
                            return (
                                <FacturaTableRow 
                                    key={factura.id} 
                                    factura={factura} 
                                    cliente={cliente} 
                                    equipo={equipo} 
                                    onView={onView} 
                                    onEdit={onEdit} 
                                />
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        );
    };
    
    const FacturacionHeader = ({ onOpenNewFacturaModal }) => (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
            <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Gestión de Facturas</h1>
            <Button onClick={onOpenNewFacturaModal} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out py-3 px-6 rounded-lg">
              <PlusCircle className="mr-2 h-5 w-5" /> Crear Nueva Factura
            </Button>
        </div>
    );

    const FacturacionSearch = ({ searchTerm, setSearchTerm }) => (
        <Card className="shadow-xl mb-8 bg-background/80 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <Search className="text-muted-foreground h-6 w-6" />
                <Input 
                  placeholder="Buscar factura por número, cliente o equipo..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="text-base py-3 px-4 border-gray-300 focus:border-primary focus:ring-primary rounded-md"
                />
              </div>
            </CardHeader>
        </Card>
    );

    const FacturacionPage = () => {
      const [facturas, setFacturas] = useLocalStorage('facturasRegistradas', []);
      const [equipos, setEquipos] = useLocalStorage('equipos', []);
      const [clientes] = useLocalStorage('clientes', []);
      const [searchTerm, setSearchTerm] = useState('');
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [currentFacturaData, setCurrentFacturaData] = useState(initialFacturaData);
      const [facturaToPrint, setFacturaToPrint] = useState(null);
      const printRef = useRef();
      const { toast } = useToast();

      const filteredFacturas = useMemo(() => {
        return facturas.filter(factura => {
          const cliente = clientes.find(c => c.id === factura.clienteId);
          const equipo = equipos.find(e => e.id === factura.equipoId);
          return (
            factura.numeroFactura.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (cliente && cliente.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (equipo && equipo.codigoUnico.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (equipo && equipo.marca.toLowerCase().includes(searchTerm.toLowerCase()))
          );
        }).sort((a,b) => new Date(b.fechaEmision) - new Date(a.fechaEmision) || b.numeroFactura.localeCompare(a.numeroFactura) );
      }, [facturas, equipos, clientes, searchTerm]);

      const handleOpenNewFacturaModal = useCallback(() => {
        const nuevoNumeroFactura = generarNumeroFactura(facturas);
        setCurrentFacturaData({...initialFacturaData, numeroFactura: nuevoNumeroFactura, fechaEmision: new Date().toISOString().slice(0,10)});
        setIsModalOpen(true);
      }, [facturas]);

      const handleEditFactura = useCallback((factura) => {
        setCurrentFacturaData(factura);
        setIsModalOpen(true);
      }, []);
      
      const handleViewFactura = useCallback((factura) => {
         const cliente = clientes.find(c => c.id === factura.clienteId);
         const equipo = equipos.find(e => e.id === factura.equipoId);
         setFacturaToPrint({...factura, cliente, equipo});
      }, [clientes, equipos]);


      const handleSubmitFactura = useCallback((e) => {
        e.preventDefault();
        if (!currentFacturaData.numeroFactura || !currentFacturaData.equipoId || !currentFacturaData.montoTotal) {
          toast({ title: "Error de Validación", description: "Número de factura, equipo y monto son obligatorios.", variant: "destructive", duration: 4000 });
          return;
        }
         if (parseFloat(currentFacturaData.montoTotal) <= 0) {
          toast({ title: "Error de Validación", description: "El monto total debe ser mayor que cero.", variant: "destructive", duration: 4000 });
          return;
        }


        let equipoActualizado = null;
        if (currentFacturaData.equipoId) {
            const equipoOriginal = equipos.find(eq => eq.id === currentFacturaData.equipoId);
            if (equipoOriginal && equipoOriginal.estado !== 'Entregado') {
                 equipoActualizado = {...equipoOriginal, estado: 'Entregado'};
                 if (!equipoActualizado.fechaEntrega) {
                    equipoActualizado.fechaEntrega = new Date().toISOString().slice(0,10);
                 }
                 if (!equipoActualizado.periodoGarantia) {
                    equipoActualizado.periodoGarantia = 30; 
                 }
            }
        }

        if (currentFacturaData.id) { 
          setFacturas(prev => prev.map(f => f.id === currentFacturaData.id ? currentFacturaData : f));
          toast({ title: "Éxito", description: `Factura ${currentFacturaData.numeroFactura} actualizada correctamente.`, className: "bg-green-500 text-white", duration: 3000 });
        } else { 
          const nuevaFactura = { ...currentFacturaData, id: Date.now().toString() };
          setFacturas(prev => [nuevaFactura, ...prev]);
          toast({ title: "Éxito", description: `Factura ${nuevaFactura.numeroFactura} creada exitosamente.`, className: "bg-green-500 text-white", duration: 3000 });
        }

        if (equipoActualizado) {
            setEquipos(prevEquipos => prevEquipos.map(eq => eq.id === equipoActualizado.id ? equipoActualizado : eq));
        }

        setIsModalOpen(false);
      }, [currentFacturaData, toast, setFacturas, equipos, setEquipos]);
      
      const handlePrint = () => {
        const content = printRef.current;
        if (content) {
            const printWindow = window.open('', '_blank', 'height=800,width=800,menubar=no,toolbar=no,location=no,status=no,scrollbars=yes,resizable=yes');
            printWindow.document.write('<html><head><title>Imprimir Factura</title>');
            const tailwindStyles = Array.from(document.styleSheets)
              .filter(sheet => sheet.href === null || sheet.href.startsWith(window.location.origin))
              .map(sheet => Array.from(sheet.cssRules)
                  .map(rule => rule.cssText)
                  .join('\n')
              ).join('\n');
            printWindow.document.write(`<style>${tailwindStyles} body{font-family: 'Inter', sans-serif; margin:20px; background-color: #fff;} @page { size: A4; margin: 20mm; } .print-container { max-width: 210mm; margin: auto; } table{width:100%; border-collapse:collapse;} th,td{border:1px solid #ccc; padding:8px;} .text-right{text-align:right;} .text-center{text-align:center;} .mb-8{margin-bottom:2rem;} .mb-6{margin-bottom:1.5rem;} .font-bold{font-weight:bold;} .text-sm{font-size:0.875rem;} .text-xs{font-size:0.75rem;} .text-lg{font-size:1.125rem;} .text-xl{font-size:1.25rem;} .text-2xl{font-size:1.5rem;} .text-3xl{font-size:1.875rem;} .text-gray-800{color:#2d3748;} .text-gray-700{color:#4a5568;} .text-gray-600{color:#718096;} .text-gray-500{color:#a0aec0;} .bg-gray-100{background-color:#f7fafc;} </style>`);
            printWindow.document.write('</head><body><div class="print-container">');
            printWindow.document.write(content.innerHTML);
            printWindow.document.write('</div></body></html>');
            printWindow.document.close();
            printWindow.focus();
            
            setTimeout(() => { 
              printWindow.print();
              printWindow.close();
            }, 250);
        }
      };

      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="container mx-auto p-4 md:p-8 space-y-8"
        >
          <FacturacionHeader onOpenNewFacturaModal={handleOpenNewFacturaModal} />
          <FacturacionSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          
          <Card className="shadow-2xl overflow-hidden border-border/50 rounded-xl">
            <CardContent className="p-0">
                <FacturacionTable 
                    facturas={filteredFacturas} 
                    clientes={clientes} 
                    equipos={equipos} 
                    onView={handleViewFactura} 
                    onEdit={handleEditFactura} 
                />
            </CardContent>
             {facturas.length > 0 && (
                <CardFooter className="py-4 px-6 bg-muted/30 border-t">
                    <div className="text-sm text-muted-foreground">
                        Mostrando {filteredFacturas.length} de {facturas.length} facturas.
                    </div>
                </CardFooter>
            )}
          </Card>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="sm:max-w-xl md:max-w-2xl glassmorphic rounded-xl shadow-2xl">
              <DialogHeader className="pb-4 border-b">
                <DialogTitle className="text-2xl font-semibold text-primary">{currentFacturaData.id ? 'Editar Factura' : 'Crear Nueva Factura'}</DialogTitle>
              </DialogHeader>
              <FacturaForm 
                onSubmit={handleSubmitFactura} 
                onCancel={() => setIsModalOpen(false)}
                facturaData={currentFacturaData}
                setFacturaData={setCurrentFacturaData}
                equipos={equipos}
                clientes={clientes}
              />
            </DialogContent>
          </Dialog>
          
          <Dialog open={!!facturaToPrint} onOpenChange={() => setFacturaToPrint(null)}>
                <DialogContent className="sm:max-w-3xl lg:max-w-4xl p-0 rounded-lg shadow-2xl">
                    {facturaToPrint && (
                        <>
                        <div className="p-6 bg-muted/30">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-semibold text-primary">Vista Previa de Factura: {facturaToPrint.numeroFactura}</DialogTitle>
                            </DialogHeader>
                        </div>
                        <div className="max-h-[70vh] overflow-y-auto p-2">
                            <FacturaPrintView ref={printRef} factura={facturaToPrint} cliente={facturaToPrint.cliente} equipo={facturaToPrint.equipo} />
                        </div>
                        <UiDialogFooter className="p-6 border-t bg-muted/30">
                             <Button variant="outline" onClick={() => setFacturaToPrint(null)} className="px-6 py-2">Cerrar</Button>
                             <Button onClick={handlePrint} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-300 ease-in-out px-6 py-2">
                                <Printer className="mr-2 h-5 w-5" /> Imprimir Factura
                             </Button>
                        </UiDialogFooter>
                        </>
                    )}
                </DialogContent>
          </Dialog>

        </motion.div>
      );
    };

    export default FacturacionPage;
  