
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCircle, Clock, AlertTriangle, AlertCircle, Shield, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { subscribeToAlerts, acknowledgeAlert, clearAllAlerts } from '@/services/monitoringService';
import { format } from 'date-fns';

interface Alert {
  id: string;
  taskId: string;
  taskTitle: string;
  type: string;
  message: string;
  severity: "info" | "warning" | "critical";
  timestamp: number;
  acknowledged: boolean;
  metadata?: Record<string, any>;
}

export function AlertsPanel() {
  const { currentUser } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showAcknowledged, setShowAcknowledged] = useState(false);
  
  useEffect(() => {
    if (!currentUser?.uid) return;
    
    // Subscribe to alerts
    const unsubscribe = subscribeToAlerts(currentUser.uid, (alertsList) => {
      setAlerts(alertsList);
    });
    
    return () => unsubscribe();
  }, [currentUser?.uid]);
  
  const handleAcknowledge = async (alertId: string) => {
    if (!currentUser?.uid) return;
    
    try {
      await acknowledgeAlert(currentUser.uid, alertId);
      // The UI will update automatically due to the subscription
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };
  
  const handleClearAll = async () => {
    if (!currentUser?.uid) return;
    
    try {
      await clearAllAlerts(currentUser.uid);
    } catch (error) {
      console.error('Error clearing alerts:', error);
    }
  };
  
  // Filter alerts based on acknowledged status
  const filteredAlerts = showAcknowledged ? alerts : alerts.filter(alert => !alert.acknowledged);
  
  // Group alerts by severity
  const criticalAlerts = filteredAlerts.filter(alert => alert.severity === 'critical');
  const warningAlerts = filteredAlerts.filter(alert => alert.severity === 'warning');
  const infoAlerts = filteredAlerts.filter(alert => alert.severity === 'info');
  
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'overdue':
      case 'approaching_deadline':
        return <Clock className="h-4 w-4" />;
      case 'duration_exceeded':
        return <AlertCircle className="h-4 w-4" />;
      case 'dependency_blocked':
        return <Shield className="h-4 w-4" />;
      case 'high_priority':
        return <AlertTriangle className="h-4 w-4" />;
      case 'performance_anomaly':
        return <Bell className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info':
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-primary/5 space-y-0 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Performance Alerts
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAcknowledged(!showAcknowledged)}
            >
              {showAcknowledged ? 'Hide Acknowledged' : 'Show All'}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleClearAll}
            >
              Clear All
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
              {criticalAlerts.length} Critical
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
              {warningAlerts.length} Warning
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
              {infoAlerts.length} Info
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-10 w-10 mx-auto mb-2 text-green-500" />
            <p className="text-sm">No active alerts</p>
            <p className="text-xs text-muted-foreground mt-1">
              {showAcknowledged ? 'Your system is running smoothly.' : 'Switch to "Show All" to view acknowledged alerts.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {criticalAlerts.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-red-700">Critical Alerts</h3>
                {criticalAlerts.map(alert => renderAlertItem(alert))}
              </div>
            )}
            
            {warningAlerts.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-yellow-700">Warning Alerts</h3>
                {warningAlerts.map(alert => renderAlertItem(alert))}
              </div>
            )}
            
            {infoAlerts.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-blue-700">Information</h3>
                {infoAlerts.map(alert => renderAlertItem(alert))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
  
  function renderAlertItem(alert: Alert) {
    return (
      <div 
        key={alert.id}
        className={`border rounded-md p-3 ${
          alert.acknowledged ? 'opacity-60' : ''
        } ${getSeverityColor(alert.severity)}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2">
            {getAlertIcon(alert.type)}
            <div>
              <p className="text-sm font-medium">{alert.message}</p>
              <p className="text-xs mt-1">
                {format(new Date(alert.timestamp), 'MMM d, h:mm a')}
                {alert.acknowledged && ' · Acknowledged'}
              </p>
            </div>
          </div>
          
          {!alert.acknowledged && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 rounded-full"
              onClick={() => handleAcknowledge(alert.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Display any relevant metadata */}
        {alert.metadata && Object.keys(alert.metadata).length > 0 && (
          <div className="mt-2 pt-2 border-t border-current/20 grid grid-cols-2 gap-2">
            {Object.entries(alert.metadata)
              .filter(([key]) => !key.includes('Count') && !key.includes('Percent') && key !== 'dependencies')
              .map(([key, value]) => (
                <div key={key} className="text-xs">
                  <span className="font-medium">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>{' '}
                  {typeof value === 'number' && value > 100 
                    ? new Date(value).toLocaleString() 
                    : String(value)}
                </div>
              ))}
          </div>
        )}
      </div>
    );
  }
}
