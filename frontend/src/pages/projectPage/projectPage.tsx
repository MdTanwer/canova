import React, { useState } from "react";
import Sidebar from "../../components/home/Sidebar";
import ProjectCard from "../../components/ProjectCard/ProjectCard";
import ActionCard from "../../components/ActionCard/ActionCard";
import type { Project } from "../../types/types";
import "../../styles/home/Dashboard.css";
import file from "../../assets/fe_edit.svg";
import form from "../../assets/fe_edit (1).svg";

const ProjectPage: React.FC = () => {
  const [activeItem, setActiveItem] = useState("projects");

  // Mock data - replace with your actual data source
  const recentProjects: Project[] = [
    { id: "1", name: "Form Name (Draft)", type: "form" },
    { id: "2", name: "Form Name", type: "form" },
    { id: "3", name: "Project Name", type: "project" },
  ];

  const sharedProjects: Project[] = [
    { id: "4", name: "Form Name", type: "form", isShared: true },
    { id: "5", name: "Project Name", type: "project", isShared: true },
  ];

  const handleItemClick = (item: string) => {
    setActiveItem(item);
  };

  const handleViewAnalysis = (projectId: string) => {
    console.log("View analysis for project:", projectId);
    // Implement navigation to analysis view
  };

  const handleMenuClick = (projectId: string) => {
    console.log("Menu clicked for project:", projectId);
    // Implement menu actions
  };

  const handleStartFromScratch = () => {
    console.log("Start from scratch");
    // Implement create new project flow
  };

  const handleCreateForm = () => {
    console.log("Create form");
    // Implement create form flow
  };

  return (
    <div className="dashboard">
      <Sidebar activeItem={activeItem} onItemClick={handleItemClick} />
      <main className="main-content">
        <header className="header-container">
          <div className="page-header">
            <h1 className="page-title">Welcome to CANOVA</h1>
          </div>
        </header>
        <div className="content-wrapper">
          {/* Action Cards */}
          <div className="actions-section">
            <div className="actions-grid">
              <ActionCard
                title="Start from scratch"
                subtitle="Create your first Project now"
                icon={file}
                onClick={handleStartFromScratch}
              />
              <ActionCard
                title="Create Form"
                subtitle="Create your first Form now"
                icon={form}
                onClick={handleCreateForm}
              />
            </div>
          </div>

          {/* Recent Works */}
          <section className="projects-section">
            <h2 className="section-title">Recent Works</h2>
            <div className="projects-grid">
              {recentProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onViewAnalysis={handleViewAnalysis}
                  onMenuClick={handleMenuClick}
                />
              ))}
            </div>
          </section>

          {/* Shared Works */}
          <section className="projects-section">
            <h2 className="section-title">Shared Works</h2>
            <div className="projects-grid">
              {sharedProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onViewAnalysis={handleViewAnalysis}
                  onMenuClick={handleMenuClick}
                />
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default ProjectPage;
