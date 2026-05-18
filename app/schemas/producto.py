from typing import Optional
from pydantic import BaseModel
from app.schemas.categoria import CategoriaResponse
from app.schemas.producto_imagen import ProductoImagenResponse

class ProductoBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    precio: float
    marca: str
    stock: int = 0
    imagen_url: Optional[str] = None
    categoria_id: int

class ProductoCreate(ProductoBase):
    pass

class ProductoResponse(ProductoBase):
    id: int
    categoria: CategoriaResponse
    imagenes: list[ProductoImagenResponse] = []

    class Config:
        from_attributes = True