"""kata title and statement i18n

Revision ID: e1b7c3a9d4f2
Revises: 40f9a77bdf86
Create Date: 2026-10-11 10:00:00.000000

"""

import sqlalchemy as sa
import sqlmodel

from alembic import op

# revision identifiers, used by Alembic.
revision = "e1b7c3a9d4f2"
down_revision = "40f9a77bdf86"
branch_labels = None
depends_on = None


def upgrade():
    # Les textes existants sont en français : ils deviennent {"fr": texte}
    for column in ("title", "statement"):
        op.alter_column(
            "kata",
            column,
            type_=sa.JSON(),
            existing_nullable=False,
            postgresql_using=f"json_build_object('fr', {column})",
        )


def downgrade():
    for column in ("title", "statement"):
        op.alter_column(
            "kata",
            column,
            type_=sqlmodel.sql.sqltypes.AutoString(),
            existing_nullable=False,
            postgresql_using=f"{column}->>'fr'",
        )
