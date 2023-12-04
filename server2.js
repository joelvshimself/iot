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

// Función para obtener la dirección IP del servidor
function getServerIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

// Endpoint para devolver la IP del servidor
app.get('/get-ip', (req, res) => {
    res.json({ ip: getServerIP() });
});

// Endpoint para obtener los últimos datos de temperatura
app.get('/ultimo-pulso', (req, res) => {
    const query = `SELECT registros.valor 
    FROM registros, medidas 
    WHERE medidas.idmedida = registros.medida AND   idregistro>0 and
    medidas.Nombre = 'heartRate' ORDER BY registros.fechaHora DESC LIMIT 1 `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error en la consulta:', err);
            res.status(500).send('Error en el servidor');
            return;
        }
        res.json(results[0]);
    });
});

app.get('/ultima-temp', (req, res) => {
    const query = "SELECT registros.valor FROM registros, medidas WHERE medidas.idmedida = registros.medida AND idregistro>0 and medidas.Nombre = 'temp' ORDER BY registros.fechaHora DESC LIMIT 1";
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error en la consulta:', err);
            res.status(500).send('Error en el servidor');
            return;
        }
        res.json(results[0]);
    });
});

app.get('/ultima-oximetria', (req, res) => {
    const query = "SELECT registros.valor FROM registros, medidas WHERE medidas.idmedida = registros.medida AND  idregistro>0 and  medidas.Nombre = 'spo2' ORDER BY registros.fechaHora DESC LIMIT 1";
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error en la consulta:', err);
            res.status(500).send('Error en el servidor');
            return;
        }
        res.json(results[0]);
    });
});


app.get('/ultimo-map', (req, res) => {
    const query = `SELECT (select registros.valor FROM registros, medidas WHERE medidas.idmedida = registros.medida AND idregistro>0 and  medidas.Nombre = 'lat' ORDER BY registros.fechaHora DESC LIMIT 1) as lat, (select registros.valor FROM registros, medidas WHERE medidas.idmedida = registros.medida AND medidas.Nombre = 'lng' ORDER BY registros.fechaHora DESC LIMIT 1) as lng;`;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error en la consulta:', err);
            res.status(500).send('Error en el servidor: ' + err.message);
            return;
        }
        res.json(results[0]);
    });
});



//query de comprobacion de usuario
app.get('/log', (req, res) => {
    const query = "SELECT nombre AS us1, id AS us2 FROM usuario; ";
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error en la consulta:', err);
            res.status(500).send('Error en el servidor');
            return;
        }
        res.json(results[0]);
    });
});

app.get('/ultima-uv', (req, res) => {
    const query = "SELECT registros.valor FROM registros, medidas WHERE medidas.idmedida = registros.medida AND idregistro>0 and  medidas.Nombre = 'uv' ORDER BY registros.fechaHora DESC LIMIT 1";
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error en la consulta:', err);
            res.status(500).send('Error en el servidor');
            return;
        }
        res.json(results[0]);
    });
});


app.get('/datos-histograma-temp', (req, res) => {
    // Asegúrate de que la consulta obtenga solo 5 registros
    const query = `SELECT 
    TRUNCATE(GREATEST( COALESCE((SELECT AVG(valor) FROM registros,medidas WHERE medida=idmedida AND Nombre="temp" and DATE(fechahora) = CURDATE() AND TIME(fechahora) BETWEEN '00:00:00' AND '04:59:59'), 0),2),1) AS t1,
    TRUNCATE(GREATEST( COALESCE((SELECT AVG(valor) FROM registros,medidas WHERE medida=idmedida AND Nombre="temp" and DATE(fechahora) = CURDATE() AND TIME(fechahora) BETWEEN '05:00:00' AND '09:59:59'), 0),2),1) AS t2,
    TRUNCATE(GREATEST( COALESCE((SELECT AVG(valor) FROM registros,medidas WHERE medida=idmedida AND Nombre="temp" and DATE(fechahora) = CURDATE() AND TIME(fechahora) BETWEEN '10:00:00' AND '14:59:59'), 0),2),1) AS t3,
    TRUNCATE(GREATEST( COALESCE((SELECT AVG(valor) FROM registros,medidas WHERE medida=idmedida AND Nombre="temp" and DATE(fechahora) = CURDATE() AND TIME(fechahora) BETWEEN '15:00:00' AND '19:59:59'), 0),2),1) AS t4,
    TRUNCATE(GREATEST( COALESCE((SELECT AVG(valor) FROM registros,medidas WHERE medida=idmedida AND Nombre="temp" and DATE(fechahora) = CURDATE() AND TIME(fechahora) BETWEEN '20:00:00' AND '24:59:59'), 0),2),1) AS t5;
    `; 
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).send('Error en el servidor');
        } else {
            res.json(results);
        }
    });
});

app.get('/datos-histograma-latidos', (req, res) => {
    // Asegúrate de que la consulta obtenga solo 5 registros
    const query = `SELECT 
    TRUNCATE(GREATEST( COALESCE((SELECT AVG(valor) FROM registros,medidas WHERE medida=idmedida AND Nombre="heartRate" and DATE(fechahora) = CURDATE() AND TIME(fechahora) BETWEEN '00:00:00' AND '04:59:59'), 0),2),1) AS l1,
    TRUNCATE(GREATEST( COALESCE((SELECT AVG(valor) FROM registros,medidas WHERE medida=idmedida AND Nombre="heartRate" and DATE(fechahora) = CURDATE() AND TIME(fechahora) BETWEEN '05:00:00' AND '09:59:59'), 0),2),1) AS l2,
    TRUNCATE(GREATEST( COALESCE((SELECT AVG(valor) FROM registros,medidas WHERE medida=idmedida AND Nombre="heartRate" and DATE(fechahora) = CURDATE() AND TIME(fechahora) BETWEEN '10:00:00' AND '14:59:59'), 0),2),1) AS l3,
    TRUNCATE(GREATEST( COALESCE((SELECT AVG(valor) FROM registros,medidas WHERE medida=idmedida AND Nombre="heartRate" and DATE(fechahora) = CURDATE() AND TIME(fechahora) BETWEEN '15:00:00' AND '19:59:59'), 0),2),1) AS l4,
    TRUNCATE(GREATEST( COALESCE((SELECT AVG(valor) FROM registros,medidas WHERE medida=idmedida AND Nombre="heartRate" and DATE(fechahora) = CURDATE() AND TIME(fechahora) BETWEEN '20:00:00' AND '24:59:59'), 0),2),1) AS l5;
    `; 
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).send('Error en el servidor');
        } else {
            res.json(results);
        }
    });
});

app.get('/datos-histograma-uv', (req, res) => {
    // Asegúrate de que la consulta obtenga solo 5 registros
    const query = `SELECT 
    TRUNCATE(GREATEST( COALESCE((SELECT AVG(valor) FROM registros,medidas WHERE medida=idmedida AND Nombre="uv" and DATE(fechahora) = CURDATE() AND TIME(fechahora) BETWEEN '00:00:00' AND '04:59:59'), 0),2),1) AS u1,
    TRUNCATE(GREATEST( COALESCE((SELECT AVG(valor) FROM registros,medidas WHERE medida=idmedida AND Nombre="uv" and DATE(fechahora) = CURDATE() AND TIME(fechahora) BETWEEN '05:00:00' AND '09:59:59'), 0),2),1) AS u2,
    TRUNCATE(GREATEST( COALESCE((SELECT AVG(valor) FROM registros,medidas WHERE medida=idmedida AND Nombre="uv" and DATE(fechahora) = CURDATE() AND TIME(fechahora) BETWEEN '10:00:00' AND '14:59:59'), 0),2),1) AS u3,
    TRUNCATE(GREATEST( COALESCE((SELECT AVG(valor) FROM registros,medidas WHERE medida=idmedida AND Nombre="uv" and DATE(fechahora) = CURDATE() AND TIME(fechahora) BETWEEN '15:00:00' AND '19:59:59'), 0),2),1) AS u4,
    TRUNCATE(GREATEST( COALESCE((SELECT AVG(valor) FROM registros,medidas WHERE medida=idmedida AND Nombre="uv" and DATE(fechahora) = CURDATE() AND TIME(fechahora) BETWEEN '20:00:00' AND '24:59:59'), 0),2),1) AS u5;
    `; 
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).send('Error en el servidor');
        } else {
            res.json(results);
        }
    });
});

app.get('/datos-histograma-oximetria', (req, res) => {
    // Asegúrate de que la consulta obtenga solo 5 registros
    const query = `SELECT 
    TRUNCATE(GREATEST( COALESCE((SELECT AVG(valor) FROM registros,medidas WHERE medida=idmedida AND Nombre="spo2" and DATE(fechahora) = CURDATE() AND TIME(fechahora) BETWEEN '00:00:00' AND '04:59:59'), 0),2),1) AS o1,
    TRUNCATE(GREATEST( COALESCE((SELECT AVG(valor) FROM registros,medidas WHERE medida=idmedida AND Nombre="spo2" and DATE(fechahora) = CURDATE() AND TIME(fechahora) BETWEEN '05:00:00' AND '09:59:59'), 0),2),1) AS o2,
    TRUNCATE(GREATEST( COALESCE((SELECT AVG(valor) FROM registros,medidas WHERE medida=idmedida AND Nombre="spo2" and DATE(fechahora) = CURDATE() AND TIME(fechahora) BETWEEN '10:00:00' AND '14:59:59'), 0),2),1) AS o3,
    TRUNCATE(GREATEST( COALESCE((SELECT AVG(valor) FROM registros,medidas WHERE medida=idmedida AND Nombre="spo2" and DATE(fechahora) = CURDATE() AND TIME(fechahora) BETWEEN '15:00:00' AND '19:59:59'), 0),2),1) AS o4,
    TRUNCATE(GREATEST( COALESCE((SELECT AVG(valor) FROM registros,medidas WHERE medida=idmedida AND Nombre="spo2" and DATE(fechahora) = CURDATE() AND TIME(fechahora) BETWEEN '20:00:00' AND '24:59:59'), 0),2),1) AS o5;
    `; 
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).send('Error en el servidor');
        } else {
            res.json(results);
        }
    });
});


// Servir archivos estáticos (HTML, CSS, JS) desde la carpeta 'public'
app.use(express.static('public'));

let server = app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor corriendo en http://${getServerIP()}:${port}`);
    console.log('Presione x para terminar el servidor');
});

// Crear una interfaz readline para la entrada de la terminal
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Escuchar la entrada de la terminal
rl.on('line', (input) => {
    if(input.toLowerCase() === 'x') {
        console.log('Apagando el servidor...');
        server.close(() => {
            console.log('El servidor se ha apagado.');
            process.exit(0);
        });
    }
});