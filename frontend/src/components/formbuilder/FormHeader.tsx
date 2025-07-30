import React from "react";
import "../../styles/formBuilder/FormHeader.css";
import "../../styles/formBuilder/previeModel/PreveiwModel.css";

interface FormHeaderProps {
  title?: string;
  onTitleChange?: (newTitle: string) => void;
  onPreview?: () => void;
  onSave?: () => void;
}

const FormHeader: React.FC<FormHeaderProps> = ({
  title,
  onPreview,
  onSave,
}) => {
  const handlePreview = () => {
    if (onPreview) {
      onPreview();
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave();
    }
  };

  return (
    <header className="form-header-container">
      <div className="form-header-content">
        <div className="form-title-section">
          <h1 className="form-title">{title}</h1>
        </div>

        <div className="form-header-actions">
          <button className="form-preview-btn" onClick={handlePreview}>
            Preview
          </button>
          <button className="form-save-btn" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </header>
  );
};

export default FormHeader;
