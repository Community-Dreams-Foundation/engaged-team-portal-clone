
import { useState, useEffect } from "react";
import { WaiversTable } from "@/components/admin/waiver/WaiversTable";
import { WaiverStats } from "@/components/admin/waiver/WaiverStats";
import { WaiverReviewDialog } from "@/components/admin/waiver/WaiverReviewDialog";
import { Card } from "@/components/ui/card";
import type { WaiverRequest } from "@/types/waiver";
import { WaiverService } from "@/services/WaiverService";

export default function WaiverDashboard() {
  const [waivers, setWaivers] = useState<WaiverRequest[]>([]);
  const [selectedWaiver, setSelectedWaiver] = useState<WaiverRequest | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = WaiverService.subscribeToWaivers((updatedWaivers) => {
      setWaivers(updatedWaivers);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleReviewClick = (waiver: WaiverRequest) => {
    setSelectedWaiver(waiver);
    setIsReviewDialogOpen(true);
  };

  const stats = {
    pending: waivers.filter(w => w.status === "pending").length,
    approved: waivers.filter(w => w.status === "approved").length,
    rejected: waivers.filter(w => w.status === "rejected").length,
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Waiver Management</h1>
      
      <WaiverStats isLoading={isLoading} stats={stats} />
      
      <Card className="p-6">
        <WaiversTable 
          waivers={waivers} 
          onReviewClick={handleReviewClick}
        />
      </Card>

      {selectedWaiver && (
        <WaiverReviewDialog
          waiver={selectedWaiver}
          open={isReviewDialogOpen}
          onOpenChange={setIsReviewDialogOpen}
          onReviewComplete={() => setSelectedWaiver(null)}
        />
      )}
    </div>
  );
}
