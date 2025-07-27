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
  type: "form" | "project";
  isShared?: boolean;
}

export interface Page {
  _id: string;
  title: string;
}
