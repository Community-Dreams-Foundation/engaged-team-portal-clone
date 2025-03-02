
import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PayPalButton from "@/components/PayPalButton"
import { SubscriptionManagement } from "@/components/subscription/SubscriptionManagement"
import { LeadershipMetrics } from "@/components/leadership/LeadershipMetrics"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Shield, Bell, UserCircle, CreditCard } from "lucide-react"

export default function Settings() {
  const { currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState("billing")
  const [showSubscription, setShowSubscription] = useState(false)

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Account Settings</h1>
          <div className="text-sm text-muted-foreground">
            Member since {currentUser?.metadata.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleDateString() : 'N/A'}
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start mb-6">
            <TabsTrigger value="billing" className="flex items-center">
              <CreditCard className="mr-2 h-4 w-4" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center">
              <UserCircle className="mr-2 h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="leadership" className="flex items-center">
              <Shield className="mr-2 h-4 w-4" />
              Leadership
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="billing" className="space-y-4">
            <div className="grid gap-4">
              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-2">Subscription Status</h2>
                <p className="text-muted-foreground mb-6">Manage your current subscription or sign up for premium features</p>
                <Separator className="mb-6" />
                
                <SubscriptionManagement />
                
                {!showSubscription ? (
                  <div className="mt-6">
                    <Button 
                      onClick={() => setShowSubscription(true)}
                      className="w-full"
                    >
                      Upgrade your subscription
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 mt-6">
                    <p className="text-sm text-muted-foreground">
                      Subscribe to unlock premium features at $15/month
                    </p>
                    <PayPalButton />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowSubscription(false)} 
                      className="mt-2"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="profile">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Profile Information</h2>
              {currentUser && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Email Address</h3>
                      <p className="text-base">{currentUser.email}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Account Created</h3>
                      <p className="text-base">{currentUser.metadata.creationTime}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Last Sign In</h3>
                      <p className="text-base">{currentUser.metadata.lastSignInTime}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Account ID</h3>
                      <p className="text-base">{currentUser.uid.substring(0, 8)}...</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-4">
                    <Button>Update Profile</Button>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Notification Preferences</h2>
              <p className="text-muted-foreground mb-6">Control how and when you receive notifications</p>
              
              <div className="space-y-4">
                <div className="bg-muted/50 p-6 rounded-lg">
                  <p className="text-center text-muted-foreground">
                    Notification settings coming soon...
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="leadership">
            <LeadershipMetrics />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
