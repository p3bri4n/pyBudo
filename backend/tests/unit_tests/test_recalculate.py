from sqlmodel import select

from app.model import DisciplineProgression, Kata, KataCompletion, Progression
from app.services.recalculate import highest_rank, recalculate_progression
from tests.data.base_entity_helper import BaseEntityHelper


class HighestRankEntityHelper(BaseEntityHelper):
    def test_highest_rank_returns_highest_rank(self):
        ranks = ["kyu_10", "kyu_3", "kyu_7"]
        result = highest_rank(ranks)
        assert result == "kyu_3"


class TestRecalculateProgression:
    def test_recalculate_progression(self, session):
        # prepare
        user_id = 1
        kata1 = Kata(
            id="1",
            rank="kyu_10",
            discipline="core",
            title="core 1",
            statement="Écrivez une fonction qui reçoit deux entiers et renvoie leur somme.",
            signature="def additionner(a: int, b: int) -> int:",
            solution_reference="def additionner(a, b):\n    return a + b",
        )

        kata2 = Kata(
            id="2",
            rank="kyu_2",
            discipline="django",
            title="django 2",
            statement="Écrivez une fonction qui reçoit un entier et renvoie True s'il est pair, False sinon",
            signature="def est_pair(n: int) -> bool:",
            solution_reference="def est_pair(n):\n"
            "if n % 2 == 0:\n"
            "return True\n"
            "else:\n"
            "return False",
        )
        progression = Progression(
            user_id=user_id,
            core_dan=None,
        )
        completion1 = KataCompletion(
            user_id=user_id,
            kata_id="1",
        )

        completion2 = KataCompletion(
            user_id=user_id,
            kata_id="2",
        )
        session.add_all(
            [
                kata1,
                kata2,
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
