import React, { useState } from "react";
import SetPassword from "../../components/forgotpassord/setPassword";
import { useAuth } from "../../context/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const SetPasswordPage = () => {
  const { setPassword } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setApiError(null);
  };

  const validateForm = (): boolean => {
    const newErrors: { password?: string; confirmPassword?: string } = {};
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      await setPassword(formData.password);
      toast.success("Password set successfully! Please login.");
      navigate("/login");
    } catch (err: unknown) {
      let message = "Failed to set password";
      if (err && typeof err === "object" && "response" in err) {
        // @ts-expect-error: response may exist on error
        message = err.response?.data?.message || message;
      }
      setApiError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePassword = () => setShowPassword((v) => !v);

  return (
    <SetPassword
      formData={formData}
      errors={errors}
      apiError={apiError}
      showPassword={showPassword}
      onInputChange={handleInputChange}
      onSubmit={handleSubmit}
      onTogglePassword={handleTogglePassword}
      loading={loading}
    />
  );
};

export default SetPasswordPage;
