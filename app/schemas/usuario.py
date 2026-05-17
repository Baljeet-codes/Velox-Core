from pydantic import BaseModel, EmailStr

class UsuarioBase(BaseModel):
    nombre: str
    email: EmailStr
    direccion: str | None = None
    telefono: str | None = None

class UsuarioCreate(UsuarioBase):
    password: str

class UsuarioResponse(UsuarioBase):
    id: int
    es_admin: bool
    puntos_fidelidad: int

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    id: int
    nombre: str
    email: str
    telefono: str | None = None
    direccion: str | None = None
    es_admin: bool
    puntos_fidelidad: int = 0
    mensaje: str