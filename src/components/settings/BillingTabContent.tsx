
import React from "react";
import { SettingsCard } from "@/components/settings/SettingsCard";
import { SubscriptionManagement } from "@/components/subscription/SubscriptionManagement";

export const BillingTabContent: React.FC = () => {
  return (
    <div className="space-y-8">
      <SettingsCard
        title="Subscription Management"
        description="Manage your subscription plan and payment methods"
      >
        <SubscriptionManagement />
      </SettingsCard>
    </div>
  );
};
