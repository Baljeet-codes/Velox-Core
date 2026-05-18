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
    """Campos opcionales para actualizar perfil (PATCH-style sobre PUT)."""
    nombre: Optional[str] = None
    email: Optional[EmailStr] = None
    direccion: Optional[str] = None
    telefono: Optional[str] = None
    password: Optional[str] = None  # Sólo se actualiza si se envía


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
