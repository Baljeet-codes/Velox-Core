from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.producto import Producto, ProductoImagen
from app.schemas.producto_imagen import ProductoImagenCreate, ProductoImagenResponse

router = APIRouter(
    prefix="/imagenes",
    tags=["Imagenes"]
)

@router.post("/", response_model=ProductoImagenResponse)
def agregar_imagen(imagen: ProductoImagenCreate, db: Session = Depends(get_db)):
    producto = db.query(Producto).filter(Producto.id == imagen.producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    if imagen.es_principal:
        db.query(ProductoImagen).filter(
            ProductoImagen.producto_id == imagen.producto_id,
            ProductoImagen.es_principal == True
        ).update({"es_principal": False})
    nueva_imagen = ProductoImagen(**imagen.model_dump())
    db.add(nueva_imagen)
    db.commit()
    db.refresh(nueva_imagen)
    return nueva_imagen

@router.get("/{producto_id}", response_model=list[ProductoImagenResponse])
def obtener_imagenes(producto_id: int, db: Session = Depends(get_db)):
    producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return db.query(ProductoImagen).filter(ProductoImagen.producto_id == producto_id).all()

@router.delete("/{imagen_id}")
def eliminar_imagen(imagen_id: int, db: Session = Depends(get_db)):
    imagen = db.query(ProductoImagen).filter(ProductoImagen.id == imagen_id).first()
    if not imagen:
        raise HTTPException(status_code=404, detail="Imagen no encontrada")
    db.delete(imagen)
    db.commit()
    return {"mensaje": "Imagen eliminada correctamente"}