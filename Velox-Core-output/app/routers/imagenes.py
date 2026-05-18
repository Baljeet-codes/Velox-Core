import os
import uuid
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.producto import Producto, ProductoImagen
from app.models.usuario import Usuario
from app.schemas.producto_imagen import ProductoImagenCreate, ProductoImagenResponse
from app.utils.auth import obtener_admin_actual

router = APIRouter(
    prefix="/imagenes",
    tags=["Imagenes"]
)

UPLOAD_DIR = Path("static/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

USE_S3 = bool(os.getenv("S3_BUCKET_NAME"))


def _desactivar_principal(db: Session, producto_id: int):
    db.query(ProductoImagen).filter(
        ProductoImagen.producto_id == producto_id,
        ProductoImagen.es_principal == True
    ).update({"es_principal": False})


@router.post("/", response_model=ProductoImagenResponse)
def agregar_imagen(
    imagen: ProductoImagenCreate,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(obtener_admin_actual),
):
    producto = db.query(Producto).filter(Producto.id == imagen.producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    if imagen.es_principal:
        _desactivar_principal(db, imagen.producto_id)
    nueva_imagen = ProductoImagen(**imagen.model_dump())
    db.add(nueva_imagen)
    db.commit()
    db.refresh(nueva_imagen)
    return nueva_imagen


@router.post("/subir", response_model=ProductoImagenResponse)
async def subir_imagen(
    file: UploadFile = File(...),
    producto_id: int = Form(...),
    es_principal: bool = Form(True),
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(obtener_admin_actual),
):
    producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    allowed_types = {"image/jpeg", "image/png", "image/webp", "image/gif"}
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Tipo de archivo no permitido: {file.content_type}. Use JPEG, PNG, WEBP o GIF."
        )

    ext = file.filename.split(".")[-1] if file.filename else "jpg"
    filename = f"{uuid.uuid4()}.{ext}"
    content = await file.read()

    if USE_S3:
        from app.utils.s3_uploader import subir_imagen_a_s3
        import io
        file.file = io.BytesIO(content)
        url = await subir_imagen_a_s3(file)
    else:
        filepath = UPLOAD_DIR / filename
        filepath.write_bytes(content)
        url = f"/static/uploads/{filename}"

    if es_principal:
        _desactivar_principal(db, producto_id)

    nueva_imagen = ProductoImagen(url=url, es_principal=es_principal, producto_id=producto_id)
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


@router.put("/{imagen_id}", response_model=ProductoImagenResponse)
def actualizar_imagen(
    imagen_id: int,
    datos: ProductoImagenCreate,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(obtener_admin_actual),
):
    imagen = db.query(ProductoImagen).filter(ProductoImagen.id == imagen_id).first()
    if not imagen:
        raise HTTPException(status_code=404, detail="Imagen no encontrada")
    if datos.es_principal:
        _desactivar_principal(db, imagen.producto_id)
    for key, value in datos.model_dump().items():
        setattr(imagen, key, value)
    db.commit()
    db.refresh(imagen)
    return imagen


@router.delete("/{imagen_id}")
def eliminar_imagen(
    imagen_id: int,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(obtener_admin_actual),
):
    imagen = db.query(ProductoImagen).filter(ProductoImagen.id == imagen_id).first()
    if not imagen:
        raise HTTPException(status_code=404, detail="Imagen no encontrada")
    db.delete(imagen)
    db.commit()
    return {"mensaje": "Imagen eliminada correctamente"}
