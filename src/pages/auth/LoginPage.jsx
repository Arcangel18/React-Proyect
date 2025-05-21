
    import React, { useState } from 'react';
    import { useAuth } from '@/contexts/AuthContext';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
    import { LogIn, AlertTriangle } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { useNavigate } from 'react-router-dom';

    const LoginPage = () => {
      const [username, setUsername] = useState('');
      const [password, setPassword] = useState('');
      const [error, setError] = useState('');
      const { login } = useAuth();
      const navigate = useNavigate();

      const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const success = login(username, password);
        if (success) {
          navigate('/'); 
        } else {
          setError('Usuario o contraseña incorrectos.');
        }
      };

      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-accent/10 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="w-full max-w-md shadow-2xl glassmorphic">
              <CardHeader className="text-center">
                <motion.div
                  initial={{ y: -20, opacity: 0}}
                  animate={{ y: 0, opacity: 1}}
                  transition={{delay: 0.2}}
                >
                  <LogIn className="mx-auto h-12 w-12 text-primary mb-2" />
                </motion.div>
                <CardTitle className="text-2xl font-bold text-primary">Iniciar Sesión</CardTitle>
                <CardDescription>Accede a Electrónica Oriental Management</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Usuario</Label>
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Tu nombre de usuario"
                      required
                      className="bg-background/70"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Tu contraseña"
                      required
                      className="bg-background/70"
                    />
                  </div>
                  {error && (
                    <motion.p 
                      initial={{opacity:0, y:10}}
                      animate={{opacity:1, y:0}}
                      className="text-sm text-red-500 flex items-center"
                    >
                      <AlertTriangle className="mr-1 h-4 w-4"/> {error}
                    </motion.p>
                  )}
                  <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white">
                    <LogIn className="mr-2 h-4 w-4" />
                    Entrar
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="text-center text-xs text-muted-foreground">
                 © {new Date().getFullYear()} Electrónica Oriental. Todos los derechos reservados.
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      );
    };

    export default LoginPage;
  