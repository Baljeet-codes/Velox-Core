from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.usuario import Usuario
from app.models.carrito import Carrito, CarritoItem
from app.models.pedido import Pedido, PedidoItem
from app.models.producto import Producto
from app.schemas.usuario import UsuarioCreate, UsuarioResponse, LoginRequest, LoginResponse, UsuarioUpdate
from app.auth import crear_access_token, get_current_user, get_current_admin
from passlib.context import CryptContext

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hashear_password(password: str) -> str:
    return pwd_context.hash(password)


@router.post("/", response_model=UsuarioResponse, status_code=201)
def crear_usuario(usuario: UsuarioCreate, db: Session = Depends(get_db)):
    if db.query(Usuario).filter(Usuario.email == usuario.email).first():
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    nuevo = Usuario(
        nombre=usuario.nombre,
        email=usuario.email,
        password=hashear_password(usuario.password),
        direccion=usuario.direccion,
        telefono=usuario.telefono,
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo


@router.post("/login", response_model=LoginResponse)
def login(datos: LoginRequest, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.email == datos.email).first()
    if not usuario or not pwd_context.verify(datos.password, usuario.password):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    token = crear_access_token({"sub": str(usuario.id)})
    return LoginResponse(
        id=usuario.id,
        nombre=usuario.nombre,
        email=usuario.email,
        telefono=usuario.telefono,
        direccion=usuario.direccion,
        es_admin=usuario.es_admin,
        puntos_fidelidad=usuario.puntos_fidelidad,
        access_token=token,
        token_type="bearer",
        mensaje="Login exitoso",
    )


@router.get("/", response_model=list[UsuarioResponse])
def obtener_usuarios(
    db: Session = Depends(get_db),
    _admin: Usuario = Depends(get_current_admin),
):
    return db.query(Usuario).all()


@router.get("/me", response_model=UsuarioResponse)
def perfil_propio(current_user: Usuario = Depends(get_current_user)):
    return current_user


@router.get("/{id}", response_model=UsuarioResponse)
def obtener_usuario(
    id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    if current_user.id != id and not current_user.es_admin:
        raise HTTPException(status_code=403, detail="Sin permisos")
    usuario = db.query(Usuario).filter(Usuario.id == id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario


@router.put("/{id}", response_model=UsuarioResponse)
def actualizar_usuario(
    id: int,
    datos: UsuarioUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    if current_user.id != id and not current_user.es_admin:
        raise HTTPException(status_code=403, detail="Sin permisos")
    usuario = db.query(Usuario).filter(Usuario.id == id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Validar email único si cambió
    if datos.email and datos.email != usuario.email:
        if db.query(Usuario).filter(Usuario.email == datos.email).first():
            raise HTTPException(status_code=400, detail="El email ya está en uso")
        usuario.email = datos.email

    if datos.nombre is not None:
        usuario.nombre = datos.nombre
    if datos.direccion is not None:
        usuario.direccion = datos.direccion
    if datos.telefono is not None:
        usuario.telefono = datos.telefono
    if datos.password:
        usuario.password = hashear_password(datos.password)

    db.commit()
    db.refresh(usuario)
    return usuario


@router.delete("/{id}")
def eliminar_usuario(
    id: int,
    db: Session = Depends(get_db),
    admin: Usuario = Depends(get_current_admin),
):
    usuario = db.query(Usuario).filter(Usuario.id == id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if usuario.es_admin:
        raise HTTPException(status_code=400, detail="No se puede eliminar a otro administrador")

    # Restaurar stock de pedidos activos
    for pedido in usuario.pedidos:
        if pedido.estado.value in ("pagado", "enviado", "entregado"):
            for item in pedido.items:
                producto = db.query(Producto).filter(Producto.id == item.producto_id).first()
                if producto:
                    producto.stock += item.cantidad

    db.delete(usuario)
    db.commit()
    return {"mensaje": "Usuario eliminado correctamente"}
