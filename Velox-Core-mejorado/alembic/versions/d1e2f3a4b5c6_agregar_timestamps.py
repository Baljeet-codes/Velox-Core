"""agregar timestamps a pedidos

Revision ID: d1e2f3a4b5c6
Revises: 6e5605b00808
Create Date: 2026-05-18

"""
from alembic import op
import sqlalchemy as sa

revision = 'd1e2f3a4b5c6'
down_revision = '6e5605b00808'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('pedidos', sa.Column(
        'creado_en',
        sa.DateTime(timezone=True),
        server_default=sa.text('NOW()'),
        nullable=True,
    ))


def downgrade() -> None:
    op.drop_column('pedidos', 'creado_en')
