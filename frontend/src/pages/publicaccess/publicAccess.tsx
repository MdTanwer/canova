import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

interface FormData {
  id: string;
  title: string;
  description: string;
  PageIds: string[];
  isPublic: boolean;
  requiresEmail: boolean;
}

const FormAccess = () => {
  const [form, setForm] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const { uniqueUrl } = useParams();
  console.log(form);

  // Fetch form data on component mount
  useEffect(() => {
    fetchForm();
  }, [uniqueUrl]);

  const fetchForm = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:3000/api/form/access/${uniqueUrl}`
      );
      const data = await response.json();

      if (data.success) {
        setForm(data.form);
      } else {
        setError(data.message || "Form not found");
      }
    } catch (err: any) {
      console.log(err);
      setError("Failed to load form");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setEmailError("Please enter your email");
      return;
    }

    setVerifying(true);
    setEmailError("");

    try {
      const response = await fetch(
        `http://localhost:3000/api/form/verify-browser-email/${uniqueUrl}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: email.trim() }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Update form data with full access
        setForm(data.form);
      } else {
        setEmailError(data.message || "Email verification failed");
      }
    } catch (err) {
      console.log(err);
      setEmailError("Failed to verify email");
    } finally {
      setVerifying(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-lg text-gray-600">Loading form...</div>
      </div>
    );
  }

  // Email verification required
  if (error == "email required") {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email address"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleEmailSubmit(e);
                }
              }}
            />
            {emailError && (
              <p className="mt-2 text-sm text-red-600">{emailError}</p>
            )}
          </div>

          <button
            onClick={handleEmailSubmit}
            disabled={verifying}
            className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {verifying ? "Verifying..." : "Verify Email"}
          </button>
        </div>
      </div>
    );
  }

  // Form accessible - show form content
  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-3"></h1>
        <p className="text-gray-600 text-lg">e</p>
        this is publick
      </div>

      {/* Render your form pages here */}
      <div className="space-y-6">
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">Form content goes here...</p>
          <p className="text-sm text-gray-500 mt-2">orijf;i</p>
        </div>
      </div>
    </div>
  );
};

export default FormAccess;
