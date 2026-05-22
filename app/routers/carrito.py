from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload
from app.database import get_db
from app.models.carrito import Carrito, CarritoItem
from app.models.usuario import Usuario
from app.models.producto import Producto
from app.schemas.carrito import CarritoItemCreate, CarritoResponse

router = APIRouter(
    prefix="/carrito",
    tags=["Carrito"]
)

def obtener_o_crear_carrito(usuario_id: int, db: Session):
    carrito = db.query(Carrito).options(
        selectinload(Carrito.items)
        .selectinload(CarritoItem.producto)
        .selectinload(Producto.imagenes)
    ).filter(Carrito.usuario_id == usuario_id).first()
    if not carrito:
        carrito = Carrito(usuario_id=usuario_id)
        db.add(carrito)
        db.commit()
        db.refresh(carrito)
    return carrito

@router.get("/{usuario_id}", response_model=CarritoResponse)
def obtener_carrito(usuario_id: int, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    carrito = obtener_o_crear_carrito(usuario_id, db)
    return carrito

@router.post("/{usuario_id}", response_model=CarritoResponse)
def agregar_item(usuario_id: int, item: CarritoItemCreate, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    producto = db.query(Producto).filter(Producto.id == item.producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    carrito = obtener_o_crear_carrito(usuario_id, db)
    item_existente = db.query(CarritoItem).filter(
        CarritoItem.carrito_id == carrito.id,
        CarritoItem.producto_id == item.producto_id
    ).first()
    if item_existente:
        nueva_cantidad = item_existente.cantidad + item.cantidad
        if producto.stock < nueva_cantidad:
            raise HTTPException(
                status_code=400,
                detail=f"Stock insuficiente para '{producto.nombre}': disponible {producto.stock}, solicitado {nueva_cantidad}"
            )
        item_existente.cantidad = nueva_cantidad
    else:
        if producto.stock < item.cantidad:
            raise HTTPException(
                status_code=400,
                detail=f"Stock insuficiente para '{producto.nombre}': disponible {producto.stock}, solicitado {item.cantidad}"
            )
        nuevo_item = CarritoItem(
            carrito_id=carrito.id,
            producto_id=item.producto_id,
            cantidad=item.cantidad
        )
        db.add(nuevo_item)
    db.commit()
    db.refresh(carrito)
    return carrito

@router.put("/{usuario_id}/item/{item_id}", response_model=CarritoResponse)
def actualizar_cantidad(usuario_id: int, item_id: int, item: CarritoItemCreate, db: Session = Depends(get_db)):
    carrito_item = db.query(CarritoItem).filter(CarritoItem.id == item_id).first()
    if not carrito_item:
        raise HTTPException(status_code=404, detail="Item no encontrado")
    producto = db.query(Producto).filter(Producto.id == carrito_item.producto_id).first()
    if producto.stock < item.cantidad:
        raise HTTPException(
            status_code=400,
            detail=f"Stock insuficiente para '{producto.nombre}': disponible {producto.stock}, solicitado {item.cantidad}"
        )
    carrito_item.cantidad = item.cantidad
    db.commit()
    carrito = obtener_o_crear_carrito(usuario_id, db)
    return carrito

@router.delete("/{usuario_id}/item/{item_id}")
def eliminar_item(usuario_id: int, item_id: int, db: Session = Depends(get_db)):
    carrito_item = db.query(CarritoItem).filter(CarritoItem.id == item_id).first()
    if not carrito_item:
        raise HTTPException(status_code=404, detail="Item no encontrado")
    db.delete(carrito_item)
    db.commit()
    return {"mensaje": "Item eliminado del carrito"}