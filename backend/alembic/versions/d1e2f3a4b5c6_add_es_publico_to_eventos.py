"""add es_publico to eventos

Revision ID: d1e2f3a4b5c6
Revises: c81481935e3e
Create Date: 2024-03-04 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd1e2f3a4b5c6'
down_revision: Union[str, None] = 'c81481935e3e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('eventos', sa.Column('es_publico', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('eventos', sa.Column('imagen_url', sa.String(500), nullable=True))


def downgrade() -> None:
    op.drop_column('eventos', 'imagen_url')
    op.drop_column('eventos', 'es_publico')
