const express = require('express');
const path = require('path');
const readline = require('readline');
const app = express();
const PORT = 5050;

// Configuración de readline para capturar la entrada del teclado
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Serve static files
console.log(path.join(__dirname, 'public'))
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/style.css')));

// Iniciar el servidor
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Presiona "x" y luego "Enter" para detener el servidor.');
});

// Capturar la tecla 'x' para detener el servidor
rl.on('line', (input) => {
    if (input === 'x') {
        server.close(() => {
            console.log('Server stopped');
            process.exit(0); // Cierra la aplicación de Node.js
        });
    }
});
