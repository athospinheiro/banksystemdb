const pool = require('../conexao');

const cadastrarTransacao = async (req, res) => {
    const { descricao, valor, data, categoria_id, tipo } = req.body;
    const idAutenticado = req.usuario;
    if (!descricao || !valor || !data || !categoria_id || !tipo) {
        return res.status(400).json({ mensagem: "Todos os campos são obrigatorios: descricao, valor, data, categoria_id, tipo" });
    }

    if (tipo.toLowerCase() != 'entrada' && tipo.toLowerCase() != 'saída') {
        return res.status(400).json({ mensagem: "O tipo de transação não é válido." });
    }
    try {
        const queryVerificarCategoria = (`
            SELECT *
            FROM categorias
            WHERE id = $1 AND usuario_id = $2
        `);
        const verificarCategoria = await pool.query(queryVerificarCategoria, [categoria_id, idAutenticado]);

        if (verificarCategoria.rowCount < 1) {
            return res.status(404).json({ "mensagem": "categoria não existente" });
        }

        const { usuario_id, descricaoCategoria } = verificarCategoria.rows[0];

        const queryCadastrandoTransacao = (`
            INSERT INTO transacoes
                (descricao, valor, data, categoria_id, usuario_id, tipo)
            VALUES
                ($1, $2, $3, $4, $5, $6)
                RETURNING     
                    id,
                    tipo,
                    descricao,
                    valor,
                    data,
                    usuario_id,
                    categoria_id,
                    (SELECT descricao FROM categorias WHERE id = $4) AS categoria_nome
            `);

        const cadastrandoTransacao = await pool.query(queryCadastrandoTransacao, [descricao, valor, data, categoria_id, usuario_id, tipo]);

        return res.status(201).json(cadastrandoTransacao.rows[0]);
    } catch (error) {
        return res.status(500).json({ "mensagem": "erro interno de servidor." });
    }
}

const listarTransacoes = async (req, res) => {
    const idAutenticado = req.usuario;
    const { filtro } = req.query;
    try {
        const queryListarTransacoes = (`
            SELECT
                t.id, t.tipo, t.descricao, t.valor, t.data,
                t.usuario_id, t.categoria_id,
                c.descricao AS categoria_nome
            FROM transacoes t
            JOIN categorias c
            ON t.categoria_id = c.id
            WHERE t.usuario_id = $1
        `);

        const listarTransacoes = await pool.query(queryListarTransacoes, [idAutenticado]);

        if(!filtro) {
            return res.status(200).json(listarTransacoes.rows);
        }

        const transacaoFiltrada = listarTransacoes.rows.filter((transacao) => filtro.includes(transacao.categoria_nome));

        return res.status(200).json(transacaoFiltrada);
    } catch (error) {
        return res.status(500).json({ "mensagem": "erro interno de servidor" });
    }
}

const detalharTransacaoPorId = async (req, res) => {
    const { id } = req.params;
    const idAutenticado = req.usuario;
    try {
        const queryDetalharTransacao = (`
            SELECT
                t.id, t.tipo, t.descricao, t.valor, t.data,
                t.usuario_id, t.categoria_id,
                c.descricao AS categoria_nome
            FROM transacoes t
            JOIN categorias c
            ON t.categoria_id = c.id
            WHERE t.id = $1 AND t.usuario_id = $2
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
    const { id } = req.params;
    const idAutenticado = req.usuario;
    const { descricao, valor, data, categoria_id, tipo } = req.body;
    if (!descricao || !valor || !data || !categoria_id || !tipo) {
        return res.status(400).json({ mensagem: "Todos os campos são obrigatorios: descricao, valor, data, categoria_id, tipo " });
    }
    if (tipo.toLowerCase() != 'entrada' && tipo.toLowerCase() != 'saída') {
        return res.status(400).json({ mensagem: "O tipo de transação não é válido." });
    }
    try {
        const queryProcurarTransacaoPorId = (`
            SELECT *
            FROM transacoes
            WHERE id = $1 AND usuario_id = $2
        `);

        const procurarTransacaoPorId = await pool.query(queryProcurarTransacaoPorId, [id, idAutenticado]);

        if (procurarTransacaoPorId.rowCount < 1) {
            return res.status(404).json({ "mensagem": "Transação não encontrada." });
        }

        const buscarCategoriaPorUsuario = await pool.query('select * from categorias where id = $1 and usuario_id = $2', [categoria_id, idAutenticado]);
        if (buscarCategoriaPorUsuario.rowCount < 1) {
            return res.status(404).json({ "mensagem": "O tipo de categoria que você deseja atualizar não se encontra cadastrado para o usuário em questão." })
        }
        const queryUpdateTransacoes = (`
            UPDATE transacoes
            SET descricao = $1, valor= $2, data = $3, categoria_id = $4, tipo = $5
            WHERE id = $6
        `);

        const atualizarTransacaoPorId = await pool.query(queryUpdateTransacoes, [descricao, valor, data, categoria_id, tipo, id]);

        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ mensagem: "Erro interno do servidor" });
    }
}

const deletarTransacaoPorId = async (req, res) => {
    const { id } = req.params;
    const idAutenticado = req.usuario;

    try {
        const queryBuscarTransacao = (`
            SELECT *
            FROM transacoes
            WHERE id = $1 AND usuario_id = $2
        `);

        const buscarTransacao = await pool.query(queryBuscarTransacao, [id, idAutenticado]);

        if (buscarTransacao.rowCount < 1) {
            return res.status(404).json({ "mensagem": "Transação não encontrada." })
        }

        const deletarTransacao = await pool.query('delete from transacoes where id = $1', [id]);

        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ mensagem: "Erro interno do servidor." });
    }
}

const obterExtratoTransacoes = async (req, res) => {
    const idAutenticado = req.usuario;
    try {
        let entrada = 0;
        let saida = 0;
        let stringEntrada = 'entrada';
        let stringSaida = 'saída';
        const buscarEntradas = await pool.query('select valor from transacoes where tipo = $1 and usuario_id = $2', [stringEntrada, idAutenticado]);
        if (buscarEntradas.rowCount < 1) {
            entrada = 0;
        }

        for (j = 0; j < buscarEntradas.rows.length; j++) {
            entrada = entrada + buscarEntradas.rows[j].valor;
        }

        const buscarSaidas = await pool.query('select valor from transacoes where tipo = $1 and usuario_id = $2', [stringSaida, idAutenticado]);
        if (buscarSaidas.rowCount < 1) {
            saida = 0;
        }
        for (i = 0; i < buscarSaidas.rows.length; i++) {
            saida = saida + buscarSaidas.rows[i].valor;
        }

        return res.status(200).json(
            {
            entradas: entrada,
            saidas: saida
            }
        );
    } catch (error) {
        return res.status(500).json({ "mensagem": "erro interno do servidor." });
    }
}
module.exports = {
    cadastrarTransacao,
    listarTransacoes,
    detalharTransacaoPorId,
    atualizarTransacaoPorId,
    deletarTransacaoPorId,
    obterExtratoTransacoes
}