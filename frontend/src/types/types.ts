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
