import React, { useState } from "react";
import ProfileSidebar from "../profileSidebar/profileSidebar";

const Profile: React.FC = () => {
  const [activeItem, setActiveItem] = useState("myProfiles");

  const handleItemClick = (item: string) => {
    setActiveItem(item);
  };

  return (
    <div className="dashboard">
      <ProfileSidebar activeItem={activeItem} onItemClick={handleItemClick} />
      <main className="main-content">
        <header className="header-container">
          <div className="page-header">
            <h1 className="page-title">Welcome to CANOVA</h1>
          </div>
        </header>

        <div>ej</div>
      </main>
    </div>
  );
};

export default Profile;
