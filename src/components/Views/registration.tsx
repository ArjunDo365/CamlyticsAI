import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Registration: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    company_name: "",
    email: "",
    mobile: "",
    address: "",
    activation_code: "",
    app_name : "Camlytix",
    no_of_records: 0,
    created_by_id: "b5cec1c6-8783-4e60-b88b-d49d8ae658a7",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ===========================
  // GET HARD DISK SERIAL NUMBER
  // ===========================
  useEffect(() => {
    
    const fetchSerial = async () => {
      try {
        const serial = await window.electronAPI.getHddSerial();
        console.log(serial)
        setFormData((prev) => ({
          ...prev,
          activation_code: serial || "",
        }));
      } catch (err) {
        console.error("Error fetching HDD serial:", err);
      }
    };

    fetchSerial();
  }, []);

  // ===========================
  // CHECK INTERNET CONNECTION
  // ===========================
  async function checkInternetConnection(): Promise<boolean> {
    try {
      await fetch("https://www.google.com/favicon.ico", {
        method: "HEAD",
        mode: "no-cors",
        cache: "no-cache",
      });
      return true;
    } catch {
      return false;
    }
  }

  // ===========================
  // FORM SUBMIT
  // ===========================
  const handleSubmit = async (e: React.FormEvent) => {
    
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const online = await checkInternetConnection();
      if (!online) {
        alert("No internet connection. Please check your network and try again.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        "https://cmchis.do365tech.in/api/RegistrationInsert",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (result.Type === "S") {
        alert("Registration successful!");

        const res = await window.electronAPI.registerLicense(formData);
        if (res.success) {
          navigate("/activation", {
            state: { id: result.Id },
            replace: true,
          });
        }

        // Reset form
        setFormData({
          name: "",
          company_name: "",
          email: "",
          mobile: "",
          address: "",
          activation_code: "",
          created_by_id: "",
          app_name : "Camlytix",
          no_of_records: 0,
        });
      } else {
        alert(result.error || "Registration failed");
      }
    } catch (error: any) {
      console.error("Error during registration:", error);
      if (error?.name === "TypeError") {
        alert("Unable to connect to server. Please check your connection.");
      } else {
        alert("Unexpected error occurred. Please try again.");
      }
    }

    setLoading(false);
  };

  // ===========================
  // INPUT CHANGE HANDLER
  // ===========================
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Allow only numeric value in mobile
    if (name === "mobile") {
      const numericValue = value.replace(/[^0-9]/g, "");
      setFormData((prev) => ({ ...prev, mobile: numericValue }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-[#2D3A7F] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl pt-10 px-10 pb-1 min-h-[500px] flex flex-col">
        
        {/* HEADER */}
        <div className="flex items-center justify-center mx-auto text-center mb-8 gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#000">
            <path d="M480-240Zm-320 80v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q37 0 73 4.5t72 14.5l-67 68q-20-3-39-5t-39-2q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32h240v80H160Zm400 40v-123l221-220q9-9 20-13t22-4q12 0 23 4.5t20 13.5l37 37q8 9 12.5 20t4.5 22q0 11-4 22.5T903-340L683-120H560Zm300-263-37-37 37 37ZM620-180h38l121-122-18-19-19-18-122 121v38Zm141-141-19-18 37 37-18-19ZM480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm0-80q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0-80Z" />
          </svg>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Registration Process
          </h1>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-6 flex-grow">
          <div className="grid grid-cols-2 gap-6">

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                required
                placeholder="Enter your company name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile No <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="mobile"
                value={formData.mobile}
                maxLength={10}
                onChange={handleChange}
                required
                placeholder="Enter mobile number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Address */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={4}
                placeholder="Enter your address"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center gap-4 mt-6 w-1/2 mx-auto">
            <button
              type="submit"
              disabled={loading}
              className={`w-1/2 bg-[#3B4A99] text-white py-3 px-4 rounded-lg font-medium transition ${
                loading ? "opacity-50 cursor-not-allowed" : "hover:bg-[#2D3A7F]"
              }`}
            >
              {loading ? "Processing..." : "Register"}
            </button>
          </div>
        </form>

        {/* FOOTER */}
        <footer className="text-black mt-auto rounded-lg p-4">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
            <div className="text-sm">&copy; {new Date().getFullYear()} All rights reserved.</div>
            <div className="text-sm">
              <a
                href="https://do365tech.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black hover:text-gray-500"
              >
                Developed
              </a>{" "}
              by DO365 Technologies
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Registration;
