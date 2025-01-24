import { useState } from 'react';
import ReactApexChart from 'react-apexcharts';

const options = {
  legend: {
    show: false,
    position: 'top',
    horizontalAlign: 'left',
  },
  colors: ['#3C50E0', '#80CAEE'],
  chart: {
    fontFamily: 'Satoshi, sans-serif',
    height: 335,
    type: 'area',
    dropShadow: {
      enabled: true,
      color: '#623CEA14',
      top: 10,
      blur: 4,
      left: 0,
      opacity: 0.1,
    },
    toolbar: {
      show: false,
    },
  },
  responsive: [
    {
      breakpoint: 1024,
      options: {
        chart: {
          height: 300,
        },
      },
    },
    {
      breakpoint: 1366,
      options: {
        chart: {
          height: 350,
        },
      },
    },
  ],
  stroke: {
    width: [2, 2],
    curve: 'straight',
  },
  grid: {
    xaxis: {
      lines: {
        show: true,
      },
    },
    yaxis: {
      lines: {
        show: true,
      },
    },
  },
  dataLabels: {
    enabled: false,
  },
  markers: {
    size: 4,
    colors: '#fff',
    strokeColors: ['#3056D3', '#80CAEE'],
    strokeWidth: 3,
    strokeOpacity: 0.9,
    strokeDashArray: 0,
    fillOpacity: 1,
    discrete: [],
    hover: {
      size: undefined,
      sizeOffset: 5,
    },
  },
  xaxis: {
    type: 'category',
    categories: [
      'Sep',
      'Oct',
      'Nov',
      'Dec',
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
    ],
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  yaxis: {
    title: {
      style: {
        fontSize: '0px',
      },
    },
    min: 0,
    max: 100,
  },
};

const ChartOne = () => {
  const [state, setState] = useState({
    series: [
      {
        name: 'Product One',
        data: [23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30, 45],
      },
      {
        name: 'Product Two',
        data: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39, 51],
      },
    ],
  });

  const [timeRange, setTimeRange] = useState('day');

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);

    if (range === 'day') {
      setState({
        series: [
          {
            name: 'Product One',
            data: [23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30, 45],
          },
          {
            name: 'Product Two',
            data: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39, 51],
          },
        ],
      });
    } else if (range === 'week') {
      setState({
        series: [
          {
            name: 'Product One',
            data: [120, 150, 170, 180, 190, 200, 210],
          },
          {
            name: 'Product Two',
            data: [130, 140, 160, 170, 180, 190, 200],
          },
        ],
      });
    } else if (range === 'month') {
      setState({
        series: [
          {
            name: 'Product One',
            data: [500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600],
          },
          {
            name: 'Product Two',
            data: [550, 650, 750, 850, 950, 1050, 1150, 1250, 1350, 1450, 1550, 1650],
          },
        ],
      });
    }
  };

  const role = sessionStorage.getItem('role');

  return (
    <div className="col-span-12 rounded-lg border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-8">
      <div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap">
        <div className="flex w-full flex-wrap gap-3 sm:gap-5">
          <div className="flex min-w-47.5">
            <span className="mt-1 mr-2 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-primary">
              <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-primary"></span>
            </span>
            {role === 'superadmin' && (
              <div className="w-full">
                <p className="font-semibold text-primary">Total Agencies</p>
                <p className="text-sm font-medium">14.11.2024 - Now</p>
              </div>
            )}
          </div>
          <div className="flex min-w-47.5">
            <span className="mt-1 mr-2 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-secondary">
              <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-secondary"></span>
            </span>
            {role === 'admin' && (
              <div className="w-full">
                <p className="font-semibold text-secondary">Completed Batches </p>
                <p className="text-sm font-medium">14.11.2024 - Now</p>
              </div>
            )}
          </div>
        </div>
        <div className="flex w-full max-w-45 justify-end mt-1">
          <div className="inline-flex items-center bg-whiter p-1.5 dark:bg-meta-4 border border-gray-800">
            <button
              className={`py-1 px-3 text-xs font-medium text-black shadow-card hover:bg-white hover:shadow-card dark:bg-boxdark dark:hover:bg-boxdark border-r border-gray-800 ${timeRange === 'day' ? 'bg-gray-200' : ''}`}
              onClick={() => handleTimeRangeChange('day')}
            >
              Day
            </button>
            <button
              className={`py-1 px-3 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:hover:bg-boxdark border-r border-gray-800 ${timeRange === 'week' ? 'bg-gray-200' : ''}`}
              onClick={() => handleTimeRangeChange('week')}
            >
              Week
            </button>
            <button
              className={`py-1 px-3 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:hover:bg-boxdark ${timeRange === 'month' ? 'bg-gray-200' : ''}`}
              onClick={() => handleTimeRangeChange('month')}
            >
              Month
            </button>
          </div>
        </div>
      </div>
      <div>
        <div id="chartOne" className="-ml-5">
          <ReactApexChart
            options={options}
            series={state.series}
            type="area"
            height={350}
          />
        </div>
      </div>
    </div>
  );
};

export default ChartOne;