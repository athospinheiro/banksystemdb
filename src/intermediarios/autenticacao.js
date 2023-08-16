const pool = require('../conexao');
const jwt = require('jsonwebtoken');
const senha_jwt = require('../senha_jwt');

const verificarUsuarioLogado = async (req, res, next) => {
    const { authorization } = req.headers;
    if(!authorization) {
        return res.status(401).json({ mensagem: "Não autorizado" });
    }
   
    const token = authorization.split(' ')[1];

    try {
        const assinaturaToken = jwt.verify(token , senha_jwt);
        
        const usuario = await pool.query(`
            SELECT *
            FROM usuarios
            WHERE id = $1`, [assinaturaToken.id]
        );

        if(!usuario) {
            return res.status(404).json({ mensagem: "Não existe usuario" });
        }

        req.usuario = assinaturaToken.id;
 
        next();
    } catch (error) {
        return res.status(401).json({ mensagem: "Para acessar este recurso um token de autenticação válido deve ser enviado." });
    }
}

module.exports = {
    verificarUsuarioLogado
}
