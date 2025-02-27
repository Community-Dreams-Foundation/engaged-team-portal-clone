
import { NetworkConnections } from "@/components/dashboard/community/NetworkConnections"
import { CommunityMemberProfile } from "@/components/dashboard/community/CommunityMemberProfile"

export function CommunitySection() {
  return (
    <div className="col-span-full lg:col-span-2 space-y-4">
      <NetworkConnections />
      <CommunityMemberProfile />
    </div>
  );
}

