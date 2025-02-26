
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LeadershipDomain } from '@/types/leadership';
import { useTeamManagement } from '@/hooks/useTeamManagement';
import { useAuth } from '@/contexts/AuthContext';

export function TeamManagement() {
  const { currentUser } = useAuth();
  const { createTeam, addTeamMember, removeTeamMember, isLoading } = useTeamManagement();
  const [selectedDomain, setSelectedDomain] = useState<LeadershipDomain>('strategy');
  const [maxMembers, setMaxMembers] = useState(10);
  const [newMemberId, setNewMemberId] = useState('');

  const handleCreateTeam = async () => {
    if (!currentUser?.uid) return;
    await createTeam(selectedDomain, currentUser.uid, maxMembers);
  };

  const handleAddMember = async (teamId: string) => {
    if (!newMemberId) return;
    await addTeamMember(teamId, newMemberId);
    setNewMemberId('');
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Create New Team</h3>
        
        <div className="space-y-2">
          <Label>Domain</Label>
          <Select
            value={selectedDomain}
            onValueChange={(value) => setSelectedDomain(value as LeadershipDomain)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select domain" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="strategy">Strategy</SelectItem>
              <SelectItem value="product-design">Product Design</SelectItem>
              <SelectItem value="data-engineering">Data Engineering</SelectItem>
              <SelectItem value="software-development">Software Development</SelectItem>
              <SelectItem value="engagement">Engagement</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Maximum Team Size</Label>
          <Input
            type="number"
            value={maxMembers}
            onChange={(e) => setMaxMembers(Number(e.target.value))}
            min={2}
            max={20}
          />
        </div>

        <Button 
          onClick={handleCreateTeam}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Creating...' : 'Create Team'}
        </Button>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Team Members</h3>
        
        <div className="space-y-2">
          <Label>Add Member</Label>
          <div className="flex gap-2">
            <Input
              value={newMemberId}
              onChange={(e) => setNewMemberId(e.target.value)}
              placeholder="Enter member ID"
              className="flex-1"
            />
            <Button 
              onClick={() => handleAddMember('team-id')} 
              disabled={!newMemberId || isLoading}
            >
              Add
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
