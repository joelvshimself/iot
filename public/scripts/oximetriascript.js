window.onload = function() {
    const oximetriaCtx = document.getElementById('oximetriaChart').getContext('2d');
    const oximetriaChart = new Chart(oximetriaCtx, {
        // Configuración para el gráfico de temperatura
        type: 'bar',
        data: {
            labels: ['0-4am', '5-9am', '10am-14pm', '15-19pm', '20-24pm'],
            datasets: [{
                label: '# de uv',
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
        fetch('/datos-histograma-oximetria')
            .then(response => response.json())
            .then(dataArray => {
                const data = dataArray[0];
                const newData = [data.o1, data.o2, data.o3, data.o4, data.o5];
                oximetriaChart.data.datasets[0].data = newData;
                oximetriaChart.update();
            })
            .catch(error => console.error('Error al obtener los datos:', error));
    }

    updateTempChartData();
    // setInterval(updateTempChartData, 5000); // Descomenta para actualizar cada 5 segundos
};
