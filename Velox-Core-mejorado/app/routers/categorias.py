from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.categoria import Categoria
from app.models.usuario import Usuario
from app.schemas.categoria import CategoriaCreate, CategoriaResponse
from app.auth import get_current_admin

router = APIRouter(prefix="/categorias", tags=["Categorias"])


@router.get("/", response_model=list[CategoriaResponse])
def obtener_categorias(db: Session = Depends(get_db)):
    return db.query(Categoria).all()


@router.get("/{id}", response_model=CategoriaResponse)
def obtener_categoria(id: int, db: Session = Depends(get_db)):
    cat = db.query(Categoria).filter(Categoria.id == id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return cat


@router.post("/", response_model=CategoriaResponse, status_code=201)
def crear_categoria(
    categoria: CategoriaCreate,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(get_current_admin),
):
    if db.query(Categoria).filter(Categoria.nombre == categoria.nombre).first():
        raise HTTPException(status_code=400, detail="Ya existe una categoría con ese nombre")
    nueva = Categoria(**categoria.model_dump())
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva


@router.put("/{id}", response_model=CategoriaResponse)
def actualizar_categoria(
    id: int,
    datos: CategoriaCreate,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(get_current_admin),
):
    cat = db.query(Categoria).filter(Categoria.id == id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    duplicado = db.query(Categoria).filter(
        Categoria.nombre == datos.nombre, Categoria.id != id
    ).first()
    if duplicado:
        raise HTTPException(status_code=400, detail="Ya existe una categoría con ese nombre")
    cat.nombre = datos.nombre
    cat.descripcion = datos.descripcion
    db.commit()
    db.refresh(cat)
    return cat


@router.delete("/{id}")
def eliminar_categoria(
    id: int,
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(get_current_admin),
):
    cat = db.query(Categoria).filter(Categoria.id == id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    if cat.productos:
        raise HTTPException(
            status_code=400,
            detail=f"No se puede eliminar: la categoría tiene {len(cat.productos)} producto(s) asociado(s)",
        )
    db.delete(cat)
    db.commit()
    return {"mensaje": "Categoría eliminada correctamente"}
