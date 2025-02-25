
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import type { WaiverRequest } from "@/types/waiver"
import { Badge } from "@/components/ui/badge"

interface WaiverReviewDialogProps {
  waiver: WaiverRequest
  open: boolean
  onOpenChange: (open: boolean) => void
  onApprove: (waiverIdcomments: string) => void
  onReject: (waiverId: string, comments: string) => void
}

export function WaiverReviewDialog({
  waiver,
  open,
  onOpenChange,
  onApprove,
  onReject,
}: WaiverReviewDialogProps) {
  const [reviewComments, setReviewComments] = useState("")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Review Waiver Request</DialogTitle>
          <DialogDescription>
            Review the waiver request details and provide your decision.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">Type:</span>
              <Badge>{waiver.type}</Badge>
            </div>
            {waiver.recruit_count && (
              <div className="flex items-center justify-between">
                <span className="font-medium">Recruits:</span>
                <span>{waiver.recruit_count}</span>
              </div>
            )}
            {waiver.approved_duration && (
              <div className="flex items-center justify-between">
                <span className="font-medium">Duration:</span>
                <span>{waiver.approved_duration}</span>
              </div>
            )}
          </div>
          <Textarea
            placeholder="Add review comments..."
            value={reviewComments}
            onChange={(e) => setReviewComments(e.target.value)}
          />
        </div>
        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="destructive"
            onClick={() => onReject(waiver.waiver_id, reviewComments)}
          >
            Reject
          </Button>
          <Button
            type="button"
            onClick={() => onApprove(waiver.waiver_id, reviewComments)}
          >
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
