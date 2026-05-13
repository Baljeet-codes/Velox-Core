# 🛒 EcommerceCaps

> Plataforma de e-commerce dedicada a la venta de gorras, lociones y relojes.

[![Python](https://img.shields.io/badge/Python-3.12+-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.136.0-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.2-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📋 Descripción del Proyecto

EcommerceCaps es una API RESTful desarrollada con **FastAPI** que proporciona la infraestructura necesaria para una tienda en línea de accesorios (gorras, lociones y relojes). El proyecto incluye gestión de usuarios, productos, categorías, carrito de compras y pedidos.

### ✨ Características Principales

- 🔐 **Autenticación segura** con JWT y hashing de contraseñas
- 👥 **Gestión de usuarios** con roles y puntos de fidelidad
- 📦 **Gestión de productos** con categorías, marcas y stock
- 🛒 **Carrito de compras** persistente por usuario
- 📋 **Sistema de pedidos** completo con estados
- 🐘 **Base de datos PostgreSQL** con Docker
- 📚 **Documentación interactiva** con Swagger UI
- 🔄 **Scripts SQL** para inicialización y datos de prueba

---

## 🛠️ Tecnologías

| Categoría | Tecnología |
|-----------|-------------|
| **Backend** | FastAPI (Python 3.12+) |
| **Base de datos** | PostgreSQL 16 |
| **ORM** | SQLAlchemy 2.0 |
| **Contenedores** | Docker + Docker Compose |
| **Admin DB** | pgAdmin 4 |
| **Servidor** | Uvicorn |
| **Frontend** | React 18 + Vite 5 |
| **UI** | Bootstrap 5 |

---

## 📋 Requisitos Previos

> ⚠️ **IMPORTANTE:** Antes de iniciar, asegúrate de tener instaladas las versiones correctas de cada herramienta. Las versiones anteriores pueden causar problemas de compatibilidad.

### Requisitos del Sistema

| Herramienta | Versión Mínima | Versión Recomendada | Verificar Instalación |
|-------------|----------------|---------------------|----------------------|
| **Python** | 3.12+ | 3.12.x | `python3 --version` |
| **Node.js** | 18.0+ | 20.x LTS | `node --version` |
| **npm** | 9.0+ | 10.x | `npm --version` |
| **Docker** | 20.10+ | Latest | `docker --version` |
| **Docker Compose** | 2.0+ | Latest | `docker compose version` |
| **PostgreSQL** (cliente) | 14+ | 16 | `psql --version` |

### Verificar Versiones Instaladas

```bash
# Verificar todas las versiones instaladas
echo "=== Python ===" && python3 --version
echo "=== Node.js ===" && node --version
echo "=== npm ===" && npm --version
echo "=== Docker ===" && docker --version
echo "=== Docker Compose ===" && docker compose version
```

### Instalar Node.js (si no lo tienes)

**Ubuntu/Debian:**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**macOS (con Homebrew):**
```bash
brew install node@20
```

**Windows:**
Descargar desde [nodejs.org](https://nodejs.org/) la versión LTS recomendada.

---

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone https://github.com/devsebas22/EcommerceCaps.git
cd EcommerceCaps/proyectoFinal
```

### 2. Crear el Entorno Virtual

```bash
python3 -m venv venv
source venv/bin/activate    # Linux/Mac
# venv\Scripts\activate     # Windows
```

### 3. Instalar Dependencias de Python

```bash
pip install -r requirements.txt
```

### 4. Instalar Dependencias del Frontend

```bash
cd frontend
npm install
cd ..
```

### 5. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
DATABASE_URL=postgresql://ecommerce_user:ecommerce123@127.0.0.1:5433/ecommerce_db
```

### 6. Levantar la Base de Datos

```bash
docker compose up -d
```

### 7. Inicializar la Base de Datos

```bash
# Ejecutar script de creación de tablas
docker exec -i ecommerce-db psql -U ecommerce_user -d ecommerce_db < create_tables.sql

# (Opcional) Cargar datos de ejemplo
docker exec -i ecommerce-db psql -U ecommerce_user -d ecommerce_db < seed.sql
```

---

## ▶️ Iniciar el Proyecto

### ⚡ Método Rápido (Recomendado): Script `iniciar.sh`

> ⚠️ **Nota:** Este script está diseñado para sistemas **Linux/macOS** con Zsh. Requiere haber completado los pasos de instalación anteriores.

```bash
# Dar permisos de ejecución (solo la primera vez)
chmod +x iniciar.sh

# Ejecutar el script
./iniciar.sh
```

**Esto iniciara:**
1. Backend (FastAPI) en [http://127.0.0.1:8000](http://127.0.0.1:8000)
2. Frontend (React + Vite) en [http://localhost:5173](http://localhost:5173)
3. Documentación API en [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

### 📝 Método Manual: Iniciar Servicios Manualmente

Si prefieres iniciar los servicios manualmente:

#### Iniciar el Backend

```bash
source venv/bin/activate
uvicorn app.main:app --reload --env-file .env
```

#### Iniciar el Frontend

```bash
cd frontend
npm run dev
```

#### Acceder a la Documentación

Abre en tu navegador: **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)**

---

## 📁 Estructura del Proyecto

```
proyectoFinal/
├── app/
│   ├── __init__.py         # Inicialización de la app
│   ├── database.py         # Configuración de base de datos
│   ├── main.py             # Punto de entrada de FastAPI
│   ├── models/             # Modelos SQLAlchemy
│   │   ├── usuario.py
│   │   ├── producto.py
│   │   ├── categoria.py
│   │   ├── carrito.py
│   │   └── pedido.py
│   ├── routers/            # Endpoints de la API
│   │   ├── usuarios.py
│   │   ├── productos.py
│   │   ├── categorias.py
│   │   ├── carrito.py
│   │   └── pedidos.py
│   └── schemas/            # Esquemas Pydantic
│       ├── usuario.py
│       ├── producto.py
│       ├── categoria.py
│       ├── carrito.py
│       └── pedido.py
├── frontend/                # Frontend React + Vite
│   ├── src/
│   │   ├── App.jsx
│   │   ├── Catalogo.jsx
│   │   ├── Registro.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── create_tables.sql       # Script de creación de tablas
├── seed.sql                # Datos de ejemplo iniciales
├── docker-compose.yml      # Configuración de contenedores
├── requirements.txt        # Dependencias Python
├── iniciar.sh              # Script de inicio rápido
└── .env                    # Variables de entorno
```

---

## 🗄️ Esquema de Base de Datos

### Tablas Principales

| Tabla | Descripción |
|-------|-------------|
| `usuarios` | Usuarios con email, password, dirección, teléfono, rol admin y puntos de fidelidad |
| `categorias` | Categorías de productos (gorras, lociones, relojes) |
| `productos` | Productos con nombre, descripción, precio, marca, stock e imagen |
| `carritos` | Carritos asociados a usuarios |
| `carrito_items` | Items dentro del carrito (relación carrito-producto) |
| `pedidos` | Pedidos con estado, total y dirección de envío |
| `pedido_items` | Items de cada pedido |

### Datos de Ejemplo (seed.sql)

El proyecto incluye datos iniciales para probar:
- **3 categorías:** gorras, lociones, relojes
- **5 productos:** Gorras Nike, Loción Armani, Reloj Casio, Loción Gucci, Gorra Puma BMW

---

## 🔗 Endpoints de la API

### Usuarios
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/usuarios/` | Crear usuario |
| `GET` | `/usuarios/{id}` | Obtener usuario por ID |
| `PUT` | `/usuarios/{id}` | Actualizar usuario |

### Productos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/productos/` | Listar todos los productos |
| `GET` | `/productos/{id}` | Obtener producto por ID |
| `POST` | `/productos/` | Crear nuevo producto |
| `PUT` | `/productos/{id}` | Actualizar producto |
| `DELETE` | `/productos/{id}` | Eliminar producto |

### Categorías
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/categorias/` | Listar todas las categorías |
| `GET` | `/categorias/{id}` | Obtener categoría por ID |
| `POST` | `/categorias/` | Crear nueva categoría |
| `DELETE` | `/categorias/{id}` | Eliminar categoría |

### Carrito
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/carrito/{usuario_id}` | Ver carrito del usuario |
| `POST` | `/carrito/{usuario_id}` | Agregar producto al carrito |
| `PUT` | `/carrito/{usuario_id}/item/{item_id}` | Actualizar cantidad de un item |
| `DELETE` | `/carrito/{usuario_id}/item/{item_id}` | Eliminar item del carrito |

### Pedidos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/pedidos/{usuario_id}` | Crear pedido desde el carrito |
| `GET` | `/pedidos/historial/{usuario_id}` | Ver historial de pedidos |

> 📖 Documentación completa disponible en **Swagger UI** en [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## 🐳 Servicios Docker

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| **PostgreSQL** | `5433` | Base de datos |
| **pgAdmin** | `5050` | Admin de DB (admin@admin.com / admin123) |

---

## 🤝 Contribuir

1. Fork del repositorio
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 👥 Autores

<div align="center">

| |
|---|
| **Juan Esteban Aguirre Foronda** |
| **Sebastian Mogollón Mendoza** |

</div>
> © 2026 EcommerceCaps - Todos los derechos reservados---

## �📄 Licencia

Este proyecto está bajo la licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.

---

<div align="center">

⭐️ Si te gusta este proyecto, ¡dale una estrella!

</div>