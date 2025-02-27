
import { Card } from "@/components/ui/card"
import { TieredSupport } from "@/components/support/TieredSupport"
import { CommunicationFeed } from "@/components/dashboard/CommunicationFeed"

export function SupportSection() {
  return (
    <>
      <div className="col-span-full">
        <Card className="p-6">
          <TieredSupport />
        </Card>
      </div>
      <div className="col-span-full lg:col-span-2">
        <Card className="p-6">
          <CommunicationFeed />
        </Card>
      </div>
    </>
  );
}

