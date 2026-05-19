from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.categoria import Categoria
from app.models.usuario import Usuario
from app.schemas.categoria import CategoriaCreate, CategoriaResponse
from app.utils.auth import obtener_admin_actual

router = APIRouter(
    prefix="/categorias",
    tags=["Categorias"]
)

@router.get("/", response_model=list[CategoriaResponse])
def obtener_categorias(db: Session = Depends(get_db)):
    categorias = db.query(Categoria).all()
    return categorias

@router.get("/{id}", response_model=CategoriaResponse)
def obtener_categoria(id: int, db: Session = Depends(get_db)):
    categoria = db.query(Categoria).filter(Categoria.id == id).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return categoria

@router.post("/", response_model=CategoriaResponse)
def crear_categoria(
    categoria: CategoriaCreate,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(obtener_admin_actual),
):
    existente = db.query(Categoria).filter(Categoria.nombre == categoria.nombre).first()
    if existente:
        raise HTTPException(status_code=400, detail="Ya existe una categoría con ese nombre")
    nueva_categoria = Categoria(**categoria.model_dump())
    db.add(nueva_categoria)
    db.commit()
    db.refresh(nueva_categoria)
    return nueva_categoria

@router.put("/{id}", response_model=CategoriaResponse)
def actualizar_categoria(
    id: int,
    datos: CategoriaCreate,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(obtener_admin_actual),
):
    categoria = db.query(Categoria).filter(Categoria.id == id).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    duplicada = db.query(Categoria).filter(
        Categoria.nombre == datos.nombre,
        Categoria.id != id
    ).first()
    if duplicada:
        raise HTTPException(status_code=400, detail="Ya existe una categoría con ese nombre")
    categoria.nombre = datos.nombre
    categoria.descripcion = datos.descripcion
    db.commit()
    db.refresh(categoria)
    return categoria

@router.delete("/{id}")
def eliminar_categoria(
    id: int,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(obtener_admin_actual),
):
    categoria = db.query(Categoria).filter(Categoria.id == id).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    if categoria.productos:
        raise HTTPException(
            status_code=400,
            detail="No se puede eliminar una categoría que tiene productos asociados"
        )
    db.delete(categoria)
    db.commit()
    return {"mensaje": "Categoría eliminada correctamente"}
