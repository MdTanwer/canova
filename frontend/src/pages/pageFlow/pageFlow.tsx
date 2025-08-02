import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type {
  FormPublishSettings,
  Page,
  PageFlowData,
} from "../../types/types";
import {
  getFormNmae,
  getPageFlow,
  getPages,
  publishForm,
} from "../../api/formBuilderApi";
import "../../styles/formBuilder/formbuilder.css";
import Sidebar from "../../components/formbuilder/Sidebar";
import "../../styles/formBuilder/pageFlow.css";
import "../../styles/PageFlow/PageFlow.css";
import ShareLink from "../../components/shareLink/shareLink";

const PageFlow = () => {
  const { id: formId } = useParams<{ id: string; pageId: string }>();
  const [allPages, setAllPages] = useState<Page[]>([]);
  const [activeItem, setActiveItem] = useState("");
  const [formTitle, setFormTitle] = useState<string>("");
  const [pageFlow, setPageFlow] = useState<PageFlowData>({
    hasConditions: false,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shareLink, setShareLink] = useState(false);

  // Fetch pages
  useEffect(() => {
    const fetchPages = async () => {
      if (!formId) return;
      try {
        const result = (await getPages(formId)) as { pages: Page[] };

        if (result && result.pages) {
          setAllPages(result.pages);
          if (result.pages.length > 0) {
            setActiveItem(result.pages[0]._id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch pages:", error);
      }
    };
    fetchPages();
  }, [formId]);

  // Fetch form title
  useEffect(() => {
    const fetchFormTitle = async () => {
      if (!formId) return;
      try {
        const result = (await getFormNmae(formId)) as { formName: string };
        if (result && result.formName) {
          setFormTitle(result.formName);
        }
      } catch (error) {
        console.error("Failed to fetch form name:", error);
      }
    };
    fetchFormTitle();
  }, [formId]);

  // Fetch page flow data when active item changes
  useEffect(() => {
    const fetchPageFlow = async () => {
      if (!formId || !activeItem) return;
      try {
        const result = await getPageFlow(formId, activeItem);
        setPageFlow(result as PageFlowData);
      } catch (error) {
        console.error("Failed to fetch page flow:", error);
        setPageFlow({ hasConditions: false });
      }
    };
    fetchPageFlow();
  }, [formId, activeItem]);

  const handleItemClick = async (item: string) => {
    setActiveItem(item);
  };
  const handleNextClick = () => {
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  // Handle publish action
  const handlePublish = () => {
    setIsModalOpen(false);
  };

  const renderFlowChart = () => {
    if (!pageFlow.hasConditions) {
      return (
        <div className="no-conditions">
          <p>No conditional flow found for this page</p>
        </div>
      );
    }

    const currentPageName = allPages.find((p) => p._id === activeItem)?.title;

    return (
      <div className="flow-chart">
        {/* Current Page */}
        <div className="flow-node current-page">
          <div className="page-box">{currentPageName}</div>
        </div>

        {/* Condition Diamond */}
        <div className="condition-container">
          <div className="flow-line vertical"></div>
          <div className="condition-diamond">
            <div className="diamond-content">Page 01</div>
          </div>

          {/* True/False Labels */}
          <div className="condition-labels">
            <span className="true-label">True</span>
            <span className="false-label">False</span>
          </div>
        </div>

        {/* Flow Branches */}
        <div className="flow-branches">
          {/* True Branch */}
          <div className="flow-branch true-branch">
            <div className="branch-line"></div>
            {pageFlow.trueSequence && pageFlow.trueSequence.length > 1 && (
              <div className="sequence-nodes">
                {pageFlow.trueSequence.slice(1).map((page, index) => (
                  <React.Fragment key={page.pageId}>
                    {index > 0 && (
                      <div className="flow-line vertical-short"></div>
                    )}
                    <div className="flow-node">
                      <div className="page-box">{page.pageName}</div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>

          {/* False Branch */}
          <div className="flow-branch false-branch">
            <div className="branch-line"></div>
            {pageFlow.falseSequence && pageFlow.falseSequence.length > 1 && (
              <div className="sequence-nodes">
                {pageFlow.falseSequence.slice(1).map((page, index) => (
                  <React.Fragment key={page.pageId}>
                    {index > 0 && (
                      <div className="flow-line vertical-short"></div>
                    )}
                    <div className="flow-node">
                      <div className="page-box">{page.pageName}</div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="">
        <Sidebar
          activeItem={activeItem}
          onItemClick={handleItemClick}
          pages={allPages}
          formbuilder={false}
        />

        <div
          style={{
            border: "2px solid #696969",
            marginLeft: "270px",
            minHeight: "100vh",
            borderRadius: "20px",
            backgroundColor: "#fff",
          }}
        >
          <div
            style={{
              borderBottom: "2px solid #696969",
              fontFamily: "Inter, sans-serif",
              fontWeight: 400,
              fontSize: "20px",
              padding: "16px 0",
            }}
          >
            <h1 style={{ marginLeft: "40px", margin: "0 0 0 40px" }}>
              {formTitle}
            </h1>
          </div>

          <div className="page-flow-content">
            <div className="current-page-info">
              <p>
                <strong>Current Page:</strong>{" "}
                {allPages.find((p) => p._id === activeItem)?.title ||
                  "No page selected"}
              </p>
            </div>
            {renderFlowChart()}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div
                style={{
                  maxWidth: "70px",
                  alignItems: "center",
                  textAlign: "center",
                }}
                className="next-btn"
                onClick={handleNextClick}
              >
                Next
              </div>
            </div>
          </div>
        </div>
      </div>
      <PublishModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onPublish={handlePublish}
        setShareLink={setShareLink}
      />
      {shareLink && (
        <ShareLink
          isOpen={shareLink}
          onClose={handleModalClose}
          onPublish={handlePublish}
        />
      )}
    </>
  );
};

export default PageFlow;

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: () => void;
  setShareLink: (value: boolean) => void;
}

const PublishModal: React.FC<PublishModalProps> = ({
  isOpen,
  onClose,
  onPublish,
}) => {
  const [emails, setEmails] = useState<string[]>([""]);
  const [responderType, setResponderType] = useState<"Anyone" | "Restricted">(
    "Anyone"
  );
  const [showManageDropdown, setShowManageDropdown] = useState(false);
  const [showEmailDropdown, setShowEmailDropdown] = useState(false);
  const [selectedEmailIndex, setSelectedEmailIndex] = useState<number | null>(
    null
  );
  const { id: formId } = useParams<{ id: string }>();
  const [linkModel, setLinkModel] = useState(false);
  const [emailModel, setEmailModel] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  console.log(
    error,
    isPublishing,
    selectedEmailIndex,
    showEmailDropdown,
    showManageDropdown
  );

  const addEmail = () => {
    setEmails([...emails, ""]);
  };

  const updateEmail = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  const removeEmail = (index: number) => {
    if (emails.length > 1) {
      const newEmails = emails.filter((_, i) => i !== index);
      setEmails(newEmails);
      setShowEmailDropdown(false);
      setSelectedEmailIndex(null);
    }
  };
  console.log(removeEmail);

  const handleEmailEditClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setSelectedEmailIndex(index);
    setShowEmailDropdown(!showEmailDropdown);
    setShowManageDropdown(false);
  };

  console.log(handleEmailEditClick);
  const validateEmails = (): boolean => {
    if (responderType === "Anyone") return true;

    const validEmails = emails.filter((email) => {
      const trimmed = email.trim();
      return trimmed && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    });

    return validEmails.length > 0;
  };

  const handlePublish = async () => {
    console.log("emails", emails);
    setError(null);

    if (!validateEmails()) {
      setError(
        "Please enter at least one valid email address for restricted access."
      );
      return;
    }

    setIsPublishing(true);

    try {
      if (!formId) {
        setError("Form ID is missing.");
        setIsPublishing(false);
        return;
      }
      const settings: FormPublishSettings = {
        isPublic: responderType === "Anyone",
        allowedEmails: emails
          .map((email) => email.trim())
          .filter((email) => email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)),
        responderType,
      };

      const result = await publishForm(formId, settings);
      onPublish();
      console.log("result", result);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to publish form. Please try again."
      );
    } finally {
      setIsPublishing(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <div className="publish-icon">📋</div>
            <span>Publish</span>
          </div>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="section">
            <label>Save to</label>
            <div className="input-row">
              <span>Project</span>
              <button className="change-btn">Change</button>
            </div>
          </div>

          <div className="section" style={{ position: "relative" }}>
            <label>Responders</label>
            <div className="input-row responder-row">
              <span>{responderType} with the Link</span>
              <div className="manage-container">
                <button
                  className="manage-btn"
                  onClick={() => setLinkModel(!linkModel)}
                >
                  {responderType === "Anyone"
                    ? "Anyone"
                    : responderType === "Restricted"
                    ? "Restricted"
                    : "Manage"}
                </button>
              </div>
            </div>
          </div>
          {linkModel && (
            <div
              style={{
                position: "absolute",
                left: "60%",
                transform: "translateX(-50%)", // to center horizontally
                // border: "1px solid red",
                paddingLeft: "20px",
                paddingRight: "20px",
                paddingTop: "5px",
                paddingBottom: "5px",
                background: "white",
                color: "#1F2937", // gray-800
                borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.5)", // ✅ shadow
              }}
            >
              <div
                style={{
                  color: "#1F2937",
                  fontFamily: "inter",
                  fontSize: "20px",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setResponderType("Anyone");
                  setLinkModel(false);
                }}
              >
                Anyone
              </div>

              <div
                style={{
                  paddingTop: "5px",
                  color: "#1F2937",
                  fontFamily: "inter",
                  fontSize: "20px",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setLinkModel(false);
                  setResponderType("Restricted");
                }}
              >
                {" "}
                Restricted
              </div>
            </div>
          )}

          {responderType === "Restricted" && (
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
                  <button
                    className="edit-btn"
                    onClick={() => setEmailModel(!emailModel)}
                  >
                    Edit
                  </button>
                </div>
              ))}
              <button className="add-mails-btn" onClick={addEmail}>
                + Add Mails
              </button>
            </div>
          )}

          {emailModel && (
            <div
              style={{
                position: "absolute",
                left: "70%",
                transform: "translateX(-50%)", // to center horizontally
                // border: "1px solid red",
                paddingLeft: "20px",
                paddingRight: "20px",
                paddingTop: "5px",
                paddingBottom: "5px",
                background: "white",
                color: "#1F2937", // gray-800
                borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.5)",
                top: "350px",
                right: "5px",
              }}
            >
              <div
                style={{
                  paddingTop: "5px",
                  color: "#1F2937",
                  fontFamily: "inter",
                  fontSize: "20px",
                  cursor: "pointer",
                }}
              >
                Edit
              </div>
              <div
                style={{
                  paddingTop: "5px",
                  color: "#1F2937",
                  fontFamily: "inter",
                  fontSize: "20px",
                  cursor: "pointer",
                }}
              >
                View
              </div>
              <div
                style={{
                  paddingTop: "5px",
                  color: "#1F2937",
                  fontFamily: "inter",
                  fontSize: "20px",
                  cursor: "pointer",
                }}
              >
                Remove
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            className="publish-btn"
            onClick={() => {
              // onPublish();
              // onClose();
              handlePublish();
              // setShareLink(true);
            }}
          >
            Publish
          </button>
        </div>
      </div>
    </div>
  );
};
