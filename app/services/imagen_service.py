from sqlalchemy.orm import Session
from app.models.producto import ProductoImagen


def desmarcar_principal(producto_id: int, db: Session) -> None:
    db.query(ProductoImagen).filter(
        ProductoImagen.producto_id == producto_id,
        ProductoImagen.es_principal == True
    ).update({"es_principal": False})
    db.flush()
