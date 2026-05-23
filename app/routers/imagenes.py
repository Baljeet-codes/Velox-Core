# ════════════════════════════════════════════════════════════════
# ROUTER: Endpoints de Imágenes (FastAPI)
#
# POST   /imagenes/              → Agrega un registro de imagen
#   - Valida que el producto exista
#   - Si es_principal=True, desmarca las demás del mismo producto
#
# PATCH  /imagenes/{id}/principal → Marca imagen como principal
#   - Busca imagen por ID
#   - Desmarca todas las imágenes del mismo producto
#   - Marca esta como es_principal = True
#
# GET    /imagenes/{producto_id} → Lista imágenes de un producto
#
# DELETE /imagenes/{id}          → Elimina registro de imagen
#   - Solo borra el registro en PostgreSQL
#   - La URL de ImgBB sigue accesible (ImgBB no tiene DELETE)
# ════════════════════════════════════════════════════════════════
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.producto import Producto, ProductoImagen
from app.schemas.producto_imagen import ProductoImagenCreate, ProductoImagenResponse
from app.services.imagen_service import desmarcar_principal

router = APIRouter(
    prefix="/imagenes",
    tags=["Imagenes"]
)


@router.post("/", response_model=ProductoImagenResponse)
def agregar_imagen(imagen: ProductoImagenCreate, db: Session = Depends(get_db)):
    """Agrega un registro de imagen a un producto.
    Si es_principal=True, desmarca cualquier otra imagen principal del mismo producto."""
    producto = db.query(Producto).filter(Producto.id == imagen.producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    if imagen.es_principal:
        desmarcar_principal(imagen.producto_id, db)
    nueva_imagen = ProductoImagen(**imagen.model_dump())
    db.add(nueva_imagen)
    db.commit()
    db.refresh(nueva_imagen)
    return nueva_imagen


@router.patch("/{imagen_id}/principal", response_model=ProductoImagenResponse)
def marcar_principal(imagen_id: int, db: Session = Depends(get_db)):
    """Marca una imagen como principal.
    Desmarca todas las demás imágenes del mismo producto antes de marcar esta."""
    imagen = db.query(ProductoImagen).filter(ProductoImagen.id == imagen_id).first()
    if not imagen:
        raise HTTPException(status_code=404, detail="Imagen no encontrada")
    desmarcar_principal(imagen.producto_id, db)
    imagen.es_principal = True
    db.commit()
    db.refresh(imagen)
    return imagen


@router.get("/{producto_id}", response_model=list[ProductoImagenResponse])
def obtener_imagenes(producto_id: int, db: Session = Depends(get_db)):
    """Retorna todas las imágenes asociadas a un producto."""
    producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return db.query(ProductoImagen).filter(ProductoImagen.producto_id == producto_id).all()


@router.delete("/{imagen_id}")
def eliminar_imagen(imagen_id: int, db: Session = Depends(get_db)):
    """Elimina el registro de imagen de la base de datos.
    Nota: No elimina la imagen de ImgBB ya que el servicio
    gratuito no expone un endpoint DELETE público."""
    imagen = db.query(ProductoImagen).filter(ProductoImagen.id == imagen_id).first()
    if not imagen:
        raise HTTPException(status_code=404, detail="Imagen no encontrada")
    db.delete(imagen)
    db.commit()
    return {"mensaje": "Imagen eliminada correctamente"}