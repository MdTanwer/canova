import { useState } from "react";
import cross from "../../assets/cross1.svg";
import logo from "../../assets/logo1.svg";
import "../../styles/home/Dashboard.css";
import { updateProjectName } from "../../api/formBuilderApi";

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  currentProjectName: string;
  onProjectNameUpdated: (newName: string) => void;
}

const EditprojectModel: React.FC<EditProjectModalProps> = ({
  isOpen,
  onClose,
  projectId,
  currentProjectName,
  onProjectNameUpdated,
}) => {
  const [projectName, setProjectName] = useState(currentProjectName);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      await updateProjectName(projectId, projectName.trim());
      onProjectNameUpdated(projectName.trim());
      onClose();
    } catch (error) {
      console.error("Failed to update project name:", error);
      setError("Failed to update project name. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setProjectName(currentProjectName); // Reset to original name
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className=" project-modal-header">
          <div>
            <div className="logo1">
              <img src={logo} alt="" />
            </div>
          </div>
          <button className=" project-close-button" onClick={handleClose}>
            <img src={cross} alt="" />
          </button>
        </div>

        <div className="project-modal-body">
          <h2 className="project-modal-title">Edit Project Name</h2>
          <h5 className="project-modal-subtitle">
            Update your project name
          </h5>

          {error && (
            <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="project-project-form">
            <div className="project-form-group">
              <label
                htmlFor="projectName"
                className=" project-project-form-label"
              >
                Project Name
              </label>
              <input
                type="text"
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Project Name"
                className="project-form-input"
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="project-create-button"
              disabled={!projectName.trim() || isLoading}
            >
              {isLoading ? 'Updating...' : 'Update'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditprojectModel;
