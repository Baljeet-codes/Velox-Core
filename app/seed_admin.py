from app.database import SessionLocal
from app.models.usuario import Usuario
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def crear_admin():
    db = SessionLocal()
    try:
        existe = db.query(Usuario).filter(Usuario.email == "admin@ecommerce.com").first()
        if existe:
            existe.es_admin = True
            existe.password = pwd_context.hash("admin123")
            existe.nombre = "Administrador"
            db.commit()
            print(f"Admin actualizado: {existe.email} / admin123")
            return
        admin = Usuario(
            nombre="Administrador",
            email="admin@ecommerce.com",
            password=pwd_context.hash("admin123"),
            direccion="Principal",
            telefono="3000000000",
            es_admin=True,
            puntos_fidelidad=0,
        )
        db.add(admin)
        db.commit()
        print("Admin creado: admin@ecommerce.com / admin123")
    finally:
        db.close()


if __name__ == "__main__":
    crear_admin()
