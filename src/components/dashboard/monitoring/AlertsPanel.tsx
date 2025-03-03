
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, Clock, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserAlerts, markAlertAsRead } from '@/services/monitoringService';

export function AlertsPanel() {
  const { currentUser } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const userAlerts = await getUserAlerts(currentUser.uid);
        setAlerts(userAlerts);
      } catch (error) {
        console.error("Error fetching alerts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [currentUser]);

  const handleMarkAsRead = async (alertId: string) => {
    if (!currentUser) return;
    
    try {
      await markAlertAsRead(currentUser.uid, alertId);
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, read: true } : alert
      ));
    } catch (error) {
      console.error("Error marking alert as read:", error);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'approaching_deadline':
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Alerts & Notifications
        </CardTitle>
        <Badge variant="outline">{alerts.filter(a => !a.read).length} new</Badge>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-4">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Bell className="mx-auto h-8 w-8 opacity-50 mb-2" />
            <p>No alerts to display</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
            {alerts.slice(0, 10).map(alert => (
              <div 
                key={alert.id}
                className={`flex items-start space-x-3 rounded-lg border p-3 transition-colors ${!alert.read ? 'bg-muted/40' : ''}`}
              >
                {getAlertIcon(alert.type)}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium leading-none">{alert.message}</p>
                    <span className="text-xs text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {alert.details || new Date(alert.timestamp).toLocaleDateString()}
                  </p>
                </div>
                {!alert.read && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleMarkAsRead(alert.id)}
                    className="h-6 rounded-sm px-2 text-xs"
                  >
                    Mark read
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
