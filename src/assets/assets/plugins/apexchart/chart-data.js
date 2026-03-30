'use strict';

window.initDashboardCharts = function () {
  if (typeof ApexCharts === 'undefined') {
    console.warn('ApexCharts not found');
    return;
  }

  function generateData(baseval, count, yrange) {
    var i = 0;
    var series = [];
    while (i < count) {
      var x = Math.floor(Math.random() * (750 - 1 + 1)) + 1;;
      var y = Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min;
      var z = Math.floor(Math.random() * (75 - 15 + 1)) + 15;

      series.push([x, y, z]);
      baseval += 86400000;
      i++;
    }
    return series;
  }


  // Column chart
  if ($('#sales_chart').length > 0) {
    var columnCtx = document.getElementById("sales_chart"),
      columnConfig = {
        colors: ['#7638ff', '#fda600'],
        series: [
          {
            name: "Received",
            type: "column",
            data: [70, 150, 80, 180, 150, 175, 201, 60, 200, 120, 190, 160, 50]
          },
          {
            name: "Pending",
            type: "column",
            data: [23, 42, 35, 27, 43, 22, 17, 31, 22, 22, 12, 16, 80]
          }
        ],
        chart: {
          type: 'bar',
          fontFamily: 'Poppins, sans-serif',
          height: 350,
          toolbar: {
            show: false
          }
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '60%',
            endingShape: 'rounded'
          },
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          show: true,
          width: 2,
          colors: ['transparent']
        },
        xaxis: {
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
        },
        yaxis: {
          title: {
            text: '$ (thousands)'
          }
        },
        fill: {
          opacity: 1
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return "$ " + val + " thousands"
            }
          }
        }
      };
    var columnChart = new ApexCharts(columnCtx, columnConfig);
    columnChart.render();
  }


  if ($('#reservation-chart').length > 0) {
    var sCol = {
      chart: {
        width: '100%',
        height: 'auto', // Adjusts dynamically
        type: 'bar',
        toolbar: { show: false },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '80%', // Adjust spacing
          endingShape: 'rounded'
        }
      },
      colors: ['#D0E3E6', '#4361ee'],
      states: {
        hover: {
          filter: {
            type: 'darken',
            value: 0.3
          }
        }
      },
      dataLabels: { enabled: false },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
      },
      series: [{
        name: 'Net Profit',
        data: [7, 9, 4, 9, 6, 8, 10]
      }],
      fill: { opacity: 1 },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'July'],
        labels: { show: false },
        axisTicks: { show: false },
        axisBorder: { show: false }
      },
      grid: {
        show: false, // Hides grid lines
        padding: { left: 0, right: 0, top: 0, bottom: 0 }
      },
      yaxis: { labels: { show: false } },
      tooltip: {
        y: {
          formatter: function (val) {
            return val;
          }
        }
      }
    };

    var chart = new ApexCharts(
      document.querySelector("#reservation-chart"),
      sCol
    );

    chart.render();
  }


if ($('#revenue-breakdown-chart').length > 0) {

  var options = {
    chart: {
      type: 'bar',
      height: 250,
      toolbar: { show: false }
    },

    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '55%',
        borderRadius: 8,
        distributed: true   // ✅ IMPORTANT
      }
    },

    series: [{
      data: [2.3, 1.9, 1.4, 0.9]
    }],

    xaxis: {
      categories: [
        'Enterprise Suite',
        'Professional Plan',
        'Starter Package',
        'Add-ons & Services'
      ],
      fontSize: '14px',
      min: 0,
      max: 2.6,
      tickAmount: 4,
      labels: {
        style: {
          fontSize: '12px'
        },
        formatter: function (val) {
          return "$" + val.toFixed(1) + "M";
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '12px',          
        },
      }
    },

    colors: [
      '#C594FA',  // Purple start
      '#ff6a6a',  // Red start
      '#ffc107',  // Orange start
      '#5bc0ff'   // Blue start
    ],
    tooltip: {
		marker: false,
	},
    fill: {
      type: 'gradient',
      gradient: {
        type: 'horizontal',
        shadeIntensity: 0,
        opacityFrom: 1,
        opacityTo: 1,
        gradientToColors: [
          '#7F24E3',  // Purple end
          '#dc3545',  // Red end
          '#ff9800',  // Orange end
          '#0dcaf0'   // Blue end
        ],
        stops: [0, 100]
      }
    },

    dataLabels: { enabled: false },
    grid: { show: false },
    stroke: { show: false },
    legend: { show: false }
  };

  var chart = new ApexCharts(
    document.querySelector("#revenue-breakdown-chart"),
    options
  );

  chart.render();
}

if ($('#revenue-performance-chart').length > 0) {

  var options = {
    chart: {
      type: 'area',
      height: 350,
      toolbar: { show: false }
    },

    series: [
      {
        name: "Actual Revenue",
        data: [120, 210, 290, 260, 240, 420, 460, 380, 300, 320, 480, 600]
      },
      {
        name: "Forecasted",
        data: [110, 200, 270, 230, 220, 300, 270, 220, 180, 210, 420, 520]
      },
      {
        name: "Prior Year",
        data: [60, 120, 160, 140, 130, 220, 260, 210, 170, 160, 330, 510]
      }
    ],

    stroke: {
      curve: 'smooth',
      width: 2
    },

    colors: ['#3B44F6', '#22C55E', '#FF3B30'],

    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.35,
        opacityTo: 0.05,
        stops: [0, 100]
      }
    },

    dataLabels: { enabled: false },

    xaxis: {
      categories: [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ],
      labels: {
        style: { fontSize: '12px' }
      }
    },

    yaxis: {
      labels: {
        formatter: function (val) {
          return "$" + val + "K";
        },
        style: { fontSize: '12px' }
      }
    },

    grid: {
      borderColor: '#e5e7eb',
      strokeDashArray: 4
    },

    tooltip: {
      marker: false,
      shared: true,
      intersect: false,
      y: {
        formatter: function (val) {
          return "$" + val + "K";
        }
      }
    },

    legend: {
      show: false   // ✅ removed legend
    }
  };

  var chart = new ApexCharts(
    document.querySelector("#revenue-performance-chart"),
    options
  );

  chart.render();
}

if ($('#revenue_expense').length > 0) {

  var options = {
    chart: {
      type: 'bar',
      height: 250,
      toolbar: { show: false }
    },

    series: [{
      name: 'Amount',
      data: [80, 45] // Revenue, Expense
    }],

    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 8,
        barHeight: '55%',
        distributed: true
      }
    },

    colors: ['#6D5EF3', '#FF5B5B'], // Purple & Red

    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: "horizontal",
        shadeIntensity: 0.5,
        gradientToColors: ['#8B7CF6', '#FF7B7B'], // lighter end color
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100]
      }
    },

    dataLabels: {
      enabled: false
    },

    xaxis: {
      categories: ['Revenue', 'Expense'],
       min: 0,
        max: 3,              // change based on your data range
        tickAmount: 6,
      labels: {
        show: true,
        formatter: function (val) {
          return "" + val.toFixed(1) + "M"; 
        },
      }
    },

    yaxis: {
      labels: {
        style: {
          fontSize: '14px'
        }
      }
    },

    grid: {
      show: false
    },

    legend: {
      show: false
    },

    tooltip: {
      y: {
        formatter: function (val) {
          return val + "%";
        }
      }
    }
  };

  var chart = new ApexCharts(
    document.querySelector("#revenue_expense"),
    options
  );

  chart.render();
}

if ($('#comparison-chart').length > 0) {

  var options = {
    chart: {
      type: 'bar',
      height: 260,
      toolbar: { show: false }
    },

    series: [
      {
        name: 'Current',
        data: [156, 28.4, 47]
      },
      {
        name: 'Previous',
        data: [152, 26.9, 42]
      }
    ],

    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 12,
        barHeight: '65%',
        distributed: false
      }
    },

    colors: ['#6D5EF3', '#9E9E9E'], // Current & Previous

    dataLabels: {
      enabled: true,
      style: {
        fontSize: '14px',
        fontWeight: 600
      },
      formatter: function (val, opts) {
        if (opts.dataPointIndex === 1) {
          return val + "%";
        }
        return val;
      }
    },

    xaxis: {
      categories: ['Deals Closed', 'Win Rate', 'Sales Cycle (days)'],
      labels: {
        show: false
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },

    yaxis: {
      labels: {
        style: {
          fontSize: '14px',
          fontWeight: 500
        }
      }
    },

    grid: {
      show: false
    },

    legend: {
      show: false
    },

    tooltip: {
      y: {
        formatter: function (val, opts) {
          if (opts.dataPointIndex === 1) {
            return val + "%";
          }
          return val;
        }
      }
    }
  };

  var chart = new ApexCharts(
    document.querySelector("#comparison-chart"),
    options
  );

  chart.render();
}

  //Report Chart
  if ($('#report_chart').length > 0) {
    var options = {
      series: [{
        data: [0, 6, 24, 14, 20, 15, 37]
      }],
      chart: {
        type: 'area',
        width: 70,
        height: 46,
        sparkline: {
          enabled: true
        }
      },
      stroke: {
        curve: 'smooth',
        width: 2
      },
      colors: ['#7539FF'],

      tooltip: {
        fixed: {
          enabled: false
        },
        x: {
          show: false
        },
        y: {
          title: {
            formatter: function (seriesName) {
              return ''
            }
          }
        },
        marker: {
          show: false
        }
      }
    };


    var chart = new ApexCharts(document.querySelector("#report_chart"), options);
    chart.render();
  }
  if ($('#report_chart_2').length > 0) {
    var options = {
      series: [{
        data: [0, 6, 24, 14, 20, 15, 37]
      }],
      chart: {
        type: 'area',
        width: 70,
        height: 50,
        sparkline: {
          enabled: true
        }
      },
      stroke: {
        curve: 'smooth',
        width: 2
      },
      colors: ['#27AE60'],

      tooltip: {
        fixed: {
          enabled: false
        },
        x: {
          show: false
        },
        y: {
          title: {
            formatter: function (seriesName) {
              return ''
            }
          }
        },
        marker: {
          show: false
        }
      }
    };


    var chart = new ApexCharts(document.querySelector("#report_chart_2"), options);
    chart.render();
  }
  if ($('#report_chart_3').length > 0) {
    var options = {
      series: [{
        data: [0, 6, 24, 14, 20, 15, 37]
      }],
      chart: {
        type: 'area',
        width: 70,
        height: 50,
        sparkline: {
          enabled: true
        }
      },
      stroke: {
        curve: 'smooth',
        width: 2
      },
      colors: ['#E2B93B'],

      tooltip: {
        fixed: {
          enabled: false
        },
        x: {
          show: false
        },
        y: {
          title: {
            formatter: function (seriesName) {
              return ''
            }
          }
        },
        marker: {
          show: false
        }
      }
    };

    var chart = new ApexCharts(document.querySelector("#report_chart_3"), options);
    chart.render();
  }
  if ($('#report_chart_4').length > 0) {
    var options = {
      series: [{
        data: [0, 6, 24, 14, 20, 15, 37]
      }],
      chart: {
        type: 'area',
        width: 70,
        height: 50,
        sparkline: {
          enabled: true
        }
      },
      stroke: {
        curve: 'smooth',
        width: 2
      },
      colors: ['#EF1E1E'],

      tooltip: {
        fixed: {
          enabled: false
        },
        x: {
          show: false
        },
        y: {
          title: {
            formatter: function (seriesName) {
              return ''
            }
          }
        },
        marker: {
          show: false
        }
      }
    };

    var chart = new ApexCharts(document.querySelector("#report_chart_4"), options);
    chart.render();
  }
  //Payment Report Chart
  if ($('#payment_report_chart').length > 0) {
    var options = {
      series: [{
        data: [0, 6, 24, 14, 20, 15, 37]
      }],
      chart: {
        type: 'area',
        height: 46,
        sparkline: {
          enabled: true
        }
      },
      stroke: {
        curve: 'smooth',
        width: 2
      },
      colors: ['#7539FF'],

      tooltip: {
        fixed: {
          enabled: false
        },
        x: {
          show: false
        },
        y: {
          title: {
            formatter: function (seriesName) {
              return ''
            }
          }
        },
        marker: {
          show: false
        }
      }
    };

    var chart = new ApexCharts(document.querySelector("#payment_report_chart"), options);
    chart.render();
  }
  if ($('#payment_report_chart_2').length > 0) {
    var options = {
      series: [{
        data: [0, 6, 24, 14, 20, 15, 37]
      }],
      chart: {
        type: 'area',
        height: 50,
        sparkline: {
          enabled: true
        }
      },
      stroke: {
        curve: 'smooth',
        width: 2
      },
      colors: ['#27AE60'],

      tooltip: {
        fixed: {
          enabled: false
        },
        x: {
          show: false
        },
        y: {
          title: {
            formatter: function (seriesName) {
              return ''
            }
          }
        },
        marker: {
          show: false
        }
      }
    };

    var chart = new ApexCharts(document.querySelector("#payment_report_chart_2"), options);
    chart.render();
  }
  if ($('#payment_report_chart_3').length > 0) {
    var options = {
      series: [{
        data: [0, 6, 24, 14, 20, 15, 37]
      }],
      chart: {
        type: 'area',
        height: 50,
        sparkline: {
          enabled: true
        }
      },
      stroke: {
        curve: 'smooth',
        width: 2
      },
      colors: ['#E2B93B'],

      tooltip: {
        fixed: {
          enabled: false
        },
        x: {
          show: false
        },
        y: {
          title: {
            formatter: function (seriesName) {
              return ''
            }
          }
        },
        marker: {
          show: false
        }
      }
    };

    var chart = new ApexCharts(document.querySelector("#payment_report_chart_3"), options);
    chart.render();
  }
  if ($('#payment_report_chart_4').length > 0) {
    var options = {
      series: [{
        data: [0, 6, 24, 14, 20, 15, 37]
      }],
      chart: {
        type: 'area',
        height: 50,
        sparkline: {
          enabled: true
        }
      },
      stroke: {
        curve: 'smooth',
        width: 2
      },
      colors: ['#EF1E1E'],

      tooltip: {
        fixed: {
          enabled: false
        },
        x: {
          show: false
        },
        y: {
          title: {
            formatter: function (seriesName) {
              return ''
            }
          }
        },
        marker: {
          show: false
        }
      }
    };

    var chart = new ApexCharts(document.querySelector("#payment_report_chart_4"), options);
    chart.render();
  }
  //Pie Chart
  if ($('#invoice_chart').length > 0) {
    var pieCtx = document.getElementById("invoice_chart"),
      pieConfig = {
        colors: ['#03C95A', '#E70D0D', '#AB47BC', '#FFC107'],
        series: [45, 15, 21, 5],
        chart: {
          fontFamily: 'Poppins, sans-serif',
          height: 150,
          type: 'donut',
          offsetX: -30,
        },
        labels: ['Paid', 'Overdue', 'Pending', 'Draft'],
        legend: { show: true },
        dataLabels: {
          enabled: false // Disable the data labels
        },
        plotOptions: {
          pie: {
            donut: {
              labels: {
                show: true,
                name: {
                  show: true,
                  fontSize: '2px',
                },
                value: {
                  show: true,
                  fontSize: '12px',
                  formatter: function (val) {
                    return val + "%";
                  }
                },
                total: {
                  show: true,
                  showAlways: true,
                  formatter: function (w) {
                    return w.globals.seriesTotals.reduce((a, b) => {
                      return 45;
                    }, 0);
                  },
                  label: 'Paid'
                }
              }
            }
          }
        },
        responsive: [{
          breakpoint: 480,
          options: {
            chart: {
              width: 300
            },
            legend: {
              position: 'right'
            }
          }
        }]
      };
    var pieChart = new ApexCharts(pieCtx, pieConfig);
    pieChart.render();
  }


  // Simple Line
if ($('#s-line').length > 0) {
    var sline = {
      chart: {
        height: 350,
        type: 'line',
        zoom: {
          enabled: false
        },
        toolbar: {
          show: false,
        }
      },
      colors: ['#3550DC'],
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'straight'
      },
      series: [{
        name: "Desktops",
        data: [10, 41, 35, 51, 49, 62, 69, 91, 148]
      }],
      title: {
        text: 'Product Trends by Month',
        align: 'left'
      },
      grid: {
        row: {
          colors: ['#f1f2f3', 'transparent'], // takes an array which will be repeated on columns
          opacity: 0.5
        },
      },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
      }
    }

    var chart = new ApexCharts(
      document.querySelector("#s-line"),
      sline
    );

    chart.render();
  }


  // Simple Line Area
  if ($('#s-line-area').length > 0) {
    var sLineArea = {
      chart: {
        height: 350,
        type: 'area',
        toolbar: {
          show: false,
        }
      },
      colors: ['#3550DC', '#888ea8'],
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth'
      },
      series: [{
        name: 'series1',
        data: [31, 40, 28, 51, 42, 109, 100]
      }, {
        name: 'series2',
        data: [11, 32, 45, 32, 34, 52, 41]
      }],

      xaxis: {
        type: 'datetime',
        categories: ["2018-09-19T00:00:00", "2018-09-19T01:30:00", "2018-09-19T02:30:00", "2018-09-19T03:30:00", "2018-09-19T04:30:00", "2018-09-19T05:30:00", "2018-09-19T06:30:00"],
      },
      tooltip: {
        x: {
          format: 'dd/MM/yy HH:mm'
        },
      }
    }

    var chart = new ApexCharts(
      document.querySelector("#s-line-area"),
      sLineArea
    );

    chart.render();
  }

  if ($('#s-col').length > 0) {
    var sCol = {
      chart: {
        height: 290,
        type: 'bar',
        toolbar: {
          show: false,
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '80%',
          borderRadius: 5,
          endingShape: 'rounded', // This rounds the top edges of the bars
        },
      },
      colors: ['#FFAD6A', '#5777E6', '#5CC583'],
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
      },

      series: [{
        name: 'Inprogress',
        data: [19, 65, 19, 19, 19, 19, 19]
      }, {
        name: 'Active',
        data: [89, 45, 89, 46, 61, 25, 79]
      },
      {
        name: 'Completed',
        data: [39, 39, 39, 80, 48, 48, 48]
      }],
      xaxis: {
        categories: ['15 Jan', '16 Jan', '17 Jan', '18 Jan', '19 Jan', '20 Jan', '21 Jan'],
        labels: {
          style: {
            colors: '#0C1C29',
            fontSize: '12px',
          }
        }
      },
      yaxis: {
        labels: {
          offsetX: -15,
          style: {
            colors: '#6D777F',
            fontSize: '14px',
          }
        }
      },
      grid: {
        borderColor: '#CED2D4',
        strokeDashArray: 5,
        padding: {
          left: -8,
          right: -15,
        },
      },
      fill: {
        opacity: 1
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return "" + val + "%"
          }
        }
      }
    }

    var chart = new ApexCharts(
      document.querySelector("#s-col"),
      sCol
    );

    chart.render();
  }

  if ($('#earnings-chart').length > 0) {
    var sCol = {
      chart: {
        height: 390,
        type: 'bar',
        toolbar: {
          show: false,
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '50%',
          borderRadius: 10,
          borderRadiusApplication: 'end', // this makes only the top of vertical bars rounded
          endingShape: 'rounded',
        },
      },
      colors: ['#7539FF'],
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
      },

      series: [{
        name: 'Income',
        data: [28, 28, 43, 75, 45, 38, 47, 28, 33, 23, 58, 40]
      }],
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        labels: {
           style: {
            colors: '#0C1C29',
            fontSize: '12px',
          }
        }
      },
      yaxis: {
        labels: {
          offsetX: -15,
          style: {
            colors: '#6D777F',
            fontSize: '14px',
          }
        }
      },
      grid: {
        borderColor: '#CED2D4',
        strokeDashArray: 5,
        padding: {
          left: -8,
          right: -15,
        },
      },
      fill: {
        opacity: 1
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return "" + val + "%"
          }
        }
      }
    }

    var chart = new ApexCharts(
      document.querySelector("#earnings-chart"),
      sCol
    );

    chart.render();
  }

};

$(document).ready(function () {
  window.initDashboardCharts();
});

