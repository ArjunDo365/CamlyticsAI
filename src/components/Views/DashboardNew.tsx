import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";

const DashboardNew = () => {
    const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
    const [inactivelist, setInactivelist] = useState([]);
  const [Dashboard, setDashboard] = useState([]);
  const [cameraStatus, setCameraStatus] = useState<any>({ series: [], options: {} });
  const [nvrStatus, setnvrStatus] = useState<any>({ series: [], options: {} });


  useEffect(() => {
    loadData();
  }, []);


    const InactiveList = async () => {
   
      setLoading(true);
       setShowModal(true);
       const inactivelist = await window.electronAPI.getAllBlocks();
      // console.log("data from backend for blocks: ", inactivelist);

      if (inactivelist.success) {
        setInactivelist(inactivelist.data);
      }
      setLoading(false);
    
  };

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
              type: "pie",
              height: 460,
              foreColor: "#000",
            },

            colors: ["#5d965d", "#ec6871"],
            labels: ["Active NVRS", "Inactive NVRS"],

            plotOptions: {
              pie: {
                donut: {
                  size: "70%",   // SAME AS CAMERA CHART
                  labels: {
                    show: true,

                    total: {
                      show: true,
                      label: "Total",
                      color: "#000",
                      fontSize: "26px",
                      formatter: () => d.total_nvrs
                    }
                  }
                }
              }
            }
          }
        });





        // Camera DONUT CHART (Same style as Camera chart)
        setCameraStatus({
          series: [d.active_cameras, d.inactive_cameras],

          options: {
            chart: {
              type: "pie",
              height: 460,
              foreColor: "#000",
            },

            colors: ["#5d965d", "#ec6871"],
            labels: ["Active Cameras", "Inactive Cameras"],

            plotOptions: {
              pie: {
                donut: {
                  size: "70%",       // <<< make center space
                  labels: {
                    show: true,

                    total: {
                      show: true,
                      label: "Total",
                      color: "#000",
                      fontSize: "26px",
                      formatter: () => d.total_cameras
                    }
                  }
                }
              }
            }
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

    <div>

      <h2 className="text-2xl font-semibold text-gray-800 dark:text-black mb-6">
        Dashboard
      </h2>

      <div className="grid xl:grid-cols-2 gap-6 mb-6">

        {/* NVR Status */}
        <div className="panel h-full transition-all duration-300 dark:bg-[#c7c8c9]  rounded-2xl pb-3 mb-6">
          <div className=" rounded-2xl ">

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
    <>
      {/* Button Row */}
      <div className="flex justify-end mb-3">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-800 transition"
          onClick={() => console.log("Inactive List Clicked")}
        >
          Inactive List
        </button>
      </div>

      {/* Chart */}
      <ReactApexChart
        series={nvrStatus.series}
        options={nvrStatus.options}
        type="pie"
        height={380}
      />
    </>
  )}
</div>

          </div>
        </div>


        {/* Camera Status */}
        <div className="panel h-full transition-all duration-300 dark:bg-[#c7c8c9]  rounded-2xl pb-3 mb-6">
          <div className=" rounded-2xl ">

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
                  <>
      {/* Button Row */}
      <div className="flex justify-end mb-3">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-800 transition"
           onClick={() => InactiveList()}
        >
          Inactive List
        </button>
      </div>
                <ReactApexChart
                  series={cameraStatus.series}
                  options={cameraStatus.options}
                  type="pie"     // <<< CHANGE TO PIE
                  height={380}
       />
    </>
              )}
            </div>

          </div>
        </div>

      </div>
        {/* Modal */}
      {showModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl max-w-md w-full">
      
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          Inactive List
        </h3>
        <button
          className="text-gray-600 hover:text-black"
          onClick={() => setShowModal(false)}
        >
          ✕
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {inactivelist.map((data: any) => (
                <tr key={data.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">

                      {/* Text */}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {data.name}
                        </div>
                      </div>

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>
               <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-200 bg-black hover:bg-black rounded-lg transition-colors"
                >
                  Cancel
                </button>
              
              </div>
    </div>
  </div>
)}

    </div>

  );
};

export default DashboardNew;
