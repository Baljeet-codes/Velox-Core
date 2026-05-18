import os
import uuid
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.producto import Producto, ProductoImagen
from app.models.usuario import Usuario
from app.schemas.producto_imagen import ProductoImagenCreate, ProductoImagenResponse
from app.auth import get_current_admin

router = APIRouter(prefix="/imagenes", tags=["Imagenes"])

UPLOAD_DIR = Path("static/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp", "gif"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


@router.post("/", response_model=ProductoImagenResponse, status_code=201)
def agregar_imagen(
    imagen: ProductoImagenCreate,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(get_current_admin),
):
    if not db.query(Producto).filter(Producto.id == imagen.producto_id).first():
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    if imagen.es_principal:
        db.query(ProductoImagen).filter(
            ProductoImagen.producto_id == imagen.producto_id,
            ProductoImagen.es_principal == True,
        ).update({"es_principal": False})
    nueva = ProductoImagen(**imagen.model_dump())
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva


@router.post("/subir", response_model=ProductoImagenResponse, status_code=201)
async def subir_imagen(
    file: UploadFile = File(...),
    producto_id: int = Form(...),
    es_principal: bool = Form(True),
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(get_current_admin),
):
    if not db.query(Producto).filter(Producto.id == producto_id).first():
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    ext = (file.filename.rsplit(".", 1)[-1].lower()) if file.filename and "." in file.filename else "jpg"
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Extensión no permitida: {ext}. Usa: {', '.join(ALLOWED_EXTENSIONS)}")

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="El archivo supera el límite de 5 MB")

    filename = f"{uuid.uuid4()}.{ext}"
    (UPLOAD_DIR / filename).write_bytes(content)
    url = f"/static/uploads/{filename}"

    if es_principal:
        db.query(ProductoImagen).filter(
            ProductoImagen.producto_id == producto_id,
            ProductoImagen.es_principal == True,
        ).update({"es_principal": False})

    nueva = ProductoImagen(url=url, es_principal=es_principal, producto_id=producto_id)
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva


@router.get("/{producto_id}", response_model=list[ProductoImagenResponse])
def obtener_imagenes(producto_id: int, db: Session = Depends(get_db)):
    if not db.query(Producto).filter(Producto.id == producto_id).first():
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return db.query(ProductoImagen).filter(ProductoImagen.producto_id == producto_id).all()


@router.delete("/{imagen_id}")
def eliminar_imagen(
    imagen_id: int,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(get_current_admin),
):
    imagen = db.query(ProductoImagen).filter(ProductoImagen.id == imagen_id).first()
    if not imagen:
        raise HTTPException(status_code=404, detail="Imagen no encontrada")

    # Eliminar archivo local si existe
    if imagen.url and imagen.url.startswith("/static/uploads/"):
        filepath = Path(imagen.url.lstrip("/"))
        if filepath.exists():
            filepath.unlink()

    db.delete(imagen)
    db.commit()
    return {"mensaje": "Imagen eliminada correctamente"}
