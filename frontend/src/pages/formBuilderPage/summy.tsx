import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../../styles/formBuilder/formbuilder.css";
import Sidebar from "../../components/formbuilder/Sidebar";
import FormHeader from "../../components/formbuilder/FormHeader";
import RightSidebar from "../../components/formbuilder/RightSidebar";
import {
  getPages,
  createNextPages,
  getFormNmae,
} from "../../api/formBuilderApi";
import type { Page } from "../../types/types";

// API functions for questions
const API_BASE = "http://localhost:3000/api";

const questionAPI = {
  // Create question
  createQuestion: async (questionData: any) => {
    const response = await fetch(`${API_BASE}/questions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(questionData),
    });

    if (!response.ok) {
      throw new Error("Failed to create question");
    }

    return response.json();
  },

  // Get questions by page
  getQuestionsByPage: async (pageId: string) => {
    const response = await fetch(`${API_BASE}/questions/page/${pageId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch questions");
    }

    return response.json();
  },

  // Update question
  updateQuestion: async (questionId: string, updateData: any) => {
    const response = await fetch(`${API_BASE}/questions/${questionId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error("Failed to update question");
    }

    return response.json();
  },

  // Delete question
  deleteQuestion: async (questionId: string) => {
    const response = await fetch(`${API_BASE}/questions/${questionId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete question");
    }

    return response.json();
  },

  // Save form draft
  saveDraft: async (formId: string, draftData: any) => {
    const response = await fetch(`${API_BASE}/forms/${formId}/draft`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(draftData),
    });

    if (!response.ok) {
      throw new Error("Failed to save draft");
    }

    return response.json();
  },
};

interface Question {
  _id?: string; // Backend MongoDB ID
  id?: string; // Frontend temporary ID
  formId?: string;
  pageId?: string;
  type:
    | "short"
    | "long"
    | "multiple-choice"
    | "time"
    | "rating"
    | "checkbox"
    | "dropdowns"
    | "date"
    | "LinearScale"
    | "upload";
  question: string;
  order?: number;
  required?: boolean;

  // Type-specific fields
  options?: string[];
  placeholder?: string;
  maxLength?: number;
  minLength?: number;
  starCount?: number;
  selectedRating?: number; // For UI only
  scaleStartLabel?: string;
  scaleEndLabel?: string;
  scaleMin?: number;
  scaleMax?: number;
  scaleValue?: number; // For UI only
  maxFiles?: number;
  maxFileSizeMb?: number;
  allowedTypes?: string[];

  // Reference media
  referenceMedia?: {
    type: "image" | "video";
    url: string;
    filename: string;
    description?: string;
  };
}

const FormBuilderPage: React.FC = () => {
  const [activeItem, setActiveItem] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#646464");
  const [sectionColor, setSectionColor] = useState("#646464");
  const [allPages, setAllPages] = useState<Page[]>([]);
  const [formTitle, setFormTitle] = useState<string>("");
  const { id: formId } = useParams<{ id: string; pageId: string }>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  // State to store questions for each page
  const [pageQuestions, setPageQuestions] = useState<{
    [pageId: string]: Question[];
  }>({});
  const [unsavedChanges, setUnsavedChanges] = useState<{
    [pageId: string]: boolean;
  }>({});
  const [isSyncing, setIsSyncing] = useState(false);

  // Fetch questions when active page changes
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!activeItem) return;

      // Check if we already have questions for this page
      if (pageQuestions[activeItem]) {
        setQuestions(pageQuestions[activeItem]);
        return;
      }

      setLoading(true);
      try {
        const result = await questionAPI.getQuestionsByPage(activeItem);
        if (result.success && result.data) {
          // Convert backend questions to frontend format
          const formattedQuestions = result.data.map((q: any) => ({
            ...q,
            id: q._id, // Use MongoDB ID as frontend ID
            selectedRating: 0, // Initialize UI state
            scaleValue: q.scaleMin || 0, // Initialize UI state
          }));

          // Store questions for this page
          setPageQuestions((prev) => ({
            ...prev,
            [activeItem]: formattedQuestions,
          }));

          setQuestions(formattedQuestions);
        } else {
          // No questions for this page yet
          setQuestions([]);
        }
      } catch (error) {
        console.error("Failed to fetch questions:", error);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [activeItem, pageQuestions]);

  const handleItemClick = async (item: string) => {
    // Save current page questions to backend if there are unsaved changes
    if (activeItem && unsavedChanges[activeItem] && questions.length > 0) {
      try {
        await savePageQuestionsToBackend(activeItem, questions);
        console.log(
          `💾 Auto-saved questions for page ${activeItem} before switching`
        );
      } catch (error) {
        console.error("Failed to save questions before page switch:", error);
        // Optionally show user a warning but don't block page switch
      }
    }

    // Store current questions in cache
    if (activeItem && questions.length > 0) {
      setPageQuestions((prev) => ({
        ...prev,
        [activeItem]: questions,
      }));
    }

    setActiveItem(item);
  };

  const handleAddText = () => {
    console.log("Add Text clicked");
  };

  const handleAddCondition = () => {
    console.log("Add Condition clicked");
  };

  const handleAddImage = () => {
    console.log("Add Image clicked");
  };

  const handleAddVideo = () => {
    console.log("Add Video clicked");
  };

  const handleAddSections = () => {
    console.log("Add Sections clicked");
  };

  const createNextPage = async () => {
    if (!formId) return;
    try {
      const result = (await createNextPages(formId)) as { page: Page };
      if (result && result.page) {
        setAllPages((prev) => [...prev, result.page]);
        setActiveItem(result.page._id);
      }
    } catch (error) {
      console.error("Failed to create next page:", error);
    }
  };

  // Save questions to backend for a specific page
  const savePageQuestionsToBackend = async (
    pageId: string,
    questionsToSave: Question[]
  ) => {
    if (!formId) return;

    try {
      setIsSyncing(true);

      // First, delete all existing questions for this page
      const existingQuestions = await questionAPI.getQuestionsByPage(pageId);
      if (existingQuestions.success && existingQuestions.data) {
        for (const question of existingQuestions.data) {
          await questionAPI.deleteQuestion(question._id);
        }
      }

      // Then create all questions fresh
      const savedQuestions: Question[] = [];
      for (let i = 0; i < questionsToSave.length; i++) {
        const question = questionsToSave[i];
        const questionData = {
          formId,
          pageId,
          type: question.type,
          question: question.question,
          order: i,
          required: question.required || false,

          // Type-specific fields
          options: question.options,
          placeholder: question.placeholder,
          maxLength: question.maxLength,
          minLength: question.minLength,
          starCount: question.starCount,
          scaleStartLabel: question.scaleStartLabel,
          scaleEndLabel: question.scaleEndLabel,
          scaleMin: question.scaleMin,
          scaleMax: question.scaleMax,
          maxFiles: question.maxFiles,
          maxFileSizeMb: question.maxFileSizeMb,
          allowedTypes: question.allowedTypes,
        };

        const result = await questionAPI.createQuestion(questionData);
        if (result.success) {
          savedQuestions.push({
            ...result.data,
            id: result.data._id,
            selectedRating: question.selectedRating || 0,
            scaleValue: question.scaleValue || question.scaleMin || 0,
          });
        }
      }

      // Update local cache with backend IDs
      setPageQuestions((prev) => ({
        ...prev,
        [pageId]: savedQuestions,
      }));

      // Mark as saved
      setUnsavedChanges((prev) => ({
        ...prev,
        [pageId]: false,
      }));

      // Update current questions if this is the active page
      if (pageId === activeItem) {
        setQuestions(savedQuestions);
      }

      console.log(
        `✅ Saved ${savedQuestions.length} questions for page ${pageId}`
      );
    } catch (error) {
      console.error("Failed to save page questions:", error);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };

  // Update question locally only
  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    // Update local state immediately for UI responsiveness
    const updatedQuestions = questions.map((q) =>
      q.id === id ? { ...q, [field]: value } : q
    );
    setQuestions(updatedQuestions);

    // Update the page-specific cache
    if (activeItem) {
      setPageQuestions((prev) => ({
        ...prev,
        [activeItem]: updatedQuestions,
      }));

      // Mark page as having unsaved changes
      setUnsavedChanges((prev) => ({
        ...prev,
        [activeItem]: true,
      }));
    }
  };

  const updateOption = (
    questionId: string,
    optionIndex: number,
    value: string
  ) => {
    const updatedQuestions = questions.map((q) =>
      q.id === questionId && q.options
        ? {
            ...q,
            options: q.options.map((opt, idx) =>
              idx === optionIndex ? value : opt
            ),
          }
        : q
    );

    setQuestions(updatedQuestions);

    // Update the page-specific cache
    if (activeItem) {
      setPageQuestions((prev) => ({
        ...prev,
        [activeItem]: updatedQuestions,
      }));

      // Mark page as having unsaved changes
      setUnsavedChanges((prev) => ({
        ...prev,
        [activeItem]: true,
      }));
    }
  };

  const addOption = (questionId: string) => {
    const updatedQuestions = questions.map((q) =>
      q.id === questionId && q.options
        ? { ...q, options: [...q.options, `Option ${q.options.length + 1}`] }
        : q
    );

    setQuestions(updatedQuestions);

    // Update the page-specific cache and mark as unsaved
    if (activeItem) {
      setPageQuestions((prev) => ({
        ...prev,
        [activeItem]: updatedQuestions,
      }));

      setUnsavedChanges((prev) => ({
        ...prev,
        [activeItem]: true,
      }));
    }
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    const updatedQuestions = questions.map((q) =>
      q.id === questionId && q.options && q.options.length > 2
        ? { ...q, options: q.options.filter((_, idx) => idx !== optionIndex) }
        : q
    );

    setQuestions(updatedQuestions);

    // Update the page-specific cache and mark as unsaved
    if (activeItem) {
      setPageQuestions((prev) => ({
        ...prev,
        [activeItem]: updatedQuestions,
      }));

      setUnsavedChanges((prev) => ({
        ...prev,
        [activeItem]: true,
      }));
    }
  };

  const addQuestion = (type: Question["type"] = "short") => {
    if (!formId || !activeItem) return;

    const tempId = `temp_${Date.now()}`;
    const newQuestion: Question = {
      id: tempId,
      formId,
      pageId: activeItem,
      type: type,
      question: "What is ?",
      order: questions.length,
      required: false,
      options:
        type === "multiple-choice" ||
        type === "checkbox" ||
        type === "dropdowns"
          ? ["Option 01", "Option 02"]
          : undefined,
      starCount: type === "rating" ? 5 : undefined,
      selectedRating: type === "rating" ? 0 : undefined,
      scaleStartLabel: type === "LinearScale" ? "Scale Starting" : undefined,
      scaleEndLabel: type === "LinearScale" ? "Scale Ending" : undefined,
      scaleMin: type === "LinearScale" ? 0 : undefined,
      scaleMax: type === "LinearScale" ? 10 : undefined,
      scaleValue: type === "LinearScale" ? 5 : undefined,
      maxFiles: type === "upload" ? 5 : undefined,
      maxFileSizeMb: type === "upload" ? 5 : undefined,
      allowedTypes:
        type === "upload"
          ? ["image", "video", "document", "spreadsheet"]
          : undefined,
    };

    // Add to local state immediately - NO API CALL
    const updatedQuestions = [...questions, newQuestion];
    setQuestions(updatedQuestions);

    // Update the page-specific cache and mark as unsaved
    if (activeItem) {
      setPageQuestions((prev) => ({
        ...prev,
        [activeItem]: updatedQuestions,
      }));

      setUnsavedChanges((prev) => ({
        ...prev,
        [activeItem]: true,
      }));
    }

    console.log(`📝 Added question locally (will sync when page changes)`);
  };

  const deleteQuestion = (questionId: string) => {
    const filteredQuestions = questions.filter((q) => q.id !== questionId);
    setQuestions(filteredQuestions);

    // Update the page-specific cache and mark as unsaved
    if (activeItem) {
      setPageQuestions((prev) => ({
        ...prev,
        [activeItem]: filteredQuestions,
      }));

      setUnsavedChanges((prev) => ({
        ...prev,
        [activeItem]: true,
      }));
    }

    console.log(`🗑️ Deleted question locally (will sync when page changes)`);
  };

  const setRating = (questionId: string, rating: number) => {
    const updatedQuestions = questions.map((q) =>
      q.id === questionId ? { ...q, selectedRating: rating } : q
    );

    setQuestions(updatedQuestions);

    // Update the page-specific cache and mark as unsaved
    if (activeItem) {
      setPageQuestions((prev) => ({
        ...prev,
        [activeItem]: updatedQuestions,
      }));

      setUnsavedChanges((prev) => ({
        ...prev,
        [activeItem]: true,
      }));
    }
  };

  // Manual save function for current page
  const saveCurrentPage = async () => {
    if (!activeItem || questions.length === 0) {
      console.log("No questions to save on current page");
      return;
    }

    try {
      await savePageQuestionsToBackend(activeItem, questions);
      console.log("✅ Current page saved successfully!");
      // Optionally show success message to user
    } catch (error) {
      console.error("Failed to save current page:", error);
      // Optionally show error message to user
    }
  };

  // Save draft function - saves all pages
  const saveDraft = async () => {
    if (!formId) return;

    setIsSaving(true);
    try {
      // Save current page first if it has unsaved changes
      if (activeItem && unsavedChanges[activeItem] && questions.length > 0) {
        await savePageQuestionsToBackend(activeItem, questions);
      }

      // Save all other pages with unsaved changes
      for (const [pageId, hasUnsavedChanges] of Object.entries(
        unsavedChanges
      )) {
        if (
          hasUnsavedChanges &&
          pageId !== activeItem &&
          pageQuestions[pageId]
        ) {
          await savePageQuestionsToBackend(pageId, pageQuestions[pageId]);
        }
      }

      console.log("✅ All pages saved successfully!");
      // Optionally show success message
    } catch (error) {
      console.error("Failed to save draft:", error);
      // Optionally show error message
    } finally {
      setIsSaving(false);
    }
  };

  const QuestionRenderer = ({
    question,
    index,
  }: {
    question: Question;
    index: number;
  }) => {
    const questionNumber = `Q${index + 1}`;

    return (
      <div className="question-container1">
        <div className="question-container">
          <div className="question-header">
            <span className="question-number">{questionNumber}</span>
            <input
              type="text"
              value={question.question}
              className="question-input editable-question"
              onChange={(e) =>
                updateQuestion(question.id!, "question", e.target.value)
              }
              placeholder="Enter your question here"
            />
            <select
              className="answer-type-dropdown"
              value={question.type}
              onChange={(e) =>
                updateQuestion(question.id!, "type", e.target.value)
              }
            >
              <option value="short">Short Answer</option>
              <option value="long">Long Answer</option>
              <option value="multiple-choice">Multiple Choice</option>
              <option value="dropdowns">Dropdowns</option>
              <option value="date">Date</option>
              <option value="time">Time</option>
              <option value="checkbox">Checkbox</option>
              <option value="rating">Rating</option>
              <option value="LinearScale">Linear Scale</option>
              <option value="upload">Upload</option>
            </select>

            {/* Delete button */}
            <button
              className="delete-question-btn"
              onClick={() => deleteQuestion(question.id!)}
              style={{
                marginLeft: "10px",
                padding: "5px 10px",
                backgroundColor: "#ff4444",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              Delete
            </button>
          </div>

          <div className="answer-area">
            {/* Reference Media Display */}
            {question.referenceMedia && (
              <div className="reference-media" style={{ marginBottom: "16px" }}>
                {question.referenceMedia.type === "image" ? (
                  <img
                    src={question.referenceMedia.url}
                    alt={question.referenceMedia.description}
                    style={{
                      maxWidth: "300px",
                      maxHeight: "200px",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <video
                    src={question.referenceMedia.url}
                    controls
                    style={{ maxWidth: "300px", maxHeight: "200px" }}
                  />
                )}
                <p>{question.referenceMedia.description}</p>
              </div>
            )}

            {/* Question type specific rendering (keeping your existing logic) */}
            {question.type === "short" && (
              <div className="short-answer-preview">
                <input
                  type="text"
                  className="editable-answer-input"
                  placeholder={question.placeholder || "Short answer text"}
                  maxLength={question.maxLength}
                  disabled
                />
              </div>
            )}

            {question.type === "long" && (
              <div className="long-answer-preview">
                <textarea
                  className="editable-answer-textarea"
                  rows={4}
                  placeholder={question.placeholder || "Long answer text"}
                  maxLength={question.maxLength}
                  disabled
                />
              </div>
            )}

            {question.type === "multiple-choice" && (
              <div className="multiple-choice-area">
                {question.options?.map((option, idx) => (
                  <div key={idx} className="option-row">
                    <input
                      type="radio"
                      name={`q${question.id}`}
                      className="radio-input"
                      disabled
                    />
                    <input
                      type="text"
                      value={option}
                      className="option-input editable"
                      onChange={(e) =>
                        updateOption(question.id!, idx, e.target.value)
                      }
                      placeholder="Enter option text"
                    />
                    {question.options && question.options.length > 2 && (
                      <button
                        className="delete-option-btn"
                        onClick={() => removeOption(question.id!, idx)}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  className="add-option-btn"
                  onClick={() => addOption(question.id!)}
                >
                  + Add option
                </button>
              </div>
            )}

            {/* Keep all your other question type renderings... */}
            {/* I'll include the upload type as an example */}
            {question.type === "upload" && (
              <div className="upload-area" style={{ marginTop: 24 }}>
                <div style={{ display: "flex", gap: 32, marginBottom: 16 }}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <span>Number of Files:</span>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={question.maxFiles || 1}
                      onChange={(e) =>
                        updateQuestion(
                          question.id!,
                          "maxFiles",
                          Number(e.target.value)
                        )
                      }
                      style={{
                        width: "48px",
                        textAlign: "center",
                        borderRadius: "10px",
                        border: "none",
                        background: "#E9F1F7",
                        fontWeight: 600,
                        fontSize: "16px",
                        padding: "4px 0",
                      }}
                    />
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <span>Max File Size:</span>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={question.maxFileSizeMb || 1}
                      onChange={(e) =>
                        updateQuestion(
                          question.id!,
                          "maxFileSizeMb",
                          Number(e.target.value)
                        )
                      }
                      style={{
                        width: "48px",
                        textAlign: "center",
                        borderRadius: "10px",
                        border: "none",
                        background: "#E9F1F7",
                        fontWeight: 600,
                        fontSize: "16px",
                        padding: "4px 0",
                        marginRight: 4,
                      }}
                    />
                    <span
                      style={{
                        background: "#E9F1F7",
                        borderRadius: "10px",
                        padding: "4px 12px",
                        fontWeight: 600,
                        fontSize: "16px",
                      }}
                    >
                      mb
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 16,
                    maxWidth: 520,
                  }}
                >
                  {[
                    "image",
                    "pdf",
                    "ppt",
                    "document",
                    "video",
                    "zip",
                    "audio",
                    "spreadsheet",
                  ].map((type) => (
                    <label
                      key={type}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontWeight: 500,
                        fontSize: 16,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={question.allowedTypes?.includes(type) || false}
                        onChange={(e) => {
                          const allowed = question.allowedTypes || [];
                          if (e.target.checked) {
                            updateQuestion(question.id!, "allowedTypes", [
                              ...allowed,
                              type,
                            ]);
                          } else {
                            updateQuestion(
                              question.id!,
                              "allowedTypes",
                              allowed.filter((t) => t !== type)
                            );
                          }
                        }}
                        style={{
                          width: 18,
                          height: 18,
                          accentColor: "#4BA3FD",
                          borderRadius: 4,
                        }}
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="form-container">
      <Sidebar
        activeItem={activeItem}
        onItemClick={handleItemClick}
        pages={allPages}
        createNextPage={createNextPage}
      />
      <main className="form-main-content">
        <div className="form-content-wrapper">
          <FormHeader title={formTitle} />

          {/* Save Buttons */}
          <div
            style={{
              padding: "10px",
              textAlign: "right",
              display: "flex",
              gap: "10px",
              justifyContent: "flex-end",
            }}
          >
            <button
              onClick={saveCurrentPage}
              disabled={!activeItem || !unsavedChanges[activeItem] || isSyncing}
              style={{
                padding: "8px 16px",
                backgroundColor: unsavedChanges[activeItem]
                  ? "#28a745"
                  : "#ccc",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor:
                  unsavedChanges[activeItem] && !isSyncing
                    ? "pointer"
                    : "not-allowed",
                fontSize: "14px",
              }}
            >
              {isSyncing ? "Syncing..." : "Save Current Page"}
            </button>

            <button
              onClick={saveDraft}
              disabled={isSaving}
              style={{
                padding: "10px 20px",
                backgroundColor: isSaving ? "#ccc" : "#4BA3FD",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: isSaving ? "not-allowed" : "pointer",
              }}
            >
              {isSaving ? "Saving All..." : "Save All Pages"}
            </button>
          </div>

          <div className="form-builder-content">
            <div className="form-builder-main">
              {loading ? (
                <div className="loading">Loading questions...</div>
              ) : questions.length === 0 ? (
                <div className="empty-canvas">
                  <p>Click "Add Question" to start building your form</p>
                  <p>
                    <strong>Current Page:</strong>{" "}
                    {allPages.find((p) => p._id === activeItem)?.title ||
                      "No page selected"}
                  </p>
                </div>
              ) : (
                <>
                  <div
                    style={{
                      marginBottom: "16px",
                      padding: "10px",
                      backgroundColor: "#f5f5f5",
                      borderRadius: "4px",
                    }}
                  >
                    <strong>Current Page:</strong>{" "}
                    {allPages.find((p) => p._id === activeItem)?.title ||
                      "Unknown Page"}
                    <span style={{ marginLeft: "20px", color: "#666" }}>
                      ({questions.length} question
                      {questions.length !== 1 ? "s" : ""})
                    </span>
                    {unsavedChanges[activeItem] && (
                      <span
                        style={{
                          marginLeft: "20px",
                          color: "#ff6b35",
                          fontWeight: "bold",
                          backgroundColor: "#fff3cd",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          fontSize: "12px",
                        }}
                      >
                        ● UNSAVED CHANGES
                      </span>
                    )}
                    {isSyncing && (
                      <span
                        style={{
                          marginLeft: "10px",
                          color: "#007bff",
                          fontStyle: "italic",
                        }}
                      >
                        Syncing...
                      </span>
                    )}
                  </div>
                  {questions.map((question, index) => (
                    <QuestionRenderer
                      key={question.id}
                      question={question}
                      index={index}
                    />
                  ))}
                </>
              )}
            </div>
            <div>
              <RightSidebar
                onAddQuestion={addQuestion}
                onAddText={handleAddText}
                onAddCondition={handleAddCondition}
                onAddImage={handleAddImage}
                onAddVideo={handleAddVideo}
                onAddSections={handleAddSections}
                backgroundColor={backgroundColor}
                sectionColor={sectionColor}
                onBackgroundColorChange={setBackgroundColor}
                onSectionColorChange={setSectionColor}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FormBuilderPage;
