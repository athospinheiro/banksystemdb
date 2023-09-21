const express = require('express');
const rotas = require('./rotas');
const app = express();
require('dotenv').config();
const cors = require('cors');
app.use(cors());
app.use(express.json());
app.use(rotas);

const port = process.env.PORT;
app.listen(port, ()=>{
    console.log(port);
});