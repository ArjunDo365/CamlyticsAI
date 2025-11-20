// App.tsx
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider, useAuth } from "./contexts/AuthContext";

import LoginForm from "./components/Auth/LoginForm";
import Registration from "./components/Views/registration";
import Activation from "./components/Views/active";

import DefaultLayout from "./components/Layout/DefaultLayout";
import DashboardNew from "./components/Views/DashboardNew";
import FileUpload from "./components/Views/FileUpload";
import FileList from "./components/Views/FileList";
import UserManagement from "./components/Views/UserManagement";
import RoleManagement from "./components/Views/RoleManagement";

import Section from "./components/Views/Masters/Section";
import Floors from "./components/Views/Masters/Floors";
import Blocks from "./components/Views/Masters/Blocks";
import NVR from "./components/Views/Masters/NVR";
import Cameras from "./components/Views/Masters/Cameras";
import Employees from "./components/Views/Masters/Employees";
import AppSetting from "./components/Views/Masters/AppSetting";


// 🔐 Protected layout for authenticated users
const ProtectedLayout: React.FC = () => {
  const { isAuthenticated, isRegistered, isLicensed, data_id, loading } = useAuth();
  const [activeView, setActiveView] = useState("dashboard");

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 🟡 Not registered → Registration page
  if (!isRegistered ) return <Navigate to="/registration" replace />;

  // 🔵 Registered but not licensed → Activation page
  if (!isLicensed)
    return <Navigate to="/activation" replace state={{ id: data_id }} />;

  // 🔴 Not logged in → Login page
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // 🚀 Logged in → Show dashboard layout
  const renderView = () => {
    switch (activeView) {
      case "dashboard": return <DashboardNew />;
      case "upload": return <FileUpload />;
      case "files": return <FileList />;
      case "users": return <UserManagement />;
      case "roles": return <RoleManagement />;
      case "sections": return <Section />;
      case "floors": return <Floors />;
      case "blocks": return <Blocks />;
      case "nvr": return <NVR />;
      case "cameras": return <Cameras />;
      case "employees": return <Employees />;
      case "appsetting": return <AppSetting />;
      default: return <DashboardNew />;
    }
  };

  return (
    <DefaultLayout activeView={activeView} onViewChange={setActiveView}>
      {renderView()}
    </DefaultLayout>
  );
};


// 📌 Main App Component
const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>

          {/* Public Routes */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/activation" element={<Activation />} />

          {/* Protected */}
          <Route path="/*" element={<ProtectedLayout />} />

          {/* Catch-All Redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
