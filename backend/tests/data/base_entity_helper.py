from pwdlib import PasswordHash
from sqlmodel import Session

from app.model import Kata, KataCompletion, Progression, User


class BaseEntityHelper:
    """Base de test pour tous les tests"""

    def _hash_password(self, password):
        password_hash = PasswordHash.recommended()
        return password_hash.hash(password)

    def _add_user(
        self,
        session: Session,
        username="john",
        email="john@example.com",
        password="password123",
        is_active=True,
    ):
        hashed_password = self._hash_password(password)
        user = User(
            username=username,
            email=email,
            hashed_password=hashed_password,
            is_active=is_active,
        )
        session.add(user)
        session.commit()
        return user

    def _add_kata(
        self,
        session: Session,
        id="kyu_10_addition",
        rank="kyu_10",
        discipline="core",
        title="Premier Kata",
        statement="Écrivez une fonction qui reçoit deux entiers et renvoie leur somme.",
        signature="def additionner(a: int, b: int) -> int:",
        solution_reference="def additionner(a, b):\n    return a + b",
        variant_of=None,
        tests=None,
        concepts_used=None,
        meta=None,
    ):

        kata = Kata(
            id=id,
            rank=rank,
            discipline=discipline,
            title=title,
            statement=statement,
            signature=signature,
            solution_reference=solution_reference,
            variant_of=variant_of,
            tests=tests if tests is not None else [],
            concepts_used=concepts_used if concepts_used is not None else [],
            meta=meta if meta is not None else {},
        )

        session.add(kata)
        session.commit()

        return kata

    def _add_progression(self, session: Session, user_id, core_dan=None):
        progression = Progression(user_id=user_id, core_dan=core_dan)

        session.add(progression)
        session.commit()

        return progression

    def _add_completed_kata(
        self,
        session: Session,
        user_id,
        kata_id="kyu_10_addition",
        rank="kyu_10",
        discipline="core",
    ):
        self._add_kata(session, kata_id, rank, discipline)

        completion = KataCompletion(user_id=user_id, kata_id=kata_id)

        session.add(completion)
        session.commit()

        return completion
