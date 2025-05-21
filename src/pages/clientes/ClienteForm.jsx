
    import React from 'react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { DialogFooter, DialogClose } from '@/components/ui/dialog';
    import { useClientes, initialClienteFormData } from '@/pages/clientes/ClientesContext.jsx';

    const ClienteForm = () => {
      const {
        formData,
        handleInputChange,
        handleSubmit,
        currentCliente,
        resetFormAndCloseModal,
        setFormData, 
        setCurrentCliente
      } = useClientes();

      const handleCancel = () => {
        setFormData(initialClienteFormData);
        setCurrentCliente(null);
        resetFormAndCloseModal();
      };


      return (
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="nombreCompleto">Nombre Completo <span className="text-red-500">*</span></Label>
            <Input id="nombreCompleto" name="nombreCompleto" value={formData.nombreCompleto} onChange={handleInputChange} required />
          </div>
          <div>
            <Label htmlFor="cedula">Cédula (DNI) <span className="text-red-500">*</span></Label>
            <Input id="cedula" name="cedula" value={formData.cedula} onChange={handleInputChange} required />
          </div>
          <div>
            <Label htmlFor="telefono">Teléfono <span className="text-red-500">*</span></Label>
            <Input id="telefono" name="telefono" type="tel" value={formData.telefono} onChange={handleInputChange} required />
          </div>
          <div>
            <Label htmlFor="email">Email (Opcional)</Label>
            <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
          </div>
          <div>
            <Label htmlFor="personaAutorizada">Persona Autorizada a Recoger (Opcional)</Label>
            <Input id="personaAutorizada" name="personaAutorizada" value={formData.personaAutorizada} onChange={handleInputChange} />
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="outline" onClick={handleCancel}>Cancelar</Button>
            </DialogClose>
            <Button type="submit" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white">{currentCliente ? 'Guardar Cambios' : 'Agregar Cliente'}</Button>
          </DialogFooter>
        </form>
      );
    };

    export default ClienteForm;
  