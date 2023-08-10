const express = require('express');
const { cadastrarUsuario, logarUsuario, obterUsuario } = require('./controladores/usuarios');
const { verificarUsuarioLogado } = require('./intermediarios/autenticacao');
const rotas = express();

rotas.post('/usuario', cadastrarUsuario);
rotas.post('/login', logarUsuario);

rotas.use(verificarUsuarioLogado);

rotas.get('/usuario', obterUsuario)

module.exports = rotas;