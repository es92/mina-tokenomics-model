

var TokenChart = (chartElement, data) => {
  var colors = [ "green", 'lightgreen'];
  var labels = [ "total tokens", 'monthly fees' ];

  var yieldcolors = [ "DarkBlue", "lightblue", "BlueViolet", "violet", "DodgerBlue"];
  var yieldlabels = [ "block reward yield", "block reward + fee yield", "supercharged yield", "supercharged + fee yield", "inflation" ];

  var tokenCharts = [ data.totalTokens, data.fees ];
  var yieldCharts = [ data.yield, data.totalYield, data.superchargedYield, data.totalSuperchargedYield, data.inflation ];

  var datasets = tokenCharts.map((d, i) => {
    return {
      label: labels[i],
      data: d,
      borderColor: colors[i],
      yAxisID: 'y'
    }
  }).concat(yieldCharts.map((d, i) => {
    return {
      label: yieldlabels[i],
      data: d,
      borderColor: yieldcolors[i],
      yAxisID: 'y1'
    }
  }));

  var round3 = (r) => Math.round(r*10e2)/10e2;

  var chart = new Chart(chartElement, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: datasets,
    },
    options: {
      responsive: true,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      elements: {
        point:{
          radius: 0
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (tooltipItem) => {
              if (tooltipItem.datasetIndex < 2) {
                return tooltipItem.dataset.label + ': ' + tooltipItem.formattedValue;
              } else {
                return tooltipItem.dataset.label + ': ' + (round3(tooltipItem.raw*100) + '%');
              }
            },
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Month',
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          min: 0,
          max: 2e9,
          ticks: {
            color: colors[0],
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          min: 0,
          max: .45,
          ticks: {
            callback: function(value) {
                return value*100 + "%"
            },
            color: yieldcolors[0],
          },
          grid: {
            drawOnChartArea: false,
          },
        },
      }
    }
  });

  return {
    update: (data) => {
      var tokenCharts = [ data.totalTokens, data.fees ];
      var yieldCharts = [ data.yield, data.totalYield, data.superchargedYield, data.totalSuperchargedYield, data.inflation ];
      tokenCharts.concat(yieldCharts).forEach((d, i) => {
        chart.data.datasets[i].data = d;
      });
      chart.update();
    }
  }
}
