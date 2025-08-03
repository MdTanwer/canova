import React, { useState } from "react";
import "../../styles/ProjectCard/ProjectCard.css";
import form from "../../assets/fe_editbigsvg.svg";
import ShareLink from "../shareLink/shareLink";
import { getFormShareUrl } from "../../api/formBuilderApi";

interface ProjectCardProps {
  title: string;
  id: string;
}

const Publicform: React.FC<ProjectCardProps> = ({ id, title }) => {
  const [tooltip, setTooltip] = useState(false);
  const [shareLink, setShareLink] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleShareClick = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setTooltip(false);

      // Fetch the share URL from the API
      const response = await getFormShareUrl(id);

      // Extract the shareableLink from the response structure
      const url = response?.data?.shareableLink;

      if (url) {
        setShareUrl(url);
        setShareLink(true);
      } else {
        setError("Failed to generate share URL");
      }
    } catch (err) {
      console.error("Error fetching share URL:", err);
      setError("Failed to get share URL. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const closeShareModal = () => {
    setShareLink(false);
    setShareUrl("");
    setError(null);
  };

  return (
    <div
      className="project-card"
      style={{ paddingBottom: "5px", position: "relative" }}
    >
      <h3 className="project-name">{title}</h3>
      <div className="icon-container">
        <div className="project-icon">
          <img src={form} alt="" />
        </div>
      </div>
      <div className="project-content-container">
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
            transform: "translateX(-50%)",
            paddingLeft: "20px",
            paddingRight: "20px",
            paddingTop: "5px",
            paddingBottom: "5px",
            background: "white",
            color: "#1F2937",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.5)",
            zIndex: "5000",
          }}
        >
          <div
            style={{
              color: "#1F2937",
              fontFamily: "inter",
              fontSize: "20px",
              cursor: isLoading ? "wait" : "pointer",
              transition: "color 0.3s ease",
              opacity: isLoading ? 0.6 : 1,
            }}
            onClick={handleShareClick}
          >
            {isLoading ? "Loading..." : "Share"}
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "100%",
            transform: "translateX(-50%)",
            marginTop: "10px",
            padding: "8px 12px",
            background: "#FEE2E2",
            color: "#DC2626",
            borderRadius: "6px",
            fontSize: "14px",
            zIndex: "5000",
            whiteSpace: "nowrap",
          }}
        >
          {error}
        </div>
      )}

      {/* Share modal */}
      {shareUrl && shareLink && (
        <ShareLink
          isOpen={shareLink}
          onClose={closeShareModal}
          shareUrl={shareUrl}
        />
      )}
    </div>
  );
};

export default Publicform;
