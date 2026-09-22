from app.rank import Rank, RANK_ORDER
from typing import get_args


def test_all_ranks_are_defined():
    ranks = get_args(Rank)
    assert len(ranks) == 15
    assert "kyu_10" in ranks
    assert "godan" in ranks


def test_rank_order():
    assert RANK_ORDER["kyu_10"] == 0
    assert RANK_ORDER["kyu_9"] == 1
    assert RANK_ORDER["kyu_1"] == 9
    assert RANK_ORDER["shodan"] == 10
    assert RANK_ORDER["godan"] == 14


def test_rank_order_is_increasing():
    ranks = get_args(Rank)
    for i in range(len(ranks) - 1):
        current_rank = ranks[i]
        next_rank = ranks[i + 1]
        assert RANK_ORDER.get[current_rank] < RANK_ORDER[next_rank]
