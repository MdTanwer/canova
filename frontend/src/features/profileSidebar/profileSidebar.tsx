import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/home/Sidebar.css";
import vector from "../../assets/Logo.svg";
import home from "../../assets/home.svg";
import anaylytics from "../../assets/project.svg";

interface SidebarProps {
  activeItem: string;
  onItemClick: (item: string) => void;
}

const ProfileSidebar: React.FC<SidebarProps> = ({
  activeItem,
  onItemClick,
}) => {
  const navigate = useNavigate();
  const menuItems = [
    { id: "myProfile", label: "My Profile", icon: home, path: "/profile" },

    {
      id: "Settings",
      label: "Settings",
      icon: anaylytics,
      path: "/profile-settings",
    },
    { id: "logout", label: "Logout", icon: anaylytics, path: "" },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <img className="home-logo" src={vector} alt="Logo" />
        <span className="sidebar-title">CANOVA</span>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-item ${activeItem === item.id ? "active" : ""}`}
            onClick={() => {
              onItemClick(item.id);
              navigate(item.path);
            }}
          >
            <img src={item.icon} alt={item.label} className="sidebar-icon" />
            <span className="sidebar-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default ProfileSidebar;
