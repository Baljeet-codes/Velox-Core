from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.pedido import Pedido, PedidoItem, EstadoPedido
from app.models.carrito import Carrito, CarritoItem
from app.models.usuario import Usuario
from app.models.producto import Producto
from app.schemas.pedido import PedidoCreate, PedidoResponse
from app.utils.auth import obtener_usuario_actual, obtener_admin_actual
from pydantic import BaseModel

router = APIRouter(
    prefix="/pedidos",
    tags=["Pedidos"]
)

@router.post("/{usuario_id}", response_model=PedidoResponse)
def crear_pedido(
    usuario_id: int,
    datos: PedidoCreate,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    if usuario_actual.id != usuario_id and not usuario_actual.es_admin:
        raise HTTPException(status_code=403, detail="No tienes permiso para crear pedidos de otro usuario")
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    carrito = db.query(Carrito).filter(Carrito.usuario_id == usuario_id).first()
    if not carrito or len(carrito.items) == 0:
        raise HTTPException(status_code=400, detail="El carrito está vacío")
    for item in carrito.items:
        if item.producto.stock < item.cantidad:
            raise HTTPException(
                status_code=400,
                detail=f"Stock insuficiente para '{item.producto.nombre}': "
                       f"disponible {item.producto.stock}, solicitado {item.cantidad}"
            )
    total = sum(item.producto.precio * item.cantidad for item in carrito.items)
    nuevo_pedido = Pedido(
        usuario_id=usuario_id,
        total=total,
        direccion_envio=datos.direccion_envio
    )
    db.add(nuevo_pedido)
    db.flush()
    for item in carrito.items:
        pedido_item = PedidoItem(
            pedido_id=nuevo_pedido.id,
            producto_id=item.producto_id,
            cantidad=item.cantidad,
            precio_unitario=item.producto.precio
        )
        db.add(pedido_item)
        db.delete(item)
    db.commit()
    db.refresh(nuevo_pedido)
    return nuevo_pedido

@router.get("/historial/{usuario_id}", response_model=list[PedidoResponse])
def historial_pedidos(
    usuario_id: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    if usuario_actual.id != usuario_id and not usuario_actual.es_admin:
        raise HTTPException(status_code=403, detail="No tienes permiso para ver los pedidos de otro usuario")
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    pedidos = db.query(Pedido).filter(Pedido.usuario_id == usuario_id).all()
    return pedidos

@router.get("/todos/", response_model=list[PedidoResponse])
def obtener_todos_pedidos(
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(obtener_admin_actual),
):
    return db.query(Pedido).order_by(Pedido.id).all()

@router.get("/{pedido_id}", response_model=PedidoResponse)
def obtener_pedido(
    pedido_id: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    pedido = db.query(Pedido).filter(Pedido.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    if usuario_actual.id != pedido.usuario_id and not usuario_actual.es_admin:
        raise HTTPException(status_code=403, detail="No tienes permiso para ver este pedido")
    return pedido

class ActualizarEstado(BaseModel):
    estado: str

@router.put("/{pedido_id}/estado")
def actualizar_estado(
    pedido_id: int,
    datos: ActualizarEstado,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(obtener_admin_actual),
):
    pedido = db.query(Pedido).filter(Pedido.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    try:
        nuevo_estado = EstadoPedido[datos.estado]
    except KeyError:
        raise HTTPException(
            status_code=400,
            detail=f"Estado inválido. Valores permitidos: {[e.value for e in EstadoPedido]}"
        )
    estado_anterior = pedido.estado
    usuario = db.query(Usuario).filter(Usuario.id == pedido.usuario_id).first()
    if nuevo_estado == EstadoPedido.pagado and estado_anterior != EstadoPedido.pagado:
        for pedido_item in pedido.items:
            producto = db.query(Producto).filter(Producto.id == pedido_item.producto_id).first()
            if producto.stock < pedido_item.cantidad:
                raise HTTPException(
                    status_code=400,
                    detail=f"Stock insuficiente para '{producto.nombre}': "
                           f"disponible {producto.stock}, requerido {pedido_item.cantidad}"
                )
            producto.stock -= pedido_item.cantidad
        if usuario:
            usuario.puntos_fidelidad += int(pedido.total)
    if nuevo_estado == EstadoPedido.cancelado and estado_anterior in (
        EstadoPedido.pagado, EstadoPedido.enviado, EstadoPedido.entregado
    ):
        for pedido_item in pedido.items:
            producto = db.query(Producto).filter(Producto.id == pedido_item.producto_id).first()
            producto.stock += pedido_item.cantidad
        if usuario:
            usuario.puntos_fidelidad = max(0, usuario.puntos_fidelidad - int(pedido.total))
    pedido.estado = nuevo_estado
    db.commit()
    db.refresh(pedido)
    return {"mensaje": "Estado actualizado", "estado": pedido.estado}
