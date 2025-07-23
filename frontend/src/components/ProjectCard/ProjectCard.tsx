import React from "react";
import "../../styles/ProjectCard/ProjectCard.css";
import type { Project } from "../../types/types";

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
      return "📝";
    }
    return "📁";
  };

  return (
    <div className="project-card">
      <div className="project-icon">{getIcon()}</div>

      <div className="project-content">
        <h3 className="project-name">{project.name}</h3>

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
