import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import Base
from app import models
from app.routers import categorias, productos, usuarios, carrito, pedidos, imagenes, stats
from app.seed_admin import crear_admin

app = FastAPI()

@app.on_event("startup")
def startup():
    crear_admin()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(categorias.router)
app.include_router(productos.router)
app.include_router(usuarios.router)
app.include_router(carrito.router)
app.include_router(pedidos.router)
app.include_router(imagenes.router)
app.include_router(stats.router)

os.makedirs("static/uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/health", tags=["Salud"])
def health_check():
    return {"status": "healthy", "service": "velox-core"}

@app.get("/")
def root():
    return {"mensaje": "Bienvenido al API de Ecommerce 🛒"}