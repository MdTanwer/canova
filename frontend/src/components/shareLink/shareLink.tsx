import { useState } from "react";
import "../../styles/formBuilder/pageFlow.css";
import "../../styles/PageFlow/PageFlow.css";
interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: () => void;
}

const ShareLink: React.FC<PublishModalProps> = ({
  isOpen,
  onClose,
  onPublish,
}) => {
  const [link, setLink] = useState(false);

  const handleManageClick = (e: any) => {
    e.stopPropagation();
  };

  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <div className="publish-icon">📋</div>
            <span>Share</span>
          </div>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="section" style={{ position: "relative" }}>
            <label>Responders</label>
            <div className="input-row responder-row">
              <span> with the Link</span>
              <div className="manage-container"></div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="publish-btn" onClick={onPublish}>
            Publish
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareLink;
