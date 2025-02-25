
import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PayPalButton from "@/components/PayPalButton"
import { SubscriptionManagement } from "@/components/subscription/SubscriptionManagement"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"

export default function Settings() {
  const { currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState("billing")
  const [showSubscription, setShowSubscription] = useState(false)

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="billing" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Subscription Status</h2>
              <div className="space-y-4">
                <SubscriptionManagement />
                {!showSubscription ? (
                  <Button 
                    onClick={() => setShowSubscription(true)}
                    className="w-full"
                  >
                    Turn on subscription
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Subscribe to unlock premium features
                    </p>
                    <PayPalButton />
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="profile">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Profile Information</h2>
              {currentUser && (
                <div className="space-y-2">
                  <p><span className="font-medium">Email:</span> {currentUser.email}</p>
                  <p><span className="font-medium">Account created:</span> {currentUser.metadata.creationTime}</p>
                </div>
              )}
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Notification Preferences</h2>
              <p>Notification settings coming soon...</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
