import React, { useState } from "react";
import ProfileSidebar from "../../features/profileSidebar/profileSidebar";
import "../../styles/PageFlow/PageFlow.css";
import { Navigate } from "react-router-dom";
import Profile from "../../features/profile/profile";
const ProfilePage = () => {
  const [activeItem, setActiveItem] = useState("myProfile");

  const handleItemClick = (item: string) => {
    setActiveItem(item);
  };

  if (activeItem === "logout") {
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
            {activeItem === "Settings" && <div> this is my settings</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
