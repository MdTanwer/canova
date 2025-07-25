import React, { useState } from "react";
import "../../styles/formBuilder/FormHeader.css";

interface FormHeaderProps {
  title?: string;
  onTitleChange?: (newTitle: string) => void;
  onPreview?: () => void;
  onSave?: () => void;
}

const FormHeader: React.FC<FormHeaderProps> = ({
  title = "Title",
  onTitleChange,
  onPreview,
  onSave,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(title);

  const handleTitleClick = () => {
    setIsEditingTitle(true);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (onTitleChange) {
      onTitleChange(currentTitle);
    }
  };

  const handleTitleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTitleBlur();
    }
  };

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
          {isEditingTitle ? (
            <input
              type="text"
              value={currentTitle}
              onChange={(e) => setCurrentTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyPress={handleTitleKeyPress}
              className="form-title-input"
              autoFocus
            />
          ) : (
            <h1 className="form-title" onClick={handleTitleClick}>
              {currentTitle}
            </h1>
          )}
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
