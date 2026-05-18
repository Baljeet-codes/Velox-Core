from pydantic import BaseModel
from app.schemas.producto import ProductoResponse

class CarritoItemBase(BaseModel):
    producto_id: int
    cantidad: int = 1

class CarritoItemCreate(CarritoItemBase):
    pass

class CarritoItemResponse(CarritoItemBase):
    id: int
    producto: ProductoResponse

    class Config:
        from_attributes = True

class CarritoResponse(BaseModel):
    id: int
    usuario_id: int
    items: list[CarritoItemResponse] = []

    class Config:
        from_attributes = True