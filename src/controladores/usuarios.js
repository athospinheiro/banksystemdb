const pool = require('../conexao');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const senha_jwt = require('../senha_jwt');

const cadastrarUsuario = async (req, res) => {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) {
        return res.status(400).json({ mensagem: "Todos os campos são obrigatorios: nome, email e senha " });
    }

    const arrayEmail = email.split("");

    if (!arrayEmail.includes("@")) {
        return res.status(400).json({ mensagem: "Email em formato invalido" });
    }

    try {
        const queryEmail = (`
            SELECT *
            FROM usuarios
            WHERE email = $1
        `);

        const verificarEmail = await pool.query(queryEmail, [email]);

        if (verificarEmail.rowCount > 0) {
            return res.status(400).json({ mensagem: "Email ja cadastrado" });
        }

        const senhaCriptografada = await bcrypt.hash(senha, 10);

        const queryInsert = (`
            INSERT INTO usuarios
                (nome, email, senha)
            VALUES
                ($1, $2, $3) RETURNING id, nome, email
        `);

        const cadastrarUsuario = await pool.query(queryInsert, [nome, email, senhaCriptografada]);

        return res.status(201).json(cadastrarUsuario.rows[0]);
    } catch (error) {
        return res.status(500).json({ mensagem: "Erro interno do servidor" });
    }
}

const logarUsuario = async (req, res) => {
    const { email, senha } = req.body;
    if (!email || !senha) {
        return res.status(404).json({ mensagem: "Todos os campos são obrigatorios: nome, email e senha " });
    }

    try {
        const queryEmail = (`
            SELECT *
            FROM usuarios
            WHERE email = $1
        `);
        const verificarEmail = await pool.query(queryEmail, [email]);
        if (verificarEmail.rowCount == 0) {
            return res.status(400).json({ mensagem: "Email Ou Senha Invalidos" });
        }

        const senhaValida = await bcrypt.compare(senha, verificarEmail.rows[0].senha);

        if (!senhaValida) {
            return res.status(400).json({ mensagem: "Email Ou Senha Invalidos" });
        }

        const token = jwt.sign(
            {
                id: verificarEmail.rows[0].id
            },
            senha_jwt,
            {
                expiresIn: "1h"
            }
        );

        const { senha: _, ...usuarioSemSenha } = verificarEmail.rows[0];

        return res.status(200).json({
            usuario: usuarioSemSenha, token
        });
    } catch (error) {
        return res.status(500).json({ mensagem: "Erro interno do servidor" });
    }
}

const obterUsuario = async (req, res) => {
    const id = req.usuario;
    try {
        const queryObeterUsuario = await pool.query(`
            SELECT *
            FROM usuarios
            WHERE id = $1`,
            [id]
        );
        const { senha: _, ...usuarioSemSenha } = queryObeterUsuario.rows[0];

        return res.status(200).json(usuarioSemSenha);
    } catch (error) {
        return res.status(500).json({ mensagem: "Erro interno do servidor" });
    }
}

const atualizarUsuario = async (req, res) => {
    const id = req.usuario;
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) {
        return res.status(400).json({ mensagem: "Todos os campos são obrigatorios: nome, email e senha " });
    }

    const arrayEmail = email.split("");
    if (!arrayEmail.includes("@")) {
        return res.status(400).json({ mensagem: "Email em formato invalido" });
    }

    try {
        const queryEmail = (`
            SELECT *
            FROM usuarios
            WHERE email = $1
        `);

        const verificarEmail = await pool.query(queryEmail, [email]);

        if (verificarEmail.rowCount > 0) {
            return res.status(400).json({ mensagem: "Email ja cadastrado" });
        }

        const senhaCriptografada = await bcrypt.hash(senha, 10);

        const queryUpdate = (`
            UPDATE usuarios
            SET nome = $1, email= $2, senha = $3
            WHERE id = $4
        `);

        const atualizarUsuario = await pool.query(queryUpdate, [nome, email, senhaCriptografada, id]);

        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ mensagem: "Erro interno do servidor" });
    }
}

module.exports = {
    cadastrarUsuario,
    logarUsuario,
    obterUsuario,
    atualizarUsuario,
}
