"""adding a file_name column to cv table

Revision ID: 56f7b440c04a
Revises: c688b0c3033a
Create Date: 2025-10-06 00:48:08.060457

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '56f7b440c04a'
down_revision: Union[str, Sequence[str], None] = 'c688b0c3033a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add the new column first
    op.add_column('cvs', sa.Column('file_name', sa.String(), nullable=True))
    
    # For SQLite, use batch operations to recreate the table with the new constraint
    with op.batch_alter_table('interviews') as batch_op:
        # This will drop and recreate foreign key with CASCADE
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.create_foreign_key(
            'fk_interviews_cv_id_cvs',
            'cvs',
            ['cv_id'],
            ['id'],
            ondelete='CASCADE'
        )


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table('interviews') as batch_op:
        batch_op.drop_constraint('fk_interviews_cv_id_cvs', type_='foreignkey')
        batch_op.create_foreign_key(
            'fk_interviews_cv_id_cvs',
            'cvs',
            ['cv_id'],
            ['id']
        )
    
    op.drop_column('cvs', 'file_name')