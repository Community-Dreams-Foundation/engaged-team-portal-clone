import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PayPalButton from "@/components/PayPalButton"
import { SubscriptionManagement } from "@/components/subscription/SubscriptionManagement"
import { LeadershipMetrics } from "@/components/leadership/LeadershipMetrics"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import NotificationSettings from "@/components/notifications/NotificationSettings"
import { 
  Shield, 
  Bell, 
  UserCircle, 
  CreditCard, 
  AtSign, 
  Calendar, 
  Settings2, 
  BadgeCheck, 
  Save, 
  Camera,
  Building,
  MapPin,
  Briefcase,
  Eye,
  EyeOff,
  Edit,
  Link as LinkIcon
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form"
import { GamificationProfile } from "@/components/dashboard/gamification/GamificationProfile"
import { CommunityMemberProfile } from "@/components/dashboard/community/CommunityMemberProfile"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { RewardTier } from "@/types/gamification"
import { searchUsers } from "@/utils/userOperations"

export default function Settings() {
  const { currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState("profile")
  const [showSubscription, setShowSubscription] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const { toast } = useToast()
  
  const [profileData, setProfileData] = useState({
    displayName: currentUser?.displayName || '',
    bio: 'Innovator and problem solver passionate about technology and AI solutions.',
    company: 'DreamTech Solutions',
    jobTitle: 'Senior Innovation Engineer',
    location: 'San Francisco, CA',
    website: 'https://example.com/profile',
    skills: ['Artificial Intelligence', 'Project Management', 'Innovation Leadership', 'UX Design'],
    interests: ['Emerging Tech', 'Team Collaboration', 'Sustainable Innovation'],
    profileVisibility: 'public'
  })

  const handleSaveProfile = () => {
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    toast({
      title: "Profile image selected",
      description: "Your new profile image has been selected. Save changes to update."
    })
  }

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
          
          <TabsContent value="profile" className="space-y-8">
            <Card className="border shadow-md bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Account Information</CardTitle>
                <CardDescription>
                  Basic information about your account and membership
                </CardDescription>
              </CardHeader>
              <CardContent className="py-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Contact Information</h3>
                    <div className="space-y-1">
                      <p className="flex items-center gap-1.5 text-sm">
                        <AtSign className="h-4 w-4 text-primary/70" /> 
                        {currentUser?.email}
                      </p>
                      <p className="flex items-center gap-1.5 text-sm">
                        <Calendar className="h-4 w-4 text-primary/70" />
                        Member since {accountCreationDate}
                      </p>
                      <p className="flex items-center gap-1.5 text-sm">
                        <Calendar className="h-4 w-4 text-primary/70" />
                        Last sign in: {lastSignInDate}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Membership</h3>
                    <div className="space-y-1">
                      <p className="text-sm">Current plan:</p>
                      <Badge className="bg-green-100 text-green-800">
                        Monthly Plan
                      </Badge>
                      <Button 
                        variant="link" 
                        className="h-auto p-0 text-xs mt-1" 
                        onClick={() => setActiveTab("billing")}
                      >
                        View billing details
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Gamification Level</h3>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-primary/10 text-primary">
                          Level {mockGamificationProfile.level}
                        </Badge>
                        <span className="text-sm">{mockGamificationProfile.points} points</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Current streak: {mockGamificationProfile.currentStreak} days
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {mockGamificationProfile.badges.slice(0, 2).map((badge, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {badge}
                          </Badge>
                        ))}
                        {mockGamificationProfile.badges.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{mockGamificationProfile.badges.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid gap-8 md:grid-cols-1">
              <Card className="bg-card border shadow-md">
                <div className="flex justify-end p-4 border-b">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1 text-xs"
                      onClick={() => setShowPreview(!showPreview)}
                    >
                      {showPreview ? (
                        <>
                          <EyeOff className="h-3.5 w-3.5" />
                          <span>Hide Preview</span>
                        </>
                      ) : (
                        <>
                          <Eye className="h-3.5 w-3.5" />
                          <span>Public View</span>
                        </>
                      )}
                    </Button>
                    <Button 
                      size="sm" 
                      className="gap-1 text-xs"
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      <Edit className="h-3.5 w-3.5" />
                      <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
                    </Button>
                  </div>
                </div>
                
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">
                    {showPreview ? "Public Profile Preview" : "Profile Information"}
                  </CardTitle>
                  <CardDescription>
                    {showPreview 
                      ? "This is how others will see your profile"
                      : "Update your profile information visible to the community"}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  {showPreview ? (
                    <div className="space-y-6">
                      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                        <Avatar className="h-24 w-24 border-4 border-primary/10">
                          {currentUser?.photoURL ? (
                            <AvatarImage src={currentUser.photoURL} alt={profileData.displayName || 'User'} />
                          ) : (
                            <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                              {profileData.displayName.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <h2 className="text-2xl font-semibold">
                            {profileData.displayName || 'DreamStream User'}
                            {currentUser?.emailVerified && (
                              <Badge className="ml-2 bg-green-100 text-green-800">
                                <BadgeCheck className="h-3 w-3 mr-1" /> Verified
                              </Badge>
                            )}
                          </h2>
                          <p className="text-muted-foreground mt-1 flex items-center gap-2">
                            <Briefcase className="h-4 w-4" /> 
                            {profileData.jobTitle} at {profileData.company}
                          </p>
                          <p className="text-muted-foreground mt-1 flex items-center gap-2">
                            <MapPin className="h-4 w-4" /> 
                            {profileData.location}
                          </p>
                          {profileData.website && (
                            <p className="text-primary mt-1 flex items-center gap-2">
                              <LinkIcon className="h-4 w-4" /> 
                              <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                {profileData.website.replace(/(https?:\/\/)?(www\.)?/, '')}
                              </a>
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-md font-medium mb-2">About</h3>
                        <p className="text-muted-foreground whitespace-pre-line">{profileData.bio}</p>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-md font-medium mb-2">Skills</h3>
                          <div className="flex flex-wrap gap-2">
                            {profileData.skills.map((skill, i) => (
                              <Badge key={i} variant="secondary">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-md font-medium mb-2">Interests</h3>
                          <div className="flex flex-wrap gap-2">
                            {profileData.interests.map((interest, i) => (
                              <Badge key={i} variant="outline">
                                {interest}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-md font-medium mb-2">Badges & Achievements</h3>
                        <div className="flex flex-wrap gap-2">
                          {mockGamificationProfile.badges.map((badge, i) => (
                            <Badge key={i} className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                              {badge}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className="relative">
                          <Avatar className="h-24 w-24 border-4 border-primary/10">
                            {currentUser?.photoURL ? (
                              <AvatarImage src={currentUser.photoURL} alt={profileData.displayName || 'User'} />
                            ) : (
                              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                                {profileData.displayName.charAt(0).toUpperCase() || 'U'}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          {isEditing && (
                            <div className="absolute bottom-0 right-0">
                              <label htmlFor="profile-image" className="cursor-pointer">
                                <div className="rounded-full bg-primary p-2 text-white shadow-md hover:bg-primary/90 transition-colors">
                                  <Camera className="h-4 w-4" />
                                </div>
                                <input 
                                  id="profile-image" 
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden" 
                                  onChange={handleFileUpload}
                                />
                              </label>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 space-y-4">
                          <div>
                            <Label htmlFor="displayName">Display Name</Label>
                            <Input 
                              id="displayName" 
                              value={profileData.displayName} 
                              onChange={(e) => setProfileData({...profileData, displayName: e.target.value})}
                              readOnly={!isEditing}
                              className={!isEditing ? "bg-muted" : ""}
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="jobTitle">Job Title</Label>
                              <Input 
                                id="jobTitle" 
                                value={profileData.jobTitle} 
                                onChange={(e) => setProfileData({...profileData, jobTitle: e.target.value})}
                                readOnly={!isEditing}
                                className={!isEditing ? "bg-muted" : ""}
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="company">Company</Label>
                              <Input 
                                id="company" 
                                value={profileData.company} 
                                onChange={(e) => setProfileData({...profileData, company: e.target.value})}
                                readOnly={!isEditing}
                                className={!isEditing ? "bg-muted" : ""}
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="location">Location</Label>
                              <Input 
                                id="location" 
                                value={profileData.location} 
                                onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                                readOnly={!isEditing}
                                className={!isEditing ? "bg-muted" : ""}
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="website">Website</Label>
                              <Input 
                                id="website" 
                                value={profileData.website} 
                                onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                                readOnly={!isEditing}
                                className={!isEditing ? "bg-muted" : ""}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="bio">Professional Bio</Label>
                        <Textarea 
                          id="bio" 
                          value={profileData.bio} 
                          onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                          readOnly={!isEditing}
                          className={!isEditing ? "bg-muted min-h-[120px]" : "min-h-[120px]"}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          A brief description about yourself, your experience and expertise.
                        </p>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="skills">Skills</Label>
                          <div className="mt-2 border rounded-md p-3 min-h-[100px]">
                            {isEditing ? (
                              <div className="flex flex-wrap gap-2">
                                {profileData.skills.map((skill, i) => (
                                  <Badge key={i} variant="secondary" className="flex items-center gap-1">
                                    {skill}
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-4 w-4 p-0 hover:bg-transparent"
                                      onClick={() => setProfileData({
                                        ...profileData, 
                                        skills: profileData.skills.filter((_, idx) => idx !== i)
                                      })}
                                    >
                                      <span className="sr-only">Remove</span>
                                      <span aria-hidden="true">×</span>
                                    </Button>
                                  </Badge>
                                ))}
                                <Input 
                                  placeholder="Add skill + Enter"
                                  className="flex-1 min-w-[150px] border-dashed"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      const value = e.currentTarget.value.trim();
                                      if (value && !profileData.skills.includes(value)) {
                                        setProfileData({
                                          ...profileData,
                                          skills: [...profileData.skills, value]
                                        });
                                        e.currentTarget.value = '';
                                      }
                                    }
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {profileData.skills.map((skill, i) => (
                                  <Badge key={i} variant="secondary">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="interests">Interests</Label>
                          <div className="mt-2 border rounded-md p-3 min-h-[100px]">
                            {isEditing ? (
                              <div className="flex flex-wrap gap-2">
                                {profileData.interests.map((interest, i) => (
                                  <Badge key={i} variant="outline" className="flex items-center gap-1">
                                    {interest}
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-4 w-4 p-0 hover:bg-transparent"
                                      onClick={() => setProfileData({
                                        ...profileData, 
                                        interests: profileData.interests.filter((_, idx) => idx !== i)
                                      })}
                                    >
                                      <span className="sr-only">Remove</span>
                                      <span aria-hidden="true">×</span>
                                    </Button>
                                  </Badge>
                                ))}
                                <Input 
                                  placeholder="Add interest + Enter"
                                  className="flex-1 min-w-[150px] border-dashed"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      const value = e.currentTarget.value.trim();
                                      if (value && !profileData.interests.includes(value)) {
                                        setProfileData({
                                          ...profileData,
                                          interests: [...profileData.interests, value]
                                        });
                                        e.currentTarget.value = '';
                                      }
                                    }
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {profileData.interests.map((interest, i) => (
                                  <Badge key={i} variant="outline">
                                    {interest}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="flex items-center gap-2">
                          <span>Profile Visibility</span>
                          {profileData.profileVisibility === 'public' ? (
                            <Badge variant="outline" className="text-green-600 bg-green-50">Public</Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-600 bg-gray-50">Private</Badge>
                          )}
                        </Label>
                        {isEditing && (
                          <div className="mt-2 flex items-center gap-4">
                            <Button 
                              type="button"
                              size="sm"
                              variant={profileData.profileVisibility === 'public' ? 'default' : 'outline'}
                              className="gap-2"
                              onClick={() => setProfileData({...profileData, profileVisibility: 'public'})}
                            >
                              <Eye className="h-4 w-4" />
                              Public
                            </Button>
                            <Button 
                              type="button"
                              size="sm"
                              variant={profileData.profileVisibility === 'private' ? 'default' : 'outline'}
                              className="gap-2"
                              onClick={() => setProfileData({...profileData, profileVisibility: 'private'})}
                            >
                              <EyeOff className="h-4 w-4" />
                              Private
                            </Button>
                            <p className="text-xs text-muted-foreground">
                              {profileData.profileVisibility === 'public' 
                                ? 'Your profile is visible to all members' 
                                : 'Only you can see your profile'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
                
                {isEditing && (
                  <CardFooter className="flex justify-end gap-2 border-t pt-6">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveProfile}>
                      Save Changes
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </div>
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
            <NotificationSettings />
          </TabsContent>

          <TabsContent value="leadership">
            <LeadershipMetrics />
          </TabsContent>
          
          <TabsContent value="settings">
            <Card className="border shadow-md bg-card">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-2xl font-bold text-primary">Account Security & Preferences</CardTitle>
                <CardDescription className="text-muted-foreground mt-1">
                  Manage your account security, authentication methods, and privacy preferences
                </CardDescription>
              </CardHeader>
              
              <CardContent className="py-6 space-y-8">
                <div className="grid gap-8 md:grid-cols-2">
                  <div className="space-y-4 p-5 rounded-lg bg-card border">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Settings2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">Change Password</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Set a strong password using a unique combination of letters, numbers, and symbols
                        </p>
                      </div>
                    </div>
                    <Button className="w-full mt-2">Change Password</Button>
                  </div>
                  
                  <div className="space-y-4 p-5 rounded-lg bg-card border">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Add an extra layer of security to protect your account from unauthorized access
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full mt-2">Enable 2FA</Button>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-gray-100">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"></path></svg>
                    </div>
                    <div>
                      <p className="font-medium">GitHub</p>
                      <p className="text-xs text-muted-foreground">Not connected</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-4 rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                        </div>
                        <div>
                          <p className="font-medium">LinkedIn</p>
                          <p className="text-xs text-muted-foreground">Not connected</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">Connect</Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                        </div>
                        <div>
                          <p className="font-medium">GitHub</p>
                          <p className="text-xs text-muted-foreground">Not connected</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">Connect</Button>
                    </div>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-red-100">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-red-600">Account Deletion</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      <div className="mt-4">
                        <Button variant="destructive" className="gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
