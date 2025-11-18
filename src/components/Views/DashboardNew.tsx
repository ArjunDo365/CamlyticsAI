import React, { Fragment, useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { Tab } from "@headlessui/react";
import { CommonHelper } from "../../helper/helper";

const DashboardNew = () => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inactivelist, setInactivelist] = useState([]);
  // const [Dashboard, setDashboard] = useState([]);
  const [Dashboard, setDashboard] = useState<any>({});

  const [cameraStatus, setCameraStatus] = useState<any>({
    series: [],
    options: {},
  });
  const [nvrStatus, setnvrStatus] = useState<any>({ series: [], options: {} });
  const [last10NVRs, setLast10NVRs] = useState<any[]>([]);
  const [Last10Cameras, setLast10Cameras] = useState<any[]>([]);

  useEffect(() => {
    loadData();
    dashboardCameraandNvr();
  }, []);

  const InactiveList = async (data: any) => {
    try {
      setLoading(true);

      const result = await window.electronAPI.downloadNotWorkingExcel(data);

      if (result.success) {
        CommonHelper.SuccessToaster(result.message);
      } else {
        CommonHelper.ErrorToaster(result.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const Manualping = async () => {
    ;
    setLoading(true);
    // setShowModal(true);
    const Ping = await window.electronAPI.manualPingTrigger();
    // console.log("data from backend for blocks: ", inactivelist);

    if (Ping.success) {
      CommonHelper.SuccessToaster(Ping.message);
    }
    setLoading(false);
  };

  const dashboardCameraandNvr = async () => {
    try {
      setLoading(true);

      const FullDashboadData = await window.electronAPI.getCamerasAndNVRs();

      if (FullDashboadData.success) {
        console.log(FullDashboadData);

        // ⬅️ Store last10NVRs data in state
        setLast10Cameras(FullDashboadData.data.last10Cameras);

        // ⬅️ Store last10Cameras data in state
        setLast10NVRs(FullDashboadData.data.last10NVRs);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error loading data:", error);
    }
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
          series: [Number(d.active_nvrs), Number(d.inactive_nvrs)],

          options: {
            chart: {
              type: "pie",
              height: 380,
              foreColor: "#000",
            },

            title: {
              text: `Total NVRS: ${d.total_nvrs}`,
              align: "center",
              style: {
                fontSize: "20px",
                fontWeight: 600,
                color: "#000",
              },
            },

            labels: ["Working NVRS", "Not Working NVRS"],

            colors: ["#5d965d", "#ec6871"],

            legend: {
              position: "bottom",
            },

            dataLabels: {
              enabled: true,
              formatter: (val: number) => `${val.toFixed(1)}%`,
            },
          },
        });

        // Camera DONUT CHART (Same style as Camera chart)
        setCameraStatus({
          series: [Number(d.active_cameras), Number(d.inactive_cameras)],

          options: {
            chart: {
              type: "pie",
              height: 380,
              foreColor: "#000",
            },

            title: {
              text: `Total Cameras: ${d.total_cameras}`,
              align: "center",
              style: {
                fontSize: "20px",
                fontWeight: 600,
                color: "#000",
              },
            },

            labels: ["Working Cameras", "Not Working Cameras"],
            colors: ["#5d965d", "#ec6871"],

            legend: {
              position: "bottom",
            },

            dataLabels: {
              enabled: true,
              formatter: (val: number) => `${val.toFixed(1)}%`,
            },
          },
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
      <div className="flex justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-black mb-6">
            Dashboard
          </h2>
        </div>
        <div>
          <button
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-800 transition"
            onClick={() => Manualping()}
          >
            Health Check
          </button>
        </div>
      </div>

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
                      className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-700 transition"
                      onClick={() => InactiveList("nvrs")}
                    >
                      Not Working Download
                    </button>
                  </div>

                  {/* Chart */}
               {Number(Dashboard.total_nvrs) === 0 ? (
  <div className="min-h-[325px] grid place-content-center text-gray-500 text-lg">
    No NVR Data Available
  </div>
) : (
  <ReactApexChart
    series={nvrStatus.series}
    options={nvrStatus.options}
    type="pie"
    height={380}
  />
)}

                </>
              )}
            </div>
          </div>
        </div>

        {/* Camera Status */}
        <div className=" panel h-full transition-all duration-300 dark:bg-[#c7c8c9]  rounded-2xl pb-3 mb-6">
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
                      className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-700 transition"
                      onClick={() => InactiveList("cameras")}
                    >
                      Not Working Download
                    </button>
                  </div>
                  {/* CAMERA STATUS PIE CHART */}
{Number(Dashboard.total_cameras) === 0 ? (
  <div className="min-h-[325px] grid place-content-center text-gray-500 text-lg">
    No Camera Data Available
  </div>
) : (
  <ReactApexChart
    series={cameraStatus.series}
    options={cameraStatus.options}
    type="pie"
    height={380}
  />
)}

                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-5 w-full">

        <Tab.Group>
          <Tab.List className="mt-3 flex flex-wrap border-b border-white-light dark:border-[#191e3a]">
            <Tab as={Fragment}>
              {({ selected }) => (
                <button
                  className={`${selected
                    ? "!border-white-light !border-b-white  text-blue-400 !outline-none dark:!border-[#191e3a] dark:!border-b-black dark:text-blue-400"
                    : ""
                    }
                                                    dark:hover:border-b-black' -mb-[1px] block border border-transparent p-3.5 py-2 hover:text-blue-500 text-gray-500`}
                >
                  NVR
                </button>
              )}
            </Tab>
            <Tab as={Fragment}>
              {({ selected }) => (
                <button
                  className={`${selected
                    ? "!border-white-light !border-b-white  text-blue-400 !outline-none dark:!border-[#191e3a] dark:!border-b-black dark:text-blue-400"
                    : ""
                    }
                                                    dark:hover:border-b-black' -mb-[1px] block border border-transparent p-3.5 py-2 hover:text-blue-500 text-gray-500`}
                >
                  Camera
                </button>
              )}
            </Tab>
          </Tab.List>
          <Tab.Panels>
            <Tab.Panel>
              <div className="active pt-5">
                <div className="flex justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-black mb-6">
                      Last 10 NVRS List
                    </h2>
                  </div>
                  <div>
                    {/* <button
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-800 transition"
            onClick={() => Manualping()}
          >
            Health Check
          </button> */}
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Modal Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Location
                          </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Is Working
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                         
                        </tr>
                      </thead>

                      <tbody className="bg-white divide-y divide-gray-200">
                        {last10NVRs.map((data: any) => (             
                          <tr key={data.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {/* <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-white font-medium">
                            {n?.asset_no?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                                </div> */}
                                <div className="">
                                  <div className="text-sm font-medium text-gray-900">
                                    {data.asset_no}
                                  </div>
                                  {/* <div className="text-sm text-gray-500">{user.email}</div> */}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {data.model_name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {data.block_name} - {data.floor_name} -{" "}
                                {data.location_name}
                              </div>
                            </td>
                           
                           <td className="px-6 py-4 whitespace-nowrap">
  <div className="text-sm">
    {data.is_working == 0 ? (
      <span className="px-3 py-1 rounded-full bg-red-200 text-red-800 font-medium">
        Not Working
      </span>
    ) : (
      <span className="px-3 py-1 rounded-full bg-green-200 text-green-800 font-medium">
        Working
      </span>
    )}
  </div>
</td>
 <td className="px-6 py-4 whitespace-nowrap">
  <div className="text-sm">
    {data.status == 0 ? (
      <span className="px-3 py-1 rounded-full bg-red-200 text-red-800 font-medium">
        Inactive
      </span>
    ) : (
      <span className="px-3 py-1 rounded-full bg-green-200 text-green-800 font-medium">
        Active
      </span>
    )}
  </div>
</td>

                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </Tab.Panel>
            <Tab.Panel>
              <div className="active pt-5">
                <div className="flex justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-black mb-6">
                      Last 10 Cameras List
                    </h2>
                  </div>
                  <div>
                    {/* <button
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-800 transition"
            onClick={() => Manualping()}
          >
            Health Check
          </button> */}
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Modal Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Location
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Is Working
                            </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>

                      <tbody className="bg-white divide-y divide-gray-200">
                        {Last10Cameras.map((data: any) => (
                          <tr key={data.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {/* <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-white font-medium">
                            {n?.asset_no?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                                </div> */}
                                <div className="">
                                  <div className="text-sm font-medium text-gray-900">
                                    {data.asset_no}
                                  </div>
                                  {/* <div className="text-sm text-gray-500">{user.email}</div> */}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {data.model_name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {data.block_name} - {data.floor_name} -{" "}
                                {data.location_name}
                              </div>
                            </td>
                            
                           <td className="px-6 py-4 whitespace-nowrap">
  <div className="text-sm">
    {data.is_working == 0 ? (
      <span className="px-3 py-1 rounded-full bg-red-200 text-red-800 font-medium">
        Not Working
      </span>
    ) : (
      <span className="px-3 py-1 rounded-full bg-green-200 text-green-800 font-medium">
        Working
      </span>
    )}
  </div>
</td>
 <td className="px-6 py-4 whitespace-nowrap">
  <div className="text-sm">
    {data.status == 0 ? (
      <span className="px-3 py-1 rounded-full bg-red-200 text-red-800 font-medium">
        Inactive
      </span>
    ) : (
      <span className="px-3 py-1 rounded-full bg-green-200 text-green-800 font-medium">
        Active
      </span>
    )}
  </div>
</td>
 {/* <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">
                                  {data.status}
                                </div>
                              </td> */}

                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
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
