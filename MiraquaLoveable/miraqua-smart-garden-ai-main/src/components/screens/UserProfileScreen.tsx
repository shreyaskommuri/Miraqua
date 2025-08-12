
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const UserProfileScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Fixed positioning */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="px-4 py-3">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-lg font-bold">User Profile</h1>
          </div>
        </div>
      </header>
      
      <div className="p-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">This screen shares functionality with Account Settings.</p>
          <Button onClick={() => navigate('/app/account')} className="bg-blue-500 hover:bg-blue-600 text-white">
            Go to Account Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileScreen;
