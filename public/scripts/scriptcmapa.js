window.onload = function() {
    var mymap = L.map('mapid').setView([19.735080, -99.027989], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(mymap);

    var iconoPersonalizado = L.icon({
        iconUrl: '/images/gps.png', // URL del icono predeterminado de Leaflet
        iconSize: [150, 150], // Tamaño del icono en píxeles (ajusta según tus necesidades)
        iconAnchor: [25, 82], // Asegúrate de que el icono esté centrado correctamente
        popupAnchor: [55, -55] // Ajusta la posición del popup
    });

    var marker = L.marker([19.735080, -99.027989], {icon: iconoPersonalizado}).addTo(mymap)
        .bindPopup('Estás aquí.')
        .openPopup();

    // Función para obtener información de la ubicación (si es necesaria)
    function fetchLocationInfo(lat, lon) {
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
                marker.bindPopup(popupContent).openPopup();
            })
            .catch(error => console.error('Error al obtener información de ubicación:', error));
    }

    fetchLocationInfo(19.735080, -99.027989);
};
