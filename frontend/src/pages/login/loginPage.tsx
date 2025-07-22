import React, { useState } from "react";
import Login from "../../components/login/login";
import { useAuth } from "../../context/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
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
      toast.success("Login successful!");
      navigate("/");
    } catch (err: unknown) {
      let message = "Login failed";
      if (err && typeof err === "object" && "response" in err) {
        // @ts-expect-error: response may exist on error
        message = err.response?.data?.message || message;
      }
      setApiError(message);
      toast.error(message);
    }
  };

  const handleTogglePassword = () => setShowPassword((v) => !v);

  return (
    <Login
      formData={formData}
      errors={errors}
      apiError={apiError}
      showPassword={showPassword}
      onInputChange={handleInputChange}
      onSubmit={handleSubmit}
      onTogglePassword={handleTogglePassword}
    />
  );
};

export default LoginPage;
