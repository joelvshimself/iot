const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const os = require('os');
const readline = require('readline');
const app = express();
const port = 5050;

app.use(cors());


// Configuración de la conexión a la base de datos MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'snow'
});

// Conexión a la base de datos
db.connect((err) => {
    if (err) { 
        console.error('Error al conectar a la base de datos:', err);
        return;
    }
    console.log('Conectado a la base de datos');
});


// ciclo de querys
let valor = 0;
let sensor = 2;
let inicio= 3601;

for(let i =inicio ; i < (inicio+200); i++) {
    const query = `INSERT INTO registros (idregistro, fechaHora, usuario, medida, idsensor, valor) VALUES (-${i}, '2023-11-30 18:26:58', '10', '${sensor}', '${sensor}', '96');`;    db.query(query, (err, results) => {
        if (err) {
            console.error('Error en la consulta:', err);
            return;
        }
        console.log('Consulta ejecutada con éxito, filas afectadas:', results.affectedRows);
    });
}
console.log('ultimo id: ', inicio+200);


