
    import React from 'react';
    import { PosProvider } from '@/pages/pos/PosContext.jsx';
    import PosView from '@/pages/pos/PosView.jsx';

    const PuntoDeVentaPage = () => {
      return (
        <PosProvider>
          <PosView />
        </PosProvider>
      );
    };
    export default PuntoDeVentaPage;
  