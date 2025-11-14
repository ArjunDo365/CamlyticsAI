import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";

const DashboardNew = () => {
  const [loading, setLoading] = useState(false);
  const [Dashboard, setDashboard] = useState([]);
  const [cameraStatus, setCameraStatus] = useState<any>({ series: [], options: {} });
  const [nvrStatus, setnvrStatus] = useState<any>({ series: [], options: {} });


  useEffect(() => {
    loadData();
  }, []);


  const loadData = async () => {
    try {
      setLoading(true);
      const DashboardData = await window.electronAPI.nvrcamerasummary();
      console.log("data from backend for Dashboard: ", DashboardData);

      if (DashboardData.success) {
        setDashboard(DashboardData.data);

        const d = DashboardData.data;

        // NVR DONUT CHART (Same style as NVR chart)
        setnvrStatus({
          series: [d.active_nvrs, d.inactive_nvrs],

          options: {
            chart: {
              type: "donut",
              height: 460,
              fontFamily: "Nunito, sans-serif",
              foreColor: "#000",          // <<< ALL LABELS + HOVER TEXT BLACK
            },

            dataLabels: {
              enabled: false,
              style: {
                colors: ["#000"],         // <<< HOVER TEXT BLACK FIX
              }
            },

            stroke: {
              show: true,
              width: 25,
              colors: "#ffffff",
            },

            colors: ["#5d965d", "#ec6871"],

            legend: {
              position: "bottom",
              horizontalAlign: "center",
              fontSize: "14px",
              labels: {
                colors: "#000"            // <<< LEGEND TEXT BLACK
              },
              markers: {
                width: 10,
                height: 10,
                offsetX: -2,
              },
              height: 50,
              offsetY: 20,
            },

            labels: ["Active NVRS", "Inactive NVRS"],

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
                      color: "#000",        // <<< NAME TEXT BLACK
                    },

                    value: {
                      show: true,
                      fontSize: "26px",
                      offsetY: 16,
                      color: "#000",        // <<< VALUE TEXT BLACK
                      formatter: (val: any) => val,
                    },

                    total: {
                      show: true,
                      label: "Total NVRS",
                      color: "#000",        // <<< TOTAL LABEL BLACK
                      fontSize: "29px",
                      formatter: () => d.total_nvrs,
                    },
                  },
                },
              },
            },

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

            tooltip: {
              style: {
                fontSize: "14px",
                color: "#000",             // <<< TOOLTIP TEXT BLACK
              }
            },
          }
        });



        // Camera DONUT CHART (Same style as Camera chart)
        setCameraStatus({
          series: [d.active_cameras, d.inactive_cameras],

          options: {
            chart: {
              type: "donut",
              height: 460,
              fontFamily: "Nunito, sans-serif",
              foreColor: "#000",          // <<< ALL LABELS + HOVER TEXT BLACK
            },

            dataLabels: {
              enabled: false,
              style: {
                colors: ["#000"],         // <<< HOVER TEXT BLACK FIX
              }
            },

            stroke: {
              show: true,
              width: 25,
              colors: "#ffffff",
            },

            colors: ["#5d965d", "#ec6871"],

            legend: {
              position: "bottom",
              horizontalAlign: "center",
              fontSize: "14px",
              labels: {
                colors: "#000"            // <<< LEGEND TEXT BLACK
              },
              markers: {
                width: 10,
                height: 10,
                offsetX: -2,
              },
              height: 50,
              offsetY: 20,
            },

            labels: ["Active Cameras", "Inactive Cameras"],

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
                      color: "#000",        // <<< NAME TEXT BLACK
                    },

                    value: {
                      show: true,
                      fontSize: "26px",
                      offsetY: 16,
                      color: "#000",        // <<< VALUE TEXT BLACK
                      formatter: (val: any) => val,
                    },

                    total: {
                      show: true,
                      label: "Total Cameras",
                      color: "#000",        // <<< TOTAL LABEL BLACK
                      fontSize: "29px",
                      formatter: () => d.total_cameras,
                    },
                  },
                },
              },
            },

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

            tooltip: {
              style: {
                fontSize: "14px",
                color: "#000",             // <<< TOOLTIP TEXT BLACK
              }
            },
          }
        });

      }

      // if (DashboardData.success) {
      //   setDashboard(DashboardData.data);
      // }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };


  return (
    
    
   <div className="grid xl:grid-cols-2 gap-6 mb-6">

  {/* NVR Status */}
  <div className="panel h-full transition-all duration-300 hover:shadow-lg rounded-2xl">
    <div className="bg-white dark:bg-[#9d9ea1] rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">

      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
        <h5 className="font-semibold text-lg text-gray-800 dark:text-dark">
          NVR Status
        </h5>
      </div>

      {/* Chart */}
      <div className="p-4">
        {loading ? (
          <div className="min-h-[325px] grid place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-20 rounded-xl">
            <span className="animate-spin border-2 border-gray-600 dark:border-white !border-l-transparent rounded-full w-6 h-6 inline-flex"></span>
          </div>
        ) : (
          <ReactApexChart
            series={nvrStatus.series}
            options={nvrStatus.options}
            type="donut"
            height={380}
          />
        )}
      </div>

    </div>
  </div>


  {/* Camera Status */}
  <div className="panel h-full transition-all duration-300 hover:shadow-lg rounded-2xl">
    <div className="bg-white dark:bg-[#9d9ea1] rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">

      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
        <h5 className="font-semibold text-lg text-gray-800 dark:text-dark">
          Camera Status
        </h5>
      </div>

      {/* Chart */}
      <div className="p-4">
        {loading ? (
          <div className="min-h-[325px] grid place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-20 rounded-xl">
            <span className="animate-spin border-2 border-gray-600 dark:border-white !border-l-transparent rounded-full w-6 h-6 inline-flex"></span>
          </div>
        ) : (
          <ReactApexChart
            series={cameraStatus.series}
            options={cameraStatus.options}
            type="donut"
            height={380}
          />
        )}
      </div>

    </div>
  </div>

</div>


  );
};

export default DashboardNew;
