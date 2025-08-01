import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

// Declare Google Identity Services types
declare global {
  interface Window {
    google: any;
  }
}

const PublicAccess: React.FC = () => {
  const { uniqueUrl } = useParams<{ uniqueUrl: string }>();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<any>(null);
  const [error, setError] = useState("");
  const [requiresBrowserLogin, setRequiresBrowserLogin] = useState(false);
  const [allowedEmails, setAllowedEmails] = useState<string[]>([]);
  const [verifyingEmail, setVerifyingEmail] = useState(false);

  useEffect(() => {
    // Load Google Identity Services
    const loadGoogleIdentity = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id:
            "952911097209-m1qkjrrf3k99nrpsn344quom1ohc06ta.apps.googleusercontent.com",
          callback: handleGoogleResponse,
        });
      }
    };

    // Load the script if not already loaded
    if (!window.google) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.onload = loadGoogleIdentity;
      document.head.appendChild(script);
    } else {
      loadGoogleIdentity();
    }

    if (uniqueUrl) {
      checkFormAccess();
    }
  }, [uniqueUrl]);

  const checkFormAccess = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/form/access/${uniqueUrl}`
      );
      console.log("response", response);
      const data = await response.json();
      console.log("data", data);
      if (data.success) {
        setForm(data.form);
        setError("");
      } else if (data.requiresBrowserLogin) {
        setRequiresBrowserLogin(true);
        setAllowedEmails(data.allowedEmails || []);
        setError(data.message);
        // Try to detect browser email automatically
        detectBrowserEmail();
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.log("err", err);
      setError("Failed to load form");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleResponse = async (response: any) => {
    try {
      // Decode the JWT token to get user info
      const payload = JSON.parse(atob(response.credential.split(".")[1]));
      const email = payload.email;

      if (email) {
        await verifyBrowserEmail(email);
      }
    } catch (error) {
      console.error("Failed to process Google response:", error);
      setError("Failed to get email from Google account");
    }
  };

  const detectBrowserEmail = async () => {
    // With new Google Identity Services, we trigger sign-in directly
    handleGoogleSignIn();
  };

  const verifyBrowserEmail = async (email: string) => {
    setVerifyingEmail(true);
    try {
      const response = await fetch(
        `/api/forms/verify-browser-email/${uniqueUrl}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Important for session
          body: JSON.stringify({ browserEmail: email }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Email verified, now load the form
        await checkFormAccess();
      } else {
        setError(`Access denied: ${data.message}`);
      }
    } catch (err) {
      setError("Failed to verify email access");
    } finally {
      setVerifyingEmail(false);
    }
  };

  const handleGoogleSignIn = () => {
    if (window.google) {
      window.google.accounts.id.prompt(); // Shows the One Tap dialog
    } else {
      setError("Google Identity Services not loaded. Please refresh the page.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading form...</div>
      </div>
    );
  }

  if (requiresBrowserLogin && !form) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white border border-gray-300 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Email Verification Required
        </h2>

        <p className="text-gray-600 mb-4">
          This form is restricted to specific email addresses. Please login with
          one of the authorized accounts:
        </p>

        {allowedEmails.length > 0 && (
          <div className="mb-4">
            <h3 className="font-medium text-gray-700 mb-2">
              Authorized emails:
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              {allowedEmails.map((email, index) => (
                <li key={index} className="bg-gray-100 px-2 py-1 rounded">
                  {email}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={verifyingEmail}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 mb-2"
        >
          {verifyingEmail ? "Verifying..." : "Sign in with Google"}
        </button>

        {/* Alternative: Show Google One Tap directly */}
        <div
          id="g_id_onload"
          data-client_id="952911097209-m1qkjrrf3k99nrpsn344quom1ohc06ta.apps.googleusercontent.com"
          data-callback="handleGoogleResponse"
        ></div>
        <div className="g_id_signin" data-type="standard"></div>

        {/* Temporary test button - remove in production */}
        <button
          onClick={() => verifyBrowserEmail("test@example.com")}
          className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 text-sm mt-2"
        >
          Test Access (Development Only)
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
      </div>
    );
  }

  if (error && !form) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white border border-red-300 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-red-800">
          Access Denied
        </h2>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (form) {
    return (
      <div className="max-w-4xl mx-auto mt-10 p-6 bg-white border border-gray-300 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">{form.title}</h1>

        {form.description && (
          <p className="text-gray-600 mb-6">{form.description}</p>
        )}

        <div className="mb-4 text-sm text-gray-500">
          Form ID: {form.id} | Access: {form.isPublic ? "Public" : "Restricted"}
        </div>

        {/* Render your form pages/components here */}
        <div className="space-y-6">
          {form.PageIds && form.PageIds.length > 0 ? (
            <div>
              <h3 className="text-lg font-medium mb-3">Form Pages:</h3>
              {form.PageIds.map((pageId: string, index: number) => (
                <div
                  key={pageId}
                  className="border border-gray-200 p-4 rounded mb-4"
                >
                  <p>
                    Page {index + 1}: {pageId}
                  </p>
                  {/* Replace with actual page component rendering */}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">
              No pages configured for this form
            </div>
          )}
        </div>

        {/* Form submission area */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <button className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600">
            Submit Form
          </button>
        </div>
      </div>
    );
  }

  return <div>Something went wrong</div>;
};

export default PublicAccess;
