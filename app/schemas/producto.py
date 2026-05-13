from pydantic import BaseModel
from app.schemas.categoria import CategoriaResponse
from app.schemas.producto_imagen import ProductoImagenResponse

class ProductoBase(BaseModel):
    nombre: str
    descripcion: str | None = None
    precio: float
    marca: str
    stock: int = 0
    imagen_url: str | None = None
    categoria_id: int

class ProductoCreate(ProductoBase):
    pass

class ProductoResponse(ProductoBase):
    id: int
    categoria: CategoriaResponse
    imagenes: list[ProductoImagenResponse] = []

    class Config:
        from_attributes = True