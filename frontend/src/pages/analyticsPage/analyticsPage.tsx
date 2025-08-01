import React, { useState } from "react";
import Sidebar from "../../components/home/Sidebar";
import ProjectCard from "../../components/ProjectCard/ProjectCard";
import "../../styles/home/Dashboard.css";
// import { useNavigate } from "react-router-dom";
import { getAllProjectsSummary } from "../../api/formBuilderApi";
import { useEffect } from "react";

const Home: React.FC = () => {
  const [activeItem, setActiveItem] = useState("analysis");

  // const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);

  console.log("projects", projects);

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

          {/* Projects from API */}
          <section className="projects-section">
            <h2 className="section-title">Resent Work</h2>
            {loading ? (
              <div>Loading...</div>
            ) : (
              <div className="projects-grid">
                {projects.length === 0 && <div>No projects found.</div>}
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={{
                      id: project.id,
                      name: project.name,
                      status: project.status,
                      type: (project.type as "form" | "project") || "project",
                    }}
                    onViewAnalysis={handleViewAnalysis}
                    onMenuClick={handleMenuClick}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Unassigned Forms from API */}
          <section className="projects-section">
            <h2 className="section-title">Shared</h2>
            {loading ? (
              <div>Loading...</div>
            ) : (
              <div className="projects-grid">
                {projects.filter((project) => project.isShared === true)
                  .length === 0 && <div>No shared projects.</div>}
                {projects
                  .filter((project) => project.isShared === true)
                  .map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={{
                        id: project.id,
                        name: project.name,
                        type: (project.type as "form" | "project") || "project",
                        status: project.status,
                        isShared: project.isShared,
                      }}
                      onViewAnalysis={handleViewAnalysis}
                      onMenuClick={handleMenuClick}
                    />
                  ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Home;
