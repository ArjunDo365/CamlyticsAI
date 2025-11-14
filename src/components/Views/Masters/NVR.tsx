import React, { useEffect, useState } from "react";
import { Nvr, Section } from "../../../types";
import { Edit, Plus, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import { CommonHelper } from "../../../helper/helper";
import "flatpickr/dist/flatpickr.css";
import Flatpickr from "react-flatpickr";

const NVR = () => {
  const [showModal, setShowModal] = useState(false);
  const [nvrs, setNvrs] = useState<Nvr[]>([]);
  const [floors, setFloors] = useState<Section[]>([]);
  const [editingNvr, setEditingNvr] = useState<Nvr | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    location_id: 0,
    asset_no: "",
    serial_number: "",
    model_name: "",
    ip_address: "",
    manufacturer: "",
    vendor: "",
    install_date: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setFormData({
      location_id: 0,
      asset_no: "",
      serial_number: "",
      model_name: "",
      ip_address: "",
      manufacturer: "",
      vendor: "",
      install_date: "",
    });
    setEditingNvr(null);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [nvrData, floorData] = await Promise.all([
        window.electronAPI.getAllNvrs(),
        window.electronAPI.getAllFloors(),
      ]);
      // console.log("data from backend for blocks: ", blockData);

      if (nvrData.success) {
        setNvrs(nvrData.data);
      }
      if (floorData.success) {
        setFloors(floorData.data);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (nvr: Nvr) => {
    setEditingNvr(nvr);
    setFormData({
      location_id: nvr.location_id,
      asset_no: nvr.asset_no,
      serial_number: nvr.serial_number,
      model_name: nvr.model_name,
      ip_address: nvr.ip_address,
      manufacturer: nvr.manufacturer,
      vendor: nvr.vendor,
      install_date: nvr.install_date,
    });
    setShowModal(true);
  };

  const handleDelete = async (n: Nvr) => {
    Swal.fire({
      icon: "warning",
      title: "Are you sure?",
      text: "You want to Delete " + " " + n.asset_no + "!",
      showCancelButton: true,
      confirmButtonText: "Delete",
      padding: "2em",
      customClass: { popup: "sweet-alerts" },
    }).then(async (result) => {
      if (result.value) {
        let res: any;
        res = await window.electronAPI.deleteNvr(n.id);
        console.log("resp from delete: ", res);
        if (res.success) {
          await loadData();
          CommonHelper.SuccessToaster(res.message);
        } else {
          CommonHelper.ErrorToaster(res.message);
        }
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // console.log("payload for block api: ", editingBlock?.id, formData);
      let result;
      if (editingNvr) {
        // console.log('payload for block update: ',formData);
        result = await window.electronAPI.updateNvr(editingNvr.id, formData);
        if (result.success) CommonHelper.SuccessToaster(result.message);
        // console.log('result on edit block submit',result);
      } else {
        // console.log('payload for block submit: ',formData);
        result = await window.electronAPI.createNvr(formData);
        if (result.success) CommonHelper.SuccessToaster(result.message);
        // console.log('result on block submit',result);
      }

      if (result.success) {
        await loadData();
        setShowModal(false);
        resetForm();
      } else {
        CommonHelper.ErrorToaster(result.error || "Operation failed");
        // alert(result.error || "Operation failed");
      }
    } catch (error) {
      console.error("Error saving NVR:", error);
      CommonHelper.ErrorToaster("An error occurred");
      // alert("An error occurred");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">NVR Master</h2>
          <p className="text-gray-600">Manage NVRs in the organisation</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Add NVR
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NVR Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP
                </th>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Block Name
                </th> */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {nvrs.map((n) => (
                <tr key={n.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-white font-medium">
                            {n?.asset_no?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {n.asset_no}
                        </div>
                        {/* <div className="text-sm text-gray-500">{user.email}</div> */}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{n.ip_address}</div>
                  </td>
                  {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {section.block}
                  </td> */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEdit(n)}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(n)}
                        className="text-red-600 hover:text-red-900 flex items-center gap-1"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-[900px] w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingNvr ? "Edit NVR" : "Add NVR"}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid xl:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Asset Number
                  </label>
                  <input
                    type="text"
                    value={formData.asset_no}
                    onChange={(e) =>
                      setFormData((prevData) => ({
                        ...prevData,
                        asset_no: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Serial Number
                  </label>
                  <input
                    type="text"
                    value={formData.serial_number}
                    onChange={(e) =>
                      setFormData((prevData) => ({
                        ...prevData,
                        serial_number: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Model Name
                  </label>
                  <input
                    type="text"
                    value={formData.model_name}
                    onChange={(e) =>
                      setFormData((prevData) => ({
                        ...prevData,
                        model_name: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Manufacturer
                  </label>
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e) =>
                      setFormData((prevData) => ({
                        ...prevData,
                        manufacturer: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vendor
                  </label>
                  <input
                    type="text"
                    value={formData.vendor}
                    onChange={(e) =>
                      setFormData((prevData) => ({
                        ...prevData,
                        vendor: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    I.P Address
                  </label>
                  <input
                    type="text"
                    value={formData.ip_address}
                    onChange={(e) =>
                      setFormData((prevData) => ({
                        ...prevData,
                        ip_address: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <select
                    value={formData.location_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location_id: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                    required
                  >
                    <option value={0}>-- Select Floor --</option>
                    {floors.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Installed Date
                  </label>
                  <Flatpickr
                    value={formData.install_date}
                    options={{
                      dateFormat: "d-m-Y",
                      position: "auto left",
                    }}
                    className="form-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                    onChange={(date: Date[]) =>
                      setFormData((prevData) => ({
                        ...prevData,
                        install_date: date[0]
                          ? date[0].toISOString().split("T")[0]
                          : "",
                      }))
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                >
                  {editingNvr ? "Update" : "Create"} NVR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NVR;
