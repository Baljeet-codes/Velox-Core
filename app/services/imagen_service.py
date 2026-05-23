# ════════════════════════════════════════════════════════════════
# Servicio: desmarca todas las imágenes principales de un producto
# antes de marcar una nueva como principal.
# Usa db.flush() para que la operación sea parte de la misma
# transacción que la llamada principal (PATCH /imagenes/{id}/principal).
# ════════════════════════════════════════════════════════════════
from sqlalchemy.orm import Session
from app.models.producto import ProductoImagen


def desmarcar_principal(producto_id: int, db: Session) -> None:
    db.query(ProductoImagen).filter(
        ProductoImagen.producto_id == producto_id,
        ProductoImagen.es_principal == True
    ).update({"es_principal": False})
    db.flush()
