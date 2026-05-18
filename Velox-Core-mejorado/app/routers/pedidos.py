from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models.pedido import Pedido, PedidoItem, EstadoPedido
from app.models.carrito import Carrito, CarritoItem
from app.models.usuario import Usuario
from app.models.producto import Producto
from app.schemas.pedido import PedidoCreate, PedidoResponse
from app.auth import get_current_user, get_current_admin

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])


@router.post("/{usuario_id}", response_model=PedidoResponse, status_code=201)
def crear_pedido(
    usuario_id: int,
    datos: PedidoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    if current_user.id != usuario_id and not current_user.es_admin:
        raise HTTPException(status_code=403, detail="Sin permisos")

    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    carrito = db.query(Carrito).filter(Carrito.usuario_id == usuario_id).first()
    if not carrito or len(carrito.items) == 0:
        raise HTTPException(status_code=400, detail="El carrito está vacío")

    # Validar stock antes de confirmar
    for item in carrito.items:
        if item.producto.stock < item.cantidad:
            raise HTTPException(
                status_code=400,
                detail=f"Stock insuficiente para '{item.producto.nombre}': "
                       f"disponible {item.producto.stock}, solicitado {item.cantidad}",
            )

    total = sum(item.producto.precio * item.cantidad for item in carrito.items)
    nuevo_pedido = Pedido(
        usuario_id=usuario_id,
        total=total,
        direccion_envio=datos.direccion_envio,
    )
    db.add(nuevo_pedido)
    db.flush()

    for item in carrito.items:
        db.add(PedidoItem(
            pedido_id=nuevo_pedido.id,
            producto_id=item.producto_id,
            cantidad=item.cantidad,
            precio_unitario=item.producto.precio,
        ))
        # Descontar stock inmediatamente al crear el pedido
        item.producto.stock -= item.cantidad
        db.delete(item)

    # Otorgar puntos de fidelidad al crear el pedido
    usuario.puntos_fidelidad += int(total)

    db.commit()
    db.refresh(nuevo_pedido)
    return nuevo_pedido


@router.get("/historial/{usuario_id}", response_model=list[PedidoResponse])
def historial_pedidos(
    usuario_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    if current_user.id != usuario_id and not current_user.es_admin:
        raise HTTPException(status_code=403, detail="Sin permisos")
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return db.query(Pedido).filter(Pedido.usuario_id == usuario_id).order_by(Pedido.id.desc()).all()


@router.get("/todos/", response_model=list[PedidoResponse])
def obtener_todos_pedidos(
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(get_current_admin),
):
    return db.query(Pedido).order_by(Pedido.id.desc()).all()


class ActualizarEstado(BaseModel):
    estado: str


@router.put("/{pedido_id}/estado")
def actualizar_estado(
    pedido_id: int,
    datos: ActualizarEstado,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(get_current_admin),
):
    pedido = db.query(Pedido).filter(Pedido.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")

    try:
        nuevo_estado = EstadoPedido(datos.estado)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Estado inválido: {datos.estado}")

    estado_anterior = pedido.estado
    usuario = db.query(Usuario).filter(Usuario.id == pedido.usuario_id).first()

    # Cancelar: restaurar stock y quitar puntos
    if nuevo_estado == EstadoPedido.cancelado and estado_anterior not in (EstadoPedido.cancelado,):
        for pedido_item in pedido.items:
            producto = db.query(Producto).filter(Producto.id == pedido_item.producto_id).first()
            if producto:
                producto.stock += pedido_item.cantidad
        if usuario:
            usuario.puntos_fidelidad = max(0, usuario.puntos_fidelidad - int(pedido.total))

    pedido.estado = nuevo_estado
    db.commit()
    db.refresh(pedido)
    return {"mensaje": "Estado actualizado", "estado": pedido.estado.value}
