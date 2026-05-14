# Velox-Core

> Plataforma de e-commerce moderna con frontend React + Vite y backend FastAPI.

[![Python](https://img.shields.io/badge/Python-3.12+-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.136.0-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.2-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)

---

## Tecnologías

| Categoría | Tecnología |
|-----------|------------|
| **Backend** | FastAPI (Python 3.12) |
| **Base de datos** | PostgreSQL 16 |
| **ORM** | SQLAlchemy 2.0 |
| **Frontend** | React 18 + Vite 5 |
| **UI** | Bootstrap 5 + React-Bootstrap |
| **Contenedores** | Docker + Docker Compose |

---

## Requisitos Previos

| Herramienta | Versión |
|-------------|---------|
| Python | 3.12+ |
| Node.js | 18+ |
| npm | 9+ |
| Docker | 20.10+ |
| Docker Compose | 2+ |

---

## Instalación y Ejecución

### 1. Clonar e ir al proyecto

```bash
git clone https://github.com/Baljeet-codes/Velox-Core.git
cd Velox-Core
```

### 2. Levantar base de datos

```bash
docker compose up -d
```

### 3. Inicializar base de datos

```bash
docker exec -i ecommerce-db psql -U ecommerce_user -d ecommerce_db < create_tables.sql
docker exec -i ecommerce-db psql -U ecommerce_user -d ecommerce_db < seed.sql
```

### 4. Iniciar backend y frontend

```bash
./iniciar.sh
```

Esto instala dependencias automáticamente y arranca ambos servidores.

### Accesos

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| Documentación | http://localhost:8000/docs |
| pgAdmin | http://localhost:5050 (admin@admin.com / admin123) |

---

### Método manual

```bash
# Backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &

# Frontend
cd frontend
npm install
npm run dev
```

---

## Estructura del Proyecto

```
Velox-Core/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI entry point + CORS + static files
│   ├── database.py          # SQLAlchemy config
│   ├── models/              # SQLAlchemy models
│   ├── routers/             # API endpoints
│   ├── schemas/             # Pydantic schemas
│   └── utils/
│       └── s3_uploader.py   # S3 upload utility (preparado para AWS)
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── pages/           # Catálogo, Login, Registro, MisPedidos
│   │   ├── admin/           # Dashboard, Productos, Usuarios, Pedidos
│   │   ├── components/      # ProductCard, ProductModal, AdminProductForm
│   │   └── hooks/           # useCarrito
│   ├── index.html
│   ├── vite.config.js
│   └── .env.production
├── Dockerfile               # Contenedor para backend
├── .dockerignore
├── docker-compose.yml       # PostgreSQL + pgAdmin
├── requirements.txt
├── iniciar.sh               # Script de inicio rápido
└── create_tables.sql / seed.sql
```

---

## Endpoints de la API

### Usuarios
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/usuarios/` | Crear usuario |
| POST | `/usuarios/login` | Iniciar sesión |
| GET | `/usuarios/{id}` | Obtener usuario |
| PUT | `/usuarios/{id}` | Actualizar usuario |
| DELETE | `/usuarios/{id}` | Eliminar usuario |

### Productos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/productos/` | Listar productos |
| GET | `/productos/{id}` | Obtener producto |
| POST | `/productos/` | Crear producto |
| PUT | `/productos/{id}` | Actualizar producto |
| DELETE | `/productos/{id}` | Eliminar producto |

### Categorías
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/categorias/` | Listar categorías |
| POST | `/categorias/` | Crear categoría |
| DELETE | `/categorias/{id}` | Eliminar categoría |

### Carrito
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/carrito/{usuario_id}` | Ver carrito |
| POST | `/carrito/{usuario_id}` | Agregar producto |
| PUT | `/carrito/{usuario_id}/item/{item_id}` | Actualizar cantidad |
| DELETE | `/carrito/{usuario_id}/item/{item_id}` | Eliminar item |

### Pedidos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/pedidos/{usuario_id}` | Crear pedido |
| GET | `/pedidos/historial/{usuario_id}` | Historial de pedidos |
| GET | `/pedidos/todos/` | Todos los pedidos (admin) |
| PUT | `/pedidos/{pedido_id}/estado` | Actualizar estado (admin) |

### Imágenes
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/imagenes/subir` | Subir imagen (multipart) |
| GET | `/imagenes/{producto_id}` | Obtener imágenes de producto |
| DELETE | `/imagenes/{imagen_id}` | Eliminar imagen |

---

## Variables de Entorno

| Variable | Default | Descripción |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://ecommerce_user:ecommerce123@127.0.0.1:5433/ecommerce_db` | Conexión PostgreSQL |
| `FRONTEND_URL` | `http://localhost:5173` | Origen CORS frontend |
| `VITE_API_URL` | `http://localhost:8000` | URL del backend (frontend) |

---

## Preparado para AWS

El proyecto incluye estructura lista para despliegue en AWS:
- `Dockerfile` para contenerizar el backend
- `app/utils/s3_uploader.py` para subida a S3 (activar con variables de entorno)
- CORS configurable vía `FRONTEND_URL`
- `API_BASE` centralizado vía `import.meta.env.VITE_API_URL`

Para activar S3, configura:
```
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
S3_BUCKET_NAME=
```

---
