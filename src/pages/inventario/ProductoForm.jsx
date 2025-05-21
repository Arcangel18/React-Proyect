
    import React from 'react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Textarea } from '@/components/ui/textarea';
    import { DialogFooter, DialogClose } from '@/components/ui/dialog';
    import { useInventario, initialProductoFormData } from '@/pages/inventario/InventarioContext.jsx';

    const ProductoForm = () => {
      const {
        formData,
        handleInputChange,
        handleSubmit,
        currentProducto,
        resetFormAndCloseModal,
        setFormData,
        setCurrentProducto,
        generateCodigoProducto
      } = useInventario();

      const handleCancel = () => {
        setFormData(initialProductoFormData);
        setCurrentProducto(null);
        resetFormAndCloseModal();
      };
      
      const placeholderCodigo = formData.nombre ? generateCodigoProducto(formData.nombre) : 'PROD-XXX-0000';

      return (
        <form onSubmit={handleSubmit} className="space-y-3 py-4 max-h-[70vh] overflow-y-auto pr-2">
          <div>
            <Label htmlFor="nombre">Nombre del Producto <span className="text-red-500">*</span></Label>
            <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleInputChange} required />
          </div>
          <div>
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea id="descripcion" name="descripcion" value={formData.descripcion} onChange={handleInputChange} rows={2}/>
          </div>
          <div>
            <Label htmlFor="precio">Precio ($) <span className="text-red-500">*</span></Label>
            <Input id="precio" name="precio" type="number" step="0.01" value={formData.precio} onChange={handleInputChange} required />
          </div>
          <div>
            <Label htmlFor="cantidad">Cantidad en Stock <span className="text-red-500">*</span></Label>
            <Input id="cantidad" name="cantidad" type="number" value={formData.cantidad} onChange={handleInputChange} required />
          </div>
          <div>
            <Label htmlFor="codigoProducto">Código de Producto (auto-generado si se deja vacío)</Label>
            <Input id="codigoProducto" name="codigoProducto" value={formData.codigoProducto} onChange={handleInputChange} placeholder={placeholderCodigo} />
          </div>
          <div>
            <Label htmlFor="imagenUrl">URL de Imagen del Producto</Label>
            <Input id="imagenUrl" name="imagenUrl" value={formData.imagenUrl} onChange={handleInputChange} placeholder="https://ejemplo.com/imagen.jpg"/>
          </div>
          <DialogFooter className="pt-3">
            <DialogClose asChild>
                <Button type="button" variant="outline" onClick={handleCancel}>Cancelar</Button>
            </DialogClose>
            <Button type="submit" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white">{currentProducto ? 'Guardar Cambios' : 'Agregar Producto'}</Button>
          </DialogFooter>
        </form>
      );
    };

    export default ProductoForm;
  