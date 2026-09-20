from typing import Literal, get_args


Rank = Literal[
    "kyu_10", "kyu_9", "kyu_8", "kyu_7", "kyu_6",
    "kyu_5", "kyu_4", "kyu_3", "kyu_2", "kyu_1",
    "shodan", "nidan", "sandan", "yondan", "godan"
]

RANK_ORDER = {rank: i for i, rank in enumerate(get_args(Rank))}