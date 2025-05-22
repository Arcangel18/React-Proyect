    import React, { useState, useEffect, useMemo, useRef } from 'react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Textarea } from '@/components/ui/textarea';
    import { DialogFooter, DialogClose } from '@/components/ui/dialog';
    import { useEquipos } from '@/pages/equipos/EquiposContext.jsx';
    import { estadoOptions, categoriasAlmacen, ubicacionesAlmacenTV, ubicacionesAlmacenGeneral } from '@/pages/equipos/equiposUtils.jsx';
    import { useAuth, ROLES } from '@/contexts/AuthContext';
    import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
    import { Check, ChevronsUpDown, Search } from "lucide-react"
    import { cn } from "@/lib/utils"
    

    const ClienteSearchableSelect = ({ value, onValueChange, clientes }) => {
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

        const filteredClientes = useMemo(() => {
            if (!internalSearchValue) return clientes.slice(0, 100);
            return clientes.filter(cliente =>
                cliente.nombreCompleto.toLowerCase().includes(internalSearchValue.toLowerCase()) ||
                cliente.cedula.toLowerCase().includes(internalSearchValue.toLowerCase())
            ).slice(0, 100);
        }, [clientes, internalSearchValue]);
      
        const selectedClienteNombre = useMemo(() => {
             const clienteSeleccionado = clientes.find(c => c.id === value);
             return clienteSeleccionado ? `${clienteSeleccionado.nombreCompleto} (${clienteSeleccionado.cedula})` : "Seleccionar cliente...";
        }, [clientes, value]);
      
        return (
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild ref={triggerRef}>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between text-sm"
                    >
                        <span className="truncate">{selectedClienteNombre}</span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent 
                    className="w-[--radix-popover-trigger-width] p-0 dropdown-content"
                    style={{ width: triggerRef.current?.offsetWidth ? `${triggerRef.current.offsetWidth}px` : 'auto' }}
                    onOpenAutoFocus={(e) => {
                         e.preventDefault(); // Keep this to prevent trigger from losing focus and closing popover
                         inputRef.current?.focus(); // Attempt focus
                    }}
                    
                >
                    <div className="flex items-center border-b px-3 sticky top-0 bg-popover z-10">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <Input
                            ref={inputRef}
                            placeholder="Buscar cliente por nombre o cédula..."
                            value={internalSearchValue}
                            onChange={(e) => setInternalSearchValue(e.target.value)}
                            className="flex h-10 w-full rounded-md bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                    </div>
                    <div className="max-h-[250px] overflow-y-auto">
                        {filteredClientes.length === 0 && <p className="p-4 text-sm text-center text-muted-foreground">No se encontró ningún cliente.</p>}
                        {filteredClientes.map((cliente) => (
                            <div
                                key={cliente.id}
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent event bubbling that might close popover prematurely
                                    onValueChange(cliente.id === value ? cliente.id :"" );
                                    setOpen(false);
                                }}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onValueChange(cliente.id === value ? "" : cliente.id);
                                        setOpen(false);
                                    }
                                }}
                                className={cn(
                                    "flex items-center w-full p-2 hover:bg-accent cursor-pointer text-sm text-left focus:bg-accent focus:outline-none",
                                    value === cliente.id ? "bg-accent text-accent-foreground" : ""
                                )}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        value === cliente.id ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                <div className="flex flex-col">
                                   <span className="font-medium">{cliente.nombreCompleto}</span>
                                   <span className="text-xs text-muted-foreground">{cliente.cedula}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </PopoverContent>
            </Popover>
        );
    }


    const EquipoForm = ({ handleSubmit: parentSubmit, clientes }) => {
      const { formData, handleInputChange, handleSelectChange, currentEquipo, resetFormAndCloseModal, tecnicosParaAsignacion } = useEquipos();
         

      const { user } = useAuth();



      const ubicacionesDisponibles = formData.categoriaAlmacen === 'Televisores' ? ubicacionesAlmacenTV : ubicacionesAlmacenGeneral;
      const puedeAsignarTecnico = user && (user.rol === ROLES.JEFE || user.rol === ROLES.SECRETARIA);

      return (
        <form onSubmit={parentSubmit} className="space-y-3 py-4 max-h-[80vh] overflow-y-auto pr-3">
          <div>
            <Label htmlFor="clienteId">Cliente <span className="text-red-500">*</span></Label>
            <ClienteSearchableSelect
            value={formData.cliente}
            onValueChange={(selectedValue) => handleSelectChange('cliente.id', selectedValue)}
            clientes={clientes}
          />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="marca">Marca <span className="text-red-500">*</span></Label>
              <Input id="marca" name="marca" value={formData.marca} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="modelo">Modelo <span className="text-red-500">*</span></Label>
              <Input id="modelo" name="modelo" value={formData.modelo} onChange={handleInputChange} required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="serial">Serial (Opcional)</Label>
              <Input id="serial" name="serial" value={formData.serial} onChange={handleInputChange} />
            </div>
            {!currentEquipo && (
                <div>
                    <Label htmlFor="numeroInicioCodigo">Número Inicial para Código (Opcional)</Label>
                    <Input id="numeroInicioCodigo" name="numeroInicioCodigo" type="number" value={formData.numeroInicioCodigo} onChange={handleInputChange} placeholder="Ej: 1001"/>
                </div>
            )}
             {currentEquipo && formData.codigoUnico && (
                <div>
                    <Label>Código Único</Label>
                    <Input value={formData.codigoUnico} disabled className="bg-muted/50" />
                </div>
            )}
          </div>

          <div>
            <Label htmlFor="descripcionProblema">Descripción del Problema <span className="text-red-500">*</span></Label>
            <Textarea id="descripcionProblema" name="descripcionProblema" value={formData.descripcionProblema} onChange={handleInputChange} required />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="montoReparacion">Monto Reparación ($)</Label>
              <Input id="montoReparacion" name="montoReparacion" type="number" step="0.01" value={formData.montoReparacion} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="estado">Estado del Equipo</Label>
              <Select value={formData.estado || 'Pendiente'} onValueChange={(value) => handleSelectChange('estado', value)}>
                <SelectTrigger><SelectValue placeholder="Seleccionar estado" /></SelectTrigger>
                <SelectContent>
                  {estadoOptions.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

           {puedeAsignarTecnico && (
            <div>
                <Label htmlFor="tecnicoId">Técnico Asignado (Opcional)</Label>
                <Select value={formData.tecnicoId || 'ninguno'} onValueChange={(value) => handleSelectChange('tecnicoId', value)}>
                <SelectTrigger><SelectValue placeholder="Asignar un técnico..." /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="ninguno">Sin asignar / Auto-asignar</SelectItem>
                    {tecnicosParaAsignacion.map(tec => <SelectItem key={tec.id} value={tec.id}>{tec.nombreCompleto} ({tec.especialidadCategoria || tec.rol})</SelectItem>)}
                </SelectContent>
                </Select>
            </div>
           )}


          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="categoriaAlmacen">Categoría Almacén (Opcional)</Label>
              <Select value={formData.categoriaAlmacen || 'no_aplica'} onValueChange={(value) => handleSelectChange('categoriaAlmacen', value === 'no_aplica' ? '' : value)}>
                <SelectTrigger><SelectValue placeholder="Seleccionar categoría" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="no_aplica">Ninguna</SelectItem>
                  {categoriasAlmacen.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="ubicacionAlmacen">Ubicación Almacén (Opcional)</Label>
              <Select value={formData.ubicacionAlmacen || 'no_aplica'} onValueChange={(value) => handleSelectChange('ubicacionAlmacen', value === 'no_aplica' ? '' : value)} disabled={!formData.categoriaAlmacen}>
                <SelectTrigger><SelectValue placeholder="Seleccionar ubicación" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="no_aplica">Ninguna</SelectItem>
                  {ubicacionesDisponibles.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fechaEntrega">Fecha de Entrega/Venta (Garantía)</Label>
              <Input id="fechaEntrega" name="fechaEntrega" type="date" value={formData.fechaEntrega || ''} onChange={handleInputChange} disabled={formData.estado === 'Entregado'}/>
            </div>
            <div>
              <Label htmlFor="periodoGarantia">Período de Garantía (días)</Label>
              <Input id="periodoGarantia" name="periodoGarantia" type="number" value={formData.periodoGarantia || ''} onChange={handleInputChange} placeholder="Ej: 30" disabled={formData.estado === 'Entregado'} />
            </div>
          </div>


          <DialogFooter className="pt-4">
            <DialogClose asChild><Button type="button" variant="outline" onClick={resetFormAndCloseModal}>Cancelar</Button></DialogClose>
            <Button type="submit" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white">{currentEquipo ? 'Guardar Cambios' : 'Registrar Equipo'}</Button>
          </DialogFooter>
        </form>
      );
    };

    export default EquipoForm;