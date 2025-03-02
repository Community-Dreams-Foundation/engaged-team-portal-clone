/**
 * API Gateway for Firebase Functions
 * 
 * This file serves as a centralized API gateway to organize Firebase functions by domain
 * and provide a unified interface for the application to interact with backend services.
 */

import { getFunctions, httpsCallable } from 'firebase/functions';
import { auth } from '@/lib/firebase';

// Define API domains and their functions
export enum ApiDomain {
  AUTH = 'auth',
  TASKS = 'tasks',
  TRAINING = 'training',
  PORTFOLIO = 'portfolio',
  COMMUNICATION = 'communication',
  PERFORMANCE = 'performance',
  PAYMENTS = 'payments',
  ADMIN = 'admin'
}

// Cache for function instances to avoid recreating them
const functionCache: Record<string, any> = {};

/**
 * Creates a callable function with the proper domain prefix
 * @param domain The function domain
 * @param functionName The specific function name
 * @returns A callable function
 */
export const createApiFunction = <TData, TResult>(domain: ApiDomain, functionName: string) => {
  const cacheKey = `${domain}_${functionName}`;
  
  if (!functionCache[cacheKey]) {
    const functions = getFunctions();
    const fullFunctionName = `${domain}-${functionName}`;
    functionCache[cacheKey] = httpsCallable<TData, TResult>(functions, fullFunctionName);
  }
  
  return functionCache[cacheKey];
};

/**
 * Executes an API call with authentication
 * @param domain The function domain
 * @param functionName The specific function name
 * @param data The data to send
 * @returns Promise with the result
 */
export const callApi = async <TData, TResult>(
  domain: ApiDomain, 
  functionName: string, 
  data?: TData
): Promise<TResult> => {
  try {
    // Ensure user is authenticated if needed
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Authentication required');
    }
    
    // Get the callable function
    const apiFunction = createApiFunction<TData, TResult>(domain, functionName);
    
    // Call the function
    const result = await apiFunction(data);
    return result.data;
  } catch (error: any) {
    console.error(`API call failed [${domain}-${functionName}]:`, error);
    throw new Error(error.message || 'API call failed');
  }
};

// Domain-specific API interfaces
export const TasksApi = {
  createTask: (data: any) => callApi(ApiDomain.TASKS, 'createTask', data),
  updateTask: (data: any) => callApi(ApiDomain.TASKS, 'updateTask', data),
  deleteTask: (taskId: string) => callApi(ApiDomain.TASKS, 'deleteTask', { taskId }),
  fetchTasks: (userId: string) => callApi(ApiDomain.TASKS, 'fetchTasks', { userId }),
  updateStatus: (data: any) => callApi(ApiDomain.TASKS, 'updateStatus', data),
  updateTimer: (data: any) => callApi(ApiDomain.TASKS, 'updateTimer', data),
};

export const TrainingApi = {
  fetchModules: (userId: string): Promise<any[]> => callApi(ApiDomain.TRAINING, 'fetchModules', { userId }),
  updateProgress: (data: any) => callApi(ApiDomain.TRAINING, 'updateProgress', data),
  completeModule: (data: any) => callApi(ApiDomain.TRAINING, 'completeModule', data),
};

export const PortfolioApi = {
  fetchPortfolio: (userId: string) => callApi(ApiDomain.PORTFOLIO, 'fetchPortfolio', { userId }),
  updatePortfolio: (data: any) => callApi(ApiDomain.PORTFOLIO, 'updatePortfolio', data),
  sharePortfolio: (data: any) => callApi(ApiDomain.PORTFOLIO, 'sharePortfolio', data),
};

export const CommunicationApi = {
  sendMessage: (data: any) => callApi(ApiDomain.COMMUNICATION, 'sendMessage', data),
  fetchMessages: (data: any) => callApi(ApiDomain.COMMUNICATION, 'fetchMessages', data),
  createConnection: (data: any) => callApi(ApiDomain.COMMUNICATION, 'createConnection', data),
  updateConnection: (data: any) => callApi(ApiDomain.COMMUNICATION, 'updateConnection', data),
};

export const PerformanceApi = {
  fetchMetrics: (userId: string) => callApi(ApiDomain.PERFORMANCE, 'fetchMetrics', { userId }),
  updateGoals: (data: any) => callApi(ApiDomain.PERFORMANCE, 'updateGoals', data),
  fetchFeedback: (userId: string) => callApi(ApiDomain.PERFORMANCE, 'fetchFeedback', { userId }),
};

export const PaymentsApi = {
  processPayment: (data: any) => callApi(ApiDomain.PAYMENTS, 'processPayment', data),
  fetchInvoices: (userId: string) => callApi(ApiDomain.PAYMENTS, 'fetchInvoices', { userId }),
  updatePaymentMethod: (data: any) => callApi(ApiDomain.PAYMENTS, 'updatePaymentMethod', data),
};

export const AdminApi = {
  fetchUsers: () => callApi(ApiDomain.ADMIN, 'fetchUsers', {}),
  updateUserRole: (data: any) => callApi(ApiDomain.ADMIN, 'updateUserRole', data),
  fetchWaivers: () => callApi(ApiDomain.ADMIN, 'fetchWaivers', {}),
  approveWaiver: (waiverId: string) => callApi(ApiDomain.ADMIN, 'approveWaiver', { waiverId }),
  rejectWaiver: (data: any) => callApi(ApiDomain.ADMIN, 'rejectWaiver', data),
};

// Add LeadershipApi for leadership-related endpoints
export const LeadershipApi = {
  fetchProfile: (userId: string): Promise<any> => 
    callApi(ApiDomain.PERFORMANCE, 'fetchLeadershipProfile', { userId }),
  updateProfile: (data: any) => 
    callApi(ApiDomain.PERFORMANCE, 'updateLeadershipProfile', data),
  fetchPromotionRequirements: (userId: string, targetTier: string) => 
    callApi(ApiDomain.PERFORMANCE, 'fetchPromotionRequirements', { userId, targetTier }),
  submitPromotionRequest: (data: any) => 
    callApi(ApiDomain.PERFORMANCE, 'submitPromotionRequest', data),
};
