import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import Base
from app import models
from app.routers import categorias, productos, usuarios, carrito, pedidos, imagenes, stats



app = FastAPI()

origins = [
    os.getenv("FRONTEND_URL", "http://localhost:5173"),
    os.getenv("FRONTEND_URL_ALT", "http://localhost:5174"),
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
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

@app.get("/")
def root():
    return {"mensaje": "Bienvenido al API de Ecommerce 🛒"}