const { Pool } = require('pg')

const pool = new Pool({
	host: 'localhost',
	port: 5432,
	user: 'postgres',
	password: 'senha',
	database: 'dindin',
});

module.exports = pool;
