
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LeadershipDomain } from "@/types/leadership";
import { useToast } from "@/hooks/use-toast";

interface MentorProfile {
  id: string;
  name: string;
  avatarUrl?: string;
  domain: LeadershipDomain;
  tier: string;
  expertise: string[];
  availability: 'high' | 'medium' | 'low';
}

interface MentorshipConnectionProps {
  isMentor: boolean;
  hasMentor: boolean;
  mentorshipPreferences?: {
    availableAsMentor?: boolean;
    seekingMentor?: boolean;
    preferredMentorshipAreas?: string[];
  };
  onUpdatePreferences: (preferences: {
    availableAsMentor?: boolean;
    seekingMentor?: boolean;
    preferredMentorshipAreas?: string[];
  }) => void;
  onRequestMentor: (mentorId: string, message: string) => void;
}

export function MentorshipConnection({
  isMentor,
  hasMentor,
  mentorshipPreferences = {},
  onUpdatePreferences,
  onRequestMentor
}: MentorshipConnectionProps) {
  const { toast } = useToast();
  const [availableMentors, setAvailableMentors] = useState<MentorProfile[]>([
    {
      id: "mentor-1",
      name: "Alex Johnson",
      avatarUrl: "",
      domain: "strategy",
      tier: "Executive",
      expertise: ["Strategic Planning", "Team Building", "Product Vision"],
      availability: "medium"
    },
    {
      id: "mentor-2",
      name: "Sam Perez",
      avatarUrl: "",
      domain: "software-development",
      tier: "Team Lead",
      expertise: ["Code Review", "Architecture", "Technical Leadership"],
      availability: "high"
    },
    {
      id: "mentor-3",
      name: "Taylor Kim",
      avatarUrl: "",
      domain: "product-design",
      tier: "Product Owner",
      expertise: ["User Research", "Design Thinking", "Product Strategy"],
      availability: "low"
    }
  ]);
  
  const [selectedDomain, setSelectedDomain] = useState<LeadershipDomain | 'all'>('all');
  const [selectedMentor, setSelectedMentor] = useState<MentorProfile | null>(null);
  const [mentorshipMessage, setMentorshipMessage] = useState("");
  
  const filteredMentors = selectedDomain === 'all' 
    ? availableMentors 
    : availableMentors.filter(mentor => mentor.domain === selectedDomain);
  
  const availabilityColors = {
    high: "bg-green-500",
    medium: "bg-yellow-500",
    low: "bg-red-500"
  };
  
  const handleAvailabilityToggle = (checked: boolean) => {
    onUpdatePreferences({
      ...mentorshipPreferences,
      availableAsMentor: checked
    });
    
    toast({
      title: checked ? "You are now available as a mentor" : "You are no longer available as a mentor",
      description: checked 
        ? "Others can now request your mentorship" 
        : "You won't receive new mentorship requests",
    });
  };
  
  const handleSeekingMentorToggle = (checked: boolean) => {
    onUpdatePreferences({
      ...mentorshipPreferences,
      seekingMentor: checked
    });
  };
  
  const handleSendRequest = () => {
    if (selectedMentor && mentorshipMessage) {
      onRequestMentor(selectedMentor.id, mentorshipMessage);
      setSelectedMentor(null);
      setMentorshipMessage("");
      
      toast({
        title: "Mentorship request sent",
        description: `Your request has been sent to ${selectedMentor.name}`,
      });
    }
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Mentorship</CardTitle>
          <CardDescription>Connect with mentors or become a mentor yourself</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col space-y-6">
            {isMentor && (
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor="mentor-availability">Available as a mentor</Label>
                  <p className="text-sm text-muted-foreground">
                    Make yourself available to mentor others
                  </p>
                </div>
                <Switch
                  id="mentor-availability"
                  checked={mentorshipPreferences.availableAsMentor || false}
                  onCheckedChange={handleAvailabilityToggle}
                />
              </div>
            )}
            
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="seeking-mentor">Seeking mentorship</Label>
                <p className="text-sm text-muted-foreground">
                  Indicate that you're looking for a mentor
                </p>
              </div>
              <Switch
                id="seeking-mentor"
                checked={mentorshipPreferences.seekingMentor || false}
                onCheckedChange={handleSeekingMentorToggle}
                disabled={hasMentor}
              />
            </div>
          </div>
          
          {mentorshipPreferences.seekingMentor && !hasMentor && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Available Mentors</h3>
                <Select 
                  value={selectedDomain} 
                  onValueChange={(value: LeadershipDomain | 'all') => setSelectedDomain(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by domain" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Domains</SelectItem>
                    <SelectItem value="strategy">Strategy</SelectItem>
                    <SelectItem value="product-design">Product Design</SelectItem>
                    <SelectItem value="data-engineering">Data Engineering</SelectItem>
                    <SelectItem value="software-development">Software Development</SelectItem>
                    <SelectItem value="engagement">Engagement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                {filteredMentors.length > 0 ? (
                  filteredMentors.map(mentor => (
                    <div 
                      key={mentor.id} 
                      className="flex items-center justify-between p-3 bg-muted rounded-md"
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={mentor.avatarUrl} />
                          <AvatarFallback>{mentor.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="text-sm font-medium">{mentor.name}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline">{mentor.tier}</Badge>
                            <Badge variant="outline">{mentor.domain}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={`${availabilityColors[mentor.availability]}`}>
                          {mentor.availability === 'high' ? 'Available' : 
                            mentor.availability === 'medium' ? 'Limited' : 'Busy'}
                        </Badge>
                        <Button 
                          size="sm" 
                          onClick={() => setSelectedMentor(mentor)}
                        >
                          Request
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-4 text-muted-foreground">
                    No mentors available for the selected domain
                  </p>
                )}
              </div>
            </div>
          )}
          
          {hasMentor && (
            <div className="p-4 bg-muted rounded-md">
              <p className="text-sm">
                You already have a mentor. You can view your mentorship details in your profile.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={!!selectedMentor} onOpenChange={(open) => !open && setSelectedMentor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Mentorship</DialogTitle>
            <DialogDescription>
              Send a message to {selectedMentor?.name} to request mentorship
            </DialogDescription>
          </DialogHeader>
          
          {selectedMentor && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-muted rounded-md">
                <Avatar>
                  <AvatarImage src={selectedMentor.avatarUrl} />
                  <AvatarFallback>{selectedMentor.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">{selectedMentor.name}</h4>
                  <p className="text-sm text-muted-foreground">{selectedMentor.domain}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Expertise:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedMentor.expertise.map((skill, index) => (
                    <Badge key={index} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Your message</Label>
                <Textarea
                  id="message"
                  placeholder="Briefly explain why you'd like to connect with this mentor..."
                  value={mentorshipMessage}
                  onChange={(e) => setMentorshipMessage(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedMentor(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendRequest}
              disabled={!mentorshipMessage}
            >
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
