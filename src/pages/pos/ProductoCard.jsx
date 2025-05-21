
    import React from 'react';
    import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { ShoppingCart } from 'lucide-react';
    import { motion } from 'framer-motion';

    const ProductoCard = ({ producto, onAddToCart }) => {
      return (
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className="h-full"
        >
          <Card className="flex flex-col h-full overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 glassmorphic">
            <CardHeader className="p-4">
              {producto.imagenUrl ? (
                <div className="aspect-square w-full overflow-hidden rounded-md mb-2 bg-muted">
                  <img  
                    src={producto.imagenUrl} 
                    alt={producto.nombre} 
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                   src="https://images.unsplash.com/photo-1635865165118-917ed9e20936" />
                </div>
              ) : (
                <div className="aspect-square w-full overflow-hidden rounded-md mb-2 bg-muted flex items-center justify-center">
                  <ShoppingCart className="w-12 h-12 text-muted-foreground"/>
                </div>
              )}
              <CardTitle className="text-lg truncate" title={producto.nombre}>{producto.nombre}</CardTitle>
              {producto.descripcion && <CardDescription className="text-xs h-8 overflow-hidden text-ellipsis">{producto.descripcion}</CardDescription>}
            </CardHeader>
            <CardContent className="p-4 pt-0 flex-grow">
              <p className="text-xl font-bold text-primary">${parseFloat(producto.precio).toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Stock: {producto.cantidad}</p>
              <p className="text-xs text-muted-foreground">Código: {producto.codigoProducto}</p>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button onClick={onAddToCart} className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white" disabled={producto.cantidad <= 0}>
                <ShoppingCart className="mr-2 h-4 w-4" /> {producto.cantidad > 0 ? "Agregar al Carrito" : "Agotado"}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      );
    };

    export default ProductoCard;
  