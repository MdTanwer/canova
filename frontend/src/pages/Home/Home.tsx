import React, { useState } from "react";
import Sidebar from "../../components/home/Sidebar";
import ProjectCard from "../../components/ProjectCard/ProjectCard";
import ActionCard from "../../components/ActionCard/ActionCard";
import type { Project } from "../../types/types";
import "../../styles/home/Dashboard.css";
import file from "../../assets/fe_edit.svg";
import form from "../../assets/fe_edit (1).svg";
import { createProjectWithForm } from "../../api/formBuilderApi";
import { createForm } from "../../api/formBuilderApi";
import { useNavigate } from "react-router-dom";

const Home: React.FC = () => {
  const [activeItem, setActiveItem] = useState("home");
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] =
    useState(false);
  const navigate = useNavigate();

  interface CreateProjectResponse {
    success: boolean;
    message: string;
    project: Record<string, unknown>;
    form: { _id: string };
  }

  interface CreateFormResponse {
    success: boolean;
    message: string;
    form: { _id: string };
  }

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
    setIsCreateProjectModalOpen(true);
  };

  const handleCreateForm = async () => {
    try {
      // You may want to prompt for a form name, or use a default
      const payload = { formName: "Untitled Form" };
      const result = (await createForm(payload)) as CreateFormResponse;
      if (result && result.form && result.form._id) {
        navigate(`/form-builder/${result.form._id}`);
      }
    } catch (error) {
      console.error("Failed to create form:", error);
      // Optionally, show error to user
    }
  };
  const handleCloseCreateProjectModal = () => {
    setIsCreateProjectModalOpen(false);
  };
  const handleCreateProject = async (projectName: string, formName: string) => {
    try {
      const result = (await createProjectWithForm({
        projectName,
        formName,
      })) as CreateProjectResponse;
      if (result && result.form && result.form._id) {
        navigate(`/form-builder/${result.form._id}`);
      }
      setIsCreateProjectModalOpen(false);
    } catch (error) {
      console.error("Failed to create project:", error);
    }
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
      {isCreateProjectModalOpen && (
        <CreateProjectModal
          isOpen={isCreateProjectModalOpen}
          onClose={handleCloseCreateProjectModal}
          onCreateProject={handleCreateProject}
        />
      )}
    </div>
  );
};

export default Home;
import cross from "../../assets/cross1.svg";
import logo from "../../assets/logo1.svg";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (projectName: string, formName: string) => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject,
}) => {
  const [projectName, setProjectName] = useState("");
  const [formName, setFormName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (projectName.trim() && formName.trim()) {
      onCreateProject(projectName.trim(), formName.trim());
      setProjectName("");
      setFormName("");
    }
  };

  const handleClose = () => {
    setProjectName("");
    setFormName("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="logo1">
              <img src={logo} alt="" />
            </div>
          </div>
          <button className="close-button" onClick={handleClose}>
            <img src={cross} alt="" />
          </button>
        </div>

        <div className="modal-body">
          <h2 className="project-modal-title">Create Project</h2>
          <h5 className="project-modal-subtitle">
            Provide your project a name and start with your journey
          </h5>

          <form onSubmit={handleSubmit} className="project-form">
            <div className="form-group">
              <label htmlFor="projectName" className="project-form-label">
                Project Name
              </label>
              <input
                type="text"
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Project Name"
                className="form-input"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label htmlFor="formName" className="project-form-label">
                Form Name
              </label>
              <input
                type="text"
                id="formName"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Form Name"
                className="form-input"
              />
            </div>

            <button
              type="submit"
              className="create-button"
              disabled={!projectName.trim() || !formName.trim()}
            >
              Create
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
