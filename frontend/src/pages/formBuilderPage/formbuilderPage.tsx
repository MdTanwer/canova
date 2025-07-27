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

const FormBuilderPage: React.FC = () => {
  const [activeItem, setActiveItem] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#646464");
  const [sectionColor, setSectionColor] = useState("#646464");
  const [allPages, setAllPages] = useState<Page[]>([]);
  const [formTitle, setFormTitle] = useState<string>("");
  const { id: formId } = useParams<{ id: string; pageId: string }>();
  const [questions, setQuestions] = useState<Question[]>([]);

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

  const handleItemClick = (item: string) => {
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

  interface Question {
    id: string;
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
    options?: string[];
    starCount?: number; // Only for rating
    selectedRating?: number; // Only for rating
    scaleStartLabel?: string; // Only for linear scale
    scaleEndLabel?: string; // Only for linear scale
    scaleMin?: number; // Only for linear scale
    scaleMax?: number; // Only for linear scale
    scaleValue?: number; // Only for linear scale
    maxFiles?: number; // Only for upload
    maxFileSizeMb?: number; // Only for upload
    allowedTypes?: string[]; // Only for upload
  }

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  const updateOption = (
    questionId: string,
    optionIndex: number,
    value: string
  ) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId && q.options
          ? {
              ...q,
              options: q.options.map((opt, idx) =>
                idx === optionIndex ? value : opt
              ),
            }
          : q
      )
    );
  };

  const addOption = (questionId: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId && q.options
          ? { ...q, options: [...q.options, `Option ${q.options.length + 1}`] }
          : q
      )
    );
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId && q.options && q.options.length > 2
          ? { ...q, options: q.options.filter((_, idx) => idx !== optionIndex) }
          : q
      )
    );
  };
  const addQuestion = (type: Question["type"] = "short") => {
    const newQuestion: Question = {
      id: `q${questions.length + 1}`,
      type: type,
      question: "What is ?",
      options:
        type === "multiple-choice" ? ["Option 01", "Option 02"] : undefined,
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
    setQuestions([...questions, newQuestion]);
  };

  const setRating = (questionId: string, rating: number) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId ? { ...q, selectedRating: rating } : q
      )
    );
  };

  const QuestionRenderer = ({
    question,
    index,
  }: {
    question: Question;
    index: number;
  }) => {
    const questionNumber = `Q${index + 1}`;

    const getAnswerTypeLabel = (type: string) => {
      switch (type) {
        case "short":
          return "Short Answer";
        case "long":
          return "Long Answer";
        case "multiple-choice":
          return "Multiple Choice";
        case "time":
          return "Time";
        case "rating":
          return "Rating";
        default:
          return "Short Answer";
      }
    };

    return (
      <div className="question-container1">
        {" "}
        <div className="question-container">
          <div className="question-header">
            <span className="question-number">{questionNumber}</span>
            <input
              type="text"
              value={question.question}
              className="question-input editable-question"
              onChange={(e) =>
                updateQuestion(question.id, "question", e.target.value)
              }
              placeholder="Enter your question here"
            />
            <select
              className="answer-type-dropdown"
              value={question.type}
              onChange={(e) =>
                updateQuestion(question.id, "type", e.target.value)
              }
            >
              <option
                className="answer-type-option"
                style={{ border: "1px solid #00000" }}
                value="short"
              >
                Short Answer
              </option>
              <option className="answer-type-option" value="long">
                Long Answer
              </option>
              <option className="answer-type-option" value="multiple-choice">
                Multiple Choice
              </option>
              <option className="answer-type-option" value="multiple-choice">
                Multiple Choice
              </option>{" "}
              <option className="answer-type-option" value="dropdown">
                dropdowns
              </option>
              <option className="answer-type-option" value="date">
                Date
              </option>
              <option className="answer-type-option" value="time">
                Time
              </option>
              <option className="answer-type-option" value="checkbox">
                Checkbox
              </option>
              <option className="answer-type-option" value="rating">
                Rating
              </option>
              <option className="answer-type-option" value="LinearScale">
                Linear Scale
              </option>
              <option className="answer-type-option" value="upload">
                Upload
              </option>
            </select>
          </div>

          <div className="answer-area">
            {question.type === "short" && (
              <div className="shohrt-answer-preview">
                <textarea className="editable-answer-input" />
              </div>
            )}

            {question.type === "long" && (
              <div className="long-ooanswer-preview">
                <textarea className="editable-answer-textarea" rows={4} />
              </div>
            )}

            {question.type === "multiple-choice" && (
              <div className="multiple-choice-area">
                <label className="question-option">
                  <input type="radio" name="question-option" />
                  <span className="question-option-label">Option 01</span>
                </label>
                <label className="question-option">
                  <input type="radio" name="question-option" />
                  <span className="question-option-label">Option 01</span>
                </label>
                {question.options?.map((option, idx) => (
                  <div key={idx} className="option-row">
                    <input
                      type="radio"
                      name={`q${question.id}`}
                      className="radio-input"
                    />
                    <input
                      type="text"
                      value={option}
                      className="option-input editable"
                      onChange={(e) =>
                        updateOption(question.id, idx, e.target.value)
                      }
                      placeholder="Enter option text"
                    />
                    {question.options && question.options.length > 2 && (
                      <button
                        className="delete-option-btn"
                        onClick={() => removeOption(question.id, idx)}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  className="add-option-btn"
                  onClick={() => addOption(question.id)}
                >
                  + Add option
                </button>
              </div>
            )}

            {question.type === "checkbox" && (
              <div className="multiple-choice-area">
                <label className="question-option">
                  <input
                    type="checkbox"
                    className="question-option-checkbox"
                    name="question-option-checkbox"
                  />
                  <span className="question-option-label">Option 01</span>
                </label>
                <label className="question-option">
                  <input
                    type="checkbox"
                    className="question-option-checkbox"
                    name="question-option-checkbox"
                  />
                  <span className="question-option-label">Option 01</span>
                </label>
                {question.options?.map((option, idx) => (
                  <div key={idx} className="option-row">
                    <input
                      type="radio"
                      name={`q${question.id}`}
                      className="radio-input"
                    />
                    <input
                      type="text"
                      value={option}
                      className="option-input editable"
                      onChange={(e) =>
                        updateOption(question.id, idx, e.target.value)
                      }
                      placeholder="Enter option text"
                    />
                    {question.options && question.options.length > 2 && (
                      <button
                        className="delete-option-btn"
                        onClick={() => removeOption(question.id, idx)}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  className="add-option-btn"
                  onClick={() => addOption(question.id)}
                >
                  + Add option
                </button>
              </div>
            )}

            {question.type === "checkbox" && (
              <div className="multiple-choice-area">
                <label className="question-option">
                  <input
                    type="checkbox"
                    className="question-option-checkbox"
                    name="question-option-checkbox"
                  />
                  <span className="question-option-label">Option 01</span>
                </label>
                <label className="question-option">
                  <input
                    type="checkbox"
                    className="question-option-checkbox"
                    name="question-option-checkbox"
                  />
                  <span className="question-option-label">Option 01</span>
                </label>
                {question.options?.map((option, idx) => (
                  <div key={idx} className="option-row">
                    <input
                      type="radio"
                      name={`q${question.id}`}
                      className="radio-input"
                    />
                    <input
                      type="text"
                      value={option}
                      className="option-input editable"
                      onChange={(e) =>
                        updateOption(question.id, idx, e.target.value)
                      }
                      placeholder="Enter option text"
                    />
                    {question.options && question.options.length > 2 && (
                      <button
                        className="delete-option-btn"
                        onClick={() => removeOption(question.id, idx)}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  className="add-option-btn"
                  onClick={() => addOption(question.id)}
                >
                  + Add option
                </button>
              </div>
            )}

            {question.type === "dropdown" && (
              <div className="multiple-choice-area">
                <select className="dropdown-preview">
                  {question.options?.map((option, idx) => (
                    <option key={idx} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {question.options?.map((option, idx) => (
                  <div key={idx} className="option-row">
                    <input
                      type="text"
                      value={option}
                      className="option-input editable"
                      onChange={(e) =>
                        updateOption(question.id, idx, e.target.value)
                      }
                      placeholder="Enter option text"
                    />
                    {question.options && question.options.length > 2 && (
                      <button
                        className="delete-option-btn"
                        onClick={() => removeOption(question.id, idx)}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  className="add-option-btn"
                  onClick={() => addOption(question.id)}
                >
                  + Add option
                </button>
              </div>
            )}

            {question.type === "time" && (
              <div className="time-answer-preview">
                <input
                  type="time"
                  className="editable-time-input"
                  defaultValue="12:00"
                />
              </div>
            )}

            {question.type === "rating" && (
              <div
                className="rating-answer-preview"
                style={{ display: "flex", alignItems: "center", gap: "32px" }}
              >
                <div
                  className="rating-scale"
                  style={{ display: "flex", gap: "8px" }}
                >
                  {Array.from({ length: question.starCount || 5 }).map(
                    (_, idx) => (
                      <svg
                        key={idx}
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill={
                          question.selectedRating &&
                          idx < question.selectedRating
                            ? "#FF3B30"
                            : "#E0E0E0"
                        }
                        stroke={
                          question.selectedRating &&
                          idx < question.selectedRating
                            ? "#FF3B30"
                            : "#E0E0E0"
                        }
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ cursor: "pointer" }}
                        onClick={() => setRating(question.id, idx + 1)}
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    )
                  )}
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <span>Star Count:</span>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={question.starCount || 5}
                    onChange={(e) =>
                      updateQuestion(
                        question.id,
                        "starCount",
                        Number(e.target.value)
                      )
                    }
                    style={{
                      width: "40px",
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
              </div>
            )}
            {question.type === "date" && (
              <div
                className="date-answer-preview"
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <input
                  type="date"
                  className="editable-date-input"
                  placeholder="DD/MM/YYYY"
                  style={{ fontSize: "18px", padding: "8px 12px" }}
                />
                <span style={{ display: "flex", alignItems: "center" }}>
                  {/* Simple calendar SVG icon */}
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="3"
                      y="4"
                      width="18"
                      height="18"
                      rx="2"
                      ry="2"
                    ></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </span>
              </div>
            )}
            {question.type === "LinearScale" && (
              <div className="linear-scale-area" style={{ marginTop: 24 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 16,
                  }}
                >
                  <input
                    type="text"
                    value={question.scaleStartLabel}
                    onChange={(e) =>
                      updateQuestion(
                        question.id,
                        "scaleStartLabel",
                        e.target.value
                      )
                    }
                    style={{
                      background: "#E9F1F7",
                      border: "none",
                      borderRadius: "12px",
                      padding: "12px 32px",
                      fontWeight: 600,
                      fontStyle: "italic",
                      textAlign: "center",
                      fontSize: "18px",
                      width: "220px",
                    }}
                  />
                  <input
                    type="text"
                    value={question.scaleEndLabel}
                    onChange={(e) =>
                      updateQuestion(
                        question.id,
                        "scaleEndLabel",
                        e.target.value
                      )
                    }
                    style={{
                      background: "#E9F1F7",
                      border: "none",
                      borderRadius: "12px",
                      padding: "12px 32px",
                      fontWeight: 600,
                      fontStyle: "italic",
                      textAlign: "center",
                      fontSize: "18px",
                      width: "220px",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 16,
                  }}
                >
                  <span style={{ color: "#A0A0A0", fontSize: 16 }}>
                    {question.scaleMin}
                  </span>
                  <div style={{ position: "relative", width: 320 }}>
                    <input
                      type="range"
                      min={question.scaleMin}
                      max={question.scaleMax}
                      value={question.scaleValue}
                      onChange={(e) =>
                        updateQuestion(
                          question.id,
                          "scaleValue",
                          Number(e.target.value)
                        )
                      }
                      style={{
                        width: "100%",
                        accentColor: "#4BA3FD",
                        height: 6,
                        borderRadius: 3,
                        background: "#E0E0E0",
                      }}
                    />
                    {/* Thumb value and checkmark */}
                    <div
                      style={{
                        position: "absolute",
                        left: `calc(${
                          ((question.scaleValue - question.scaleMin) /
                            (question.scaleMax - question.scaleMin)) *
                          100
                        }% - 18px)`,
                        top: -28,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        pointerEvents: "none",
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          background: "#4BA3FD",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: 18,
                          boxShadow: "0 2px 8px rgba(75,163,253,0.15)",
                          border: "3px solid #fff",
                        }}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#fff"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <span
                        style={{
                          color: "#4BA3FD",
                          fontWeight: 600,
                          fontSize: 18,
                          marginTop: 4,
                        }}
                      >
                        {question.scaleValue}
                      </span>
                    </div>
                  </div>
                  <span style={{ color: "#A0A0A0", fontSize: 16 }}>
                    {question.scaleMax}
                  </span>
                </div>
              </div>
            )}
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
                          question.id,
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
                          question.id,
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
                            updateQuestion(question.id, "allowedTypes", [
                              ...allowed,
                              type,
                            ]);
                          } else {
                            updateQuestion(
                              question.id,
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
          <div className="form-builder-content">
            <div className="form-builder-main">
              {questions.length === 0 ? (
                <div className="empty-canvas">
                  <p>Click "Add Question" to start building your form</p>
                </div>
              ) : (
                questions.map((question, index) => (
                  <QuestionRenderer
                    key={question.id}
                    question={question}
                    index={index}
                  />
                ))
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
