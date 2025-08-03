export interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  otp?: string;
}

export interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  otp?: string;
}

export interface Project {
  id: string;
  name: string;
  type?: "form" | "project";
  isShared?: boolean;
  status?: string;
}

export interface Page {
  _id: string;
  title: string;
}

export interface Question {
  _id?: string; // Backend MongoDB ID
  id?: string; // Frontend temporary ID
  formId?: string;
  pageId?: string;
  type:
    | "short"
    | "long"
    | "multiple-choice"
    | "time"
    | "rating"
    | "checkbox"
    | "dropdowns"
    | "date"
    | "LinearScale"
    | "upload";
  question: string;
  order?: number;
  required?: boolean;

  // Type-specific fields
  options?: string[];
  placeholder?: string;
  maxLength?: number;
  minLength?: number;
  starCount?: number;
  selectedRating?: number;
  // For UI only
  scaleStartLabel?: string;
  scaleEndLabel?: string;
  scaleMin?: number;
  scaleMax?: number;
  scaleValue?: number; // For UI only
  maxFiles?: number;
  selectedScale?: number;
  dateAnswer?: Date | string;
  maxFileSizeMb?: number;
  allowedTypes?: string[];
  correctAnswer?: number;
  correctAnswers?: number[];
  referenceUrl: string;

  // Reference media
  referenceMedia?: {
    type: "image" | "video";
    url: string;
    description: string;
    fileName?: string;
  };
}

export interface ConditionRule {
  questionId: string; // Just use string for IDs on frontend
  adminAnswer: string;
}

export interface Condition {
  formId: string;
  pageId: string;
  questionIds: string[]; // Array of question ID strings
  rules: ConditionRule[];
  sourcePage: string;
  trueDestinationPage: string;
  falseDestinationPage?: string;
  logicOperator: "AND";
}

export interface PageFlowData {
  hasConditions: boolean;
  trueSequence?: Array<{
    pageId: string;
    pageName: string;
    pageOrder: number;
  }>;
  falseSequence?: Array<{
    pageId: string;
    pageName: string;
    pageOrder: number;
  }>;
  conditionsCount?: number;
  message?: string;
}

// export interface FormPublishSettings {
//   isPublic: boolean;
//   allowedEmails: string[];
//   responderType: "Anyone" | "Restricted";
// }

export interface UploadResponse {
  success: boolean;
  media: {
    _id: string;
    mediaType: "image" | "video";
    file: {
      public_id: string;
      url: string;
    };
    createdAt: string;
    updatedAt: string;
    __v?: number;
  };
}
export interface UploadPayload {
  file: File; // HTML File object (from input)
  mediaType: "image" | "video"; // optional, default is image
}

// Updated types for enhanced access control
export enum AccessPermission {
  VIEW = "view",
  EDIT = "edit",
  DELETE = "delete",
}

export interface EmailAccess {
  email: string;
  permissions: AccessPermission[];
}

export interface FormPublishSettings {
  isPublic: boolean;
  allowedEmails: string[]; // For backward compatibility
  emailAccess: EmailAccess[]; // New granular access control
  responderType: "Anyone" | "Restricted";
  projectId?: string; // Optional project ID
}

export interface PublishResponse {
  success: boolean;
  message: string;
  data: {
    formId: string;
    uniqueUrl: string;
    shareUrl: string;
    isPublic: boolean;
    projectId?: string;
    status: string;
    publishedAt: string;
    accessControl: {
      isPublic: boolean;
      emailAccess: EmailAccess[];
      allowedEmails: string[];
    };
  };
}

export interface GetAllProjectsResponse {
  success: boolean;
  message: string;
  count: number;
  projects: Project[];
}
