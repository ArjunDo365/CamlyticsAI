import React, { useEffect, useState } from "react";
import { Block, Floor } from "../../../types";
import { Edit, Plus, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import { CommonHelper } from "../../../helper/helper";

const Floors = () => {
  const [showModal, setShowModal] = useState(false);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [editingFloor, setEditingFloor] = useState<Floor | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    block_id: 1,
    display_order: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      block_id: 1,
      display_order: 0,
    });
    setEditingFloor(null);
  };

  const loadData = async () => {
    try {
      const [floorData, blockData] = await Promise.all([
        window.electronAPI.getAllFloors(),
        window.electronAPI.getAllBlocks(),
      ]);
      console.log("data from backend for floor: ", floorData);

      if (floorData.success) {
        setFloors(floorData.data);
      }

      if (blockData.success) {
        setBlocks(blockData.data);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (floor: Floor) => {
    setEditingFloor(floor);
    setFormData({
      name: floor.name,
      description: floor.description,
      block_id: floor.block_id,
      display_order: floor.display_order ?? 0,
    });
    setShowModal(true);
  };

  const handleDelete = async (floor: Floor) => {
    Swal.fire({
      icon: "warning",
      title: "Are you sure?",
      text: "You want to Delete " + " " + floor.name + "!",
      showCancelButton: true,
      confirmButtonText: "Delete",
      padding: "2em",
      customClass: { popup: "sweet-alerts" },
    }).then(async (result) => {
      if (result.value) {
        let res: any;
        res = await window.electronAPI.deleteFloors(floor.id);
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
      if (editingFloor) {
        result = await window.electronAPI.updateFloors(
          editingFloor.id,
          formData
        );
      } else {
        result = await window.electronAPI.createFloors(formData);
      }

      if (result.success) {
        await loadData();
        setShowModal(false);
        resetForm();
      } else {
        alert(result.error || "Operation failed");
      }
    } catch (error) {
      console.error("Error saving block:", error);
      alert("An error occurred");
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
          <h2 className="text-2xl font-bold text-gray-900">Floor Master</h2>
          <p className="text-gray-600">Manage Floors in the organisation</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Add Floor
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Floor Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Block Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {floors.map((floor) => (
                <tr key={floor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-white font-medium">
                            {floor.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {floor.name}
                        </div>
                        {/* <div className="text-sm text-gray-500">{user.email}</div> */}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {floor.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {floor.block_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEdit(floor)}
                        className="bg-blue-600 hover:bg-blue-700 flex items-center gap-1 rounded-full p-2"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(floor)}
                        className="bg-red-600 hover:bg-red-700 flex items-center gap-1 rounded-full p-2"
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
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingFloor ? "Edit Floor" : "Add Floor"}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Floor Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prevData) => ({
                      ...prevData,
                      name: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prevData) => ({
                      ...prevData,
                      description: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Block
                </label>
                <select
                  value={formData.block_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      block_id: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                  required
                >
                  {blocks.map((block) => (
                    <option key={block.id} value={block.id}>
                      {block.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => {
                    const valueConvert = e.target.value ? e.target.value : "0";
                    setFormData((prevData) => ({
                      ...prevData,
                      display_order: parseInt(valueConvert),
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-200 bg-black hover:bg-black rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors"
                >
                  {editingFloor ? "Update" : "Create"} Floor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Floors;
