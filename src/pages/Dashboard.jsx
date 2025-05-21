
    import React from 'react';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { DollarSign, Users, HardDrive, ShoppingCart } from 'lucide-react';
    import { motion } from 'framer-motion';
    import useLocalStorage from '@/hooks/useLocalStorage';

    const StatCard = ({ title, value, icon, color, unit }) => (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4" style={{borderColor: color}}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            {React.createElement(icon, { className: "h-5 w-5", style: {color: color} })}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unit}{value}</div>
          </CardContent>
        </Card>
      </motion.div>
    );

    const Dashboard = () => {
      const [equipos] = useLocalStorage('equipos', []);
      const [productos] = useLocalStorage('productos', []);
      const [clientes] = useLocalStorage('clientes', []);

      const today = new Date().toISOString().slice(0, 10);

      const dailyRepairsRevenue = equipos
        .filter(e => e.fechaRegistro && e.fechaRegistro.startsWith(today) && e.estado === 'Reparado' && e.montoReparacion)
        .reduce((sum, e) => sum + parseFloat(e.montoReparacion), 0);

      const dailySalesRevenue = 0; 

      const totalDailyRevenue = dailyRepairsRevenue + dailySalesRevenue;

      const stats = [
        { title: "Ingresos Diarios (Reparaciones)", value: dailyRepairsRevenue.toFixed(2), icon: DollarSign, color: 'hsl(var(--primary))', unit: '$' },
        { title: "Ingresos Diarios (Ventas Tienda)", value: dailySalesRevenue.toFixed(2), icon: DollarSign, color: 'hsl(var(--accent))', unit: '$' },
        { title: "Total Ingresos Hoy", value: totalDailyRevenue.toFixed(2), icon: DollarSign, color: '#22c55e', unit: '$' },
        { title: "Clientes Registrados", value: clientes.length, icon: Users, color: '#3b82f6' },
        { title: "Equipos en Sistema", value: equipos.length, icon: HardDrive, color: '#f97316' },
        { title: "Productos en Tienda", value: productos.length, icon: ShoppingCart, color: '#8b5cf6' },
      ];
      
      return (
        <div className="space-y-6">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent"
          >
            Panel de Control
          </motion.h1>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <StatCard {...stat} />
              </motion.div>
            ))}
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-primary">Resumen Rápido</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Bienvenido al panel de control de Electrónica Oriental. Aquí podrás ver un resumen de la actividad diaria y el estado general del sistema.
                </p>
                <ul className="list-disc list-inside mt-4 space-y-1 text-muted-foreground">
                  <li>Equipos pendientes de reparación: {equipos.filter(e => e.estado === 'Pendiente').length}</li>
                  <li>Equipos en espera de piezas: {equipos.filter(e => e.estado === 'En Espera de Piezas').length}</li>
                  <li>Equipos en reparación: {equipos.filter(e => e.estado === 'En Reparación').length}</li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      );
    };
    export default Dashboard;
  