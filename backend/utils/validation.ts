// 4. utils/validation.ts (Input validation utilities)
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (
  password: string
): { isValid: boolean; message?: string } => {
  if (password.length < 8) {
    return {
      isValid: false,
      message: "Password must be at least 8 characters long",
    };
  }

  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return {
      isValid: false,
      message:
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    };
  }

  return { isValid: true };
};

export const validateUsername = (
  username: string
): { isValid: boolean; message?: string } => {
  if (username.length < 3 || username.length > 20) {
    return {
      isValid: false,
      message: "Username must be between 3 and 20 characters",
    };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return {
      isValid: false,
      message: "Username can only contain letters, numbers, and underscores",
    };
  }

  return { isValid: true };
};
