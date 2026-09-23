from typing import get_args

from app.rank import RANK_ORDER, Rank
from tests.data.test_base import TestBase


class TestRanks(TestBase):
    def test_all_ranks_are_defined(self):
        ranks = get_args(Rank)
        assert len(ranks) == 15
        assert "kyu_10" in ranks
        assert "godan" in ranks

    def test_rank_order(self):
        assert RANK_ORDER["kyu_10"] == 0
        assert RANK_ORDER["kyu_9"] == 1
        assert RANK_ORDER["kyu_1"] == 9
        assert RANK_ORDER["shodan"] == 10
        assert RANK_ORDER["godan"] == 14

    def test_rank_order_is_increasing(self):
        ranks = get_args(Rank)
        for i in range(len(ranks) - 1):
            current_rank = ranks[i]
            next_rank = ranks[i + 1]
            assert RANK_ORDER[current_rank] < RANK_ORDER[next_rank]
