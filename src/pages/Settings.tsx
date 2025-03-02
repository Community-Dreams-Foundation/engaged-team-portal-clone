
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
import { Shield, Bell, UserCircle, CreditCard, AtSign, Calendar, Settings2, BadgeCheck } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GamificationProfile } from "@/components/dashboard/gamification/GamificationProfile"
import { CommunityMemberProfile } from "@/components/dashboard/community/CommunityMemberProfile"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { RewardTier } from "@/types/gamification"

export default function Settings() {
  const { currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState("profile")
  const [showSubscription, setShowSubscription] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    displayName: currentUser?.displayName || '',
    bio: '',
    company: '',
    jobTitle: '',
    location: ''
  })
  const { toast } = useToast()

  const handleSaveProfile = () => {
    // Here we would implement actual profile update logic
    setIsEditing(false)
    toast({
      title: "Profile updated",
      description: "Your profile information has been saved successfully."
    })
  }

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

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Account Settings</h1>
          <div className="text-sm text-muted-foreground">
            Member since {accountCreationDate}
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start mb-6">
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
          
          <TabsContent value="profile" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-24 w-24 border-4 border-primary/10">
                      {currentUser?.photoURL ? (
                        <AvatarImage src={currentUser.photoURL} alt={currentUser.displayName || 'User'} />
                      ) : (
                        <AvatarFallback className="text-2xl">
                          {currentUser?.email?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <h2 className="text-2xl font-semibold">
                        {currentUser?.displayName || 'DreamStream User'}
                      </h2>
                      <p className="text-muted-foreground flex items-center gap-1">
                        <AtSign className="h-4 w-4" /> 
                        {currentUser?.email}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Joined {accountCreationDate}</span>
                      </div>
                      {currentUser?.emailVerified && (
                        <Badge className="mt-2 bg-green-100 text-green-800">
                          <BadgeCheck className="h-3 w-3 mr-1" /> Verified Account
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant={isEditing ? "default" : "outline"}
                    onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                  >
                    {isEditing ? "Save Profile" : "Edit Profile"}
                  </Button>
                </div>

                <Separator className="my-6" />

                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid gap-4">
                      <div>
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input 
                          id="displayName" 
                          value={profileData.displayName} 
                          onChange={(e) => setProfileData({...profileData, displayName: e.target.value})}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="bio">Bio</Label>
                        <Input 
                          id="bio" 
                          value={profileData.bio} 
                          onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="company">Company</Label>
                        <Input 
                          id="company" 
                          value={profileData.company} 
                          onChange={(e) => setProfileData({...profileData, company: e.target.value})}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="jobTitle">Job Title</Label>
                        <Input 
                          id="jobTitle" 
                          value={profileData.jobTitle} 
                          onChange={(e) => setProfileData({...profileData, jobTitle: e.target.value})}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input 
                          id="location" 
                          value={profileData.location} 
                          onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Email Address</h3>
                        <p className="text-base">{currentUser?.email}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Account Created</h3>
                        <p className="text-base">{accountCreationDate}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Last Sign In</h3>
                        <p className="text-base">{lastSignInDate}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Account ID</h3>
                        <p className="text-base">{currentUser?.uid.substring(0, 8)}...</p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
              
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Activity & Achievements</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Gamification Level</h3>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary text-primary-foreground">
                        Level {mockGamificationProfile.level}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {mockGamificationProfile.points} points
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Recent Badges</h3>
                    <div className="flex flex-wrap gap-2">
                      {mockGamificationProfile.badges.slice(0, 3).map((badge, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Current Subscription</h3>
                    <Badge className="bg-green-100 text-green-800">
                      Monthly Plan
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      Next billing date: May 15, 2024
                    </p>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="mt-auto pt-4">
                  <Button className="w-full" variant="outline" onClick={() => setActiveTab("billing")}>
                    Manage Subscription
                  </Button>
                </div>
              </Card>
            </div>
            
            <GamificationProfile profile={mockGamificationProfile} />
            
            <CommunityMemberProfile />
          </TabsContent>
          
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
              
              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-4">Billing History</h2>
                
                <div className="rounded-md border overflow-hidden">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Amount
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Invoice
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          Apr 15, 2024
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          $15.00
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className="bg-green-100 text-green-800">Paid</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Button variant="ghost" size="sm">
                            Download
                          </Button>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          Mar 15, 2024
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          $15.00
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className="bg-green-100 text-green-800">Paid</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Button variant="ghost" size="sm">
                            Download
                          </Button>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          Feb 15, 2024
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          $15.00
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className="bg-green-100 text-green-800">Paid</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Button variant="ghost" size="sm">
                            Download
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
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
          
          <TabsContent value="settings">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Account Settings</h2>
              <p className="text-muted-foreground mb-6">Manage your account security and preferences</p>
              
              <Separator className="mb-6" />
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Change Password</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Update your password to maintain account security
                  </p>
                  <Button>Change Password</Button>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Two-Factor Authentication</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add an extra layer of security to your account
                  </p>
                  <Button variant="outline">Enable 2FA</Button>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Account Deletion</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Permanently delete your account and all associated data
                  </p>
                  <Button variant="destructive">Delete Account</Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
