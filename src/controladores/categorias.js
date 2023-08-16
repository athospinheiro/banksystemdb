const pool = require('../conexao');

const cadastrarCategoria = async (req, res) => {
    const { descricao } = req.body;
    if (!descricao) {
        return res.status(400).json({ "mensagem": "O campo descricão é obrigatório." });
    }
    const id = req.usuario;
    try {
        const queryCadastrarDescricao = (`
            INSERT INTO categorias
                (usuario_id, descricao)
            VALUES
                ($1, $2) RETURNING id,descricao,usuario_id`
        );

        const cadastrarCategoria = await pool.query(queryCadastrarDescricao, [id, descricao]);

        return res.status(201).json(cadastrarCategoria.rows[0]);
    } catch (error) {
        return res.status(500).json({ "mensagem": "Erro interno do servidor." });
    }
}

const detalharCategoriaPorId = async (req, res) => {
    const { id } = req.params;
    const idAutenticado = req.usuario;
    try {
        const queryDetalharCategoria = (`
            SELECT *
            FROM categorias
            WHERE id = $1 AND usuario_id = $2
        `);
        const detalharCategoria = await pool.query(queryDetalharCategoria, [id, idAutenticado]);
        if (detalharCategoria.rowCount < 1) {
            return res.status(404).json({ "mensagem": "categoria não existente" });
        }

        return res.status(200).json(detalharCategoria.rows[0]);
    } catch (error) {
        return res.status(500).json({ "mensagem": "erro interno de servidor" });
    }
}

const listarCategorias = async (req, res) => {
    const idAutenticado = req.usuario;
    try {
        const queryDetalharCategoria = (`
            SELECT *
            FROM categorias
            WHERE usuario_id = $1
        `);
        const listarCategoria = await pool.query(queryDetalharCategoria, [idAutenticado]);

        return res.status(200).json(listarCategoria.rows);
    } catch (error) {
        return res.status(500).json({ "mensagem": "erro interno de servidor" });
    }
}

const deletarCategoriaPorId = async (req, res) => {
    const { id } = req.params;
    const idAutenticado = req.usuario;
    try {
        const queryBuscarCategoria = (`
            SELECT *
            FROM categorias
            WHERE id = $1 AND usuario_id = $2
        `);

        const buscarCategoria = await pool.query(queryBuscarCategoria, [id, idAutenticado]);

        if (buscarCategoria.rowCount < 1) {
            return res.status(404).json({ "mensagem": "categoria não encontrada." });
        }

        const deletarCategoria = await pool.query('delete from categorias where id = $1', [id]);

        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ "mensagem": "erro interno de servidor." });
    }
}

const atualizarCategoriaPorId = async (req, res) => {
    const { id } = req.params;
    const { descricao } = req.body;
    const idAutenticado = req.usuario;

    if (!descricao) {
        return res.status(400).json({ "mensagem": "O campo descricão é obrigatório." });
    }

    try {
        const queryBuscarCategoria = (`
            SELECT *
            FROM categorias
            WHERE id = $1 AND usuario_id = $2
        `);

        const buscarCategoria = await pool.query(queryBuscarCategoria, [id, idAutenticado]);

        if (buscarCategoria.rowCount < 1) {
            return res.status(404).json({ "mensagem": "categoria não encontrada." })
        }

        const queryAtualizarDescricao = (`
            UPDATE categorias
            SET descricao = $1
            WHERE id = $2
        `);

        const atualizarCategoria = await pool.query(queryAtualizarDescricao, [descricao, id]);

        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ "mensagem": "Erro interno do servidor." });
    }
}

module.exports = {
    cadastrarCategoria,
    detalharCategoriaPorId,
    listarCategorias,
    deletarCategoriaPorId,
    atualizarCategoriaPorId
}