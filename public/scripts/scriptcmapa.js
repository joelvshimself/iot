window.onload = function() {
    var mymap = L.map('mapid'); // Se elimina setView inicial

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(mymap);

    var iconoPersonalizado = L.icon({
        iconUrl: '/images/azulgps.png',
        iconSize: [150, 150],
        iconAnchor: [75, 75],
        popupAnchor: [0, -75]
    });

    // Función para actualizar la ubicación en el mapa
    function updateMapLocation(lat, lon) {
        var marker = L.marker([lat, lon], {icon: iconoPersonalizado}).addTo(mymap)
            .bindPopup('Estás aquí.')
            .openPopup();
    
        fetchLocationInfo(lat, lon, marker); // Pasa marker como un argumento adicional
    }
    

    // Función para obtener información de la ubicación
    function fetchLocationInfo(lat, lon, marker) { // Agrega marker como un parámetro
        var url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
    
        fetch(url)
            .then(response => response.json())
            .then(data => {
                var popupContent = '<div class="custom-popup">Estás aquí.<br/>';
                if (data.address) {
                    popupContent += `Calle: ${data.address.road || 'No disponible'}<br/>`;
                    popupContent += `Ciudad: ${data.address.city || data.address.town || 'No disponible'}<br/>`;
                    popupContent += `Código Postal: ${data.address.postcode || 'No disponible'}</div>`;
                }
                marker.bindPopup(popupContent).openPopup(); // Usa marker aquí
            })
            .catch(error => console.error('Error al obtener información de ubicación:', error));
    }
    

    // Obtener la última ubicación desde el servidor
    fetch('/ultimo-map')
        .then(response => response.json())
        .then(data => {
            mymap.setView([data.lat, data.lng], 13); // Establece el centro y el zoom del mapa
            updateMapLocation(data.lat, data.lng); // Actualiza la ubicación del marcador
        })
        .catch(error => console.error('Error al obtener datos del servidor:', error));
};
