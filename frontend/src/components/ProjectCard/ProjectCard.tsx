import React, { useState } from "react";
import "../../styles/ProjectCard/ProjectCard.css";
import type { Project } from "../../types/types";
import form from "../../assets/fe_editbigsvg.svg";
import file from "../../assets/filebig.svg";
import { deleteById } from "../../api/formBuilderApi";
import { toast } from "react-toastify";

interface ProjectCardProps {
  project: Project;
  onViewAnalysis: (projectId: string) => void;
  onMenuClick: (projectId: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onViewAnalysis,
  onMenuClick,
}) => {
  const getIcon = () => {
    if (project.type === "form") {
      return <img src={form} alt="file" />;
    }
    return <img src={file} alt="file" />;
  };
  const [tooltip, setTooltip] = useState(false);

  const handleDelete = async () => {
    try {
      const result = (await deleteById(project.id)) as any;
      if (result.success) {
        // Optional: Show success message
        toast.success(`${result.type} deleted successfully`);
        // Close tooltip
        setTooltip(false);
        // Optional: Refresh the projects list or remove from UI
        window.location.reload(); // Simple refresh - you might want to use a callback prop instead
      }
    } catch (error) {
      console.error("Failed to delete:", error);
      toast.error("Failed to delete. Please try again.");
    }
  };

  return (
    <div
      className="project-card"
      style={{ paddingBottom: "5px", position: "relative" }}
    >
      <h3 className="project-name">
        {project.type === "form" ? project.name : ""}
        {project.status === "draft" ? " (draft)" : ""}
      </h3>
      <div
        className="icon-container"
        style={{
          background: project.type === "project" ? "#69b5f8" : "",
          borderRadius: project.type === "project" ? "10px" : "", // Added default padding for non-project types
        }}
      >
        {" "}
        <div className="project-icon">{getIcon()}</div>
      </div>
      <div className="project-content-container">
        <button
          className="view-analysis-btn"
          onClick={() => onViewAnalysis(project.id)}
        >
          View Analysis
        </button>
        <button
          className="menu-btn"
          onClick={() => {
            setTooltip(!tooltip);
          }}
        >
          ⋮
        </button>
      </div>
      {tooltip && (
        <div
          style={{
            position: "absolute",
            left: "100%",
            top: "100%",
            transform: "translateX(-50%)", // to center horizontally

            paddingLeft: "20px",
            paddingRight: "20px",
            paddingTop: "5px",
            paddingBottom: "5px",
            background: "white",
            color: "#1F2937", // gray-800
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.5)",
            zIndex: "5000", // ✅ shadow
          }}
        >
          <div
            style={{
              color: "#1F2937",
              fontFamily: "inter",
              fontSize: "20px",
              cursor: "pointer",
              transition: "color 0.3s ease",
            }}
            onClick={() => {
              setResponderType("Anyone");
              setLinkModel(false);
            }}
          >
            Share
          </div>

          <div
            style={{
              paddingTop: "5px",
              color: "#1F2937",
              fontFamily: "inter",
              fontSize: "20px",
              cursor: "pointer",
            }}
            onClick={() => {
              setLinkModel(false);
              setResponderType("Restricted");
            }}
          >
            {" "}
            Rename
          </div>
          <div
            style={{
              paddingTop: "5px",
              color: "#1F2937",
              fontFamily: "inter",
              fontSize: "20px",
              cursor: "pointer",
            }}
            onClick={() => {
              setLinkModel(false);
              setResponderType("Restricted");
            }}
          >
            {" "}
            Copy
          </div>

          <div
            style={{
              paddingTop: "5px",
              color: "#1F2937",
              fontFamily: "inter",
              fontSize: "20px",
              cursor: "pointer",
            }}
            onClick={handleDelete}
          >
            {" "}
            Delete
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectCard;
