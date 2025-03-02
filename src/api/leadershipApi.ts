
import { apiClient } from "./gateway";
import { LeadershipProfile, PromotionRequest, LeadershipTier } from "@/types/leadership";

export const LeadershipApi = {
  fetchProfile: (userId: string): Promise<LeadershipProfile> => 
    apiClient.get(`/leadership/profile/${userId}`),
  
  updateProfile: (data: Partial<LeadershipProfile>): Promise<LeadershipProfile> => 
    apiClient.post('/leadership/profile/update', data),
  
  fetchPromotionRequirements: (userId: string, targetTier: LeadershipTier): Promise<any> => 
    apiClient.get(`/leadership/promotion/requirements/${userId}/${targetTier}`),
  
  submitPromotionRequest: (data: Partial<PromotionRequest>): Promise<PromotionRequest> => 
    apiClient.post('/leadership/promotion/request', data),
  
  fetchMentors: (domain?: string): Promise<any[]> => 
    apiClient.get(`/leadership/mentors${domain ? `?domain=${domain}` : ''}`),
  
  requestMentorship: (mentorId: string, message: string): Promise<any> => 
    apiClient.post('/leadership/mentorship/request', { mentorId, message }),
  
  updateMentorshipStatus: (userId: string, status: 'available' | 'unavailable'): Promise<any> => 
    apiClient.post('/leadership/mentorship/status', { userId, status }),
};
