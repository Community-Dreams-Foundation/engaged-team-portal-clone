
import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/AuthContext"
import { 
  Shield, 
  Bell, 
  UserCircle, 
  CreditCard,
  Settings2, 
  Save
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { RewardTier } from "@/types/gamification"
import { Button } from "@/components/ui/button"
import { ProfileTabContent } from "@/components/settings/ProfileTabContent"
import { BillingTabContent } from "@/components/settings/BillingTabContent"
import { SecurityTabContent } from "@/components/settings/SecurityTabContent"
import { LeadershipTabContent } from "@/components/settings/LeadershipTabContent"
import NotificationSettings from "@/components/notifications/NotificationSettings"

export default function Settings() {
  const { currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState("profile")
  const [isEditing, setIsEditing] = useState(false)
  const { toast } = useToast()
  
  const accountCreationDate = currentUser?.metadata.creationTime 
    ? new Date(currentUser.metadata.creationTime).toLocaleDateString()
    : 'N/A'
  
  const lastSignInDate = currentUser?.metadata.lastSignInTime
    ? new Date(currentUser.metadata.lastSignInTime).toLocaleDateString()
    : 'N/A'

  const mockGamificationProfile = {
    userId: currentUser?.uid || "guest-user",
    level: 12,
    points: 8750,
    badges: ["Early Adopter", "Team Player", "Task Master", "Problem Solver"],
    challengesCompleted: 47,
    teamContributions: 23,
    currentStreak: 14,
    longestStreak: 21,
    rewards: [
      {
        tier: "gold" as RewardTier,
        unlockedAt: Date.parse("2023-05-15"),
        benefits: ["Priority Support", "Custom Portfolio Theme", "Premium Analytics"]
      },
      {
        tier: "silver" as RewardTier,
        unlockedAt: Date.parse("2023-03-01"),
        benefits: ["Increased Storage", "Access to Team Challenges"]
      }
    ]
  }

  const handleSaveProfile = () => {
    setIsEditing(false);
    toast({
      title: "Profile updated",
      description: "Your profile information has been saved successfully."
    });
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Account Settings</h1>
            <p className="text-muted-foreground mt-1">
              Manage your profile, account preferences and subscription
            </p>
          </div>
          {isEditing ? (
            <Button onClick={handleSaveProfile} className="gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          ) : (
            <div className="text-sm text-muted-foreground">
              Member since {accountCreationDate}
            </div>
          )}
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start mb-8 bg-card border">
            <TabsTrigger value="profile" className="flex items-center">
              <UserCircle className="mr-2 h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center">
              <CreditCard className="mr-2 h-4 w-4" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="leadership" className="flex items-center">
              <Shield className="mr-2 h-4 w-4" />
              Leadership
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center">
              <Settings2 className="mr-2 h-4 w-4" />
              Account
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <ProfileTabContent 
              currentUser={currentUser} 
              accountCreationDate={accountCreationDate}
              lastSignInDate={lastSignInDate}
              mockGamificationProfile={mockGamificationProfile}
            />
          </TabsContent>
          
          <TabsContent value="billing">
            <BillingTabContent />
          </TabsContent>
          
          <TabsContent value="notifications">
            <NotificationSettings />
          </TabsContent>

          <TabsContent value="leadership">
            <LeadershipTabContent />
          </TabsContent>
          
          <TabsContent value="settings">
            <SecurityTabContent />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
