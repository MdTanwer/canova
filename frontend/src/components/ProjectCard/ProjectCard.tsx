import React, { useState } from "react";
import "../../styles/ProjectCard/ProjectCard.css";
import type { Project } from "../../types/types";
import form from "../../assets/fe_editbigsvg.svg";
import file from "../../assets/filebig.svg";
import { deleteById, getPages, getFormShareUrl } from "../../api/formBuilderApi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import ShareLink from "../shareLink/shareLink";

interface ProjectCardProps {
  project: Project;
  onViewAnalysis: (projectId: string) => void;
  onMenuClick: (projectId: string) => void;
  setProjectName: (value: boolean) => void;
  setProjectId: (projectId: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onViewAnalysis,
  setProjectName,
  setProjectId,
}) => {
  const getIcon = () => {
    if (project.type === "form") {
      return <img src={form} alt="file" />;
    }
    return <img src={file} alt="file" />;
  };
  const [tooltip, setTooltip] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>("");

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

  const handleShare = async () => {
    try {
      setTooltip(false); // Close tooltip when share is clicked
      const response = await getFormShareUrl(project.id) as any;
      const url = response.data?.shareableLink || response.shareableLink;
      setShareUrl(url);
      setShareModalOpen(true);
    } catch (error) {
      console.error("Failed to get share URL:", error);
      toast.error("Failed to get share link. Please try again.");
    }
  };
  const navigate = useNavigate();
  const handleClick = async () => {
    if (project.type === "form") {
      try {
        // Get the pages for this form to get the first page ID
        const pagesResponse = await getPages(project.id) as any;
        const pages = pagesResponse.data || pagesResponse.pages || pagesResponse;
        
        if (pages && pages.length > 0) {
          // Navigate to form builder with the first page
          navigate(`/form-builder/${project.id}/${pages[0]._id || pages[0].id}`);
        } else {
          // Fallback: navigate to form analysis if no pages found
          navigate(`/formanalysis/${project.id}`);
        }
      } catch (error) {
        console.error("Failed to fetch pages for form:", error);
        // Fallback: navigate to form analysis on error
        navigate(`/formanalysis/${project.id}`);
      }
    } else {
      navigate(`/project/${project.id}`);
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
        onClick={handleClick}
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
          {project.type === "form" && project.status === "published" && (
            <div
              style={{
                color: "#1F2937",
                fontFamily: "inter",
                fontSize: "20px",
                cursor: "pointer",
                transition: "color 0.3s ease",
              }}
              onClick={handleShare}
            >
              Share
            </div>
          )}

          <div
            style={{
              paddingTop: "5px",
              color: "#1F2937",
              fontFamily: "inter",
              fontSize: "20px",
              cursor: "pointer",
            }}
            onClick={() => {
              setProjectName(true);
              setProjectId(project.id);
              setTooltip(false); // Close tooltip when rename is clicked
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
            onClick={handleDelete}
          >
            {" "}
            Delete
          </div>
        </div>
      )}
      
      {/* Share Link Modal */}
      <ShareLink
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        formId={project.id}
        shareUrl={shareUrl}
      />
    </div>
  );
};

export default ProjectCard;
