
    import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
    import useLocalStorage from '@/hooks/useLocalStorage';
    import { useToast } from '@/components/ui/use-toast';

    const AuthContext = createContext(null);

    export const ROLES = {
      JEFE: 'jefe',
      SECRETARIA: 'secretaria',
      TECNICO_MICROONDAS: 'tecnico_microondas',
      TECNICO_TV: 'tecnico_tv',
      TECNICO_GENERAL: 'tecnico_general',
    };

    const initialUsers = [
      { id: 'user1', username: 'jefe', password: 'password', rol: ROLES.JEFE, nombreCompleto: 'El Jefe Maestro' },
      { id: 'user2', username: 'secretaria', password: 'password', rol: ROLES.SECRETARIA, nombreCompleto: 'Ana Secretaria' },
      { id: 'user3', username: 'tecmic', password: 'password', rol: ROLES.TECNICO_MICROONDAS, nombreCompleto: 'Carlos Microondas', especialidadCategoria: 'Microondas' },
      { id: 'user4', username: 'tectv', password: 'password', rol: ROLES.TECNICO_TV, nombreCompleto: 'Maria Televisiones', especialidadCategoria: 'Televisores' },
      { id: 'user5', username: 'tecgen', password: 'password', rol: ROLES.TECNICO_GENERAL, nombreCompleto: 'Luis Generalista', especialidadCategoria: 'General' },
    ];

    export const AuthProvider = ({ children }) => {
      const [user, setUser] = useState(null);
      const [users, setUsers] = useLocalStorage('appUsers', initialUsers);
      const { toast } = useToast();

      useEffect(() => {
        const loggedInUser = localStorage.getItem('loggedInUser');
        if (loggedInUser) {
          setUser(JSON.parse(loggedInUser));
        }
      }, []);

      const login = useCallback((username, password) => {
        const foundUser = users.find(u => u.username === username && u.password === password);
        if (foundUser) {
          setUser(foundUser);
          localStorage.setItem('loggedInUser', JSON.stringify(foundUser));
          toast({ title: "Inicio de Sesión Exitoso", description: `Bienvenido ${foundUser.nombreCompleto}` });
          return true;
        }
        toast({ title: "Error de Inicio de Sesión", description: "Usuario o contraseña incorrectos.", variant: "destructive" });
        return false;
      }, [users, toast]);

      const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem('loggedInUser');
        toast({ title: "Sesión Cerrada", description: "Has cerrado sesión exitosamente." });
      }, [toast]);

      const addUser = useCallback((newUser) => {
        if (users.find(u => u.username === newUser.username)) {
          toast({ title: "Error", description: "El nombre de usuario ya existe.", variant: "destructive"});
          return false;
        }
        setUsers(prevUsers => [...prevUsers, { ...newUser, id: `user${Date.now()}` }]);
        toast({ title: "Usuario Creado", description: `El usuario ${newUser.username} ha sido creado.`});
        return true;
      }, [users, setUsers, toast]);
      
      const updateUser = useCallback((userId, updatedUserData) => {
        setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, ...updatedUserData } : u));
        toast({ title: "Usuario Actualizado", description: "Datos del usuario actualizados."});
      }, [setUsers, toast]);

      const deleteUser = useCallback((userId) => {
        if(userId === user?.id) {
             toast({ title: "Error", description: "No puedes eliminar tu propia cuenta.", variant: "destructive"});
             return;
        }
        setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
        toast({ title: "Usuario Eliminado", description: "El usuario ha sido eliminado."});
      }, [setUsers, toast, user]);


      const value = { user, users, login, logout, addUser, updateUser, deleteUser, ROLES };

      return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
    };

    export const useAuth = () => {
      const context = useContext(AuthContext);
      if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
      }
      return context;
    };
  