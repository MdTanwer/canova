import React from "react";
import "../../styles/home/Sidebar.css";
import vector from "../../assets/Logo.svg";
import home from "../../assets/home.svg";
import anaylytics from "../../assets/project.svg";
import project from "../../assets/Group.svg";
import avatar from "../../assets/Layer 2.svg";

interface SidebarProps {
  activeItem: string;
  onItemClick: (item: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeItem, onItemClick }) => {
  const menuItems = [
    { id: "home", label: "Home", icon: home },
    { id: "analysis", label: "Analysis", icon: anaylytics },
    { id: "projects", label: "Projects", icon: project },
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
            onClick={() => onItemClick(item.id)}
          >
            <img src={item.icon} alt={item.label} className="sidebar-icon" />
            <span className="sidebar-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="profile-section">
          <img src={avatar} alt="avater" className="sidebar-icon" />

          <span className="profile-text">Profile</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
