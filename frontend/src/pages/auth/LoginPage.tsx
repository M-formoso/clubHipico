import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LogIn, Waves, Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  dni: z.string().min(7, 'El DNI debe tener al menos 7 caracteres').max(20, 'DNI inválido'),
  password: z.string().min(4, 'La contraseña debe tener al menos 4 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginFormData) => authService.login(data.dni, data.password),
    onSuccess: (response) => {
      login(response.user, response.access_token, response.refresh_token);
      toast({
        title: 'Inicio de sesión exitoso',
        description: `Bienvenido al sistema`,
      });
      navigate('/dashboard');
    },
    onError: (error: any) => {
      toast({
        title: 'Error al iniciar sesión',
        description: error.response?.data?.detail || 'Credenciales inválidas',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-beige-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center">
            <img
              src="/logo.jpeg"
              alt="Club Ecuestre Logo"
              className="w-32 h-32 object-contain rounded-lg"
            />
          </div>
        </div>

        <Card className="w-full shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Iniciar Sesión</CardTitle>
            <CardDescription className="text-center">
              Ingresa tus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dni">DNI / Usuario</Label>
                <Input
                  id="dni"
                  type="text"
                  placeholder="12345678"
                  {...register('dni')}
                  className={errors.dni ? 'border-red-500' : ''}
                  autoComplete="username"
                />
                {errors.dni && (
                  <p className="text-sm text-red-500">{errors.dni.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('password')}
                    className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <span className="mr-2">Iniciando sesión...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Iniciar Sesión
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>Solo usuarios autorizados pueden acceder</p>
              <p className="mt-1">Contacta al administrador para obtener credenciales</p>
            </div>
          </CardContent>
        </Card>

        {/* Credenciales de prueba (temporal - solo para desarrollo) */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <p className="font-semibold text-blue-900 mb-2">Credenciales de prueba:</p>
          <div className="space-y-1 text-blue-800">
            <p><strong>Admin:</strong> DNI: <code className="bg-blue-100 px-1 rounded">99999999</code> / Pass: <code className="bg-blue-100 px-1 rounded">admin123</code></p>
            <p><strong>Empleado:</strong> DNI: <code className="bg-blue-100 px-1 rounded">12345678</code> / Pass: <code className="bg-blue-100 px-1 rounded">password</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}
