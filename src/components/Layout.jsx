
    import React, { useState } from 'react';
    import { NavLink, useLocation, useNavigate, Link } from 'react-router-dom';
    import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
    import { Button } from '@/components/ui/button';
    import { Menu, Users, HardDrive, Wrench, BarChartBig, Sun, Moon, ListChecks, Package, ShoppingCart, LogOut, UserCog, ExternalLink, Tv, FileText } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { useAuth, ROLES } from '@/contexts/AuthContext';

    const defaultNavItems = [
      { href: '/clientes', label: 'Clientes', icon: Users, roles: [ROLES.JEFE, ROLES.SECRETARIA] },
      { href: '/equipos', label: 'Equipos', icon: HardDrive, roles: [ROLES.JEFE, ROLES.SECRETARIA, ROLES.TECNICO_MICROONDAS, ROLES.TECNICO_TV, ROLES.TECNICO_GENERAL] },
      { href: '/estado-equipos', label: 'Estado Equipos', icon: ListChecks, roles: [ROLES.JEFE, ROLES.SECRETARIA, ROLES.TECNICO_MICROONDAS, ROLES.TECNICO_TV, ROLES.TECNICO_GENERAL] },
      { href: '/inventario', label: 'Inventario', icon: Package, roles: [ROLES.JEFE, ROLES.SECRETARIA] },
      { href: '/pos', label: 'Punto de Venta', icon: ShoppingCart, roles: [ROLES.JEFE, ROLES.SECRETARIA] },
      { href: '/facturacion', label: 'Facturación', icon: FileText, roles: [ROLES.JEFE, ROLES.SECRETARIA] },
      { href: '/tecnicos', label: 'Vista Técnicos', icon: Wrench, roles: [ROLES.JEFE, ROLES.SECRETARIA, ROLES.TECNICO_MICROONDAS, ROLES.TECNICO_TV, ROLES.TECNICO_GENERAL] },
      { href: '/reportes', label: 'Reportes', icon: BarChartBig, roles: [ROLES.JEFE, ROLES.SECRETARIA] },
      { href: '/admin/empleados', label: 'Gestión Empleados', icon: UserCog, roles: [ROLES.JEFE] },
    ];

    const Layout = ({ children }) => {
      const [isSheetOpen, setIsSheetOpen] = useState(false);
      const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
          const theme = localStorage.getItem('theme');
           if (theme) return theme === 'dark';
           return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
      });
      const location = useLocation();
      const { user, logout } = useAuth();
      const navigate = useNavigate();

      const handleLogout = () => {
        logout();
        navigate('/login');
      };

      React.useEffect(() => {
        if (isDarkMode) {
          document.documentElement.classList.add('dark');
          localStorage.setItem('theme', 'dark');
        } else {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('theme', 'light');
        }
      }, [isDarkMode]);

      const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

      const navItems = defaultNavItems.filter(item => user && item.roles.includes(user.rol));

      const NavContent = () => (
        <nav className="flex flex-col space-y-2 p-4 flex-grow">
          {navItems.map((item) => (
            <NavLink 
            key={item.label} 
            to={item.href} 
            onClick={() => setIsSheetOpen(false)}
              className={({ isActive }) =>
                `flex items-center p-3 rounded-lg transition-colors duration-200 ease-in-out
                ${isActive 
                  ? 'bg-primary text-primary-foreground shadow-md transform scale-105' 
                  : 'hover:bg-accent hover:text-accent-foreground hover:shadow-sm'
                }`
              }
            >
              <item.icon className="mr-3 h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
           {(user?.rol === ROLES.JEFE || user?.rol === ROLES.SECRETARIA) && (
            <Link 
                to="/monitor-taller" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => setIsSheetOpen(false)}
                className="flex items-center p-3 rounded-lg transition-colors duration-200 ease-in-out hover:bg-accent hover:text-accent-foreground hover:shadow-sm mt-auto"
            >
                <Tv className="mr-3 h-5 w-5" />
                <span className="font-medium">Monitor Taller</span>
                <ExternalLink className="ml-auto h-4 w-4 text-muted-foreground" />
            </Link>
          )}
        </nav>
      );

      return (
        <div className="flex h-screen bg-background text-foreground">
          <aside className="hidden md:flex md:w-64 flex-col border-r border-border shadow-lg bg-card">
            <div className="p-6 border-b border-border">
              <h1 className="text-2xl font-bold text-primary">Electrónica Oriental</h1>
              {user && <p className="text-xs text-muted-foreground">Hola, {user.nombreCompleto} ({user.rol})</p>}
            </div>
            <NavContent />
            <div className="p-4 border-t border-border space-y-2">
              <Button onClick={toggleDarkMode} variant="ghost" className="w-full justify-start p-3">
                {isDarkMode ? <Sun className="mr-3 h-5 w-5" /> : <Moon className="mr-3 h-5 w-5" />}
                <span className="font-medium">{isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
              </Button>
              <Button onClick={handleLogout} variant="outline" className="w-full justify-start p-3 text-red-500 hover:bg-red-500/10">
                <LogOut className="mr-3 h-5 w-5" />
                <span className="font-medium">Cerrar Sesión</span>
              </Button>
            </div>
          </aside>

          <div className="flex-1 flex flex-col overflow-hidden">
            <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card shadow-sm">
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 bg-card p-0 flex flex-col">
                  <div className="p-6 border-b border-border">
                    <h1 className="text-2xl font-bold text-primary">Electrónica Oriental</h1>
                    {user && <p className="text-xs text-muted-foreground">Hola, {user.nombreCompleto} ({user.rol})</p>}
                  </div>
                  <NavContent />
                   <div className="p-4 border-t border-border space-y-2">
                    <Button onClick={toggleDarkMode} variant="ghost" className="w-full justify-start p-3">
                      {isDarkMode ? <Sun className="mr-3 h-5 w-5" /> : <Moon className="mr-3 h-5 w-5" />}
                      <span className="font-medium">{isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
                    </Button>
                     <Button onClick={handleLogout} variant="outline" className="w-full justify-start p-3 text-red-500 hover:bg-red-500/10">
                        <LogOut className="mr-3 h-5 w-5" />
                        <span className="font-medium">Cerrar Sesión</span>
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
              <h1 className="text-xl font-semibold text-primary">
                {navItems.find(item => location.pathname.startsWith(item.href))?.label || 'Electrónica Oriental'}
              </h1>
               <Button onClick={toggleDarkMode} variant="ghost" size="icon" className="md:hidden">
                  {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </header>

            <main className="flex-1 overflow-y-auto p-6 md:p-8">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {children}
              </motion.div>
            </main>
          </div>
        </div>
      );
    };

    export default Layout;
  