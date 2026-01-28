import { useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft } from 'lucide-react';
import { useTiposAlerta, useToggleTipoAlerta, useDeleteTipoAlerta } from '@/hooks/useAlertas';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function TiposAlertaPage() {
  const navigate = useNavigate();
  const { data: tipos = [], isLoading } = useTiposAlerta();
  const toggleMutation = useToggleTipoAlerta();
  const deleteMutation = useDeleteTipoAlerta();

  const handleToggle = (id: string, activo: boolean) => {
    toggleMutation.mutate({ id, activo: !activo });
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar este tipo de alerta?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/alertas')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tipos de Alertas</h1>
            <p className="text-gray-500 mt-1">
              Configura los tipos de alertas y su comportamiento
            </p>
          </div>
        </div>
        <Button onClick={() => navigate('/alertas/tipos/nuevo')}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Tipo
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 text-center text-gray-500">Cargando...</div>
          ) : tipos.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              No hay tipos de alerta configurados
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Activo</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Prioridad</TableHead>
                  <TableHead>Frecuencia</TableHead>
                  <TableHead>Canales</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tipos.map((tipo) => (
                  <TableRow key={tipo.id}>
                    <TableCell>
                      <Checkbox
                        checked={tipo.activo}
                        onCheckedChange={() => handleToggle(tipo.id, tipo.activo)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{tipo.nombre}</TableCell>
                    <TableCell className="capitalize">{tipo.tipo}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {tipo.prioridad_default}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">{tipo.frecuencia.replace(/_/g, ' ')}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {tipo.canal_sistema && <Badge variant="secondary">Sistema</Badge>}
                        {tipo.canal_email && <Badge variant="secondary">Email</Badge>}
                        {tipo.canal_push && <Badge variant="secondary">Push</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/alertas/tipos/${tipo.id}/editar`)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(tipo.id)}
                          className="hover:text-red-600"
                        >
                          Eliminar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
