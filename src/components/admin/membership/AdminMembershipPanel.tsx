
import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PaymentsTable } from "./PaymentsTable"
import { WaiversTable } from "../waiver/WaiversTable"

export function AdminMembershipPanel() {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Membership Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="payments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="waivers">Waivers</TabsTrigger>
          </TabsList>
          <TabsContent value="payments">
            <PaymentsTable />
          </TabsContent>
          <TabsContent value="waivers">
            <WaiversTable />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
