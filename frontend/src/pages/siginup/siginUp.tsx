import React, { useState } from "react";
import "./siginUp.css";
import type { FormData, FormErrors } from "../../types/types";
import vector from "../../assets/Logo.svg";

const SignUp: React.FC = () => {
  const [showCreatePassword, setShowCreatePassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    createPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.createPassword) {
      newErrors.createPassword = "Password is required";
    } else if (formData.createPassword.length < 8) {
      newErrors.createPassword = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.createPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (): void => {
    if (validateForm()) {
      console.log("Form submitted:", formData);
      // Add your API call here
    }
  };

  const togglePasswordVisibility = (field: "create" | "confirm"): void => {
    if (field === "create") {
      setShowCreatePassword(!showCreatePassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  const EyeIcon: React.FC<{ isVisible: boolean }> = ({ isVisible }) => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {isVisible ? (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </>
      ) : (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );

  return (
    <div className="signup-container">
      {/* Logo */}
      <div className="logo-container">
        <div className="logo-wrapper">
          <img src={vector} alt="Logo" />
          <span className="logo-text">CANOVA</span>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="form-card">
        {/* Header */}
        <div className="form-header">
          <h1 className="form-title">Welcome CANOVA 👋</h1>
          <p className="form-subtitle">
            Today is a new day. It's your day. You shape it.
            <br />
            Sign in to start managing your projects
          </p>
        </div>

        {/* Form Fields */}
        <div className="form-fields">
          {/* Name Field */}
          <div className="field-group">
            <label htmlFor="name" className="field-label">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`form-input ${errors.name ? "input-error" : ""}`}
              placeholder="Enter your name"
            />
            {errors.name && (
              <span className="error-message">{errors.name}</span>
            )}
          </div>

          {/* Email Field */}
          <div className="field-group">
            <label htmlFor="email" className="field-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`form-input ${errors.email ? "input-error" : ""}`}
              placeholder="Enter your email"
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          {/* Create Password Field */}
          <div className="field-group">
            <label htmlFor="createPassword" className="field-label">
              Create Password
            </label>
            <div className="password-input-wrapper">
              <input
                type={showCreatePassword ? "text" : "password"}
                id="createPassword"
                name="createPassword"
                value={formData.createPassword}
                onChange={handleInputChange}
                placeholder="At least 8 characters"
                className={`form-input password-input ${
                  errors.createPassword ? "input-error" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("create")}
                className="password-toggle"
                aria-label="Toggle password visibility"
              >
                <EyeIcon isVisible={showCreatePassword} />
              </button>
            </div>
            {errors.createPassword && (
              <span className="error-message">{errors.createPassword}</span>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="field-group">
            <label htmlFor="confirmPassword" className="field-label">
              Confirm Password
            </label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="At least 8 characters"
                className={`form-input password-input ${
                  errors.confirmPassword ? "input-error" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("confirm")}
                className="password-toggle"
                aria-label="Toggle password visibility"
              >
                <EyeIcon isVisible={showConfirmPassword} />
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="error-message">{errors.confirmPassword}</span>
            )}
          </div>

          {/* Sign Up Button */}
          <button
            onClick={handleSubmit}
            className="submit-button"
            type="button"
          >
            Sign up
          </button>
        </div>

        {/* Footer */}
        <div className="form-footer">
          <p className="footer-text">
            Do you have an account?{" "}
            <a href="/signin" className="signin-link">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
