from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

class Producto(Base):
    __tablename__ = "productos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    descripcion = Column(String)
    precio = Column(Float, nullable=False)
    marca = Column(String, nullable=False)
    stock = Column(Integer, default=0)
    imagen_url = Column(String)
    categoria_id = Column(Integer, ForeignKey("categorias.id"), nullable=False)

    categoria = relationship("Categoria", back_populates="productos")
    imagenes = relationship("ProductoImagen", back_populates="producto")

class ProductoImagen(Base):
    __tablename__ = "producto_imagenes"

    id = Column(Integer, primary_key=True, index=True)
    producto_id = Column(Integer, ForeignKey("productos.id"), nullable=False)
    url = Column(String, nullable=False)
    es_principal = Column(Boolean, default=False)

    producto = relationship("Producto", back_populates="imagenes")