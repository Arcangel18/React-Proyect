
    import React from 'react';
    import { ClientesProvider, useClientes } from '@/pages/clientes/ClientesContext.jsx';
    import ClientesView from '@/pages/clientes/ClientesView.jsx';

    const ClientesPage = () => {
      return (
        <ClientesProvider>
          <ClientesView />
        </ClientesProvider>
      );
    };

    export default ClientesPage;
  