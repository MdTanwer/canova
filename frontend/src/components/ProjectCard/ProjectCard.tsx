import React from "react";
import "../../styles/ProjectCard/ProjectCard.css";
import type { Project } from "../../types/types";
import form from "../../assets/fe_editbigsvg.svg";
import file from "../../assets/filebig.svg";

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

  return (
    <div className="project-card">
      <h3 className="project-name">{project.name}</h3>
      <div className="icon-container">
        {" "}
        <div className="project-icon">{getIcon()}</div>
      </div>
      <div className="project-content">
        <button
          className="view-analysis-btn"
          onClick={() => onViewAnalysis(project.id)}
        >
          View Analysis
        </button>
      </div>
      <button className="menu-btn" onClick={() => onMenuClick(project.id)}>
        ⋮
      </button>
    </div>
  );
};

export default ProjectCard;
