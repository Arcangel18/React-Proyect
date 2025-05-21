
    import React from 'react';
    import { InventarioProvider } from '@/pages/inventario/InventarioContext.jsx';
    import InventarioView from '@/pages/inventario/InventarioView.jsx';

    const InventarioPage = () => {
      return (
        <InventarioProvider>
          <InventarioView />
        </InventarioProvider>
      );
    };
    export default InventarioPage;
  