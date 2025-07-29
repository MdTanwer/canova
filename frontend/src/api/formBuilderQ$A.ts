import type { Question } from "../types/types";
import api from "./axios";

// API response type for getQuestionsByPage
export interface GetQuestionsByPageResponse {
  success: boolean;
  data: Question[];
}

// Create question
export const createQuestion = async (questionData: Question) => {
  const response = await api.post("/question", questionData);
  return response.data;
};

// Get questions by page
export const getQuestionsByPage = async (
  pageId: string
): Promise<GetQuestionsByPageResponse> => {
  const response = await api.get(`question/${pageId}`);
  return response.data as GetQuestionsByPageResponse;
};

// Update question
export const updateQuestion = async (
  questionId: string,
  updateData: Question
) => {
  const response = await api.put(`/question/${questionId}`, updateData);
  return response.data;
};

// Delete question
export const deleteQuestion1 = async (questionId: string) => {
  console.log(questionId);
  const response = await api.delete(`/question/${questionId}`);
  return response.data;
};
