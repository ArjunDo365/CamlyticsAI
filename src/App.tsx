import React, { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import LoginForm from "./components/Auth/LoginForm";
import DefaultLayout from "./components/Layout/DefaultLayout";
import Dashboard from "./components/Views/Dashboard";
import FileUpload from "./components/Views/FileUpload";
import FileList from "./components/Views/FileList";
import UserManagement from "./components/Views/UserManagement";
import RoleManagement from "./components/Views/RoleManagement";
import DashboardNew from "./components/Views/DashboardNew";
import Section from "./components/Views/Masters/Section";
import Floors from "./components/Views/Masters/Floors";
import Blocks from "./components/Views/Masters/Blocks";
import NVR from "./components/Views/Masters/NVR";
import Cameras from "./components/Views/Masters/Cameras";
import Employees from "./components/Views/Masters/Employees";
import AppSetting from "./components/Views/Masters/AppSetting";

const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const [activeView, setActiveView] = useState("dashboard");

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return <DashboardNew />;
      case "upload":
        return <FileUpload />;
      case "files":
        return <FileList />;
      case "users":
        return <UserManagement />;
      case "roles":
        return <RoleManagement />;
      case "sections":
        return <Section />;
        case "floors":
        return <Floors />;
        case "blocks":
        return <Blocks />;
        case "nvr":
        return <NVR />;
        case "cameras":
        return <Cameras />;
        case "employees":
        return <Employees />;
         case "appsetting":
        return <AppSetting />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <DefaultLayout activeView={activeView} onViewChange={setActiveView}>
      {renderView()}
    </DefaultLayout>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
