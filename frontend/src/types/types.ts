export interface FormData {
  name: string;
  email: string;
  createPassword: string;
  confirmPassword: string;
}

export interface FormErrors {
  name?: string;
  email?: string;
  createPassword?: string;
  confirmPassword?: string;
}
