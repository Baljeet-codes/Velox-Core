from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.producto import Producto
from app.models.usuario import Usuario
from app.models.pedido import Pedido, EstadoPedido
from app.models.carrito import CarritoItem
from app.auth import get_current_admin

router = APIRouter(prefix="/stats", tags=["Stats"])


@router.get("/")
def obtener_stats(
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(get_current_admin),
):
    total_productos = db.query(Producto).count()
    total_usuarios = db.query(Usuario).filter(Usuario.es_admin == False).count()
    total_pedidos = db.query(Pedido).count()
    productos_sin_stock = db.query(Producto).filter(Producto.stock == 0).count()

    # Ingreso total de pedidos pagados/enviados/entregados
    ingresos = db.query(func.sum(Pedido.total)).filter(
        Pedido.estado.in_([EstadoPedido.pagado, EstadoPedido.enviado, EstadoPedido.entregado])
    ).scalar() or 0.0

    # Pedidos por estado
    estados = {}
    for estado in EstadoPedido:
        count = db.query(Pedido).filter(Pedido.estado == estado).count()
        estados[estado.value] = count

    return {
        "total_productos": total_productos,
        "total_usuarios": total_usuarios,
        "total_pedidos": total_pedidos,
        "productos_sin_stock": productos_sin_stock,
        "ingresos_totales": round(ingresos, 2),
        "pedidos_por_estado": estados,
    }
