from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.schemas.producto import ProductoResponse
from app.models.pedido import EstadoPedido

class PedidoItemResponse(BaseModel):
    id: int
    producto_id: int
    cantidad: int
    precio_unitario: float
    producto: ProductoResponse

    class Config:
        from_attributes = True

class PedidoCreate(BaseModel):
    direccion_envio: str

class PedidoResponse(BaseModel):
    id: int
    usuario_id: int
    total: float
    estado: EstadoPedido
    direccion_envio: str
    items: list[PedidoItemResponse] = []
    creado_en: Optional[datetime] = None

    class Config:
        from_attributes = True