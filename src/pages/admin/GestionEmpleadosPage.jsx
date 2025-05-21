
    import React, { useState } from 'react';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogFooter } from '@/components/ui/dialog';
    import { PlusCircle, Edit, Trash2, Users, ShieldCheck } from 'lucide-react';
    import { useAuth, ROLES } from '@/contexts/AuthContext';
    import { useToast } from '@/components/ui/use-toast';
    import { categoriasAlmacen } from '@/pages/equipos/equiposUtils.jsx';


    const initialFormData = {
      username: '',
      password: '',
      nombreCompleto: '',
      rol: ROLES.SECRETARIA,
      especialidadCategoria: '',
    };
    
    const rolOptions = Object.values(ROLES).map(rol => ({ value: rol, label: rol.charAt(0).toUpperCase() + rol.slice(1).replace('_', ' ') }));
    const especialidadOptions = [...categoriasAlmacen.filter(cat => cat !== 'Otros' && cat !== 'Abanicos' && cat !== 'Air Fryer' && cat !== 'Arroceras' && cat !== 'Inversores'), 'General'];


    const GestionEmpleadosPage = () => {
      const { users, addUser, updateUser, deleteUser, user: currentUser } = useAuth();
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [currentEmpleado, setCurrentEmpleado] = useState(null);
      const [formData, setFormData] = useState(initialFormData);
      const [searchTerm, setSearchTerm] = useState('');
      const { toast } = useToast();

      const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
      };

      const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'rol' && value !== ROLES.TECNICO_MICROONDAS && value !== ROLES.TECNICO_TV && value !== ROLES.TECNICO_GENERAL) {
            setFormData(prev => ({...prev, especialidadCategoria: ''}));
        }
      };

      const resetFormAndCloseModal = () => {
        setFormData(initialFormData);
        setCurrentEmpleado(null);
        setIsModalOpen(false);
      };

      const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.username || !formData.password || !formData.nombreCompleto || !formData.rol) {
            toast({ title: "Campos incompletos", description: "Por favor, rellene todos los campos obligatorios.", variant: "destructive"});
            return;
        }
        if ((formData.rol === ROLES.TECNICO_MICROONDAS || formData.rol === ROLES.TECNICO_TV || formData.rol === ROLES.TECNICO_GENERAL) && !formData.especialidadCategoria) {
            toast({ title: "Campo requerido", description: "Por favor, seleccione una especialidad para el técnico.", variant: "destructive"});
            return;
        }

        if (currentEmpleado) {
          updateUser(currentEmpleado.id, formData);
        } else {
          addUser(formData);
        }
        resetFormAndCloseModal();
      };

      const handleEdit = (empleado) => {
        setCurrentEmpleado(empleado);
        setFormData({
            username: empleado.username,
            password: '', 
            nombreCompleto: empleado.nombreCompleto,
            rol: empleado.rol,
            especialidadCategoria: empleado.especialidadCategoria || ''
        });
        setIsModalOpen(true);
      };

      const handleDelete = (id) => {
        if(currentUser && id === currentUser.id) {
            toast({ title: "Acción no permitida", description: "No puedes eliminar tu propia cuenta de administrador.", variant: "destructive"});
            return;
        }
        if (window.confirm("¿Estás seguro de que deseas eliminar este empleado? Esta acción no se puede deshacer.")) {
          deleteUser(id);
        }
      };
      
      const openNewEmpleadoModal = () => {
        setCurrentEmpleado(null);
        setFormData(initialFormData);
        setIsModalOpen(true);
      };

      const filteredEmpleados = users.filter(u => 
        u.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.rol.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="flex flex-wrap justify-between items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent flex items-center"><Users className="mr-3"/>Gestión de Empleados</h1>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={openNewEmpleadoModal} className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white">
                  <PlusCircle className="mr-2 h-4 w-4" /> Agregar Empleado
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg glassmorphic">
                <DialogHeader>
                  <DialogTitle className="text-primary">{currentEmpleado ? 'Editar Empleado' : 'Agregar Nuevo Empleado'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                  <div>
                    <Label htmlFor="nombreCompleto">Nombre Completo <span className="text-red-500">*</span></Label>
                    <Input id="nombreCompleto" name="nombreCompleto" value={formData.nombreCompleto} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <Label htmlFor="username">Nombre de Usuario <span className="text-red-500">*</span></Label>
                    <Input id="username" name="username" value={formData.username} onChange={handleInputChange} required disabled={!!currentEmpleado} />
                  </div>
                  <div>
                    <Label htmlFor="password">Contraseña {currentEmpleado ? '(Dejar vacío para no cambiar)' : <span className="text-red-500">*</span>}</Label>
                    <Input id="password" name="password" type="password" value={formData.password} onChange={handleInputChange} required={!currentEmpleado} />
                  </div>
                  <div>
                    <Label htmlFor="rol">Rol <span className="text-red-500">*</span></Label>
                    <Select value={formData.rol} onValueChange={(value) => handleSelectChange('rol', value)}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar rol" /></SelectTrigger>
                      <SelectContent>
                        {rolOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  {(formData.rol === ROLES.TECNICO_MICROONDAS || formData.rol === ROLES.TECNICO_TV || formData.rol === ROLES.TECNICO_GENERAL) && (
                    <div>
                      <Label htmlFor="especialidadCategoria">Especialidad (Categoría de Equipo) <span className="text-red-500">*</span></Label>
                      <Select value={formData.especialidadCategoria} onValueChange={(value) => handleSelectChange('especialidadCategoria', value)}>
                        <SelectTrigger><SelectValue placeholder="Seleccionar especialidad" /></SelectTrigger>
                        <SelectContent>
                          {especialidadOptions.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                        </SelectContent>
                      </Select>
                       <p className="text-xs text-muted-foreground mt-1">
                        Microondas y TV se asignan automáticamente. 'General' cubre Air Fryer, Arroceras, Inversores, Abanicos y Otros.
                       </p>
                    </div>
                  )}
                  <DialogFooter className="pt-4">
                    <DialogClose asChild><Button type="button" variant="outline" onClick={resetFormAndCloseModal}>Cancelar</Button></DialogClose>
                    <Button type="submit" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white">{currentEmpleado ? 'Guardar Cambios' : 'Agregar Empleado'}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="shadow-xl">
            <CardHeader>
                <Input 
                  placeholder="Buscar empleado por nombre, usuario o rol..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre Completo</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Especialidad</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmpleados.map((empleado, index) => (
                    <motion.tr 
                      key={empleado.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="hover:bg-muted/50"
                    >
                      <TableCell>{empleado.nombreCompleto}</TableCell>
                      <TableCell>{empleado.username}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-accent text-accent-foreground">
                          <ShieldCheck className="mr-1 h-3 w-3" /> {empleado.rol}
                        </span>
                      </TableCell>
                      <TableCell>{empleado.especialidadCategoria || 'N/A'}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(empleado)} className="text-blue-500 hover:text-blue-700" title="Editar">
                          <Edit className="h-4 w-4" />
                        </Button>
                        {currentUser && empleado.id !== currentUser.id && (
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(empleado.id)} className="text-red-500 hover:text-red-700" title="Eliminar">
                            <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
               {filteredEmpleados.length === 0 && (
                 <p className="text-center py-8 text-muted-foreground">No se encontraron empleados.</p>
               )}
            </CardContent>
             <CardFooter>
              <div className="text-xs text-muted-foreground">
                Total de empleados: {users.length}.
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      );
    };

    export default GestionEmpleadosPage;
  