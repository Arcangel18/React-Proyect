
    import React, { useState, useMemo, useEffect, useRef } from 'react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Textarea } from '@/components/ui/textarea';
    import { Card } from '@/components/ui/card';
    import { DialogFooter } from '@/components/ui/dialog';
    import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
    import { Check, ChevronsUpDown, Search } from "lucide-react";
    import { cn } from "@/lib/utils";

    export const initialFacturaData = {
      id: '',
      numeroFactura: '',
      fechaEmision: new Date().toISOString().slice(0, 10),
      equipoId: '',
      clienteId: '',
      descripcionServicio: '',
      montoTotal: 0,
      notas: '',
    };

    const EquipoParaFacturaSearchableSelect = ({ value, onValueChange, equipos, clientes }) => {
        const [open, setOpen] = useState(false);
        const [internalSearchValue, setInternalSearchValue] = useState("");
        const inputRef = useRef(null);
        const triggerRef = useRef(null);


        useEffect(() => {
            if (open) {
                setInternalSearchValue("");
                 // No focus immediately, let onOpenAutoFocus handle it or manual click
            }
        }, [open]);


        const equiposParaFacturar = useMemo(() => {
            return equipos.filter(eq => eq.estado === 'Reparado' || eq.estado === 'Entregado');
        }, [equipos]);

        const filteredEquipos = useMemo(() => {
            if (!internalSearchValue) return equiposParaFacturar.slice(0, 50); 
            return equiposParaFacturar.filter(equipo => {
                const cliente = clientes.find(c => c.id === equipo.clienteId);
                return (
                    equipo.codigoUnico.toLowerCase().includes(internalSearchValue.toLowerCase()) ||
                    equipo.marca.toLowerCase().includes(internalSearchValue.toLowerCase()) ||
                    equipo.modelo.toLowerCase().includes(internalSearchValue.toLowerCase()) ||
                    (cliente && cliente.nombreCompleto.toLowerCase().includes(internalSearchValue.toLowerCase()))
                );
            }).slice(0, 50);
        }, [equiposParaFacturar, internalSearchValue, clientes]);

        const selectedEquipoInfo = useMemo(() => {
            const eq = equipos.find(e => e.id === value);
            if (!eq) return "Seleccionar equipo...";
            const cli = clientes.find(c => c.id === eq.clienteId);
            return `${eq.codigoUnico} - ${eq.marca} ${eq.modelo} (${cli?.nombreCompleto || 'N/A'})`;
        }, [value, equipos, clientes]);


        return (
            <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild ref={triggerRef}>
                <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between text-sm"
                >
                <span className="truncate">{selectedEquipoInfo}</span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent 
                className="w-[--radix-popover-trigger-width] p-0 dropdown-content"
                style={{ width: triggerRef.current?.offsetWidth ? `${triggerRef.current.offsetWidth}px` : 'auto' }}
                onOpenAutoFocus={(e) => {
                    e.preventDefault(); // Keep this
                    inputRef.current?.focus(); // Attempt focus
                }}
            >
                <div className="flex items-center border-b px-3 sticky top-0 bg-popover z-10">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <Input
                        ref={inputRef}
                        placeholder="Buscar equipo por código, marca, modelo o cliente..."
                        value={internalSearchValue}
                        onChange={(e) => setInternalSearchValue(e.target.value)}
                        className="flex h-10 w-full rounded-md bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                </div>
                <div className="max-h-[250px] overflow-y-auto">
                    {filteredEquipos.length === 0 && <p className="p-4 text-sm text-center text-muted-foreground">No se encontró ningún equipo.</p>}
                    {filteredEquipos.map((equipo) => {
                        const cliente = clientes.find(c => c.id === equipo.clienteId);
                        return (
                        <div
                            key={equipo.id}
                            onClick={(e) => {
                                e.stopPropagation();
                                onValueChange(equipo.id === value ? "" : equipo.id);
                                setOpen(false);
                            }}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onValueChange(equipo.id === value ? "" : equipo.id);
                                    setOpen(false);
                                }
                            }}
                            className={cn(
                                "flex items-center w-full p-2 hover:bg-accent cursor-pointer text-sm text-left focus:bg-accent focus:outline-none",
                                value === equipo.id ? "bg-accent text-accent-foreground" : ""
                            )}
                        >
                            <Check
                                className={cn(
                                "mr-2 h-4 w-4",
                                value === equipo.id ? "opacity-100" : "opacity-0"
                                )}
                            />
                            <div className="flex flex-col">
                                <span className="font-medium">{equipo.codigoUnico} - {equipo.marca} {equipo.modelo}</span>
                                <span className="text-xs text-muted-foreground">Cliente: {cliente?.nombreCompleto || 'N/A'} - Estado: {equipo.estado}</span>
                            </div>
                        </div>
                    )})}
                </div>
            </PopoverContent>
            </Popover>
        )
    }


    export const FacturaForm = ({ onSubmit, onCancel, facturaData, setFacturaData, equipos, clientes }) => {
      const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFacturaData(prev => ({ ...prev, [name]: value }));
      };

      const handleEquipoSelect = (equipoId) => {
        const equipoSeleccionado = equipos.find(eq => eq.id === equipoId);
        if (equipoSeleccionado) {
          setFacturaData(prev => ({
            ...prev,
            equipoId: equipoSeleccionado.id,
            clienteId: equipoSeleccionado.clienteId,
            descripcionServicio: `Reparación de ${equipoSeleccionado.marca} ${equipoSeleccionado.modelo} (${equipoSeleccionado.codigoUnico}) - ${equipoSeleccionado.descripcionProblema || 'Servicio General'}`,
            montoTotal: parseFloat(equipoSeleccionado.montoReparacion) || 0,
          }));
        } else {
            setFacturaData(prev => ({
                ...prev,
                equipoId: '',
                clienteId: '',
                descripcionServicio: '',
                montoTotal: 0,
              }));
        }
      };
      
      const clienteFactura = clientes.find(c => c.id === facturaData.clienteId);

      return (
        <form onSubmit={onSubmit} className="space-y-4 py-4 max-h-[75vh] overflow-y-auto pr-2">
          <div>
            <Label htmlFor="numeroFactura">Número de Factura <span className="text-red-500">*</span></Label>
            <Input id="numeroFactura" name="numeroFactura" value={facturaData.numeroFactura} onChange={handleInputChange} required />
          </div>
          <div>
            <Label htmlFor="fechaEmision">Fecha de Emisión <span className="text-red-500">*</span></Label>
            <Input id="fechaEmision" name="fechaEmision" type="date" value={facturaData.fechaEmision} onChange={handleInputChange} required />
          </div>
          <div>
            <Label htmlFor="equipoId">Equipo Reparado <span className="text-red-500">*</span></Label>
            <EquipoParaFacturaSearchableSelect
                value={facturaData.equipoId}
                onValueChange={handleEquipoSelect}
                equipos={equipos}
                clientes={clientes}
            />
          </div>
          {clienteFactura && (
            <Card className="mt-2 p-3 bg-muted/50">
                <p className="text-sm font-semibold">Cliente: {clienteFactura.nombreCompleto}</p>
                <p className="text-xs text-muted-foreground">Cédula: {clienteFactura.cedula}</p>
            </Card>
          )}
          <div>
            <Label htmlFor="descripcionServicio">Descripción del Servicio <span className="text-red-500">*</span></Label>
            <Textarea id="descripcionServicio" name="descripcionServicio" value={facturaData.descripcionServicio} onChange={handleInputChange} required rows={3} />
          </div>
          <div>
            <Label htmlFor="montoTotal">Monto Total ($) <span className="text-red-500">*</span></Label>
            <Input id="montoTotal" name="montoTotal" type="number" step="0.01" value={facturaData.montoTotal} onChange={handleInputChange} required />
          </div>
           <div>
            <Label htmlFor="notas">Notas Adicionales (Opcional)</Label>
            <Textarea id="notas" name="notas" value={facturaData.notas} onChange={handleInputChange} rows={2} />
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
            <Button type="submit" className="bg-gradient-to-r from-primary to-accent text-white">
              {facturaData.id ? 'Actualizar Factura' : 'Crear Factura'}
            </Button>
          </DialogFooter>
        </form>
      );
    };
    
    export const FacturaPrintView = React.forwardRef(({ factura, cliente, equipo }, ref) => {
        if (!factura || !cliente || !equipo) return null;
        
        let garantiaTexto = "Este servicio/equipo no cuenta con garantía o la información no está disponible.";
        if (equipo.estado === 'Entregado' && equipo.fechaEntrega && equipo.periodoGarantia) {
            garantiaTexto = `Este servicio/equipo (${equipo.marca} ${equipo.modelo} - ${equipo.codigoUnico}) cuenta con una garantía de ${equipo.periodoGarantia} días a partir de la fecha de entrega (${new Date(equipo.fechaEntrega).toLocaleDateString()}).`;
        }


        return (
            <div ref={ref} className="p-8 bg-white text-black font-sans text-xs">
                <header className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Electrónica Oriental</h1>
                    <p className="text-xs text-gray-600">Reparación y Venta de Electrodomésticos</p>
                    <p className="text-xs text-gray-600">Dirección: [Tu Dirección Completa Aquí]</p>
                    <p className="text-xs text-gray-600">Teléfono: [Tu Número de Teléfono]</p>
                    <p className="text-xs text-gray-600">RUC: [Tu RUC/Identificación Fiscal]</p>
                </header>

                <div className="flex justify-between mb-4">
                    <div>
                        <h2 className="text-sm font-semibold text-gray-700">Factura Para:</h2>
                        <p>{cliente.nombreCompleto}</p>
                        <p>Cédula/RUC: {cliente.cedula}</p>
                        <p>Teléfono: {cliente.telefono}</p>
                        {cliente.email && <p>Email: {cliente.email}</p>}
                        {cliente.direccion && <p>Dirección: {cliente.direccion}</p>}
                    </div>
                    <div className="text-right">
                        <h2 className="text-lg font-bold text-gray-800">FACTURA</h2>
                        <p className="text-gray-700">No. <span className="font-semibold">{factura.numeroFactura}</span></p>
                        <p className="text-gray-700">Fecha: <span className="font-semibold">{new Date(factura.fechaEmision).toLocaleDateString()}</span></p>
                    </div>
                </div>

                <table className="w-full mb-6 border-collapse">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border p-1 text-left text-xs font-semibold text-gray-700">Descripción</th>
                            <th className="border p-1 text-right text-xs font-semibold text-gray-700">Cantidad</th>
                            <th className="border p-1 text-right text-xs font-semibold text-gray-700">Precio Unit.</th>
                            <th className="border p-1 text-right text-xs font-semibold text-gray-700">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="border p-1">{factura.descripcionServicio}</td>
                            <td className="border p-1 text-right">1</td>
                            <td className="border p-1 text-right">${parseFloat(factura.montoTotal).toFixed(2)}</td>
                            <td className="border p-1 text-right">${parseFloat(factura.montoTotal).toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>

                <div className="flex justify-end mb-6">
                    <div className="w-2/5">
                        <div className="flex justify-between py-1">
                            <span className="text-gray-700">Subtotal:</span>
                            <span className="font-semibold">${parseFloat(factura.montoTotal).toFixed(2)}</span>
                        </div>
                         <div className="flex justify-between py-1">
                            <span className="text-gray-700">Impuestos (ITBIS 0%):</span>
                            <span className="font-semibold">$0.00</span>
                        </div>
                        <div className="flex justify-between py-1 border-t border-b">
                            <span className="text-sm font-bold text-gray-800">TOTAL:</span>
                            <span className="text-sm font-bold">${parseFloat(factura.montoTotal).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                
                <div className="mb-4">
                    <h3 className="text-xs font-semibold text-gray-700">Términos y Condiciones:</h3>
                    <p className="text-xs text-gray-600">{garantiaTexto}</p>
                    {factura.notas && <p className="text-xs text-gray-600 mt-1">Notas Adicionales: {factura.notas}</p>}
                </div>
                
                <div className="grid grid-cols-2 gap-8 mt-10">
                    <div className="text-center">
                        <div className="border-t-2 border-gray-400 w-3/4 mx-auto pt-1">
                            <p className="text-xs text-gray-600">Firma del Cliente</p>
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="border-t-2 border-gray-400 w-3/4 mx-auto pt-1">
                             <p className="text-xs text-gray-600">Firma Autorizada (Electrónica Oriental)</p>
                        </div>
                    </div>
                </div>


                <footer className="text-center text-xs text-gray-500 mt-10 pt-4 border-t">
                    <p>Gracias por su preferencia.</p>
                    <p>Esta factura es válida sin firma ni sello si es generada electrónicamente y cumple con las normativas fiscales vigentes.</p>
                </footer>
            </div>
        );
    });
  