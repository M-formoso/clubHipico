"""increase_altura_precision

Revision ID: 51cf166c97d7
Revises: 3344c652c257
Create Date: 2026-02-06 12:51:07.780837

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '51cf166c97d7'
down_revision = '3344c652c257'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Aumentar precisión de altura de NUMERIC(4,2) a NUMERIC(5,2)
    op.alter_column('caballos', 'altura',
                    type_=sa.Numeric(precision=5, scale=2),
                    existing_type=sa.Numeric(precision=4, scale=2),
                    existing_nullable=True)


def downgrade() -> None:
    # Revertir a NUMERIC(4,2)
    op.alter_column('caballos', 'altura',
                    type_=sa.Numeric(precision=4, scale=2),
                    existing_type=sa.Numeric(precision=5, scale=2),
                    existing_nullable=True)
