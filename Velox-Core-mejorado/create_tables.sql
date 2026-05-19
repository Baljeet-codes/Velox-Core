CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR NOT NULL UNIQUE,
    descripcion VARCHAR
);

CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR NOT NULL,
    descripcion VARCHAR,
    precio FLOAT NOT NULL,
    marca VARCHAR NOT NULL,
    stock INTEGER DEFAULT 0,
    imagen_url VARCHAR,
    categoria_id INTEGER NOT NULL REFERENCES categorias(id)
);

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR NOT NULL,
    email VARCHAR NOT NULL UNIQUE,
    password VARCHAR NOT NULL,
    direccion VARCHAR,
    telefono VARCHAR,
    es_admin BOOLEAN DEFAULT FALSE,
    puntos_fidelidad INTEGER DEFAULT 0
);

CREATE TABLE carritos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id)
);

CREATE TABLE carrito_items (
    id SERIAL PRIMARY KEY,
    carrito_id INTEGER NOT NULL REFERENCES carritos(id),
    producto_id INTEGER NOT NULL REFERENCES productos(id),
    cantidad INTEGER DEFAULT 1
);

CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    total FLOAT NOT NULL,
    estado VARCHAR DEFAULT 'pendiente',
    direccion_envio VARCHAR NOT NULL
);

CREATE TABLE pedido_items (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER NOT NULL REFERENCES pedidos(id),
    producto_id INTEGER NOT NULL REFERENCES productos(id),
    cantidad INTEGER NOT NULL,
    precio_unitario FLOAT NOT NULL
);