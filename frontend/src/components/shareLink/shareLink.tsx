import React, { useState, useEffect } from "react";
import "../../styles/formBuilder/pageFlow.css";
import "../../styles/PageFlow/PageFlow.css";
interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: () => void;
  formId?: string;
  shareUrl?: string;
}

const ShareLink: React.FC<PublishModalProps> = ({
  isOpen,
  onClose,
  formId,
  shareUrl,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  console.log("shareUrl from the shareLink component", shareUrl);

  // Fetch share URL when modal opens
  useEffect(() => {
    if (isOpen && formId) {
      console.log("ShareLink modal opened with formId:", formId);
      setCopied(false); // Reset copy state
    }
  }, [isOpen, formId]);

  const handleCopyLink = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (error) {
      console.error("Failed to copy link:", error);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
            <label>Share Link</label>
            <div className="input-row responder-row">
              {shareUrl ? (
                <div className="share-link-container">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="share-link-input"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <button
                    className={`copy-btn ${copied ? "copied" : ""}`}
                    onClick={handleCopyLink}
                    title="Copy link"
                  >
                    {copied ? "✓ Copied!" : "Copy"}
                  </button>
                </div>
              ) : (
                <div className="no-link-container">
                  <span>
                    No share link available. Please publish the form first.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareLink;
