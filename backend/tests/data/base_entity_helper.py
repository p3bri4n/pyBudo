from app.model import Kata


class BaseEntityHelper:
    """Base de test pour tous les tests"""

    def add_kata(
        self,
        id,
        rank,
        discipline,
        title,
        statement,
        signature,
        solution_reference,
        session,
    ):

        kata = Kata(
            id=id,
            rank=rank,
            discipline=discipline,
            title=title,
            statement=statement,
            signature=signature,
            solution_reference=solution_reference,
        )

        session.add(kata)
        session.commit()
        return kata
