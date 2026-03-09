"""add comprobantes module

Revision ID: a2b3c4d5e6f7
Revises: d1e2f3a4b5c6
Create Date: 2024-03-09 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'a2b3c4d5e6f7'
down_revision: Union[str, None] = 'd1e2f3a4b5c6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create enums using raw SQL with IF NOT EXISTS
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE tipocomprobanteenum AS ENUM ('factura', 'recibo', 'nota_credito', 'nota_debito', 'presupuesto');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """)

    op.execute("""
        DO $$ BEGIN
            CREATE TYPE estadocomprobanteenum AS ENUM ('borrador', 'emitido', 'pagado_parcial', 'pagado_total', 'anulado', 'vencido');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """)

    # Add 'aplicado_parcial' to estado_pago enum
    op.execute("ALTER TYPE estadopagoenum ADD VALUE IF NOT EXISTS 'aplicado_parcial'")

    # Check if comprobantes table exists
    conn = op.get_bind()
    result = conn.execute(sa.text("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'comprobantes')"))
    table_exists = result.scalar()

    if not table_exists:
        # Create comprobantes table
        op.create_table('comprobantes',
            sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column('tipo', postgresql.ENUM('factura', 'recibo', 'nota_credito', 'nota_debito', 'presupuesto', name='tipocomprobanteenum', create_type=False), nullable=False),
            sa.Column('numero', sa.Integer(), nullable=False),
            sa.Column('punto_venta', sa.Integer(), nullable=False, server_default='1'),
            sa.Column('numero_completo', sa.String(20), nullable=False),
            sa.Column('cliente_id', postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column('fecha_emision', sa.Date(), nullable=False),
            sa.Column('fecha_vencimiento', sa.Date(), nullable=True),
            sa.Column('subtotal', sa.Numeric(12, 2), nullable=False, server_default='0'),
            sa.Column('descuento_porcentaje', sa.Numeric(5, 2), nullable=True, server_default='0'),
            sa.Column('descuento_monto', sa.Numeric(12, 2), nullable=True, server_default='0'),
            sa.Column('iva_porcentaje', sa.Numeric(5, 2), nullable=True, server_default='0'),
            sa.Column('iva_monto', sa.Numeric(12, 2), nullable=True, server_default='0'),
            sa.Column('total', sa.Numeric(12, 2), nullable=False),
            sa.Column('monto_pagado', sa.Numeric(12, 2), nullable=True, server_default='0'),
            sa.Column('saldo_pendiente', sa.Numeric(12, 2), nullable=False),
            sa.Column('estado', postgresql.ENUM('borrador', 'emitido', 'pagado_parcial', 'pagado_total', 'anulado', 'vencido', name='estadocomprobanteenum', create_type=False), nullable=False, server_default='borrador'),
            sa.Column('concepto_general', sa.String(255), nullable=True),
            sa.Column('observaciones', sa.Text(), nullable=True),
            sa.Column('condicion_pago', sa.String(100), nullable=True),
            sa.Column('comprobante_relacionado_id', postgresql.UUID(as_uuid=True), nullable=True),
            sa.Column('pdf_url', sa.String(500), nullable=True),
            sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=True),
            sa.Column('anulado_por', postgresql.UUID(as_uuid=True), nullable=True),
            sa.Column('fecha_anulacion', sa.DateTime(), nullable=True),
            sa.Column('motivo_anulacion', sa.String(255), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=False),
            sa.Column('updated_at', sa.DateTime(), nullable=False),
            sa.ForeignKeyConstraint(['cliente_id'], ['clientes.id'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['comprobante_relacionado_id'], ['comprobantes.id'], ondelete='SET NULL'),
            sa.ForeignKeyConstraint(['created_by'], ['usuarios.id'], ondelete='SET NULL'),
            sa.ForeignKeyConstraint(['anulado_por'], ['usuarios.id'], ondelete='SET NULL'),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('numero_completo')
        )
        op.create_index('ix_comprobantes_cliente_id', 'comprobantes', ['cliente_id'])
        op.create_index('ix_comprobantes_fecha_emision', 'comprobantes', ['fecha_emision'])
        op.create_index('ix_comprobantes_tipo', 'comprobantes', ['tipo'])
        op.create_index('ix_comprobantes_estado', 'comprobantes', ['estado'])

    # Check if comprobante_items table exists
    result = conn.execute(sa.text("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'comprobante_items')"))
    items_table_exists = result.scalar()

    if not items_table_exists:
        # Create comprobante_items table
        op.create_table('comprobante_items',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('comprobante_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('descripcion', sa.String(255), nullable=False),
        sa.Column('cantidad', sa.Numeric(10, 2), nullable=False, server_default='1'),
        sa.Column('precio_unitario', sa.Numeric(12, 2), nullable=False),
        sa.Column('descuento_porcentaje', sa.Numeric(5, 2), nullable=True, server_default='0'),
        sa.Column('subtotal', sa.Numeric(12, 2), nullable=False),
        sa.Column('tipo_servicio', sa.String(50), nullable=True),
        sa.Column('orden', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['comprobante_id'], ['comprobantes.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index('ix_comprobante_items_comprobante_id', 'comprobante_items', ['comprobante_id'])

    # Check if pagos_comprobantes table exists
    result = conn.execute(sa.text("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'pagos_comprobantes')"))
    pagos_comp_table_exists = result.scalar()

    if not pagos_comp_table_exists:
        # Create pagos_comprobantes table (many-to-many for partial payments)
        op.create_table('pagos_comprobantes',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('pago_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('comprobante_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('monto_aplicado', sa.Numeric(12, 2), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['pago_id'], ['pagos.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['comprobante_id'], ['comprobantes.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index('ix_pagos_comprobantes_pago_id', 'pagos_comprobantes', ['pago_id'])
        op.create_index('ix_pagos_comprobantes_comprobante_id', 'pagos_comprobantes', ['comprobante_id'])

    # Check if movimientos_cuenta table exists
    result = conn.execute(sa.text("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'movimientos_cuenta')"))
    mov_table_exists = result.scalar()

    if not mov_table_exists:
        # Create movimientos_cuenta table
        op.create_table('movimientos_cuenta',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('cliente_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tipo', sa.String(20), nullable=False),
        sa.Column('comprobante_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('pago_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('descripcion', sa.String(255), nullable=False),
        sa.Column('monto', sa.Numeric(12, 2), nullable=False),
        sa.Column('saldo_anterior', sa.Numeric(12, 2), nullable=False),
        sa.Column('saldo_posterior', sa.Numeric(12, 2), nullable=False),
        sa.Column('fecha', sa.Date(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['cliente_id'], ['clientes.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['comprobante_id'], ['comprobantes.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['pago_id'], ['pagos.id'], ondelete='SET NULL'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index('ix_movimientos_cuenta_cliente_id', 'movimientos_cuenta', ['cliente_id'])
        op.create_index('ix_movimientos_cuenta_fecha', 'movimientos_cuenta', ['fecha'])

    # Add new columns to pagos table if they don't exist
    columns_result = conn.execute(sa.text("""
        SELECT column_name FROM information_schema.columns
        WHERE table_name = 'pagos' AND column_name IN ('numero_recibo', 'numero_recibo_completo', 'monto_aplicado', 'monto_disponible')
    """))
    existing_columns = [row[0] for row in columns_result]

    if 'numero_recibo' not in existing_columns:
        op.add_column('pagos', sa.Column('numero_recibo', sa.Integer(), nullable=True))
    if 'numero_recibo_completo' not in existing_columns:
        op.add_column('pagos', sa.Column('numero_recibo_completo', sa.String(20), nullable=True))
    if 'monto_aplicado' not in existing_columns:
        op.add_column('pagos', sa.Column('monto_aplicado', sa.Numeric(12, 2), nullable=True, server_default='0'))
    if 'monto_disponible' not in existing_columns:
        op.add_column('pagos', sa.Column('monto_disponible', sa.Numeric(12, 2), nullable=True))


def downgrade() -> None:
    # Remove columns from pagos
    op.drop_column('pagos', 'monto_disponible')
    op.drop_column('pagos', 'monto_aplicado')
    op.drop_column('pagos', 'numero_recibo_completo')
    op.drop_column('pagos', 'numero_recibo')

    # Drop tables
    op.drop_index('ix_movimientos_cuenta_fecha', table_name='movimientos_cuenta')
    op.drop_index('ix_movimientos_cuenta_cliente_id', table_name='movimientos_cuenta')
    op.drop_table('movimientos_cuenta')

    op.drop_index('ix_pagos_comprobantes_comprobante_id', table_name='pagos_comprobantes')
    op.drop_index('ix_pagos_comprobantes_pago_id', table_name='pagos_comprobantes')
    op.drop_table('pagos_comprobantes')

    op.drop_index('ix_comprobante_items_comprobante_id', table_name='comprobante_items')
    op.drop_table('comprobante_items')

    op.drop_index('ix_comprobantes_estado', table_name='comprobantes')
    op.drop_index('ix_comprobantes_tipo', table_name='comprobantes')
    op.drop_index('ix_comprobantes_fecha_emision', table_name='comprobantes')
    op.drop_index('ix_comprobantes_cliente_id', table_name='comprobantes')
    op.drop_table('comprobantes')

    # Drop enums
    op.execute("DROP TYPE IF EXISTS estadocomprobanteenum")
    op.execute("DROP TYPE IF EXISTS tipocomprobanteenum")
