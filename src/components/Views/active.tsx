import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";

interface ActiveProps {
  id?: string;
}

const Active: React.FC<ActiveProps> = ({ id }) => {
  const [formData, setFormData] = useState({
    system_code: "",
    license_key: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const { data_id } = useAuth();

  const routeState = location.state as { id?: string } | null;
  const finalId = id || routeState?.id || "";

  // ----------------------------------------
  // Internet Check
  // ----------------------------------------
  const checkInternetConnection = async (): Promise<boolean> => {
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
  };

  // ----------------------------------------
  // Submit Handler
  // ----------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const online = await checkInternetConnection();
    if (!online) {
      alert("No internet connection. Please check your network.");
      setLoading(false);
      return;
    }

    let user = await window.electronAPI.getRegistrationById(data_id);
    const email = user.data[0].email;

    let hmc = await window.electronAPI.generateHmc({
      registered_id: email,
      hddSerial: formData.system_code,
    });

    if (hmc !== formData.license_key) {
      alert("Given key is invalid. Please contact provider.");
      setLoading(false);
      return;
    }

    const SaveData: any = {
      license_key: formData.license_key,
      system_code: formData.system_code,
      registered_id: finalId,
    };

    const res = await window.electronAPI.insertlicense(SaveData);

    if (!res.success) {
      setError("Invalid system_code or license_key");
    } else {
      alert(res.message);
      navigate("/login", { replace: true });
    }

    setLoading(false);
  };

  // ----------------------------------------
  // Fetch HDD Serial
  // ----------------------------------------
  useEffect(() => {
    const fetchSerial = async () => {
      const serial = await window.electronAPI.getHddSerial();
      console.log(serial)
      if (serial) {
        setFormData((prev) => ({
          ...prev,
          system_code: serial,
        }));
      }
    };
    fetchSerial();
  }, []);

  // ----------------------------------------
  // Handle Change
  // ----------------------------------------
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-[#2D3A7F] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl pt-10 px-10 pb-1 min-h-[500px] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-center text-center mb-8 gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#000"><path d="M120-160v-112q0-34 17.5-62.5T184-378q62-31 126-46.5T440-440q20 0 40 1.5t40 4.5q-4 58 21 109.5t73 84.5v80H120ZM760-40l-60-60v-186q-44-13-72-49.5T600-420q0-58 41-99t99-41q58 0 99 41t41 99q0 45-25.5 80T790-290l50 50-60 60 60 60-80 80ZM440-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm300 80q17 0 28.5-11.5T780-440q0-17-11.5-28.5T740-480q-17 0-28.5 11.5T700-440q0 17 11.5 28.5T740-400Z" /></svg>

   
          <h1 className="text-4xl font-bold text-gray-900">Activation</h1>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="flex-grow">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* System Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Activation Code
              </label>
              <input
                type="text"
                name="system_code"
                value={formData.system_code}
                readOnly
                className="w-full px-4 py-3 border rounded-lg"
              />
            </div>

            {/* License Key */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                License Key
              </label>
              <input
                type="text"
                name="license_key"
                value={formData.license_key}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border rounded-lg"
                placeholder="Enter your License Key"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-center gap-4 mt-6 w-1/2 mx-auto">
              {/* <button
                type="button"
                onClick={() => navigate("/login")}
                className="w-1/2 bg-gray-400 text-white py-3 rounded-lg"
              >
                Cancel
              </button> */}

              <button
                type="submit"
                className="w-1/2 bg-[#3B4A99] text-white py-3 rounded-lg"
              >
               Activate
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <footer className="text-black mt-auto p-4 text-center">
          &copy; {new Date().getFullYear()} | Developed by DO365 Technologies
        </footer>
      </div>
    </div>
  );
};

export default Active;
