
export type LeadershipTier = "emerging" | "captain" | "team-lead" | "product-owner" | "executive";

export type LeadershipDomain = "strategy" | "product-design" | "data-engineering" | "software-development" | "engagement";

export interface LeadershipMetrics {
  assessmentId: string;
  userId: string;
  tier: LeadershipTier;
  averageTaskTime: number;
  tasksCompleted: number;
  delegationAccuracy: number;
  teamEfficiency: number;
  overallScore: number;
  feedback: string;
  timestamp: number;
}

export interface LeadershipAssessment {
  id: string;
  userId: string;
  projectId: string;
  startDate: number;
  endDate: number;
  metrics: LeadershipMetrics;
  status: "in-progress" | "completed";
}

export interface Team {
  id: string;
  domain: LeadershipDomain;
  captainId: string;
  memberIds: string[];
  maxMembers: number;
  createdAt: number;
  performance?: {
    averageTaskCompletion: number;
    teamEfficiency: number;
    innovationScore: number;
    collaborationRate: number;
  };
}

export interface LeadershipTraining {
  id: string;
  userId: string;
  moduleName: string;
  completionDate: number;
  score: number;
  certificationEarned: boolean;
  feedback?: string;
}

export interface LeadershipProfile {
  userId: string;
  currentTier: LeadershipTier;
  domain?: LeadershipDomain;
  joinedAt: number;
  assessments: LeadershipAssessment[];
  trainingCompleted: LeadershipTraining[];
  teamId?: string;
  metrics: {
    overallScore: number;
    leaderboardRank: number;
    mentorshipScore?: number;
    innovationImpact?: number;
  };
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    earnedAt: number;
  }>;
  mentors: string[];
  mentees: string[];
}

export interface PromotionRequest {
  id: string;
  userId: string;
  currentTier: LeadershipTier;
  requestedTier: LeadershipTier;
  metrics: LeadershipMetrics;
  status: "pending" | "approved" | "rejected";
  submittedAt: number;
  reviewedAt?: number;
  reviewedBy?: string;
  feedback?: string;
}

