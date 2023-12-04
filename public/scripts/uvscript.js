window.onload = function() {
    const showValuesOnPointsPlugin = {
        id: 'showValuesOnPoints',
        afterDatasetsDraw: function(chart, easing) {
            const ctx = chart.ctx;
            chart.data.datasets.forEach((dataset, i) => {
                const meta = chart.getDatasetMeta(i);
                if (!meta.hidden) {
                    meta.data.forEach((element, index) => {
                        ctx.fillStyle = 'rgb(255, 255, 255)'; // Color del texto
                        ctx.font = 'normal 12px Arial'; // Estilo del texto
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'bottom';
                        const dataString = dataset.data[index].toString();
                        ctx.fillText(dataString, element.x+10, element.y -5);
                    });
                }
            });
        }
    };

    const uvCtx = document.getElementById('uvChart').getContext('2d');
    const uvChart = new Chart(uvCtx, {
        type: 'line',
        data: {
            labels: ['4hrs', '9hrs', '14hrs', '19hrs', '24hrs'],
            datasets: [{
                label: 'IRV',
                data: [],
                borderColor: 'rgb(253, 78, 78)',
                backgroundColor: 'rgb(253, 78, 78)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    display: false, // Oculta el eje Y    
                },
                x: {
                    grid:{
                        color: 'white', // Cambia el color de las líneas de la cuadrícula
                    },
                    ticks: {
                        color: 'white', // Cambia el color del texto de los ticks
                        font: {
                            size: 14 // Cambia el tamaño de la fuente de los ticks
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: 'red', // Cambia el color del texto de la leyenda
                        font: {
                            size: 16 // Cambia el tamaño de la fuente de la leyenda
                        }
                    }
                }
            }
        },
        plugins: [showValuesOnPointsPlugin, {
            beforeDraw: function(uvChart) {
                const ctx = uvChart.canvas.getContext('2d');
                ctx.fillStyle = 'black'; // Color de fondo
                ctx.fillRect(0, 0, uvChart.width, uvChart.height);
            }
        }]
    });
    function updateUvChartData() {
        fetch('/datos-histograma-uv')
            .then(response => response.json())
            .then(dataArray => {
                const data = dataArray[0];
                const newData = [data.u1, data.u2, data.u3, data.u4, data.u5];
                uvChart.data.datasets[0].data = newData;
                uvChart.update();
            })
            .catch(error => console.error('Error al obtener los datos:', error));
    }

    updateUvChartData();
    setInterval(updateUvChartData, 1000); 
};