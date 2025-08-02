import { useState } from "react";
interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: () => void;
}

const PublishModal: React.FC<PublishModalProps> = ({ onClose, onPublish }) => {
  const [emails, setEmails] = useState([""]);
  const [responderType, setResponderType] = useState("Anyone");
  const [showManageDropdown, setShowManageDropdown] = useState(false);
  console.log(setResponderType);

  const addEmail = () => {
    setEmails([...emails, ""]);
  };

  const updateEmail = (index: any, value: any) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  const removeEmail = (index: any) => {
    if (emails.length > 1) {
      const newEmails = emails.filter((_, i) => i !== index);
      setEmails(newEmails);
    }
  };

  const handleManageClick = (e: any) => {
    e.stopPropagation();
    setShowManageDropdown(!showManageDropdown);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <div className="publish-icon">📋</div>
            <span>Publish</span>
          </div>
          <button className="close-btn">✕</button>
        </div>

        <div className="modal-body">
          <div className="section">
            <label>Save to</label>
            <div className="input-row">
              <span>Project</span>
              <button className="change-btn">Change</button>
            </div>
          </div>

          <div className="section">
            <label>Responders</label>
            <div className="input-row responder-row">
              <span>{responderType} with the Link</span>
              <div className="manage-container">
                <button className="manage-btn" onClick={handleManageClick}>
                  Manage
                </button>

                {/* <ManageDropdown
                    isOpen={showManageDropdown}
                    onClose={() => setShowManageDropdown(false)}
                    onSelect={handleResponderSelect}
                    selectedOption={responderType}
                  /> */}
              </div>
            </div>
          </div>
          <div className="section">
            <label>Share</label>
            {emails.map((email, index) => (
              <div key={index} className="email-input-row">
                <input
                  type="email"
                  placeholder="Mail"
                  value={email}
                  onChange={(e) => updateEmail(index, e.target.value)}
                  className="email-input"
                />
                <button className="edit-btn" onClick={() => removeEmail(index)}>
                  Edit
                </button>
              </div>
            ))}
            <button className="add-mails-btn" onClick={addEmail}>
              + Add Mails
            </button>
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

export default PublishModal;
