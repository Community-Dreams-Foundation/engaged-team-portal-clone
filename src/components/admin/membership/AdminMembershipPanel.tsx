
import { useQuery } from "@tanstack/react-query"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, DollarSign, Users, FileWarning } from "lucide-react"

export function AdminMembershipPanel() {
  const { data: membershipData, isLoading } = useQuery({
    queryKey: ["membership-overview"],
    queryFn: async () => {
      // Simulated data - replace with actual API call
      return {
        activeMembers: 120,
        pendingPayments: 15,
        overdueFees: 5,
        totalRevenue: 12000,
        upcomingDeadline: "2024-03-05T23:59:00",
        waiverRequests: 3,
      }
    },
  })

  if (isLoading) return <div>Loading membership data...</div>

  return (
    <div className="space-y-4">
      <CardHeader className="px-0 pt-0">
        <CardTitle>Membership & Fee Management</CardTitle>
        <CardDescription>
          Monitor member status, payments, and waiver requests
        </CardDescription>
      </CardHeader>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Active Members
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-3xl font-bold">{membershipData?.activeMembers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Pending Payments
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-3xl font-bold">{membershipData?.pendingPayments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileWarning className="h-5 w-5" />
              Waiver Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-3xl font-bold">{membershipData?.waiverRequests}</div>
          </CardContent>
        </Card>
      </div>

      {membershipData?.overdueFees > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Attention Required</AlertTitle>
          <AlertDescription>
            {membershipData.overdueFees} members have overdue fees that require
            immediate attention.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="payments" className="w-full">
        <TabsList>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="waivers">Waivers</TabsTrigger>
        </TabsList>
        <TabsContent value="payments" className="mt-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Payment Overview</h3>
                <p className="text-sm text-muted-foreground">
                  Next deadline: {new Date(membershipData?.upcomingDeadline).toLocaleDateString()}
                </p>
              </div>
              <Button>Process Payments</Button>
            </div>
            {/* Add payment table/list here */}
          </div>
        </TabsContent>
        <TabsContent value="waivers" className="mt-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Waiver Requests</h3>
              <Button variant="outline">Review All</Button>
            </div>
            {/* Add waiver request table/list here */}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
