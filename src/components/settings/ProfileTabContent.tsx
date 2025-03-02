
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import {
  Save,
  Camera,
  Building,
  MapPin,
  Briefcase,
  Eye,
  EyeOff,
  Edit,
  Link as LinkIcon,
  AtSign,
  Calendar,
  BadgeCheck
} from "lucide-react";
import { User } from "firebase/auth";

interface ProfileData {
  displayName: string;
  bio: string;
  company: string;
  jobTitle: string;
  location: string;
  website: string;
  skills: string[];
  interests: string[];
  profileVisibility: 'public' | 'private';
}

interface ProfileTabContentProps {
  currentUser: User | null;
  accountCreationDate: string;
  lastSignInDate: string;
  mockGamificationProfile: any;
}

export const ProfileTabContent: React.FC<ProfileTabContentProps> = ({
  currentUser,
  accountCreationDate,
  lastSignInDate,
  mockGamificationProfile
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const [profileData, setProfileData] = useState<ProfileData>({
    displayName: currentUser?.displayName || '',
    bio: 'Innovator and problem solver passionate about technology and AI solutions.',
    company: 'DreamTech Solutions',
    jobTitle: 'Senior Innovation Engineer',
    location: 'San Francisco, CA',
    website: 'https://example.com/profile',
    skills: ['Artificial Intelligence', 'Project Management', 'Innovation Leadership', 'UX Design'],
    interests: ['Emerging Tech', 'Team Collaboration', 'Sustainable Innovation'],
    profileVisibility: 'public'
  });

  const handleSaveProfile = () => {
    setIsEditing(false);
    toast({
      title: "Profile updated",
      description: "Your profile information has been saved successfully."
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    toast({
      title: "Profile image selected",
      description: "Your new profile image has been selected. Save changes to update."
    });
  };

  return (
    <div className="space-y-8">
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
                  {mockGamificationProfile.badges.slice(0, 2).map((badge: string, i: number) => (
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
                    {mockGamificationProfile.badges.map((badge: string, i: number) => (
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
    </div>
  );
};
