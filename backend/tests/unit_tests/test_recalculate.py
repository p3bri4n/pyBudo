from sqlmodel import Session, select

from app.model import DisciplineProgression, Kata, Progression
from app.services.recalculate import highest_rank, recalculate_progression
from tests.data.base_entity_helper import BaseEntityHelper


class TestsHighestRank(BaseEntityHelper):
    def test_highest_rank_returns_highest_rank(self):
        ranks = ["kyu_10", "kyu_3", "kyu_7"]
        result = highest_rank(ranks)
        assert result == "kyu_3"

    def test_highest_rank_is_none(self):
        assert highest_rank([]) is None


class TestRecalculateProgression(BaseEntityHelper):
    def test_recalculate_progression(self, session: Session):
        # prepare
        user_id = 1

        progression = self._add_progression(session, user_id)

        self._add_completed_kata(
            session,
            user_id,
            kata_id="kyu_10_addition",
            rank="kyu_10",
            discipline="core",
        )

        self._add_completed_kata(
            session,
            user_id,
            kata_id="kyu_2_check_pair",
            rank="kyu_2",
            discipline="django",
        )

        # act
        recalculate_progression(user_id, session)

        dp = session.exec(
            select(DisciplineProgression).where(
                DisciplineProgression.user_id == user_id,
                DisciplineProgression.discipline == "django",
            )
        ).one()
        # assert
        # les deux progressions sont plafonnées au niveau de progression le plus bas
        assert progression.core_dan == "kyu_10"
        assert dp.highest_dan_practiced == "kyu_10"

    # Même qu'au dessus mais avec une etape supplémentaire
    # L'autre test peut etre supprimé jugé comme cas plus necessaire
    def test_raising_core_lifts_discipline(self, session: Session):
        user_id = 1

        progression = self._add_progression(session, user_id)

        self._add_completed_kata(
            session,
            user_id,
            kata_id="kyu_10_addition",
            rank="kyu_10",
            discipline="core",
        )

        self._add_completed_kata(
            session,
            user_id,
            kata_id="kyu_2_check_pair",
            rank="kyu_2",
            discipline="django",
        )

        recalculate_progression(user_id, session)

        dp = session.exec(
            select(DisciplineProgression).where(
                DisciplineProgression.user_id == user_id,
                DisciplineProgression.discipline == "django",
            )
        ).one()

        # Vérifie le plafond est appliqué
        assert progression.core_dan == "kyu_10"
        assert dp.highest_dan_practiced == "kyu_10"

        self._add_completed_kata(
            session,
            user_id,
            kata_id="kyu_1_modulo",
            rank="kyu_1",
            discipline="core",
        )

        recalculate_progression(user_id, session)

        dp = session.exec(
            select(DisciplineProgression).where(
                DisciplineProgression.user_id == user_id,
                DisciplineProgression.discipline == "django",
            )
        ).one()

        # Vérifie que le nouveau plafon est appliqué
        assert progression.core_dan == "kyu_1"
        assert dp.highest_dan_practiced == "kyu_2"

    def test_progression_without_core(self, session: Session):
        # prepare
        user_id = 1

        progression = self._add_progression(session, user_id)

        self._add_completed_kata(
            session,
            user_id,
            kata_id="kyu_2_check_pair",
            rank="kyu_2",
            discipline="django",
        )

        recalculate_progression(user_id, session)

        dps = session.exec(
            select(DisciplineProgression).where(
                DisciplineProgression.user_id == user_id,
            )
        ).all()

        assert progression.core_dan is None
        assert dps == []

    def test_orphan_kata_completion_get_ignored(self, session: Session):
        user_id = 1

        progression = self._add_progression(session, user_id)

        self._add_completed_kata(
            session,
            user_id,
            kata_id="kyu_1_modulo",
            rank="kyu_1",
            discipline="core",
        )

        self._add_completed_kata(
            session,
            user_id,
            kata_id="kyu_10_addition",
            rank="kyu_10",
            discipline="core",
        )

        recalculate_progression(user_id, session)

        assert progression.core_dan == "kyu_1"

        kata1 = session.get(Kata, "kyu_1_modulo")
        session.delete(kata1)

        recalculate_progression(user_id, session)

        progression: Progression = session.exec(
            select(Progression).where(Progression.user_id == user_id)
        ).one()

        assert progression.core_dan == "kyu_10"

    def test_progression_get_deleted(self, session: Session):
        user_id = 1

        self._add_progression(session, user_id)

        self._add_completed_kata(
            session,
            user_id,
            kata_id="kyu_10_addition",
            rank="kyu_10",
            discipline="core",
        )

        completion2 = self._add_completed_kata(
            session,
            user_id,
            kata_id="kyu_2_check_pair",
            rank="kyu_2",
            discipline="django",
        )

        recalculate_progression(user_id, session)

        dp = session.exec(
            select(DisciplineProgression).where(
                DisciplineProgression.user_id == user_id,
                DisciplineProgression.discipline == "django",
            )
        ).first()

        assert dp.discipline == "django"

        session.delete(completion2)
        recalculate_progression(user_id, session)

        dp = session.exec(
            select(DisciplineProgression).where(
                DisciplineProgression.user_id == user_id,
                DisciplineProgression.discipline == "django",
            )
        ).first()

        assert dp is None
