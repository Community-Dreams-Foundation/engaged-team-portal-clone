
import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { TaskMonitor } from '@/components/dashboard/monitoring/TaskMonitor';
import { AlertsPanel } from '@/components/dashboard/monitoring/AlertsPanel';
import { RealTimeMonitor } from '@/components/dashboard/monitoring/RealTimeMonitor';

const MonitoringSection = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 space-y-6">
        <h1 className="text-2xl font-bold mb-6">Real-Time Performance Monitoring</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <TaskMonitor />
          </div>
          <div>
            <AlertsPanel />
          </div>
        </div>
        
        <RealTimeMonitor />
      </div>
    </DashboardLayout>
  );
};

export default MonitoringSection;
