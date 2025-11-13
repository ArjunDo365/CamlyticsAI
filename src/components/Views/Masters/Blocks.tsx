import React, { useState } from "react";
import { Block } from "../../../types";
import { Edit, Plus, Trash2 } from "lucide-react";

const sampleData = [
  {
    id: 1,
    name: "Block A",
    description:
      "Main administrative block housing the reception area, security control room, and staff offices.",
    created_at: "2023-11-12T10:30:00Z",
  },
  {
    id: 2,
    name: "Block B",
    description:
      "Main administrative block housing the reception area, security control room, and staff offices.",
    created_at: "2023-11-10T15:45:00Z",
  },
  {
    id: 3,
    name: "Block C",
    description:
      "Main administrative block housing the reception area, security control room, and staff offices.",
    created_at: "2023-11-08T09:20:00Z",
  },
  {
    id: 4,
    name: "Block D",
    description:
      "Main administrative block housing the reception area, security control room, and staff offices.",
    created_at: "2023-11-05T12:00:00Z",
  },
  {
    id: 5,
    name: "Block E",
    description:
      "Main administrative block housing the reception area, security control room, and staff offices.",
    created_at: "2023-11-01T14:10:00Z",
  },
];

const Blocks = () => {
  const [showModal, setShowModal] = useState(false);
  const [blocks, setBlocks] = useState([
    { id: 1, name: "Block A", description: "Main administrative block housing the reception area, security control room, and staff offices." },
    { id: 2, name: "Block B", description: "Main administrative block housing the reception area, security control room, and staff offices." },
    { id: 3, name: "Block C", description: "Main administrative block housing the reception area, security control room, and staff offices." },
  ]);
  const [editingBlock, setEditingBlock] = useState<Block | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    id: 0,
    description: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      id: 0,
      description: "",
    });
    setEditingBlock(null);
  };

  const loadData = async () => {
    try {
      const blockData: Block[] = [
        {
          id: 1,
          name: "Block A",
          description:
            "Main administrative block housing the reception area, security control room, and staff offices.",
          created_at: "2023-11-12T10:30:00Z",
        },
        {
          id: 2,
          name: "Block B",
          description:
            "Main administrative block housing the reception area, security control room, and staff offices.",
          created_at: "2023-11-10T15:45:00Z",
        },
        {
          id: 3,
          name: "Block C",
          description:
            "Main administrative block housing the reception area, security control room, and staff offices.",
          created_at: "2023-11-08T09:20:00Z",
        },
        {
          id: 4,
          name: "Block D",
          description:
            "Main administrative block housing the reception area, security control room, and staff offices.",
          created_at: "2023-11-05T12:00:00Z",
        },
        {
          id: 5,
          name: "Block E",
          description:
            "Main administrative block housing the reception area, security control room, and staff offices.",
          created_at: "2023-11-01T14:10:00Z",
        },
      ];
      setBlocks(blockData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (block: Block) => {
    setEditingBlock(block);
    setFormData({
      name: block.name,
      id: block.id,
      description: block.description,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this block?")) {
      try {
        const result = await window.electronAPI.deleteUser(id);
        if (result.success) {
          await loadData();
        } else {
          alert(result.error || "Delete failed");
        }
      } catch (error) {
        console.error("Error deleting block:", error);
        alert("An error occurred");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      console.log("payload for block api: ", editingBlock?.id, formData);
      // let result;
      // if (editingBlock) {
      //   result = await window.electronAPI.updateUser(editingBlock.id, formData);
      // } else {
      //   result = await window.electronAPI.createUser(formData);
      // }

      // if (result.success) {
      //   await loadData();
      //   setShowModal(false);
      //   resetForm();
      // } else {
      //   alert(result.error || 'Operation failed');
      // }
    } catch (error) {
      console.error("Error saving block:", error);
      alert("An error occurred");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Block Master</h2>
          <p className="text-gray-600">Manage Blocks in the organisation</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Add Block
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Block Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
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
              {blocks.map((block) => (
                <tr key={block.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-white font-medium">
                            {block.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {block.name}
                        </div>
                        {/* <div className="text-sm text-gray-500">{user.email}</div> */}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                          {block.description}
                        </div>
                  </td>
                  {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {section.block}
                  </td> */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEdit(block)}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                      >
                        <Edit size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(block.id)}
                        className="text-red-600 hover:text-red-900 flex items-center gap-1"
                      >
                        <Trash2 size={14} />
                        Delete
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
                {editingBlock ? "Edit Block" : "Add Block"}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Block Name
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
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
                  {editingBlock ? "Update" : "Create"} Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blocks;
