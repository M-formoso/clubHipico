import { useParams, useNavigate } from 'react-router-dom';
import { useAlerta, useMarcarLeida, useDeleteAlerta } from '@/hooks/useAlertas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Trash2, ExternalLink } from 'lucide-react';
import { Prioridad } from '@/types/alerta';

const PRIORIDAD_COLORS: Record<Prioridad, string> = {
  baja: 'bg-blue-100 text-blue-800',
  media: 'bg-yellow-100 text-yellow-800',
  alta: 'bg-orange-100 text-orange-800',
  critica: 'bg-red-100 text-red-800',
};

export function AlertaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: alerta, isLoading } = useAlerta(id!);
  const marcarLeidaMutation = useMarcarLeida();
  const deleteAlertaMutation = useDeleteAlerta();

  const handleDelete = async () => {
    if (confirm('¿Eliminar esta alerta?')) {
      await deleteAlertaMutation.mutateAsync(id!);
      navigate('/alertas');
    }
  };

  const handleVerEntidad = () => {
    if (alerta?.entidad_relacionada_tipo && alerta?.entidad_relacionada_id) {
      navigate(`/${alerta.entidad_relacionada_tipo}s/${alerta.entidad_relacionada_id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando alerta...</div>
      </div>
    );
  }

  if (!alerta) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Alerta no encontrada</div>
      </div>
    );
  }

  // Marcar como leída al ver
  if (!alerta.leida) {
    marcarLeidaMutation.mutate(alerta.id);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/alertas')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{alerta.titulo}</h1>
            <p className="text-gray-500 mt-1">
              {new Date(alerta.created_at).toLocaleString('es-ES')}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-3">
        <Badge className={PRIORIDAD_COLORS[alerta.prioridad]}>
          Prioridad: {alerta.prioridad}
        </Badge>
        <Badge variant="outline" className="capitalize">
          Tipo: {alerta.tipo}
        </Badge>
        {alerta.leida && <Badge variant="secondary">Leída</Badge>}
      </div>

      {/* Contenido */}
      <Card>
        <CardHeader>
          <CardTitle>Mensaje</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 whitespace-pre-wrap">{alerta.mensaje}</p>
        </CardContent>
      </Card>

      {/* Entidad Relacionada */}
      {alerta.entidad_relacionada_tipo && alerta.entidad_relacionada_id && (
        <Card>
          <CardHeader>
            <CardTitle>Entidad Relacionada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tipo</p>
                <p className="font-medium capitalize">{alerta.entidad_relacionada_tipo}</p>
              </div>
              <Button variant="outline" onClick={handleVerEntidad}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Ver Detalle
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Datos Adicionales */}
      {alerta.datos_adicionales && Object.keys(alerta.datos_adicionales).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Información Adicional</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              {Object.entries(alerta.datos_adicionales).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-600 capitalize">
                    {key.replace(/_/g, ' ')}:
                  </dt>
                  <dd className="text-sm text-gray-900">{String(value)}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
