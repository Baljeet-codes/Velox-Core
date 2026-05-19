from typing import Optional
from pydantic import BaseModel, EmailStr

class UsuarioBase(BaseModel):
    nombre: str
    email: EmailStr
    direccion: Optional[str] = None
    telefono: Optional[str] = None

class UsuarioCreate(UsuarioBase):
    password: str

class UsuarioUpdate(BaseModel):
    """Schema para actualización parcial de usuario (todos los campos opcionales)."""
    nombre: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    direccion: Optional[str] = None
    telefono: Optional[str] = None

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
    telefono: Optional[str] = None
    direccion: Optional[str] = None
    es_admin: bool
    puntos_fidelidad: int = 0
    access_token: str
    token_type: str = "bearer"
    mensaje: str
