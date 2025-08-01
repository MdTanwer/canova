import React, { useState } from "react";
import "../../styles/sendotp.css";
import type { FormErrors } from "../../types/types";
import vector from "../../assets/Logo.svg";
import { useAuth } from "../../context/useAuth";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Verifyotp: React.FC = () => {
  const [formData, setFormData] = useState({
    otp: "",
  });
  const { verifyEmail } = useAuth();
  const [errors, setErrors] = useState<FormErrors>({});
  const navigate = useNavigate();

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
    if (!formData.otp.trim()) {
      newErrors.otp = "OTP is required";
    } else if (!/^\d{6}$/.test(formData.otp)) {
      newErrors.otp = "OTP must be a 6-digit number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;
    try {
      await verifyEmail(formData.otp);
      toast.success("OTP verified successfully!");
      navigate("/set-password");
    } catch (err: unknown) {
      let message = "OTP verification failed";
      if (err && typeof err === "object" && "response" in err) {
        // @ts-expect-error: response may exist on error
        message = err.response?.data?.message || message;
      }
      setErrors((prev) => ({ ...prev, otp: message }));
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
      <div className="otp-form-card">
        {/* Header */}
        <div className="otp-form-header">
          <h1 className="otp-form-title">Enter Your OTP</h1>
          <p className="otp-form-subtitle">
            We’ve sent a 6-digit OTP to your <br />
            registered mail. <br /> Please enter it below to sign in.
          </p>
        </div>

        {/* Form Fields */}
        <form className="otp-form-fields" onSubmit={handleSubmit}>
          {/* OTP Field */}
          <div className="otp-field-group">
            <label htmlFor="otp" className="otp-field-label">
              OTP
            </label>
            <input
              type="text"
              id="otp"
              name="otp"
              value={formData.otp}
              onChange={handleInputChange}
              className={`otp-form-input ${errors.otp ? "input-error" : ""}`}
              placeholder="Enter your OTP"
            />
            {errors.otp && <span className="error-message">{errors.otp}</span>}
          </div>

          {/* Confirm Button */}
          <button className="otp-submit-button" type="submit">
            Confirm
          </button>
        </form>
      </div>
    </div>
  );
};

export default Verifyotp;
