const express = require('express');

const { cadastrarUsuario, logarUsuario, obterUsuario, atualizarUsuario } = require('./controladores/usuarios');
const { cadastrarCategoria, detalharCategoriaPorId, listarCategorias, deletarCategoriaPorId, atualizarCategoriaPorId } = require('./controladores/categorias');
const { cadastrarTransacao, listarTransacoes, detalharTransacaoPorId, atualizarTransacaoPorId, deletarTransacaoPorId, obterExtratoTransacoes } = require('./controladores/transacoes');

const { verificarUsuarioLogado } = require('./intermediarios/autenticacao');

const rotas = express();

rotas.post('/usuario', cadastrarUsuario);
rotas.post('/login', logarUsuario);

rotas.use(verificarUsuarioLogado);

rotas.get('/usuario', obterUsuario);
rotas.put('/usuario', atualizarUsuario);

rotas.post('/categoria', cadastrarCategoria);
rotas.get('/categoria/:id', detalharCategoriaPorId);
rotas.get('/categoria', listarCategorias);
rotas.delete('/categoria/:id', deletarCategoriaPorId);
rotas.put('/categoria/:id', atualizarCategoriaPorId);

rotas.post('/transacao', cadastrarTransacao);
rotas.get('/transacao', listarTransacoes);
rotas.get('/transacao/extrato', obterExtratoTransacoes);
rotas.get('/transacao/:id', detalharTransacaoPorId);
rotas.put('/transacao/:id', atualizarTransacaoPorId);
rotas.delete('/transacao/:id', deletarTransacaoPorId);

module.exports = rotas;