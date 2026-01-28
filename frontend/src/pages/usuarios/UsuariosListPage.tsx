import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { useUsuarios } from '@/hooks/useUsuarios';
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

const rolLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  empleado: 'Empleado',
  cliente: 'Cliente',
};

const rolColors: Record<string, string> = {
  super_admin: 'bg-purple-100 text-purple-800',
  admin: 'bg-blue-100 text-blue-800',
  empleado: 'bg-green-100 text-green-800',
  cliente: 'bg-gray-100 text-gray-800',
};

export function UsuariosListPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: usuarios, isLoading } = useUsuarios();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando usuarios...</div>
      </div>
    );
  }

  const filteredUsuarios = usuarios?.filter(
    (usuario) =>
      usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.dni?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-gray-500 mt-1">
            Gestiona los usuarios y permisos del sistema
          </p>
        </div>
        <Button onClick={() => navigate('/usuarios/nuevo')}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre, email o DNI..."
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
              <TableHead>Email</TableHead>
              <TableHead>DNI</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Función</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsuarios?.map((usuario) => (
              <TableRow
                key={usuario.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => navigate(`/usuarios/${usuario.id}`)}
              >
                <TableCell className="font-medium">
                  {usuario.nombre} {usuario.apellido}
                </TableCell>
                <TableCell>{usuario.email}</TableCell>
                <TableCell>{usuario.dni || '-'}</TableCell>
                <TableCell>
                  <Badge
                    className={rolColors[usuario.rol]}
                    variant="outline"
                  >
                    {rolLabels[usuario.rol]}
                  </Badge>
                </TableCell>
                <TableCell>
                  {usuario.funcion ? (
                    <span className="text-sm text-gray-600 capitalize">
                      {usuario.funcion}
                    </span>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={usuario.activo ? 'default' : 'destructive'}>
                    {usuario.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/usuarios/${usuario.id}/editar`);
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

      {filteredUsuarios?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No se encontraron usuarios</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate('/usuarios/nuevo')}
          >
            Crear primer usuario
          </Button>
        </div>
      )}
    </div>
  );
}
