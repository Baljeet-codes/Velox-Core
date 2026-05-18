from pydantic import BaseModel

class ProductoImagenBase(BaseModel):
    url: str
    es_principal: bool = False

class ProductoImagenCreate(ProductoImagenBase):
    producto_id: int

class ProductoImagenResponse(ProductoImagenBase):
    id: int
    producto_id: int

    class Config:
        from_attributes = True