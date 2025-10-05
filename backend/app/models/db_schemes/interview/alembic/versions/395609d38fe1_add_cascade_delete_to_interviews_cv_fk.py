"""add_cascade_delete_to_interviews_cv_fk

Revision ID: 395609d38fe1
Revises: c688b0c3033a
Create Date: 2025-10-05 00:25:26.269234

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '395609d38fe1'
down_revision: Union[str, Sequence[str], None] = 'c688b0c3033a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade():
    # Use batch operations for SQLite
    with op.batch_alter_table('interviews') as batch_op:
        batch_op.drop_constraint('interviews_cv_id_fkey', type_='foreignkey')
        batch_op.create_foreign_key(
            'interviews_cv_id_fkey', 
            'cvs', 
            ['cv_id'], 
            ['id'],
            ondelete='CASCADE'
        )

def downgrade():
    # Revert back to no cascade
    with op.batch_alter_table('interviews') as batch_op:
        batch_op.drop_constraint('interviews_cv_id_fkey', type_='foreignkey')
        batch_op.create_foreign_key(
            'interviews_cv_id_fkey', 
            'cvs', 
            ['cv_id'], 
            ['id']
        )