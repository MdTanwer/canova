import React from "react";
import "../../styles/formBuilder/RightSidebar.css";
import add from "../../assets/Home (1).svg";
import text from "../../assets/import.svg";
import cndtn from "../../assets//condition(1).svg";
import video from "../../assets/Video(1).svg";
import img1 from "../../assets/img154.svg";
import sec from "../../assets/sec.svg";
interface RightSidebarProps {
  onAddQuestion?: () => void;
  onAddText?: () => void;
  onAddCondition?: () => void;
  onAddImage?: () => void;
  onAddVideo?: () => void;
  onAddSections?: () => void;
  backgroundColor?: string;
  sectionColor?: string;
  onBackgroundColorChange?: (color: string) => void;
  onSectionColorChange?: (color: string) => void;
}

const RightSidebar: React.FC<RightSidebarProps> = ({
  onAddQuestion,
  onAddText,
  onAddCondition,
  onAddImage,
  onAddVideo,
  onAddSections,
  backgroundColor = "#646464",
  sectionColor = "#646464",
  onBackgroundColorChange,
  onSectionColorChange,
}) => {
  return (
    <div className="right-sidebar">
      {/* Action Buttons Section */}
      <div className="action-buttons-section">
        <button className="right-sidebar-action-btn" onClick={onAddQuestion}>
          <span className="right-sidebar-action-icon">
            <img src={add} alt="" />
          </span>
          <span className="right-sidebar-action-text">Add Question</span>
        </button>

        <button className="right-sidebar-action-btn" onClick={onAddText}>
          <span className="right-sidebar-action-icon">
            <img src={text} alt="" />
          </span>
          <span className="right-sidebar-action-text">Add Text</span>
        </button>

        <button className="right-sidebar-action-btn " onClick={onAddCondition}>
          <span className="right-sidebar-action-icon">
            <img src={cndtn} alt="" />
          </span>
          <span className="right-sidebar-action-text">Add Condition</span>
        </button>

        <button className="right-sidebar-action-btn " onClick={onAddImage}>
          <span className="right-sidebar-action-icon">
            <img src={img1} alt="" />
          </span>
          <span className="right-sidebar-action-text">Add Image</span>
        </button>

        <button className="right-sidebar-action-btn " onClick={onAddVideo}>
          <span className="right-sidebar-action-icon">
            {" "}
            <img src={video} alt="" />
          </span>
          <span className="right-sidebar-action-text">Add Video</span>
        </button>

        <button className="right-sidebar-action-btn " onClick={onAddSections}>
          <span className="right-sidebar-action-icon">
            <img src={sec} alt="" />
          </span>
          <span className="right-sidebar-action-text">Add Sections</span>
        </button>
      </div>

      {/* Styling Options Section */}
      <div className="styling-section">
        <div className="color-option">
          <label className="color-label">Background Color</label>
          <div className="color-picker-wrapper">
            <div
              className="color-preview"
              style={{ backgroundColor: backgroundColor }}
            ></div>
            <input
              type="text"
              value={backgroundColor}
              className="color-input"
              onChange={(e) => onBackgroundColorChange?.(e.target.value)}
            />
            <span className="opacity-value">100%</span>
          </div>
        </div>

        <div className="color-option">
          <label className="color-label">Section Color</label>
          <div className="color-picker-wrapper">
            <div
              className="color-preview"
              style={{ backgroundColor: sectionColor }}
            ></div>
            <input
              type="text"
              value={sectionColor}
              className="color-input"
              onChange={(e) => onSectionColorChange?.(e.target.value)}
            />
            <span className="opacity-value">100%</span>
          </div>
        </div>
      </div>

      {/* Next Button */}
      <div className="next-button-section">
        <button className="next-btn">Next</button>
      </div>
    </div>
  );
};

export default RightSidebar;
