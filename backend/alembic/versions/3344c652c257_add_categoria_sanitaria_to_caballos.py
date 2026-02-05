"""add categoria_sanitaria to caballos

Revision ID: 3344c652c257
Revises: ada89328ced7
Create Date: 2026-02-05 17:12:01.832884

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '3344c652c257'
down_revision = 'ada89328ced7'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Crear enum type si no existe
    op.execute("CREATE TYPE categoriasanitariaenum AS ENUM ('A', 'B')")

    # Agregar columna categoria_sanitaria
    op.add_column(
        'caballos',
        sa.Column('categoria_sanitaria', sa.Enum('A', 'B', name='categoriasanitariaenum'), nullable=True)
    )


def downgrade() -> None:
    # Eliminar columna
    op.drop_column('caballos', 'categoria_sanitaria')

    # Eliminar enum type
    op.execute("DROP TYPE categoriasanitariaenum")
