import api from "./axios";

export interface CreateProjectPayload {
  formName: string;
  projectName: string;
}

export const createProjectWithForm = async (payload: CreateProjectPayload) => {
  const response = await api.post("/project", payload);
  return response.data;
};
