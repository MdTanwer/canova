import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/formBuilder/NavigationSidebar.css";
import vector from "../../assets/Logo.svg";
import avatar from "../../assets/Layer 2.svg";
import add from "../../assets/Home (1).svg";

interface SidebarProps {
  activeItem: string;
  onItemClick: (item: string) => void;
  pages: { _id: string; title: string }[];
  createNextPage: () => void;
}

const NavigationSidebar: React.FC<SidebarProps> = ({
  activeItem,
  onItemClick,
  pages,
  createNextPage,
}) => {
  const navigate = useNavigate();

  return (
    <div className="form-sidebar">
      <div className="form-sidebar-header">
        <img className=" form-home-logo" src={vector} alt="Logo" />
        <span className="form-sidebar-title">CANOVA</span>
      </div>

      <nav className="form-sidebar-nav">
        {pages.map((page) => (
          <button
            key={page._id}
            className={`form-sidebar-item ${
              activeItem === page._id ? "active" : ""
            }`}
            onClick={() => {
              onItemClick(page._id);
            }}
          >
            <span className="form-sidebar-label">{page.title}</span>
          </button>
        ))}

        {/* <button className="form-sidebar-add-page" onClick={addNewPage}>
          <span className="form-add-icon">
            <img src={add} alt="" />
          </span>
          <span className="form-add-text">Add new Page</span>
        </button> */}
        <button className="form-sidebar-add-page" onClick={createNextPage}>
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
