from typing import Literal, get_args


# La liste établi des rank depuis le json, dans l'ordre croissant
Rank = Literal[
    "kyu_10", "kyu_9", "kyu_8", "kyu_7", "kyu_6",
    "kyu_5", "kyu_4", "kyu_3", "kyu_2", "kyu_1",
    "shodan", "nidan", "sandan", "yondan", "godan"
]

# Donne une valeur numérique à chaque rank de manière croissant (le dernier est le plus elevé)
RANK_ORDER = {rank: i for i, rank in enumerate(get_args(Rank))}