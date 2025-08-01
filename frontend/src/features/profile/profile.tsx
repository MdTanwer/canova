import React, { useEffect, useState } from "react";
import "../../styles/profile/profile.css";
import api from "../../api/axios";
import { toast } from "react-toastify";

const Profile = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch current user info
    const fetchUser = async () => {
      try {
        const res = await api.get("/users/me");
        const user = (res.data as { user: { username: string; email: string } })
          .user;
        setUsername(user.username);
        setEmail(user.email);
      } catch {
        setError("Failed to load user info");
      }
    };
    fetchUser();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.patch("/users/me/username", { username });
      const user = (res.data as { user: { username: string } }).user;
      toast.success("Username updated successfully");
      setUsername(user.username);
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response &&
        err.response.data &&
        typeof err.response.data === "object" &&
        "message" in err.response.data
      ) {
        const msg =
          (err.response.data as { message?: string }).message ||
          "Failed to update username";
        setError(msg);
        toast.error(msg);
      } else {
        setError("Failed to update username");
        toast.error("Failed to update username");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <img
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face"
            alt="Profile"
            className="profile-avatar-image"
          />
        </div>
        <div className="profile-info">
          <h3 className="profile-name">Your name</h3>
          <p className="profile-email">yourname@gmail.com</p>
        </div>
      </div>

      <div className="profile-form">
        <form onSubmit={handleSave}>
          <div className="profile-field">
            <label className="profile-label">Name</label>
            <input
              type="text"
              className="profile-input"
              placeholder="your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <br />
          <div className="profile-field">
            <label className="profile-label">Email account</label>
            <input
              type="email"
              className="profile-input"
              placeholder="yourname@gmail.com"
              value={email}
              disabled
            />
          </div>

          {error && <div className="profile-error">{error}</div>}
          <div className="profile-actions">
            <button
              className="profile-btn profile-btn-primary"
              type="submit"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
