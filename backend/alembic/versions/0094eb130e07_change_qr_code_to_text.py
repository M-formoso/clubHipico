"""change_qr_code_to_text

Revision ID: 0094eb130e07
Revises: 51cf166c97d7
Create Date: 2026-02-06 13:01:46.231007

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0094eb130e07'
down_revision = '51cf166c97d7'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Cambiar qr_code de VARCHAR(500) a TEXT para soportar QR codes grandes en base64
    op.alter_column('caballos', 'qr_code',
                    type_=sa.Text(),
                    existing_type=sa.String(length=500),
                    existing_nullable=True)


def downgrade() -> None:
    # Revertir a VARCHAR(500)
    op.alter_column('caballos', 'qr_code',
                    type_=sa.String(length=500),
                    existing_type=sa.Text(),
                    existing_nullable=True)
