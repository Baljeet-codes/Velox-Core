from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.producto import Producto
from app.models.categoria import Categoria
from app.models.usuario import Usuario
from app.schemas.producto import ProductoCreate, ProductoResponse
from app.auth import get_current_admin

router = APIRouter(prefix="/productos", tags=["Productos"])


@router.get("/", response_model=list[ProductoResponse])
def obtener_productos(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0, description="Registros a omitir"),
    limit: int = Query(50, ge=1, le=200, description="Máximo de resultados"),
    categoria_id: Optional[int] = Query(None, description="Filtrar por categoría"),
    buscar: Optional[str] = Query(None, description="Buscar en nombre o marca"),
):
    q = db.query(Producto)
    if categoria_id:
        q = q.filter(Producto.categoria_id == categoria_id)
    if buscar:
        term = f"%{buscar}%"
        q = q.filter(
            Producto.nombre.ilike(term) | Producto.marca.ilike(term)
        )
    return q.order_by(Producto.id).offset(skip).limit(limit).all()


@router.get("/{id}", response_model=ProductoResponse)
def obtener_producto(id: int, db: Session = Depends(get_db)):
    producto = db.query(Producto).filter(Producto.id == id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto


@router.post("/", response_model=ProductoResponse, status_code=201)
def crear_producto(
    producto: ProductoCreate,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(get_current_admin),
):
    if not db.query(Categoria).filter(Categoria.id == producto.categoria_id).first():
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    nuevo = Producto(**producto.model_dump())
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo


@router.put("/{id}", response_model=ProductoResponse)
def actualizar_producto(
    id: int,
    datos: ProductoCreate,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(get_current_admin),
):
    producto = db.query(Producto).filter(Producto.id == id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    if not db.query(Categoria).filter(Categoria.id == datos.categoria_id).first():
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    for key, value in datos.model_dump().items():
        setattr(producto, key, value)
    db.commit()
    db.refresh(producto)
    return producto


@router.delete("/{id}")
def eliminar_producto(
    id: int,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(get_current_admin),
):
    producto = db.query(Producto).filter(Producto.id == id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    db.delete(producto)
    db.commit()
    return {"mensaje": "Producto eliminado correctamente"}
