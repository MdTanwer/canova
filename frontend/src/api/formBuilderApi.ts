import api from "./axios";

export interface CreateProjectPayload {
  formName: string;
  projectName: string;
}

export interface CreateFormPayload {
  formName: string;
}

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
