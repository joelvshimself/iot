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
app.get('/ultima-temperatura', (req, res) => {
    const query = "SELECT registros.valor FROM registros, medidas WHERE medidas.idmedida = registros.medida AND medidas.Nombre = 'heartRate' ORDER BY registros.fechaHora DESC LIMIT 1";
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error en la consulta:', err);
            res.status(500).send('Error en el servidor');
            return;
        }
        res.json(results[0]);
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