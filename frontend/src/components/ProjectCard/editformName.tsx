import { useState } from "react";
import cross from "../../assets/cross1.svg";
import logo from "../../assets/logo1.svg";
import "../../styles/home/Dashboard.css";
import { updateFormTitle } from "../../api/formBuilderApi";

interface EditFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  formId: string;
  currentFormName: string;
  onFormNameUpdated: (newName: string) => void;
}

const EditformModal: React.FC<EditFormModalProps> = ({
  isOpen,
  onClose,
  formId,
  currentFormName,
  onFormNameUpdated,
}) => {
  const [formName, setFormName] = useState(currentFormName);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      await updateFormTitle(formId, formName.trim());
      onFormNameUpdated(formName.trim());
      onClose();
    } catch (error) {
      console.error("Failed to update form name:", error);
      setError("Failed to update form name. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormName(currentFormName); // Reset to original name
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
          <h2 className="project-modal-title">Edit Form Name</h2>
          <h5 className="project-modal-subtitle">
            Update your form name
          </h5>

          {error && (
            <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="project-project-form">
            <div className="project-form-group">
              <label htmlFor="formName" className="project-project-form-label">
                Form Name
              </label>
              <input
                type="text"
                id="formName"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Form Name"
                className="project-form-input"
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="project-create-button"
              disabled={!formName.trim() || isLoading}
            >
              {isLoading ? 'Updating...' : 'Update'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditformModal;
