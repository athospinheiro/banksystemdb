const express = require('express');
const { cadastrarUsuario, logarUsuario, obterUsuario, atualizarUsuario, cadastrarCategoria, detalharCategoria, listarCategorias, deletarCategoria } = require('./controladores/usuarios');
const { verificarUsuarioLogado } = require('./intermediarios/autenticacao');
const rotas = express();

rotas.post('/usuario', cadastrarUsuario);
rotas.post('/login', logarUsuario);

rotas.use(verificarUsuarioLogado);

rotas.get('/usuario', obterUsuario);
rotas.put('/usuario', atualizarUsuario);


rotas.post('/categoria', cadastrarCategoria);
rotas.get('/categoria/:id', detalharCategoria);
rotas.get('/categoria', listarCategorias);
rotas.delete('/categoria/:id', deletarCategoria);

module.exports = rotas;