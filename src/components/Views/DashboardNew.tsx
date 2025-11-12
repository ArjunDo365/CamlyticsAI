import React, { useState } from "react";
import ReactApexChart from "react-apexcharts";

const DashboardNew = () => {
  const [loading, setLoading] = useState(false);

  const nvrStatus: any = {
    series: [98,2],
    options: {
      chart: {
        type: "donut",
        height: 460,
        fontFamily: "Nunito, sans-serif",
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 25,
        // colors: isDark ? '#0e1726' : '#fff',
        colors: "#fff",
      },
      // colors: isDark ? ['#5c1ac3', '#e2a03f', '#e7515a', '#e2a03f'] : ['#e2a03f', '#5c1ac3', '#e7515a'],
      colors: ["#5c1ac3", "#e7515a"],

      legend: {
        position: "bottom",
        horizontalAlign: "center",
        fontSize: "14px",
        markers: {
          width: 10,
          height: 10,
          offsetX: -2,
        },
        height: 50,
        offsetY: 20,
      },
      plotOptions: {
        pie: {
          donut: {
            size: "65%",
            background: "transparent",
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: "29px",
                offsetY: -10,
              },
              value: {
                show: true,
                fontSize: "26px",
                // color: isDark ? '#bfc9d4' : undefined,
                color: undefined,
                offsetY: 16,
                formatter: (val: any) => {
                  return val;
                },
              },
              total: {
                show: true,
                label: "Total",
                color: "#888ea8",
                fontSize: "29px",
                formatter: (w: any) => {
                  return w.globals.seriesTotals.reduce(function (
                    a: any,
                    b: any
                  ) {
                    return a + b;
                  },
                  0);
                },
              },
            },
          },
        },
      },
      labels: ["Working NVR", "Not working  NVR"],
      states: {
        hover: {
          filter: {
            type: "none",
            value: 0.15,
          },
        },
        active: {
          filter: {
            type: "none",
            value: 0.15,
          },
        },
      },
    },
  };

  return (
    <div>
      <div>
        <div className="grid xl:grid-cols-2 gap-6 mb-6">
          <div className="panel h-full xl:col-span-1">
            <div className="panel h-full">
              <div className="flex items-center mb-5">
                <h5 className="font-semibold text-lg dark:text-white-light">
                  NVR Status
                </h5>
              </div>
              <div>
                <div className="bg-white dark:bg-black rounded-lg overflow-hidden">
                  {loading ? (
                    <div className="min-h-[325px] grid place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08] ">
                      <span className="animate-spin border-2 border-black dark:border-white !border-l-transparent  rounded-full w-5 h-5 inline-flex"></span>
                    </div>
                  ) : (
                    <ReactApexChart
                      series={nvrStatus.series}
                      options={nvrStatus.options}
                      type="donut"
                      height={460}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="panel h-full xl:col-span-1">
            <div className="panel h-full">
              <div className="flex items-center mb-5">
                <h5 className="font-semibold text-lg dark:text-white-light">
                  Camera Status
                </h5>
              </div>
              <div>
                <div className="bg-white dark:bg-black rounded-lg overflow-hidden">
                  {loading ? (
                    <div className="min-h-[325px] grid place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08] ">
                      <span className="animate-spin border-2 border-black dark:border-white !border-l-transparent  rounded-full w-5 h-5 inline-flex"></span>
                    </div>
                  ) : (
                    <ReactApexChart
                      series={nvrStatus.series}
                      options={nvrStatus.options}
                      type="donut"
                      height={460}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardNew;
