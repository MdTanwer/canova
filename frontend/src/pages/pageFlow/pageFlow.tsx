// Enhanced React Component
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  type FormPublishSettings,
  type Page,
  type PageFlowData,
  type EmailAccess,
  type Project,
  AccessPermission,
} from "../../types/types";
import {
  getFormNmae,
  getPageFlow,
  getPages,
  publishForm,
  getAllProjects,
} from "../../api/formBuilderApi";
import "../../styles/formBuilder/formbuilder.css";
import Sidebar from "../../components/formbuilder/Sidebar";
import "../../styles/formBuilder/pageFlow.css";
import "../../styles/PageFlow/PageFlow.css";
import ShareLink from "../../components/shareLink/shareLink";
import { toast } from "react-toastify";

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
  const [shareUrl, setShareUrl] = useState<string>("");

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

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handlePublish = () => {
    setIsModalOpen(false);
    setShareLink(true);
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
        <div className="page-box">{currentPageName}</div>

        <div className="condition-container">
          <div className="flow-line vertical"></div>

          <div className="condition-labels">
            <span className="true-label">True</span>
            <span className="false-label">False</span>
          </div>
        </div>

        <div className="flow-branches">
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
        setShareUrl={setShareUrl}
      />

      {shareUrl && shareLink && (
        <ShareLink
          isOpen={shareLink}
          onClose={() => setShareLink(false)}
          onPublish={handlePublish}
          shareUrl={shareUrl}
        />
      )}
    </>
  );
};

export default PageFlow;

// Enhanced PublishModal Component
interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: () => void;
  setShareUrl: (link: string) => void;
}

const PublishModal: React.FC<PublishModalProps> = ({
  isOpen,
  onClose,
  onPublish,
  setShareUrl,
}) => {
  const [emailAccess, setEmailAccess] = useState<EmailAccess[]>([
    { email: "", permissions: [AccessPermission.VIEW] },
  ]);
  const [responderType, setResponderType] = useState<"Anyone" | "Restricted">(
    "Anyone"
  );
  const [showEmailDropdown, setShowEmailDropdown] = useState(false);
  const [selectedEmailIndex, setSelectedEmailIndex] = useState<number | null>(
    null
  );
  const [projectId, setProjectId] = useState<string>("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const { id: formId } = useParams<{ id: string }>();
  const [linkModel, setLinkModel] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch projects when modal opens
  useEffect(() => {
    const fetchProjects = async () => {
      if (!isOpen) return;

      setLoadingProjects(true);
      try {
        const response = (await getAllProjects()) as {
          success: boolean;
          projects: Project[];
        };
        if (response.success && response.projects) {
          setProjects(response.projects);
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjects();
  }, [isOpen]);

  // Handle project selection
  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setProjectId(project.id);
  };

  const addEmail = () => {
    setEmailAccess([
      ...emailAccess,
      { email: "", permissions: [AccessPermission.VIEW] },
    ]);
  };

  const updateEmail = (index: number, email: string) => {
    const newEmailAccess = [...emailAccess];
    newEmailAccess[index].email = email;
    setEmailAccess(newEmailAccess);
  };

  const setPermission = (index: number, permission: AccessPermission) => {
    const newEmailAccess = [...emailAccess];
    // Set only one permission for the email
    newEmailAccess[index].permissions = [permission];
    setEmailAccess(newEmailAccess);
  };

  const handleEmailEditClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setSelectedEmailIndex(index);
    setShowEmailDropdown(!showEmailDropdown);
  };

  const validateEmails = (): boolean => {
    if (responderType === "Anyone") return true;

    const validEmails = emailAccess.filter((access) => {
      const trimmed = access.email.trim();
      return (
        trimmed &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) &&
        access.permissions.length > 0
      );
    });

    return validEmails.length > 0;
  };

  const handlePublish = async () => {
    setError(null);

    if (!validateEmails()) {
      setError(
        "Please enter at least one valid email address with permissions for restricted access."
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

      const validEmailAccess = emailAccess.filter((access) => {
        const trimmed = access.email.trim();
        return (
          trimmed &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) &&
          access.permissions.length > 0
        );
      });

      const settings: FormPublishSettings = {
        isPublic: responderType === "Anyone",
        allowedEmails: validEmailAccess.map((access) => access.email.trim()),
        emailAccess: validEmailAccess,
        responderType,
        projectId: projectId || undefined,
      };

      const result = await publishForm(formId, settings);
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (result?.data?.shareUrl) {
        console.log(result.data.shareUrl);
        setShareUrl(result.data.shareUrl);
        toast.success("Form published successfully");
        onPublish();
      } else {
        throw new Error("Shareable link not received in response");
      }

      setShareUrl(result.data.shareUrl);

      onPublish();
    } catch (err: any) {
      setError(err.response?.data?.message);
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

        <div className="modal-body" onClick={() => setShowEmailDropdown(false)}>
          <div className="section">
            <label>Save to</label>
            <div className="input-row">
              {loadingProjects ? (
                <div
                  className="email-input"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    color: "#666",
                  }}
                >
                  Loading projects...
                </div>
              ) : (
                <select
                  value={selectedProject?.id || ""}
                  onChange={(e) => {
                    const project = projects.find(
                      (p) => p.id === e.target.value
                    );
                    if (project) {
                      handleProjectSelect(project);
                    } else {
                      setSelectedProject(null);
                      setProjectId("");
                    }
                  }}
                  className="email-input"
                  style={{ cursor: "pointer" }}
                >
                  <option value="">Select a project (optional)</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              )}
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
                  {responderType === "Anyone" ? "Anyone" : "Restricted"}
                </button>
              </div>
            </div>
          </div>

          {linkModel && (
            <div
              style={{
                position: "absolute",
                left: "60%",
                transform: "translateX(-50%)",
                paddingLeft: "20px",
                paddingRight: "20px",
                paddingTop: "5px",
                paddingBottom: "5px",
                background: "white",
                color: "#1F2937",
                borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.5)",
                zIndex: 1000,
              }}
            >
              <div
                style={{
                  color: "#1F2937",
                  fontFamily: "inter",
                  fontSize: "20px",
                  cursor: "pointer",
                  padding: "5px 0",
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
                  color: "#1F2937",
                  fontFamily: "inter",
                  fontSize: "20px",
                  cursor: "pointer",
                  padding: "5px 0",
                }}
                onClick={() => {
                  setLinkModel(false);
                  setResponderType("Restricted");
                }}
              >
                Restricted
              </div>
            </div>
          )}

          {responderType === "Restricted" && (
            <div className="section">
              <label>Share with Access Control</label>
              {emailAccess.map((access, index) => (
                <div
                  key={index}
                  className="email-input-row"
                  style={{ marginBottom: "10px" }}
                >
                  <input
                    type="email"
                    placeholder="Email address"
                    value={access.email}
                    onChange={(e) => updateEmail(index, e.target.value)}
                    className="email-input"
                  />
                  <button
                    className="edit-btn"
                    onClick={(e) => handleEmailEditClick(e, index)}
                  >
                    {access.permissions.length > 0
                      ? access.permissions[0].charAt(0).toUpperCase() +
                        access.permissions[0].slice(1)
                      : "None"}
                  </button>

                  {/* Permissions Checkboxes */}
                  {selectedEmailIndex === index && showEmailDropdown && (
                    <div
                      style={{
                        position: "absolute",
                        left: "70%",
                        transform: "translateX(-50%)",
                        padding: "10px",
                        background: "white",
                        color: "#1F2937",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.5)",
                        zIndex: 1000,
                        border: "1px solid #ccc",
                      }}
                    >
                      {Object.values(AccessPermission).map((permission) => (
                        <div key={permission} style={{ padding: "5px 0" }}>
                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              cursor: "pointer",
                            }}
                          >
                            <input
                              type="radio"
                              name={`permission-${index}`}
                              checked={access.permissions.includes(permission)}
                              onChange={() => setPermission(index, permission)}
                              style={{ marginRight: "8px" }}
                            />
                            {permission.charAt(0).toUpperCase() +
                              permission.slice(1)}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <button className="add-mails-btn" onClick={addEmail}>
                + Add Email
              </button>
            </div>
          )}

          {error && (
            <div style={{ color: "red", marginTop: "10px", fontSize: "14px" }}>
              {error}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            className="publish-btn"
            onClick={handlePublish}
            disabled={isPublishing}
          >
            {isPublishing ? "Publishing..." : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
};
