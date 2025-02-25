
import React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"

type Waiver = {
  id: string
  userId: string
  type: "leadership" | "sweat-equity" | "competition" | "hardship" | "referral"
  status: "pending" | "approved" | "rejected"
  submittedDate: string
  reviewedDate?: string
}

const mockWaivers: Waiver[] = [
  {
    id: "1",
    userId: "user1",
    type: "leadership",
    status: "pending",
    submittedDate: new Date().toISOString(),
  },
  {
    id: "2",
    userId: "user2",
    type: "hardship",
    status: "approved",
    submittedDate: new Date().toISOString(),
    reviewedDate: new Date().toISOString(),
  },
]

export function WaiversTable() {
  const { data: waivers, isLoading } = useQuery({
    queryKey: ["waivers"],
    queryFn: async () => {
      // Simulated API call
      return mockWaivers
    },
  })

  if (isLoading) {
    return <div>Loading waivers...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Waiver Requests</h3>
        <Button>Process All Pending</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead>Reviewed</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {waivers?.map((waiver) => (
            <TableRow key={waiver.id}>
              <TableCell>{waiver.id}</TableCell>
              <TableCell>{waiver.userId}</TableCell>
              <TableCell className="capitalize">{waiver.type}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    waiver.status === "approved"
                      ? "default"
                      : waiver.status === "pending"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {waiver.status}
                </Badge>
              </TableCell>
              <TableCell>
                {format(new Date(waiver.submittedDate), "MMM dd, yyyy")}
              </TableCell>
              <TableCell>
                {waiver.reviewedDate
                  ? format(new Date(waiver.reviewedDate), "MMM dd, yyyy")
                  : "-"}
              </TableCell>
              <TableCell className="space-x-2">
                <Button variant="outline" size="sm">
                  Review
                </Button>
                <Button variant="outline" size="sm">
                  History
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
