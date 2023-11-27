window.onload = function() {
    const tempCtx = document.getElementById('tempChart').getContext('2d');
    const tempChart = new Chart(tempCtx, {
        // Configuración para el gráfico de temperatura
        type: 'bar',
        data: {
            labels: ['0-4am', '5-9am', '10am-14pm', '15-19pm', '20-24pm'],
            datasets: [{
                label: '# de Temperatura',
                data: [],
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    function updateTempChartData() {
        fetch('/datos-histograma-temp')
            .then(response => response.json())
            .then(dataArray => {
                const data = dataArray[0];
                const newData = [data.t1, data.t2, data.t3, data.t4, data.t5];
                tempChart.data.datasets[0].data = newData;
                tempChart.update();
            })
            .catch(error => console.error('Error al obtener los datos:', error));
    }

    updateTempChartData();
    // setInterval(updateTempChartData, 5000); // Descomenta para actualizar cada 5 segundos
};
