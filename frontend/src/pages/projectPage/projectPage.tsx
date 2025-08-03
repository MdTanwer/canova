import React, { useState } from "react";
import Sidebar from "../../components/home/Sidebar";
import ProjectCard from "../../components/ProjectCard/ProjectCard";
import EditprojectModel from "../../components/ProjectCard/editProject";
import "../../styles/home/Dashboard.css";
// import { useNavigate } from "react-router-dom";
import { getAllProjectsSummary } from "../../api/formBuilderApi";
import { useEffect } from "react";

const Home: React.FC = () => {
  const [activeItem, setActiveItem] = useState("projects");

  // const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for project editing modal
  const [editProjectModalOpen, setEditProjectModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string>("");
  const [editingProjectName, setEditingProjectName] = useState<string>("");

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const response = (await getAllProjectsSummary()) as {
          data: ProjectSummary[];
        };
        setProjects(response.data || []);
      } catch (error) {
        console.error("Failed to fetch projects summary:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  interface ProjectSummary {
    id: string;
    name: string;
    type?: string;
    status?: string;
    forms?: { id: string; name: string }[];
    isShared: boolean;
  }

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

  // Handlers for project editing modal
  const handleOpenEditProjectModal = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setEditingProjectId(projectId);
      setEditingProjectName(project.name);
      setEditProjectModalOpen(true);
    }
  };

  const handleCloseEditProjectModal = () => {
    setEditProjectModalOpen(false);
    setEditingProjectId("");
    setEditingProjectName("");
  };

  const handleProjectNameUpdated = (newName: string) => {
    setProjects(prevProjects => 
      prevProjects.map(project => 
        project.id === editingProjectId 
          ? { ...project, name: newName }
          : project
      )
    );
    handleCloseEditProjectModal();
  };

  // Filter projects to show only type "project"
  const projectTypeItems = projects.filter(
    (project) => project.type === "project"
  );
  const sharedProjectTypeItems = projectTypeItems.filter(
    (project) => project.isShared === true
  );

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

          {/* Projects from API - Only type "project" */}
          <section className="projects-section">
            <h2 className="section-title">Recent Work</h2>
            {loading ? (
              <div>Loading...</div>
            ) : (
              <div className="projects-grid">
                {projectTypeItems.length === 0 && <div>No projects found.</div>}
                {projectTypeItems.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={{
                      id: project.id,
                      name: project.name,
                      status: project.status,
                      type: "project",
                    }}
                    onViewAnalysis={handleViewAnalysis}
                    onMenuClick={handleMenuClick}
                    setProjectName={setEditProjectModalOpen}
                    setProjectId={handleOpenEditProjectModal}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Shared Projects - Only type "project" */}
          <section className="projects-section">
            <h2 className="section-title">Shared</h2>
            {loading ? (
              <div>Loading...</div>
            ) : (
              <div className="projects-grid">
                {sharedProjectTypeItems.length === 0 && (
                  <div>No shared projects.</div>
                )}
                {sharedProjectTypeItems.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={{
                      id: project.id,
                      name: project.name,
                      type: "project",
                      status: project.status,
                      isShared: project.isShared,
                    }}
                    onViewAnalysis={handleViewAnalysis}
                    onMenuClick={handleMenuClick}
                    setProjectName={setEditProjectModalOpen}
                    setProjectId={handleOpenEditProjectModal}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      
      {/* Edit Project Modal */}
      <EditprojectModel
        isOpen={editProjectModalOpen}
        onClose={handleCloseEditProjectModal}
        projectId={editingProjectId}
        currentProjectName={editingProjectName}
        onProjectNameUpdated={handleProjectNameUpdated}
      />
    </div>
  );
};

export default Home;
