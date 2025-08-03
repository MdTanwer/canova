import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./publicAccess.css";
import PrivateAccess from "../privateAccessByEmail/privateAccessByEmail";

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
  const [hasAccess, setHasAccess] = useState(false);
  const { uniqueUrl } = useParams();

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
        // If form is public or doesn't require email, grant immediate access
        if (data.form.isPublic || !data.form.requiresEmail) {
          setHasAccess(true);
        }
      } else {
        setError(data.message || "Form not found");
      }
    } catch (err) {
      console.log(err);
      setError("Failed to load form");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: any) => {
    e.preventDefault();

    if (!email.trim()) {
      setEmailError("Please enter your email");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setEmailError("Please enter a valid email address");
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
        setHasAccess(true);
      } else {
        setEmailError(data.message || "Email verification failed");
      }
    } catch (err) {
      console.log(err);
      setEmailError("Failed to verify email. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="form-loading">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading form...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="form-error-container">
        <div className="error-card">
          <div className="error-content">
            <div className="error-icon-container">
              <svg
                className="error-icon"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="error-text-container">
              <h3 className="error-title">Error</h3>
              <p className="error-message">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No form found
  if (!form) {
    return (
      <div className="not-found-container">
        <div className="not-found-content">
          <h2 className="not-found-title">Form Not Found</h2>
          <p className="not-found-message">
            The requested form could not be found.
          </p>
        </div>
      </div>
    );
  }

  if (form.isPublic && hasAccess) {
    return <div>this is public rjheifhsdkhsj</div>;
  }

  // Form requires email verification and user doesn't have access yet
  if (form.requiresEmail && !hasAccess) {
    return (
      <div className="email-verification-container">
        <div className="form-header">
          <h2 className="form-title">{form.title}</h2>
          {form.description && (
            <p className="form-description">{form.description}</p>
          )}
        </div>

        <div className="warning-banner">
          <div className="warning-content">
            <svg
              className="warning-icon"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <p className="warning-text">
              This form requires email verification to access.
            </p>
          </div>
        </div>

        <form onSubmit={handleEmailSubmit} className="email-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError("");
              }}
              className={`form-input ${emailError ? "error" : ""}`}
              placeholder="Enter your email address"
              disabled={verifying}
            />
            {emailError && <p className="input-error">{emailError}</p>}
          </div>

          <button
            type="submit"
            disabled={verifying || !email.trim()}
            className={`submit-button ${
              verifying || !email.trim() ? "disabled" : "primary"
            }`}
          >
            {verifying ? (
              <div className="button-content">
                <div className="button-spinner"></div>
                Verifying...
              </div>
            ) : (
              "Verify Email"
            )}
          </button>
        </form>
      </div>
    );
  }

  // Form is restricted (private) and user doesn't have access

  if (hasAccess) {
    return (
      <div>
        <PrivateAccess id={form.id} title={form.title} />
      </div>
    );
  }
  // U
  // ser has access - show the actual form
};

export default FormAccess;
