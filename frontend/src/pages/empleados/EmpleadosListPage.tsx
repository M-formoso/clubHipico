import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { empleadoService } from '@/services/empleadoService';
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

export function EmpleadosListPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: empleados, isLoading } = useQuery({
    queryKey: ['empleados'],
    queryFn: () => empleadoService.getAll(),
  });

  const getFuncionBadgeColor = (funcion: string) => {
    switch (funcion) {
      case 'veterinario':
        return 'bg-blue-100 text-blue-800';
      case 'instructor':
        return 'bg-green-100 text-green-800';
      case 'cuidador':
        return 'bg-yellow-100 text-yellow-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'mantenimiento':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando empleados...</div>
      </div>
    );
  }

  const filteredEmpleados = empleados?.filter(
    (empleado) =>
      empleado.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      empleado.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      empleado.dni?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Empleados</h1>
          <p className="text-gray-500 mt-1">
            Gestiona el personal del club ecuestre
          </p>
        </div>
        <Button onClick={() => navigate('/empleados/nuevo')}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Empleado
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre, apellido o DNI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>DNI</TableHead>
              <TableHead>Función</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmpleados?.map((empleado) => (
              <TableRow
                key={empleado.id}
                className="cursor-pointer"
                onClick={() => navigate(`/empleados/${empleado.id}`)}
              >
                <TableCell className="font-medium">
                  {empleado.nombre} {empleado.apellido}
                </TableCell>
                <TableCell>{empleado.dni || '-'}</TableCell>
                <TableCell>
                  <Badge
                    className={getFuncionBadgeColor(empleado.funcion)}
                    variant="outline"
                  >
                    {empleado.funcion}
                  </Badge>
                </TableCell>
                <TableCell>{empleado.telefono || '-'}</TableCell>
                <TableCell>
                  <Badge variant={empleado.activo ? 'success' : 'destructive'}>
                    {empleado.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/empleados/${empleado.id}/editar`);
                    }}
                  >
                    Editar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredEmpleados?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No se encontraron empleados</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate('/empleados/nuevo')}
          >
            Crear primer empleado
          </Button>
        </div>
      )}
    </div>
  );
}
