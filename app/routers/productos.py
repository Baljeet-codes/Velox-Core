from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.producto import Producto
from app.models.categoria import Categoria
from app.models.carrito import CarritoItem
from app.models.pedido import PedidoItem
from app.schemas.producto import ProductoCreate, ProductoResponse

router = APIRouter(
    prefix="/productos",
    tags=["Productos"]
)

@router.get("/", response_model=list[ProductoResponse])
def obtener_productos(db: Session = Depends(get_db)):
    return db.query(Producto).options(
        joinedload(Producto.imagenes),
        joinedload(Producto.categoria)
    ).order_by(Producto.id).all()

@router.get("/{id}", response_model=ProductoResponse)
def obtener_producto(id: int, db: Session = Depends(get_db)):
    producto = db.query(Producto).options(
        joinedload(Producto.imagenes),
        joinedload(Producto.categoria)
    ).filter(Producto.id == id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto

@router.post("/", response_model=ProductoResponse)
def crear_producto(producto: ProductoCreate, db: Session = Depends(get_db)):
    categoria = db.query(Categoria).filter(Categoria.id == producto.categoria_id).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    nuevo_producto = Producto(**producto.model_dump())
    db.add(nuevo_producto)
    db.commit()
    db.refresh(nuevo_producto)
    return nuevo_producto

@router.put("/{id}", response_model=ProductoResponse)
def actualizar_producto(id: int, datos: ProductoCreate, db: Session = Depends(get_db)):
    producto = db.query(Producto).filter(Producto.id == id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    for key, value in datos.model_dump().items():
        setattr(producto, key, value)
    db.commit()
    db.refresh(producto)
    return producto

@router.delete("/{id}")
def eliminar_producto(id: int, db: Session = Depends(get_db)):
    producto = db.query(Producto).filter(Producto.id == id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    en_carrito = db.query(CarritoItem).filter(CarritoItem.producto_id == id).first()
    en_pedido = db.query(PedidoItem).filter(PedidoItem.producto_id == id).first()
    if en_carrito or en_pedido:
        raise HTTPException(
            status_code=409,
            detail="No se puede eliminar el producto porque existe en carritos o pedidos activos"
        )

    db.delete(producto)
    db.commit()
    return {"mensaje": "Producto eliminado correctamente"}