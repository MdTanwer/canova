import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/formBuilder/NavigationSidebar.css";
import vector from "../../assets/Logo.svg";
import avatar from "../../assets/Layer 2.svg";
import add from "../../assets/Home (1).svg";

interface SidebarProps {
  activeItem: string;
  onItemClick: (item: string) => void;
}

const NavigationSidebar: React.FC<SidebarProps> = ({
  activeItem,
  onItemClick,
}) => {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([
    { id: "page1", label: "Page 01" },
    { id: "page2", label: "Page 02" },
    { id: "page3", label: "Page 03" },
  ]);

  const addNewPage = () => {
    const newPageNumber = menuItems.length + 1;
    const newPageId = `page${newPageNumber}`;
    const newPageLabel = `Page ${newPageNumber.toString().padStart(2, "0")}`;

    const newPage = {
      id: newPageId,
      label: newPageLabel,
    };

    setMenuItems([...menuItems, newPage]);
    // Automatically select the new page
    onItemClick(newPageId);
  };

  return (
    <div className="form-sidebar">
      <div className="form-sidebar-header">
        <img className=" form-home-logo" src={vector} alt="Logo" />
        <span className="form-sidebar-title">CANOVA</span>
      </div>

      <nav className="form-sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`form-sidebar-item ${
              activeItem === item.id ? "active" : ""
            }`}
            onClick={() => {
              onItemClick(item.id);
            }}
          >
            <span className="form-sidebar-label">{item.label}</span>
          </button>
        ))}

        <button className="form-sidebar-add-page" onClick={addNewPage}>
          <span className="form-add-icon">
            <img src={add} alt="" />
          </span>
          <span className="form-add-text">Add new Page</span>
        </button>
      </nav>

      <div className="form-sidebar-footer">
        <div
          className="form-profile-section"
          onClick={() => navigate("/profile")}
        >
          <img src={avatar} alt="avater" className="form-sidebar-icon" />

          <span className="form-profile-text">Profile</span>
        </div>
      </div>
    </div>
  );
};

export default NavigationSidebar;
