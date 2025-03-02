
import { SubscriptionManagement } from "@/components/subscription/SubscriptionManagement"
import { SettingsCard } from "./SettingsCard"

export function BillingTabContent() {
  return (
    <div className="space-y-6">
      <SettingsCard
        title="Subscription Management"
        description="Manage your subscription, billing history, and payment methods"
      >
        <SubscriptionManagement />
      </SettingsCard>
    </div>
  )
}
