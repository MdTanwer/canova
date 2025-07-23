import React, { useState } from "react";
import "../../styles/sendotp.css";
import type { FormErrors } from "../../types/types";
import vector from "../../assets/Logo.svg";
import { useAuth } from "../../context/useAuth";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Sendotp: React.FC = () => {
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setApiError(null);
    setSuccess(null);
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;
    try {
      await forgotPassword(formData.email);
      setSuccess("OTP sent to your email.");
      toast.success("OTP sent to your email.");
      navigate("/verify-otp");
    } catch (err: unknown) {
      let message = "Failed to send OTP";
      if (err && typeof err === "object" && "response" in err) {
        // @ts-expect-error: response may exist on error
        message = err.response?.data?.message || message;
      }
      setApiError(message);
      toast.error(message);
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
            Please enter your registered email ID <br /> to receive an OTP
          </p>
        </div>
        {/* Form Fields */}
        <form className="form-fields" onSubmit={handleSubmit}>
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
          {/* Error/Success Message */}
          {apiError && <div className="error-message">{apiError}</div>}
          {success && <div className="success-message">{success}</div>}
          {/* Send OTP Button */}
          <button className="submit-button" type="submit">
            Send OTP
          </button>
        </form>
      </div>
    </div>
  );
};

export default Sendotp;
