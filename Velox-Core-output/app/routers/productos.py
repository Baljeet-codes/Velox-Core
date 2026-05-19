from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.producto import Producto
from app.models.categoria import Categoria
from app.models.usuario import Usuario
from app.schemas.producto import ProductoCreate, ProductoResponse
from app.utils.auth import obtener_admin_actual

router = APIRouter(
    prefix="/productos",
    tags=["Productos"]
)

@router.get("/", response_model=list[ProductoResponse])
def obtener_productos(
    db: Session = Depends(get_db),
    categoria_id: int | None = Query(default=None),
    marca: str | None = Query(default=None),
    con_stock: bool | None = Query(default=None),
):
    query = db.query(Producto)
    if categoria_id is not None:
        query = query.filter(Producto.categoria_id == categoria_id)
    if marca is not None:
        query = query.filter(Producto.marca.ilike(f"%{marca}%"))
    if con_stock is True:
        query = query.filter(Producto.stock > 0)
    elif con_stock is False:
        query = query.filter(Producto.stock == 0)
    return query.order_by(Producto.id).all()

@router.get("/{id}", response_model=ProductoResponse)
def obtener_producto(id: int, db: Session = Depends(get_db)):
    producto = db.query(Producto).filter(Producto.id == id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto

@router.post("/", response_model=ProductoResponse)
def crear_producto(
    producto: ProductoCreate,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(obtener_admin_actual),
):
    categoria = db.query(Categoria).filter(Categoria.id == producto.categoria_id).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    nuevo_producto = Producto(**producto.model_dump())
    db.add(nuevo_producto)
    db.commit()
    db.refresh(nuevo_producto)
    return nuevo_producto

@router.put("/{id}", response_model=ProductoResponse)
def actualizar_producto(
    id: int,
    datos: ProductoCreate,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(obtener_admin_actual),
):
    producto = db.query(Producto).filter(Producto.id == id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    for key, value in datos.model_dump().items():
        setattr(producto, key, value)
    db.commit()
    db.refresh(producto)
    return producto

@router.delete("/{id}")
def eliminar_producto(
    id: int,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(obtener_admin_actual),
):
    producto = db.query(Producto).filter(Producto.id == id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    db.delete(producto)
    db.commit()
    return {"mensaje": "Producto eliminado correctamente"}
