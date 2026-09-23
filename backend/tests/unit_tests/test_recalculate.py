from sqlmodel import select

from app.model import DisciplineProgression, KataCompletion, Progression
from app.services.recalculate import highest_rank, recalculate_progression
from tests.data.base_entity_helper import BaseEntityHelper


class TestsHighestRank(BaseEntityHelper):
    def test_highest_rank_returns_highest_rank(self):
        ranks = ["kyu_10", "kyu_3", "kyu_7"]
        result = highest_rank(ranks)
        assert result == "kyu_3"


class TestRecalculateProgression(BaseEntityHelper):
    def test_recalculate_progression(self, session):
        # prepare
        user_id = 1
        kata1 = self._add_kata(
            session=session,
            id="kyu_10_addition",
            rank="kyu_10",
            discipline="core",
        )

        kata2 = self._add_kata(
            session=session,
            id="kyu_2_check_pair",
            rank="kyu_2",
            discipline="django",
        )

        progression = Progression(
            user_id=user_id,
            core_dan=None,
        )
        completion1 = KataCompletion(
            user_id=user_id,
            kata_id=kata1.id,
        )

        completion2 = KataCompletion(
            user_id=user_id,
            kata_id=kata2.id,
        )
        session.add_all(
            [
                progression,
                completion1,
                completion2,
            ]
        )
        session.commit()

        # act
        recalculate_progression(user_id, session)
        session.refresh(progression)

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
