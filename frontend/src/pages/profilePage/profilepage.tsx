import { useState } from "react";
import ProfileSidebar from "../../features/profileSidebar/profileSidebar";
import "../../styles/PageFlow/PageFlow.css";
import { Navigate } from "react-router-dom";
import Profile from "../../features/profile/profile";
import Settings from "../../features/settings/settings";
import api from "../../api/axios";
import { toast } from "react-toastify";
const ProfilePage = () => {
  const [activeItem, setActiveItem] = useState("myProfile");
  const [loggedOut, setLoggedOut] = useState(false);

  const handleItemClick = (item: string) => {
    if (item === "logout") {
      api
        .post("/users/logout")
        .then(() => {
          toast.success("Logged out successfully");
          setLoggedOut(true);
        })
        .catch(() => {
          toast.error("Logout failed");
          setLoggedOut(true); // Still navigate to login
        });
    } else {
      setActiveItem(item);
    }
  };

  if (activeItem === "logout" || loggedOut) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <ProfileSidebar activeItem={activeItem} onItemClick={handleItemClick} />
      <div
        style={{
          border: "2px solid #696969",
          marginLeft: "240px",
          minHeight: "100vh",
          borderRadius: "20px",
          backgroundColor: "#fff",
        }}
      >
        <div
          style={{
            borderBottom: "2px solid #696969",
            fontFamily: "Inter, sans-serif",
            fontWeight: 400,
            fontSize: "20px",
            padding: "16px 0",
          }}
        >
          <h1 style={{ marginLeft: "40px", margin: "0 0 0 40px" }}>
            My Profile
          </h1>
        </div>

        <div className="page-flow-content">
          <div className="current-page-info">
            {activeItem === "myProfile" && <Profile />}
            {activeItem === "Settings" && <Settings />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
