import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { clienteService } from '@/services/clienteService';
import { Cliente } from '@/types/cliente';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const tipoClienteLabels = {
  socio_pleno: 'Socio Pleno',
  pensionista: 'Pensionista',
  alumno: 'Alumno',
};

const tipoClienteColors = {
  socio_pleno: 'bg-purple-100 text-purple-800',
  pensionista: 'bg-blue-100 text-blue-800',
  alumno: 'bg-green-100 text-green-800',
};

const estadoCuentaLabels = {
  al_dia: 'Al Día',
  debe: 'Debe',
  moroso: 'Moroso',
};

const estadoCuentaColors = {
  al_dia: 'bg-green-100 text-green-800',
  debe: 'bg-yellow-100 text-yellow-800',
  moroso: 'bg-red-100 text-red-800',
};

export function ClientesListPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string>('todos');
  const [estadoFilter, setEstadoFilter] = useState<string>('todos');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState<Cliente | null>(null);

  // Si el usuario es cliente, redirigir a su propio perfil
  useEffect(() => {
    if (user?.rol === 'cliente') {
      clienteService.getMe().then((cliente) => {
        navigate(`/clientes/${cliente.id}`);
      }).catch((error) => {
        console.error('Error al obtener perfil de cliente:', error);
        toast({
          title: 'Error',
          description: 'No se pudo cargar tu perfil',
          variant: 'destructive',
        });
      });
    }
  }, [user, navigate, toast]);

  const { data: clientes, isLoading } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => clienteService.getAll(),
    enabled: user?.rol !== 'cliente', // Solo cargar si no es cliente
  });

  const deleteMutation = useMutation({
    mutationFn: clienteService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast({
        title: 'Cliente eliminado',
        description: 'El cliente ha sido eliminado exitosamente.',
      });
      setDeleteDialogOpen(false);
      setClienteToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error al eliminar',
        description: error.response?.data?.detail || 'No se pudo eliminar el cliente.',
        variant: 'destructive',
      });
    },
  });

  const handleDelete = (cliente: Cliente) => {
    setClienteToDelete(cliente);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (clienteToDelete) {
      deleteMutation.mutate(clienteToDelete.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando clientes...</div>
      </div>
    );
  }

  const filteredClientes = clientes?.filter((cliente) => {
    const matchesSearch =
      cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.dni?.includes(searchTerm) ||
      cliente.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTipo = tipoFilter === 'todos' || cliente.tipo_cliente === tipoFilter;
    const matchesEstado =
      estadoFilter === 'todos' || cliente.estado_cuenta === estadoFilter;

    return matchesSearch && matchesTipo && matchesEstado;
  });

  // Calcular estadísticas
  const stats = {
    total: clientes?.length || 0,
    activos: clientes?.filter((c) => c.activo).length || 0,
    alDia: clientes?.filter((c) => c.estado_cuenta === 'al_dia').length || 0,
    morosos: clientes?.filter((c) => c.estado_cuenta === 'moroso').length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500 mt-1">
            Gestiona los clientes del club ecuestre
          </p>
        </div>
        <Button onClick={() => navigate('/clientes/nuevo')}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <UserCheck className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Al Día</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.alDia}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Morosos</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.morosos}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre, DNI o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={tipoFilter}
          onChange={(e) => setTipoFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="todos">Todos los tipos</option>
          <option value="socio_pleno">Socio Pleno</option>
          <option value="pensionista">Pensionista</option>
          <option value="alumno">Alumno</option>
        </select>
        <select
          value={estadoFilter}
          onChange={(e) => setEstadoFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="todos">Todos los estados</option>
          <option value="al_dia">Al Día</option>
          <option value="debe">Debe</option>
          <option value="moroso">Moroso</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>DNI</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Estado Cuenta</TableHead>
              <TableHead>Saldo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClientes?.map((cliente) => (
              <TableRow key={cliente.id}>
                <TableCell className="font-medium">
                  {cliente.nombre} {cliente.apellido}
                </TableCell>
                <TableCell>{cliente.dni || '-'}</TableCell>
                <TableCell>{cliente.email || '-'}</TableCell>
                <TableCell>
                  <Badge
                    className={tipoClienteColors[cliente.tipo_cliente]}
                    variant="outline"
                  >
                    {tipoClienteLabels[cliente.tipo_cliente]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    className={estadoCuentaColors[cliente.estado_cuenta]}
                    variant="outline"
                  >
                    {estadoCuentaLabels[cliente.estado_cuenta]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span
                    className={
                      Number(cliente.saldo) < 0 ? 'text-red-600 font-semibold' : 'text-gray-900'
                    }
                  >
                    ${Number(cliente.saldo || 0).toFixed(2)}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={cliente.activo ? 'default' : 'secondary'}>
                    {cliente.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/clientes/${cliente.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/clientes/${cliente.id}/editar`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(cliente)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredClientes?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No se encontraron clientes</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate('/clientes/nuevo')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Crear primer cliente
          </Button>
        </div>
      )}

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar cliente?</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar a{' '}
              <span className="font-semibold">
                {clienteToDelete?.nombre} {clienteToDelete?.apellido}
              </span>
              ? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
