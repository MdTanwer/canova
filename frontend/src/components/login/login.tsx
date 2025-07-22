import React, { useState } from "react";
import "../../styles/login.css";
import { useAuth } from "../../context/useAuth";
import vector from "../../assets/Logo.svg";

const Login: React.FC = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [apiError, setApiError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setApiError(null);
  };

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;
    try {
      await login(formData.email, formData.password);
      // Redirect to home or dashboard if needed
    } catch (err: any) {
      setApiError(err.response?.data?.message || "Login failed");
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
            Today is a new day. It's your day. You shape it.
            <br />
            Sign in to start managing your projects
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
                onChange={handleInputChange}
                placeholder="Enter your password"
                className={`form-input password-input ${
                  errors.password ? "input-error" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="password-toggle"
                aria-label="Toggle password visibility"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>
          {/* Error Message */}
          {apiError && <div className="error-message">{apiError}</div>}
          {/* Login Button */}
          <button className="submit-button" type="submit">
            Login
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
