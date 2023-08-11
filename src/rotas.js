const express = require('express');

const { cadastrarUsuario, logarUsuario, obterUsuario, atualizarUsuario } = require('./controladores/usuarios');
const { cadastrarCategoria, detalharCategoria, listarCategorias, deletarCategoria, atualizarCategoriaPorID } = require('./controladores/categorias');
const { cadastrarTransacao, listarTransacoes, detalharTransacao, atualizarTransacaoPorId } = require('./controladores/transacoes');

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
rotas.put('/categoria/:id', atualizarCategoriaPorID);

rotas.post('/transacao', cadastrarTransacao);
rotas.get('/transacao', listarTransacoes);
rotas.get('/transacao/:id', detalharTransacao);
rotas.put('/transacao/:id', atualizarTransacaoPorId);

module.exports = rotas;