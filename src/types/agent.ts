
export interface CoSPreferences {
  tone: "formal" | "casual";
  notificationFrequency: "high" | "medium" | "low";
  trainingFocus: string[];
  workloadThreshold: number; // hours per week
  delegationPreference: "aggressive" | "balanced" | "conservative";
  communicationStyle: "formal" | "casual";
  agentInteractionLevel: "high" | "medium" | "low";
}
