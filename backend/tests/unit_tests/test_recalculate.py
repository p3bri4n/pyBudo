from sqlmodel import Session, select

from app.model import DisciplineProgression, Kata, Progression
from app.services.recalculate import (
    core_rank_status,
    highest_rank,
    recalculate_progression,
)
from tests.data.base_entity_helper import BaseEntityHelper


class TestsHighestRank(BaseEntityHelper):
    def test_highest_rank_returns_highest_rank(self):
        ranks = ["kyu_10", "kyu_3", "kyu_7"]
        result = highest_rank(ranks)
        assert result == "kyu_3"

    def test_highest_rank_is_none(self):
        assert highest_rank([]) is None


CORE_KATAS = [
    Kata(id="a", rank="kyu_10", discipline="core"),
    Kata(id="b", rank="kyu_10", discipline="core"),
    Kata(id="c", rank="kyu_8", discipline="core"),
    Kata(id="d", rank="kyu_5", discipline="core"),
]


class TestsCoreRankStatus:
    def test_beginner_starts_at_lowest_rank(self):
        assert core_rank_status(CORE_KATAS, set()) == (None, "kyu_10")

    def test_rank_is_not_obtained_until_all_its_katas_are_completed(self):
        assert core_rank_status(CORE_KATAS, {"a"}) == (None, "kyu_10")

    def test_completed_rank_moves_to_next_rank_with_katas(self):
        assert core_rank_status(CORE_KATAS, {"a", "b"}) == ("kyu_10", "kyu_8")
        assert core_rank_status(CORE_KATAS, {"a", "b", "c"}) == ("kyu_8", "kyu_5")

    def test_lower_rank_must_be_completed_first(self):
        # Réussir un kata d'un rang supérieur ne donne pas ce rang
        assert core_rank_status(CORE_KATAS, {"a", "c"}) == (None, "kyu_10")

    def test_all_katas_completed(self):
        assert core_rank_status(CORE_KATAS, {"a", "b", "c", "d"}) == ("kyu_5", None)

    def test_new_kata_in_obtained_rank_keeps_rank(self):
        # "b" est un nouveau kata kyu_10 que l'utilisateur n'a pas fait
        assert core_rank_status(CORE_KATAS, {"a"}, obtained_dan="kyu_10") == (
            "kyu_10",
            "kyu_8",
        )

    def test_obtained_rank_counts_as_completed_to_go_higher(self):
        # "b" ajouté après coup ne bloque pas l'obtention des rangs supérieurs
        assert core_rank_status(CORE_KATAS, {"a", "c"}, obtained_dan="kyu_10") == (
            "kyu_8",
            "kyu_5",
        )


class TestRecalculateProgression(BaseEntityHelper):
    def test_new_kata_in_obtained_rank_keeps_core_dan(self, session: Session):
        user_id = 1
        progression = self._add_progression(session, user_id)
        self._add_completed_kata(
            session, user_id, kata_id="kyu_10_addition", rank="kyu_10"
        )
        recalculate_progression(user_id, session)
        assert progression.core_dan == "kyu_10"

        # L'admin ajoute deux katas kyu_10, l'utilisateur n'en réussit qu'un
        self._add_kata(session, id="kyu_10_soustraction", rank="kyu_10")
        self._add_kata(session, id="kyu_10_multiplication", rank="kyu_10")
        self._add_completion(session, user_id, kata_id="kyu_10_soustraction")
        recalculate_progression(user_id, session)

        assert progression.core_dan == "kyu_10"

    def test_core_dan_waits_for_every_kata_of_the_rank(self, session: Session):
        user_id = 1
        progression = self._add_progression(session, user_id)
        self._add_kata(session, id="kyu_10_soustraction", rank="kyu_10")
        self._add_completed_kata(
            session, user_id, kata_id="kyu_10_addition", rank="kyu_10"
        )

        recalculate_progression(user_id, session)

        assert progression.core_dan is None

        self._add_completion(session, user_id, kata_id="kyu_10_soustraction")
        recalculate_progression(user_id, session)

        assert progression.core_dan == "kyu_10"

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

    def test_orphan_kata_completion_keeps_obtained_rank(self, session: Session):
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

        kata = session.get(Kata, "kyu_1_modulo")
        session.delete(kata)

        recalculate_progression(user_id, session)

        progression: Progression = session.exec(
            select(Progression).where(Progression.user_id == user_id)
        ).one()

        # La réussite orpheline est ignorée mais le rang obtenu n'est jamais retiré
        assert progression.core_dan == "kyu_1"

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
