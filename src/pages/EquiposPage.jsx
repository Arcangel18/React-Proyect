
    import React from 'react';
    import { EquiposProvider } from '@/pages/equipos/EquiposContext.jsx';
    import EquiposView from '@/pages/equipos/EquiposView.jsx';

    const EquiposPage = () => {
      return (
        <EquiposProvider>
          <EquiposView />
        </EquiposProvider>
      );
    };

    export default EquiposPage;
  