const pool = require('../conexao');

const cadastrarTransacao = async  (req, res) => {
    const { descricao, valor, data, categoria_id, tipo } = req.body;
    const idAutenticado = req.usuario;
    if(!descricao || !valor ||!data ||!categoria_id ||!tipo) {
        return res.status(400).json({ mensagem: "Todos os campos são obrigatorios: descricao, valor, data, categoria_id, tipo" });
    }

    try {    
        const queryVerificarCategoria= (`
            SELECT *
            FROM categorias
            WHERE id = $1 AND usuario_id = $2
        `);
        const verificarCategoria = await pool.query(queryVerificarCategoria, [categoria_id, idAutenticado]);

        if(verificarCategoria.rowCount < 1) {
            return res.status(404).json({ "mensagem": "categoria não existente" });
        }

        const { usuario_id, descricao } = verificarCategoria.rows[0];
        // const { usuario_id, descricao } = verificarCategoria.rows[0];
        // console.log(descricao);
        // Descricao da categoria

        const queryCadastrandoTransacao = (`
            INSERT INTO transacoes
                (descricao, valor, data, categoria_id, usuario_id, tipo)
            VALUES
                ($1, $2, $3, $4, $5, $6) RETURNING id, tipo, descricao, valor, data, usuario_id, categoria_id
        `);

        const cadastrandoTransacao = await pool.query(queryCadastrandoTransacao, [descricao, valor, data, categoria_id, usuario_id, tipo]);
        
        //const { tipo, descricao, valor, data, usuario_id, categoria_id  } = cadastrandoTransacao;

        return res.status(201).json(cadastrandoTransacao.rows[0]);
    } catch (error) {
        return res.status(500).json({ "mensagem": "erro interno de servidor." });
    }
}

const listarTransacoes = async (req, res) => {
    const idAutenticado = req.usuario;
    try {
        const queryListarTransacoes = (`
            SELECT *
            FROM transacoes
            WHERE usuario_id = $1
        `);
        const listarTransacoes= await pool.query(queryListarTransacoes, [idAutenticado]);
        
        return res.status(200).json(listarTransacoes.rows);
    } catch (error) {
        return res.status(500).json({ "mensagem": "erro interno de servidor" });
    }
}

const detalharTransacao = async (req, res) => {
    const { id } = req.params;
    const idAutenticado = req.usuario;
    try {
        const queryDetalharTransacao = (`
            SELECT *
            FROM transacoes
            WHERE id = $1 AND usuario_id = $2
        `);
        const detalharTransacao = await pool.query(queryDetalharTransacao, [id, idAutenticado]);
        if (detalharTransacao.rowCount < 1) {
            return res.status(404).json({ "mensagem": "Transação não encontrada." });
        }

        return res.status(200).json(detalharTransacao.rows[0]);
    } catch (error) {
        return res.status(500).json({ "mensagem": "erro interno de servidor" });
    }
}

const atualizarTransacaoPorId = async (req, res) => {
    const { id } = req.params
    const idAutenticado = req.usuario;
    const { descricao, valor, data, categoria_id, tipo } = req.body;
    if (!descricao || !valor || !data || !categoria_id || !tipo) {
        return res.status(400).json({ mensagem: "Todos os campos são obrigatorios: descricao, valor, data, categoria_id, tipo " });
    }

    try {
        const queryProcurarTransacaoPorId = (`
            SELECT *
            FROM transacoes
            WHERE id = $1 AND usuario_id = $2
        `);

        const procurarTransacaoPorId = await pool.query(queryProcurarTransacaoPorId, [id, idAutenticado]);

        if(procurarTransacaoPorId.rowCount < 1 ) {
            return res.status(404).json({ "mensagem": "Transação não encontrada." });
        }

        const queryUpdateTransacoes = (`
            UPDATE transacoes
            SET descricao = $1, valor= $2, data = $3, categoria_id = $4, tipo = $5
            WHERE id = $6
        `);

        const atualizarTransacaoPorId = await pool.query(queryUpdateTransacoes, [descricao, valor, data, categoria_id, tipo, id]);

        return res.status(204).json();
    } catch (error) {
        return res.status(500).json({ mensagem: "Erro interno do servidor" });
    }
}

module.exports = {
    cadastrarTransacao,
    listarTransacoes,
    detalharTransacao,
    atualizarTransacaoPorId
}