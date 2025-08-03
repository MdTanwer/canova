import api from "./axios";

export interface CreateProjectPayload {
  formName: string;
  projectName: string;
}

export interface CreateFormPayload {
  formName: string;
}
import type {
  Condition,
  FormPublishSettings,
  PublishResponse,
} from "../types/types";

export const createProjectWithForm = async (payload: CreateProjectPayload) => {
  const response = await api.post("/project", payload);
  return response.data;
};

export const createForm = async (payload: CreateFormPayload) => {
  const response = await api.post("/form", payload);
  return response.data;
};

export const getPages = async (formId: string) => {
  const response = await api.get(`/form/pages/${formId}`);
  return response.data;
};
export const createNextPages = async (formId: string) => {
  const response = await api.post(`/form/add-page/${formId}`);
  return response.data;
};

export const getFormNmae = async (formId: string) => {
  const response = await api.get(`/form/name/${formId}`);
  return response.data;
};

export const updateFormTitle = async (formId: string, title: string) => {
  const response = await api.put(`/form/rename/${formId}`, { title });
  return response.data;
};

export const updateProjectName = async (projectId: string, name: string) => {
  const response = await api.put(`/project/rename/${projectId}`, { name });
  return response.data;
};

export const incrementFormViews = async (uniqueUrl: string) => {
  const response = await api.post(`/form/views/${uniqueUrl}`);
  return response.data;
};

// Project Analytics Types
interface ProjectAnalyticsData {
  project: {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
  analytics: {
    totalViews: number;
    totalForms: number;
    publishedForms: number;
    draftForms: number;
    averageViewsPerForm: number;
  };
  forms: Array<{
    id: string;
    title: string;
    views: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    uniqueUrl: string;
  }>;
  topForms: Array<{
    id: string;
    title: string;
    views: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    uniqueUrl: string;
  }>;
  dailyViews: Array<{
    date: string;
    dayName: string;
    views: number;
  }>;
}

interface ProjectAnalyticsResponse {
  success: boolean;
  message: string;
  data: ProjectAnalyticsData;
}

export const getProjectAnalytics = async (projectId: string): Promise<ProjectAnalyticsResponse> => {
  const response = await api.get<ProjectAnalyticsResponse>(`/project/analytics/${projectId}`);
  return response.data;
};

export const createCondition = async (payload: Condition) => {
  const response = await api.post(`/condition`, payload);
  return response.data;
};

export const getPageFlow = async (formId: string, pageId: string) => {
  const payload = { formId, pageId };
  const response = await api.post(`/condition/page-flow`, payload);
  return response.data;
};

export const publishForm = async (
  formId: string,
  settings: FormPublishSettings
): Promise<PublishResponse> => {
  const payload = {
    isPublic: settings.responderType === "Anyone",
    allowedEmails:
      settings.responderType === "Restricted" ? settings.allowedEmails : [],
    emailAccess:
      settings.responderType === "Restricted" ? settings.emailAccess : [],
    projectId: settings.projectId,
  };

  const response = await api.post(`/form/publish/${formId}`, payload);
  return response.data as PublishResponse;
};

export const getAllProjectsSummary = async () => {
  const response = await api.get("/project/summary");
  return response.data;
};

export const deleteById = async (id: string) => {
  const response = await api.delete(`/project/${id}`);
  return response.data;
};

interface FormUpdateResponse {
  success: boolean;
  message: string;
}

interface UpdateFormDetailsPayload {
  backgroundColor?: string;
  description?: string;
}

// Update form background color

// Update form description
export const updateFormDescription = async (
  formId: string,
  description: string
): Promise<FormUpdateResponse> => {
  const response = await api.put<FormUpdateResponse>(`/form/desc/${formId}`, {
    description,
  });
  return response.data;
};

// Update both background color and description (combined)
export const updateFormDetails = async (
  formId: string,
  updates: UpdateFormDetailsPayload
): Promise<FormUpdateResponse> => {
  const response = await api.put<FormUpdateResponse>(
    `/form/color/${formId}`,
    updates
  );
  return response.data;
};

export const getAllProjects = async () => {
  const response = await api.get("/project");
  return response.data;
};

// Type definitions for API response
interface ShareUrlResponse {
  success: boolean;
  data: {
    shareableLink: string;
  };
}
// API function to get share URL
// API function to get share URL
export const getFormShareUrl = async (
  formId: string
): Promise<ShareUrlResponse> => {
  const response = await api.get<ShareUrlResponse>(`/form/shareUrl/${formId}`);
  return response.data;
};
