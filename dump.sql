CREATE DATABASE dindin;

CREATE TABLE usuarios (
	id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL
);

CREATE TABLE categorias (
	id SERIAL PRIMARY KEY,
	usuario_id INTEGER REFERENCES usuarios(id),
	descricao TEXT NOT NULL
);

CREATE TABLE transacoes (
	id SERIAL PRIMARY KEY,
	descricao TEXT NOT NULL,
	valor INTEGER NOT NULL,
	data DATE NOT NULL,
    categoria_id INTEGER REFERENCES categorias(id),
    usuario_id INTEGER REFERENCES usuarios(id),
	tipo TEXT NOT NULL
);

ALTER TABLE transacoes
ALTER COLUMN data TYPE TIMESTAMP;











