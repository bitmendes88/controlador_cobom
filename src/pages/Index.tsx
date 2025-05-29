
import { useState } from 'react';
import { FleetDashboard } from '@/components/FleetDashboard';
import { DailyServiceNotes } from '@/components/DailyServiceNotes';
import { AddVehicleForm } from '@/components/AddVehicleForm';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const Index = () => {
  const [showAddVehicle, setShowAddVehicle] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-red-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Fire Department Fleet Management</h1>
              <p className="text-red-100 mt-1">Emergency Vehicle Status & Control System</p>
            </div>
            <Button 
              onClick={() => setShowAddVehicle(true)}
              className="bg-white text-red-600 hover:bg-gray-100 font-semibold"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Vehicle
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Daily Service Notes - Whiteboard */}
        <DailyServiceNotes />
        
        {/* Fleet Dashboard */}
        <FleetDashboard />
      </div>

      {/* Add Vehicle Modal */}
      {showAddVehicle && (
        <AddVehicleForm onClose={() => setShowAddVehicle(false)} />
      )}
    </div>
  );
};

export default Index;
