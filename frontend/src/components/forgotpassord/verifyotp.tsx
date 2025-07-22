import React, { useState } from "react";
import "../../styles/sendotp.css";
import type { FormErrors } from "../../types/types";
import vector from "../../assets/Logo.svg";

const Verifyotp: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
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

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
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
            We’ve sent a 6-digit OTP to your <br />
            registered mail. <br /> Please enter it below to sign in.
          </p>
        </div>

        {/* Form Fields */}
        <div className="form-fields">
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

export default Verifyotp;
