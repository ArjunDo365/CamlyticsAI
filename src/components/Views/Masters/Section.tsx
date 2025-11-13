import { Edit, Plus, Trash2 } from "lucide-react";
import React, { useState } from "react";
import type { Section, User } from "../../../types/index";

const sampleData= [
        {
          id: 1,
          name: "Billing",
          floorId: 2,
          description:''
        },
        {
          id: 2,
          name: "Cash Counter",
          floorId: 6,
          description:''
        },
        {
          id: 3,
          name: "Diamonds",
          floorId: 1,
          description:''
        },
        {
          id: 4,
          name: "Silver",
          floorId: 4,
          description:''
        },
        {
          id: 5,
          name: "Gold",
          floorId: 3,
          description:''
        },
      ];

const Section = () => {
  const [showModal, setShowModal] = useState(false);
  const [sections, setSections] = useState<Section[]>(sampleData);
  const [floors,setFloors] = useState([{id:1,name:'Floor 1'},{id:2,name:'Floor 2'},{id:3,name:'Floor 3'}]);
  const [blocks,setBlocks] = useState([{id:1,name:'Block A'},{id:2,name:'Block B'},{id:3,name:'Block C'}]);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    floorId: 3,
    description:''
  });

  const resetForm = () => {
    setFormData({
      name: "",
      floorId:0,
      description:''
      
    });
    setEditingSection(null);
  };

  const loadData = async () => {
    try {
      const sectionData:Section[] = [
        {
          id: 1,
          name: "Billing",
          floorId: 1,
          description:''
        },
        {
          id: 2,
          name: "Cash Counter",
          floorId: 2,
          description:''
        },
        {
          id: 3,
          name: "Diamonds",
          floorId: 3,
          description:''
        },
        {
          id: 4,
          name: "Silver",
          floorId: 2,
          description:''
        },
        {
          id: 5,
          name: "Gold",
          floorId: 5,
          description:''
        },
      ];

      setSections(sectionData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (section: Section) => {
    setEditingSection(section);
    setFormData({
      name: section.name,
      floorId: section.floorId,
      description:''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this section?")) {
      try {
        const result = await window.electronAPI.deleteUser(id);
        if (result.success) {
          await loadData();
        } else {
          alert(result.error || "Delete failed");
        }
      } catch (error) {
        console.error("Error deleting section:", error);
        alert("An error occurred");
      }
    }
  };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      try {

        console.log('payload for section api: ',editingSection?.id,formData)

        // let result;
        // if (editingSection) {
        //   result = await window.electronAPI.updateUser(editingSection.id, formData);
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
        console.error('Error saving section:', error);
        alert('An error occurred');
      }
    };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Section Master</h2>
          <p className="text-gray-600">Manage sections in the organisation</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Add Section
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Section Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Floor Name
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
              {sections.map((section) => (
                <tr key={section.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-white font-medium">
                            {section.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {section.name}
                        </div>
                        {/* <div className="text-sm text-gray-500">{user.email}</div> */}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {/* <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role_name === 'Admin' 
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-green-100 text-green-800'
                    }`}> */}
                    {section.floorId}
                    {/* </span> */}
                  </td>
                  {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {section.block}
                  </td> */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEdit(section)}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                      >
                        <Edit size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(section.id)}
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
                {editingSection ? "Edit Section" : "Add Section"}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData(prevData => ({ ...prevData, name: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Floor
                </label>
                <select
                  value={formData.floorId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      floorId: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {floors.map((floor) => (
                    <option key={floor.id} value={floor.id}>
                      {floor.name}
                    </option>
                  ))}
                </select>
              </div>
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Block 
                </label>
                <div className="relative">
                  <select
                  value={formData.block}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      block: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {blocks.map((block) => (
                    <option key={block.id} value={block.id}>
                      {block.name}
                    </option>
                  ))}
                </select>
                </div>
              </div> */}
              
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
                  {editingSection ? "Update" : "Create"} Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Section;
