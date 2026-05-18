from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.producto import Producto
from app.models.usuario import Usuario
from app.models.pedido import Pedido
from app.models.carrito import CarritoItem

router = APIRouter(
    prefix="/stats",
    tags=["Stats"]
)

@router.get("/")
def obtener_stats(db: Session = Depends(get_db)):
    total_productos = db.query(Producto).count()
    total_usuarios = db.query(Usuario).count()
    total_pedidos = db.query(Pedido).count()
    productos_sin_stock = db.query(Producto).filter(Producto.stock == 0).count()
    
    return {
        "total_productos": total_productos,
        "total_usuarios": total_usuarios,
        "total_pedidos": total_pedidos,
        "productos_sin_stock": productos_sin_stock
    }