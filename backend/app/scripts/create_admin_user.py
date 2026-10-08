from getpass import getpass

from sqlmodel import Session, select

from app.db import engine
from app.model import Progression, User
from app.routes.auth import password_hash


def create_admin() -> None:
    print("=== Création du compte administrateur ===")

    username = input("Username : ").strip()
    email = input("Email : ").strip()
    password = getpass("Mot de passe : ")
    password_confirmation = getpass("Confirmation : ")

    if not username or not email or not password:
        print("Erreur : tous les champs sont obligatoires.")
        return

    if password != password_confirmation:
        print("Erreur : les mots de passe ne correspondent pas.")
        return

    with Session(engine) as session:
        existing_email = session.exec(
            select(User).where(User.email == email)
        ).first()

        if existing_email:
            print(f"Erreur : l'email '{email}' existe déjà.")
            return

        existing_username = session.exec(
            select(User).where(User.username == username)
        ).first()

        if existing_username:
            print(f"Erreur : le username '{username}' existe déjà.")
            return

        hashed_password = password_hash.hash(password)
        user = User(
            username=username,
            email=email,
            hashed_password=hashed_password,
            role="admin",
            is_active=True,
        )
        session.add(user)
        session.commit()

        print(f"Admin créé avec succès : {email}")


if __name__ == "__main__":
    create_admin()
