import React from "react";
import "../../styles/login.css";
import vector from "../../assets/Logo.svg";
import { IoMdEye } from "react-icons/io";
import { FaEyeSlash } from "react-icons/fa6";
import { Link } from "react-router-dom";

interface LoginProps {
  formData: { email: string; password: string };
  errors: { email?: string; password?: string };
  apiError: string | null;
  showPassword: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e?: React.FormEvent) => void;
  onTogglePassword: () => void;
  loading: boolean;
}

const Login: React.FC<LoginProps> = ({
  formData,
  errors,
  apiError,
  showPassword,
  onInputChange,
  onSubmit,
  onTogglePassword,
  loading,
}) => {
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
        <form className="form-fields" onSubmit={onSubmit}>
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
              onChange={onInputChange}
              className={`form-input ${errors.email ? "input-error" : ""}`}
              placeholder="Enter your email"
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>
          {/* Password Field */}
          <div className="field-group">
            <label htmlFor="password" className="field-label">
              Password
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={onInputChange}
                placeholder="Enter your password"
                className={`form-input password-input ${
                  errors.password ? "input-error" : ""
                }`}
              />
              <button
                type="button"
                onClick={onTogglePassword}
                className="password-toggle"
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <FaEyeSlash size={20} />
                ) : (
                  <IoMdEye size={20} />
                )}
              </button>
            </div>
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          {/* Error Message */}
          {apiError && <div className="error-message">{apiError}</div>}

          <div className="forgot-pass">
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>
          {/* Login Button */}
          <button className="submit-button" type="submit" disabled={loading}>
            {loading ? <span className="spinner">Loading...</span> : "Sign In"}
          </button>
        </form>
        {/* Footer */}
        <div className="form-footer">
          <p className="footer-text">
            Don't have an account?{" "}
            <a href="/siginup" className="signin-link">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
