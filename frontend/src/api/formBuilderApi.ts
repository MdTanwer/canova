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
  const response = await api.get(`/form/${formId}`);
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

// export const publishForm = async (formId: string) => {
//   const payload = {};
//   const response = await api.post(`/publish/$formId`, payload);
//   return response.data;
// };

export const publishForm = async (
  formId: string,
  settings: FormPublishSettings
): Promise<PublishResponse> => {
  const payload = {
    isPublic: settings.responderType === "Anyone",
    allowedEmails:
      settings.responderType === "Restricted" ? settings.allowedEmails : [],
  };

  const response = await api.post(`/form/publish/${formId}`, payload);
  return response.data as PublishResponse;
};
