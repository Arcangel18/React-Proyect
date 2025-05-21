
    import React from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
    import { BarChartBig, CalendarDays, DollarSign, ShoppingBag } from 'lucide-react';
    import { motion } from 'framer-motion';
    import useLocalStorage from '@/hooks/useLocalStorage';

    const ReportesPage = () => {
      const [equipos] = useLocalStorage('equipos', []);
      const [clientes] = useLocalStorage('clientes', []);
      const [ventasRegistradas] = useLocalStorage('ventasRegistradas', []);

      const getWeeklyData = (items, dateField, amountField, isSale = false) => {
        const today = new Date();
        const dayOfWeek = today.getDay(); 
        const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); 
        const startOfWeek = new Date(today.setDate(diff));
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23,59,59,999); 

        let count = 0;
        let totalAmount = 0;

        items.forEach(item => {
          const itemDate = new Date(item[dateField]);
          if (itemDate >= startOfWeek && itemDate <= endOfWeek) {
            count++;
            if (isSale) {
              totalAmount += parseFloat(item[amountField] || 0);
            } else {
              totalAmount += parseFloat(item[amountField] || 0);
            }
          }
        });
        return { count, totalAmount, startOfWeek, endOfWeek };
      };
      
      const weeklyRepairsData = getWeeklyData(
        equipos.filter(e => e.estado === 'Reparado' || e.estado === 'Entregado'), 
        'fechaRegistro', 
        'montoReparacion'
      );
      
      const weeklySalesData = getWeeklyData(
        ventasRegistradas,
        'fecha',
        'totalVenta',
        true
      );

      const totalWeeklyRevenue = weeklyRepairsData.totalAmount + weeklySalesData.totalAmount;
      const totalWeeklyTransactions = weeklyRepairsData.count + weeklySalesData.count;

      const formatDateRange = (start, end) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return `${start.toLocaleDateString(undefined, options)} - ${end.toLocaleDateString(undefined, options)}`;
      };

      const reportData = [
        { title: "Ingresos por Reparaciones (Semanal)", value: `$${weeklyRepairsData.totalAmount.toFixed(2)}`, count: `${weeklyRepairsData.count} reparaciones`, icon: DollarSign, color: "text-blue-500", borderColor: "var(--blue-500)" },
        { title: "Ingresos por Ventas (Semanal)", value: `$${weeklySalesData.totalAmount.toFixed(2)}`, count: `${weeklySalesData.count} ventas`, icon: ShoppingBag, color: "text-purple-500", borderColor: "var(--purple-500)" },
        { title: "Total Ingresos (Semanal)", value: `$${totalWeeklyRevenue.toFixed(2)}`, count: `${totalWeeklyTransactions} transacciones`, icon: BarChartBig, color: "text-green-500", borderColor: "var(--green-500)" },
      ];
      
      const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'buen día';
        if (hour < 18) return 'buenas tardes';
        return 'buenas noches';
      };

      const exampleClient = clientes[0] || { nombreCompleto: "Juan Pérez", personaAutorizada: "Ana Rodríguez (Cédula: 000-0000000-0)"};
      const exampleEquipo = equipos.find(e => e.clienteId === exampleClient?.id) || equipos[0] || { marca: "Samsung", modelo: "Galaxy A50", codigoUnico: "EO-1234", serial: "SN123XYZ", montoReparacion: "75.00" };


      return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div className="flex flex-col">
             <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Reporte Semanal de Caja</h1>
             <p className="text-muted-foreground">
               Resumen financiero para la semana: {formatDateRange(weeklyRepairsData.startOfWeek, weeklyRepairsData.endOfWeek)}.
             </p>
          </div>
          
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl text-primary flex items-center"><CalendarDays className="mr-2"/>Resumen de la Semana Actual</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {reportData.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="border-l-4" style={{ borderColor: item.borderColor }}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">{item.title}</CardTitle>
                      <item.icon className={`h-5 w-5 ${item.color}`} />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{item.value}</div>
                      <p className="text-xs text-muted-foreground">{item.count}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </CardContent>
            <CardFooter>
                <p className="text-sm text-muted-foreground">Este reporte se actualiza automáticamente con los datos registrados.</p>
            </CardFooter>
          </Card>

          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl text-primary">Maqueta de Correo Electrónico de Reparación</CardTitle>
              <CardDescription>Así se vería un correo de notificación para un cliente (esto es solo una maqueta visual, los datos son ejemplos).</CardDescription>
            </CardHeader>
            <CardContent className="p-6 border rounded-lg bg-muted/10 dark:bg-muted/20">
              <div className="max-w-2xl mx-auto font-sans text-sm">
                <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground p-4 rounded-t-lg">
                  <h2 className="text-xl font-semibold">Electrónica Oriental - Notificación de Servicio</h2>
                </div>
                <div className="p-6 bg-card border border-border rounded-b-lg shadow-sm">
                  <p className="mb-4">Saludos {getGreeting()}, {exampleClient.nombreCompleto},</p>
                  <p className="mb-4">
                    Esperamos que se encuentre bien. El motivo de este correo electrónico es para informarle que su equipo electrónico ha sido reparado y está listo para ser recogido.
                  </p>
                  <div className="bg-muted/50 dark:bg-muted/30 p-4 rounded-md mb-4 border border-border">
                    <h3 className="font-semibold text-md mb-2 text-primary">Detalles del Equipo:</h3>
                    <p><strong>Equipo:</strong> {exampleEquipo.marca} - {exampleEquipo.modelo}</p>
                    <p><strong>Código Único del Sistema:</strong> {exampleEquipo.codigoUnico}</p>
                    <p><strong>Serial:</strong> {exampleEquipo.serial || 'N/A'}</p>
                  </div>
                  <p className="mb-4">
                    Favor de pasar por nuestras instalaciones en Electrónica Oriental lo más pronto posible para retirar su equipo.
                  </p>
                  <p className="mb-4">
                    El costo total de la reparación, como ya se le notificó, es de: <strong>${parseFloat(exampleEquipo.montoReparacion || 0).toFixed(2)}</strong>.
                  </p>
                  {exampleClient.personaAutorizada && (
                    <p className="mb-4 text-xs text-muted-foreground">
                      Recordatorio: Si la persona autorizada ({exampleClient.personaAutorizada}) va a recoger el equipo, por favor asegúrese de que traiga su identificación.
                    </p>
                  )}
                  <p className="mb-4">
                    Agradecemos su confianza en nuestros servicios.
                  </p>
                  <p>Atentamente,</p>
                  <p className="font-semibold">El equipo de Gestión de Electrónica Oriental</p>
                </div>
              </div>
            </CardContent>
          </Card>

        </motion.div>
      );
    };

    export default ReportesPage;
  