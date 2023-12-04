document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Evita el envío predeterminado del formulario

    // Obtén los valores ingresados por el usuario
    var nombre = document.getElementById('nombre').value;
    var usuario = document.getElementById('usuario').value;

    // Realiza una solicitud al servidor para obtener los datos de usuario
    fetch('/log')
        .then(response => response.json())
        .then(data => {
            console.log(data); // Para depuración: muestra los datos en la consola
            // Comprueba si los datos coinciden
            if (nombre === data.us1 && usuario === data.us2.toString()) {
                alert('Ingreso exitoso');
                window.location.href = '/index.html';
                // Redirige después del ingreso exitoso
            } else {
                alert('Usuario o contraseña incorrectos');
            }
        })
        .catch(error => {
            console.error('Error al obtener datos del servidor:', error);
        });
});
