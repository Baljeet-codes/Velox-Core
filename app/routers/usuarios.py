from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.usuario import Usuario
from app.models.carrito import Carrito, CarritoItem
from app.models.pedido import Pedido, PedidoItem
from app.models.producto import Producto
from app.schemas.usuario import UsuarioCreate, UsuarioResponse, LoginRequest, LoginResponse
from passlib.context import CryptContext

router = APIRouter(
    prefix="/usuarios",
    tags=["Usuarios"]
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hashear_password(password: str) -> str:
    return pwd_context.hash(password)

@router.post("/", response_model=UsuarioResponse)
def crear_usuario(usuario: UsuarioCreate, db: Session = Depends(get_db)):
    usuario_existente = db.query(Usuario).filter(Usuario.email == usuario.email).first()
    if usuario_existente:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    nuevo_usuario = Usuario(
        nombre=usuario.nombre,
        email=usuario.email,
        password=hashear_password(usuario.password),
        direccion=usuario.direccion,
        telefono=usuario.telefono
    )
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    return nuevo_usuario

@router.get("/{id}", response_model=UsuarioResponse)
def obtener_usuario(id: int, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.id == id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario

@router.put("/{id}", response_model=UsuarioResponse)
def actualizar_usuario(id: int, datos: UsuarioCreate, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.id == id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    usuario.nombre = datos.nombre
    usuario.email = datos.email
    usuario.password = hashear_password(datos.password)
    usuario.direccion = datos.direccion
    usuario.telefono = datos.telefono
    db.commit()
    db.refresh(usuario)
    return usuario
@router.delete("/{id}")
def eliminar_usuario(id: int, admin_id: int, db: Session = Depends(get_db)):
    admin = db.query(Usuario).filter(Usuario.id == admin_id).first()
    if not admin or not admin.es_admin:
        raise HTTPException(status_code=403, detail="Se requieren permisos de administrador")
    usuario = db.query(Usuario).filter(Usuario.id == id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if usuario.es_admin:
        raise HTTPException(status_code=400, detail="No se puede eliminar a otro administrador")
    for pedido in usuario.pedidos:
        if pedido.estado.value in ("pagado", "enviado", "entregado"):
            for item in pedido.items:
                producto = db.query(Producto).filter(Producto.id == item.producto_id).first()
                if producto:
                    producto.stock += item.cantidad
    db.delete(usuario)
    db.commit()
    return {"mensaje": "Usuario eliminado correctamente"}

@router.get("/", response_model=list[UsuarioResponse])
def obtener_usuarios(db: Session = Depends(get_db)):
    usuarios = db.query(Usuario).all()
    return usuarios

@router.post("/login", response_model=LoginResponse)
def login(datos: LoginRequest, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.email == datos.email).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if not pwd_context.verify(datos.password, usuario.password):
        raise HTTPException(status_code=400, detail="Contraseña incorrecta")
    return LoginResponse(
        id=usuario.id,
        nombre=usuario.nombre,
        email=usuario.email,
        telefono=usuario.telefono,
        direccion=usuario.direccion,
        es_admin=usuario.es_admin,
        puntos_fidelidad=usuario.puntos_fidelidad,
        mensaje="Login exitoso"
    )