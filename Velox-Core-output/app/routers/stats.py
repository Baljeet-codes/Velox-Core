from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.producto import Producto
from app.models.usuario import Usuario
from app.models.pedido import Pedido, PedidoItem, EstadoPedido
from app.models.carrito import CarritoItem
from app.utils.auth import obtener_admin_actual

router = APIRouter(
    prefix="/stats",
    tags=["Stats"]
)

@router.get("/")
def obtener_stats(
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(obtener_admin_actual),
):
    total_productos = db.query(Producto).count()
    total_usuarios = db.query(Usuario).count()
    total_pedidos = db.query(Pedido).count()
    productos_sin_stock = db.query(Producto).filter(Producto.stock == 0).count()

    ingresos_totales = db.query(func.sum(Pedido.total)).filter(
        Pedido.estado.in_([EstadoPedido.pagado, EstadoPedido.enviado, EstadoPedido.entregado])
    ).scalar() or 0.0

    pedidos_por_estado = {
        estado.value: db.query(Pedido).filter(Pedido.estado == estado).count()
        for estado in EstadoPedido
    }

    producto_mas_vendido = (
        db.query(PedidoItem.producto_id, func.sum(PedidoItem.cantidad).label("total_vendido"))
        .group_by(PedidoItem.producto_id)
        .order_by(func.sum(PedidoItem.cantidad).desc())
        .first()
    )

    return {
        "total_productos": total_productos,
        "total_usuarios": total_usuarios,
        "total_pedidos": total_pedidos,
        "productos_sin_stock": productos_sin_stock,
        "ingresos_totales": round(ingresos_totales, 2),
        "pedidos_por_estado": pedidos_por_estado,
        "producto_mas_vendido_id": producto_mas_vendido[0] if producto_mas_vendido else None,
    }
