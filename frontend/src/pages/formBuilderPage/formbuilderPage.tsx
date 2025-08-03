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
  // createCondition,
} from "../../api/formBuilderApi";
import {
  createQuestion,
  getQuestionsByPage,
  deleteQuestion1,
} from "../../api/formBuilderQ$A";
import type { Page, Question } from "../../types/types";
import Uploadmedia from "../../components/uploadmedia/uploadmedia";

import AddDes from "../../components/addDescriptionForm/addDes";
import Addcolorform from "../../components/addcolorform/addcolorform";

const FormBuilderPage: React.FC = () => {
  const [activeItem, setActiveItem] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#646464");
  const [sectionColor, setSectionColor] = useState("#646464");
  const [allPages, setAllPages] = useState<Page[]>([]);
  const [formTitle, setFormTitle] = useState<string>("");
  const { id: formId } = useParams<{ id: string; pageId: string }>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [conditionModel, setConditionModel] = useState(false);
  const [condition, setCondition] = useState(false);
  const [selectedConditionOptions, setSelectedConditionOptions] = useState<{
    [questionId: string]: number;
  }>({});
  const [formbColor, setFormbColor] = useState(false);
  const [descriptionForm, setDescriptionForm] = useState(false);

  const [referenceUrl, setReferenceUrl] = useState("");

  const [openuploadMedia, setOpenuploadMedia] = useState(false);
  console.log(referenceUrl);
  const [currentUploadingQuestionId, setCurrentUploadingQuestionId] = useState<
    string | null
  >(null);
  const [showTypeSelector, setShowTypeSelector] = useState<{
    [questionId: string]: boolean;
  }>({});

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
        const result = (await getQuestionsByPage(activeItem)) as {
          data: Question[];
        };
        const questionsArray = result.data || [];
        // Convert backend questions to frontend format
        const formattedQuestions = questionsArray.map((q: Question) => ({
          ...q,
          id: q._id, // Use MongoDB ID as frontend ID
          selectedRating: q.selectedRating || 0, // Initialize UI state
          scaleValue: q.scaleMin || 0, // Initialize UI state
          dateAnswer: q.dateAnswer
            ? typeof q.dateAnswer === "string"
              ? q.dateAnswer.slice(0, 10)
              : q.dateAnswer
            : "",
        }));

        // Store questions for this page
        setPageQuestions((prev) => ({
          ...prev,
          [activeItem]: formattedQuestions,
        }));

        setQuestions(formattedQuestions);
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

  // const backgroundColor = () => {
  //   console.log("");
  // };
  const handleAddText = () => {
    setDescriptionForm(true);
  };

  const handleAddCondition = async () => {
    if (activeItem && questions.length > 0) {
      try {
        await savePageQuestionsToBackend(activeItem, questions);
        console.log("✅ Questions saved before adding condition");
      } catch (error) {
        console.error(
          "Failed to save questions before adding condition:",
          error
        );
        alert("Please save your questions first before adding conditions");
        return;
      }
    }
    setCondition(true);
  };

  const handleAddImage = () => {
    setOpenuploadMedia(true);
  };

  const handleAddVideo = () => {
    setOpenuploadMedia(true);
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
      // First, delete all existing questions for this page
      const existingQuestions = await getQuestionsByPage(pageId);
      if (existingQuestions.success && existingQuestions.data) {
        for (const question of existingQuestions.data) {
          if (question._id) {
            await deleteQuestion1(question._id);
          }
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
          selectedRating: question.selectedRating,
          minLength: question.minLength,
          starCount: question.starCount,
          scaleStartLabel: question.scaleStartLabel,
          scaleEndLabel: question.scaleEndLabel,
          scaleMin: question.scaleMin,
          scaleMax: question.scaleMax,
          maxFiles: question.maxFiles,
          maxFileSizeMb: question.maxFileSizeMb,
          allowedTypes: question.allowedTypes,
          dateAnswer: question.dateAnswer,
          selectedScale: question.selectedScale,
          correctAnswer: question.correctAnswer,
          correctAnswers: question.correctAnswers,
          referenceUrl: question.referenceUrl,
        };

        const result = (await createQuestion(questionData)) as {
          success: boolean;
          data: Question;
        };
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
    }
  };

  // Update question locally only
  const updateQuestion = (
    id: string,
    field: keyof Question,
    value: Question[keyof Question],
    referenceUrl?: string
  ) => {
    // Update local state immediately for UI responsiveness
    const updatedQuestions = questions.map((q) => {
      if (q.id === id) {
        const updatedQuestion = { ...q, [field]: value };

        // Add referenceUrl if provided
        if (referenceUrl !== undefined) {
          updatedQuestion.referenceUrl = referenceUrl;
        }

        return updatedQuestion;
      }
      return q;
    });
    setQuestions(updatedQuestions);

    console.log("Updated questions:", updatedQuestions); // Debug log

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

  // Update addOption to save questions and open condition modal
  const addOption = async (questionId: string) => {
    console.log("Adding option to question:", questionId); // Debug log

    const updatedQuestions = questions.map((q) => {
      if (q.id === questionId) {
        const currentOptions = q.options || [];
        const newOptions = [
          ...currentOptions,
          `Option ${currentOptions.length + 1}`,
        ];

        return { ...q, options: newOptions };
      }
      return q;
    });

    console.log("Updated questions:", updatedQuestions); // Debug log
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
    const updatedQuestions = questions.map((q) => {
      if (q.id === questionId && q.options && q.options.length > 2) {
        const newOptions = q.options.filter((_, idx) => idx !== optionIndex);

        // ✅ Handle correct answer adjustment
        const updatedQuestion = { ...q, options: newOptions };

        if (q.type === "multiple-choice" || q.type === "dropdowns") {
          // Handle single correct answer
          if (q.correctAnswer === optionIndex) {
            // Reset correct answer if deleted option was correct
            updatedQuestion.correctAnswer = undefined;
          } else if (
            q.correctAnswer !== undefined &&
            q.correctAnswer > optionIndex
          ) {
            // Adjust index if correct answer is after deleted option
            updatedQuestion.correctAnswer = q.correctAnswer - 1;
          }
        } else if (q.type === "checkbox") {
          // Handle multiple correct answers
          if (q.correctAnswers) {
            updatedQuestion.correctAnswers = q.correctAnswers
              .filter((idx) => idx !== optionIndex) // Remove deleted option
              .map((idx) => (idx > optionIndex ? idx - 1 : idx)); // Adjust indices
          }
        }

        return updatedQuestion;
      }
      return q;
    });

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
      referenceUrl: "",
      options:
        type === "multiple-choice" ||
        type === "checkbox" ||
        type === "dropdowns"
          ? ["Option 01", "Option 02"]
          : undefined,
      // ✅ Initialize correct answer fields
      correctAnswer:
        type === "multiple-choice" || type === "dropdowns"
          ? undefined // Will be set when user clicks radio button
          : undefined,
      correctAnswers:
        type === "checkbox"
          ? [] // Empty array for multi-select
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
      selectedScale: type === "LinearScale" ? 0 : undefined,
      allowedTypes:
        type === "upload"
          ? ["image", "video", "document", "spreadsheet"]
          : undefined,
      dateAnswer: type === "date" ? new Date() : undefined,
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

    console.log(` Added question locally (will sync when page changes)`);
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

    deleteQuestion1(questionId);
  };

  const setRating = (questionId: string, rating: number) => {
    console.log("Rating:", rating);
    const updatedQuestions = questions.map((q) =>
      q.id === questionId ? { ...q, selectedRating: rating } : q
    );

    setQuestions(updatedQuestions);
    console.log("Updated questions:", updatedQuestions);

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

  const QuestionRenderer = ({
    question,
    index,
  }: {
    question: Question;
    index: number;
  }) => {
    const questionNumber = `Q${index + 1}`;

    console.log("question", question);

    // Function to handle upload for specific question
    const handleUploadForQuestion = (questionId: string) => {
      setCurrentUploadingQuestionId(questionId);
      setOpenuploadMedia(true);
    };
    return (
      <div className="question-container1">
        <div className="question-container ">
          <div className="question-header">
            <span className="question-number">{questionNumber}</span>
            <input
              type="text"
              defaultValue={question.question} // ✅ Use defaultValue like short answer
              className="question-input editable-question"
              onKeyDown={(e) => {
                // ✅ Handle backspace for double-delete functionality
                if (
                  e.key === "Backspace" &&
                  (e.target as HTMLInputElement).value === ""
                ) {
                  // If question is empty and backspace is pressed, delete the entire question
                  e.preventDefault();
                  deleteQuestion(question.id!);
                }
              }}
              onBlur={(e) => {
                // ✅ Update only when user finishes editing
                updateQuestion(question.id!, "question", e.target.value);
              }}
              placeholder="Enter your question here"
            />
            <select
              key={`${question.id}-type`}
              className="answer-type-dropdown"
              value={question.type}
              onChange={(e) => {
                const newType = e.target.value;
                updateQuestion(question.id!, "type", newType);

                // If changed to upload type, automatically trigger upload
                if (newType === "upload") {
                  setTimeout(() => {
                    handleUploadForQuestion(question.id!);
                  }, 100);
                }

                // Hide type selector after selection
                setShowTypeSelector((prev) => ({
                  ...prev,
                  [question.id!]: false,
                }));
              }}
            >
              <option value="short">Short Answer</option>
              <option value="long">Long Answer</option>
              <option value="multiple-choice">Multiple Choice</option>

              <option value="date">Date</option>
              <option value="checkbox">Checkbox</option>
              <option value="rating">Rating</option>
              <option value="LinearScale">Linear Scale</option>
              <option value="upload">Upload</option>
            </select>
          </div>

          <div className="answer-area">
            {/* Reference Media Display */}

            {question.referenceUrl && (
              <div
                className="reference-media-container"
                style={{
                  marginBottom: "16px",
                  padding: "12px",
                  border: "2px dashed #e0e0e0",
                  borderRadius: "8px",
                  backgroundColor: "#f9f9f9",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#666",
                    }}
                  >
                    📎 Reference Media
                  </span>
                  <button
                    onClick={() =>
                      updateQuestion(question.id!, "referenceUrl", "")
                    }
                    style={{
                      background: "none",
                      border: "none",
                      color: "#ff4444",
                      cursor: "pointer",
                      fontSize: "16px",
                    }}
                    title="Remove reference"
                  >
                    ✕
                  </button>
                </div>

                {/* Display based on media type */}
                {question.referenceUrl.includes("image") ||
                question.referenceUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                  <img
                    src={question.referenceUrl}
                    alt="Reference"
                    style={{
                      maxWidth: "200px",
                      maxHeight: "150px",
                      borderRadius: "4px",
                      objectFit: "cover",
                    }}
                  />
                ) : question.referenceUrl.includes("video") ||
                  question.referenceUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                  <video
                    controls
                    style={{
                      maxWidth: "200px",
                      maxHeight: "150px",
                      borderRadius: "4px",
                    }}
                  >
                    <source src={question.referenceUrl} />
                  </video>
                ) : (
                  <div
                    style={{
                      padding: "8px",
                      backgroundColor: "#e9f1f7",
                      borderRadius: "4px",
                      fontSize: "14px",
                    }}
                  >
                    🔗{" "}
                    <a
                      href={question.referenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {question.referenceUrl}
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* ✅ FIXED SHORT ANSWER INPUT */}
            {question.type === "short" && (
              <textarea
                className="editable-answer-input"
                defaultValue={question.placeholder || ""} // ✅ Use defaultValue instead
                onBlur={(e) => {
                  // Only update when user finishes editing (loses focus)
                  updateQuestion(question.id!, "placeholder", e.target.value);
                }}
                placeholder="Enter placeholder text"
              />

              // </div>
            )}

            {question.type === "long" && (
              <div className="long-answer-previewW">
                <textarea
                  className="editable-answer-textarea"
                  defaultValue={question.placeholder || ""} // ✅ Use defaultValue
                  onBlur={(e) => {
                    // ✅ Update only when user finishes editing
                    updateQuestion(
                      question.id!,
                      "placeholder",
                      e.target.value,
                      "abc.url.com"
                    );
                  }}
                  placeholder="Set placeholder text"
                  rows={4}
                />
              </div>
            )}

            {question.type === "multiple-choice" && (
              <div className="multiple-choice-area">
                {question.options?.map((option, idx) => (
                  <div
                    key={`${question.id}-option-${idx}`}
                    className="option-row"
                    style={{ paddingBottom: "10px" }}
                  >
                    <div className="option-row-input">
                      <input
                        type="radio"
                        name={`q${question.id}`}
                        className="radio-radio-input"
                        // ✅ Check if this option is the correct answer
                        checked={question.correctAnswer === idx}
                        onChange={() => {
                          // ✅ Update the correct answer when radio is selected
                          updateQuestion(question.id!, "correctAnswer", idx);
                        }}
                      />
                      <input
                        key={`${question.id}-option-input-${idx}`}
                        type="text"
                        defaultValue={option}
                        onKeyDown={(e) => {
                          if (
                            e.key === "Backspace" &&
                            (e.target as HTMLInputElement).value === ""
                          ) {
                            e.preventDefault();
                            removeOption(question.id!, idx);
                          }
                        }}
                        onBlur={(e) => {
                          updateOption(question.id!, idx, e.target.value);
                        }}
                        className="option-input editable"
                        style={{ border: "none" }}
                        placeholder="Enter option text"
                      />
                    </div>
                    {condition && (
                      <input
                        type="radio"
                        name={`condition-q${question.id}`}
                        className="radio-input"
                        checked={selectedConditionOptions[question.id!] === idx}
                        onChange={() => {
                          console.log("Selected condition:", {
                            frontendId: question.id,
                            mongoId: question._id,
                            option: question.options?.[idx],
                            optionIndex: idx,
                          });

                          setSelectedConditionOptions((prev) => ({
                            ...prev,
                            [question.id!]: idx,
                          }));
                        }}
                      />
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

            {question.type === "checkbox" && (
              <div className="multiple-choice-area">
                {question.options?.map((option, idx) => (
                  <div
                    key={`${question.id}-option-${idx}`}
                    className="option-row"
                    style={{ paddingBottom: "10px" }}
                  >
                    <input
                      type="checkbox"
                      name={`q${question.id}`}
                      className="checkbox-question-option-checkbox"
                      // ✅ Check if this option is in the correct answers array
                      checked={question.correctAnswers?.includes(idx) || false}
                      onChange={(e) => {
                        // ✅ Update the correct answers array when checkbox is toggled
                        const currentCorrectAnswers =
                          question.correctAnswers || [];
                        let updatedCorrectAnswers;

                        if (e.target.checked) {
                          // Add this option to correct answers
                          updatedCorrectAnswers = [
                            ...currentCorrectAnswers,
                            idx,
                          ];
                        } else {
                          // Remove this option from correct answers
                          updatedCorrectAnswers = currentCorrectAnswers.filter(
                            (answerIdx) => answerIdx !== idx
                          );
                        }

                        updateQuestion(
                          question.id!,
                          "correctAnswers",
                          updatedCorrectAnswers
                        );
                      }}
                    />
                    <input
                      key={`${question.id}-option-input-${idx}`}
                      type="text"
                      defaultValue={option}
                      onKeyDown={(e) => {
                        if (
                          e.key === "Backspace" &&
                          (e.target as HTMLInputElement).value === "" &&
                          question.options &&
                          question.options.length > 2
                        ) {
                          e.preventDefault();
                          removeOption(question.id!, idx);
                        }
                      }}
                      onBlur={(e) => {
                        updateOption(question.id!, idx, e.target.value);
                      }}
                      className="option-input editable"
                      placeholder="Enter option text"
                      style={{ border: "none" }}
                    />
                    {/* ✅ Visual indicator for correct answers */}
                    {question.correctAnswers?.includes(idx) && (
                      <span
                        className="correct-indicator"
                        style={{
                          marginLeft: "8px",
                          color: "#4CAF50",
                          fontWeight: "bold",
                          fontSize: "14px",
                        }}
                      >
                        ✓ Correct
                      </span>
                    )}
                  </div>
                ))}
                <button
                  className="add-option-btn"
                  onClick={() => addOption(question.id!)}
                >
                  + Add option
                </button>

                {/* ✅ Instructions for setting correct answers */}
                <div
                  className="correct-answer-help"
                  style={{
                    marginTop: "12px",
                    padding: "8px 12px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "6px",
                    fontSize: "14px",
                    color: "#666",
                  }}
                >
                  {question.correctAnswers &&
                    question.correctAnswers.length > 0 && (
                      <div style={{ marginTop: "4px", fontWeight: "500" }}>
                        Selected: {question.correctAnswers.length} correct
                        answer{question.correctAnswers.length !== 1 ? "s" : ""}
                      </div>
                    )}
                </div>
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
                        key={`${question.id}-star-${idx}`} // ✅ Stable key
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
                        onClick={() => setRating(question.id!, idx + 1)} // ✅ Added type assertion
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
                  <p
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
                  >
                    5
                  </p>
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
                  defaultValue={
                    question.dateAnswer
                      ? typeof question.dateAnswer === "string"
                        ? question.dateAnswer
                        : question.dateAnswer.toISOString().slice(0, 10)
                      : ""
                  }
                  onBlur={(e) => {
                    // ✅ Update only when user finishes editing
                    updateQuestion(question.id!, "dateAnswer", e.target.value);
                  }}
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
                  <p
                    style={{
                      background: "#E9F1F7",
                      border: "none",
                      borderRadius: "12px",
                      padding: "12px 32px",
                      fontWeight: 600,
                      fontFamily: "Inter",
                      textAlign: "center",
                      fontSize: "18px",
                      width: "220px",
                    }}
                  >
                    {" "}
                    Scale Starting{" "}
                  </p>
                  <p
                    style={{
                      background: "#E9F1F7",
                      border: "none",
                      borderRadius: "12px",
                      padding: "12px 32px",
                      fontWeight: 600,
                      fontFamily: "Inter",
                      textAlign: "center",
                      fontSize: "18px",
                      width: "220px",
                    }}
                  >
                    {" "}
                    Scale Ending
                  </p>
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
                      value={question.selectedScale}
                      onChange={(e) =>
                        updateQuestion(
                          question.id!,
                          "selectedScale",
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
                          (((question.scaleValue ?? 0) -
                            (question.scaleMin ?? 0)) /
                            ((question.scaleMax ?? 1) -
                              (question.scaleMin ?? 0))) *
                          100
                        }% - 18px)`,
                        top: -28,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        pointerEvents: "none",
                      }}
                    >
                      <span
                        style={{
                          color: "#4BA3FD",
                          fontWeight: 600,
                          fontSize: 18,
                          marginTop: 10,
                          marginLeft: 200,
                        }}
                      >
                        {question.selectedScale}
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
              <div className="upload-ui">
                <div className="upload-ui-content">
                  <div
                    className="upload-ui-header"
                    style={{ display: "flex", gap: 10 }}
                  >
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      Number of Files:
                      <span
                        style={{
                          backgroundColor: "#EDF2F7",
                          padding: "4px 10px",
                          borderRadius: 8,
                          fontWeight: 500,
                        }}
                      >
                        {referenceUrl.length}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: 16 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        image
                        <span
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 8,
                            backgroundColor: "#F7F9FA", // Light background
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)",
                          }}
                        >
                          ✓
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        video
                        <span
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 8,
                            backgroundColor: "#F7F9FA", // Light background
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)",
                          }}
                        >
                          ✓
                        </span>
                      </div>{" "}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        pdf
                        <span
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 8,
                            backgroundColor: "#F7F9FA", // Light background
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)",
                          }}
                        >
                          ✓
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {showTypeSelector[question.id!] && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      right: "0",
                      zIndex: 1000,
                      backgroundColor: "white",
                      border: "2px solid #4ba3fd",
                      borderRadius: "8px",
                      padding: "16px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      minWidth: "280px",
                    }}
                  >
                    <div
                      style={{
                        marginBottom: "12px",
                        fontWeight: "600",
                        color: "#333",
                      }}
                    >
                      🔄 Change Question Type
                    </div>
                    <div
                      style={{
                        marginBottom: "12px",
                        fontSize: "14px",
                        color: "#666",
                      }}
                    >
                      Select a new type for this question with reference media:
                    </div>

                    {/* Type Selection Grid */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "8px",
                        marginBottom: "12px",
                      }}
                    >
                      {[
                        {
                          value: "short",
                          label: "📝 Short Answer",
                          desc: "Single line text",
                        },
                        {
                          value: "long",
                          label: "📄 Long Answer",
                          desc: "Multi-line text",
                        },
                        {
                          value: "multiple-choice",
                          label: "⚪ Multiple Choice",
                          desc: "Single selection",
                        },
                        {
                          value: "checkbox",
                          label: "☑️ Checkbox",
                          desc: "Multi selection",
                        },
                        {
                          value: "rating",
                          label: "⭐ Rating",
                          desc: "Star rating",
                        },
                        {
                          value: "date",
                          label: "📅 Date",
                          desc: "Date picker",
                        },
                        {
                          value: "LinearScale",
                          label: "📊 Linear Scale",
                          desc: "Scale slider",
                        },
                        {
                          value: "upload",
                          label: "📤 Upload",
                          desc: "File upload",
                        },
                      ].map((type) => (
                        <button
                          key={type.value}
                          onClick={() => {
                            updateQuestion(question.id!, "type", type.value);
                            setShowTypeSelector((prev) => ({
                              ...prev,
                              [question.id!]: false,
                            }));

                            // If changing to upload, trigger upload again
                            if (type.value === "upload") {
                              setTimeout(() => {
                                handleUploadForQuestion(question.id!);
                              }, 100);
                            }
                          }}
                          style={{
                            padding: "8px",
                            border:
                              question.type === type.value
                                ? "2px solid #4ba3fd"
                                : "1px solid #ddd",
                            borderRadius: "6px",
                            backgroundColor:
                              question.type === type.value
                                ? "#f0f8ff"
                                : "white",
                            cursor: "pointer",
                            textAlign: "left",
                            fontSize: "12px",
                            transition: "all 0.2s",
                          }}
                        >
                          <div
                            style={{ fontWeight: "600", marginBottom: "2px" }}
                          >
                            {type.label}
                          </div>
                          <div style={{ color: "#666", fontSize: "10px" }}>
                            {type.desc}
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Close button */}
                    <button
                      onClick={() => {
                        setShowTypeSelector((prev) => ({
                          ...prev,
                          [question.id!]: false,
                        }));
                      }}
                      style={{
                        width: "100%",
                        padding: "6px",
                        backgroundColor: "#f5f5f5",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      ❌ Cancel
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  const [showPreview, setShowPreview] = useState(false);
  const handlePreview = () => {
    setShowPreview(true);
  };

  const addBackgroundColor = () => {
    console.log("");
    setFormbColor(true);
  };

  const addSectionColorChange = () => {
    console.log("dfkjkhd");
  };

  return (
    <div className="form-container">
      <Sidebar
        activeItem={activeItem}
        onItemClick={handleItemClick}
        pages={allPages}
        createNextPage={createNextPage}
        formbuilder={true}
      />
      <main className="form-main-content">
        <div className="form-content-wrapper">
          <FormHeader title={formTitle} onPreview={handlePreview} />

          <div className="form-builder-content">
            <div
              className="form-builder-main"
              style={{
                backgroundColor: condition ? "#E7EEF5" : "",
              }}
            >
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
            {condition && (
              <div
                onClick={() => {
                  const hasSelectedOptions =
                    Object.keys(selectedConditionOptions).length > 0;
                  if (!hasSelectedOptions) {
                    alert(
                      "Please select at least one option to create a condition"
                    );
                    return;
                  }
                  setConditionModel(true);
                }}
                className="add-condition-btn"
              >
                Add Condition
              </div>
            )}

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
                onBackgroundColorChange={addBackgroundColor}
                onSectionColorChange={addSectionColorChange}
              />
            </div>
          </div>
        </div>
      </main>

      {descriptionForm && <AddDes setDescriptionForm={setDescriptionForm} />}
      {formbColor && <Addcolorform setFormbColor={setFormbColor} />}
      <PreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        questions={questions}
        formTitle={formTitle}
        currentPageTitle={
          allPages.find((p) => p._id === activeItem)?.title || "Current Page"
        }
      />

      {openuploadMedia && (
        <Uploadmedia
          setOpenuploadMedia={(isOpen: boolean) => {
            setOpenuploadMedia(isOpen);
            // When upload modal closes, show type selector if we have a reference URL
            if (!isOpen && currentUploadingQuestionId) {
              const question = questions.find(
                (q) => q.id === currentUploadingQuestionId
              );
              if (question?.referenceUrl) {
                // Auto-show the type selector after upload completes
                setTimeout(() => {
                  setShowTypeSelector((prev) => ({
                    ...prev,
                    [currentUploadingQuestionId!]: true,
                  }));
                }, 300);
              }
            }
          }}
          setReferenceUrl={(url: string) => {
            // Update the specific question that triggered the upload
            if (currentUploadingQuestionId) {
              updateQuestion(currentUploadingQuestionId, "referenceUrl", url);

              // Don't reset currentUploadingQuestionId here - let it be handled by modal close
            }
            setReferenceUrl(url); // Keep your existing functionality
          }}
        />
      )}
      {conditionModel && (
        <ConditionModel
          pages={allPages}
          setConditionModel={setConditionModel}
          formId={formId}
          questions={questions.filter((q) => q.type === "multiple-choice")}
          selectedConditionOptions={selectedConditionOptions}
          setSelectedConditionOptions={setSelectedConditionOptions}
          setCondition={setCondition}
        />
      )}
    </div>
  );
};

export default FormBuilderPage;

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  formTitle: string;
  currentPageTitle: string;
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  questions,
  formTitle,
  currentPageTitle,
}) => {
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, any>>({});

  if (!isOpen) return null;

  const handleAnswerChange = (questionId: string, value: any) => {
    setPreviewAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const PreviewQuestion = ({
    question,
    index,
  }: {
    question: Question;
    index: number;
  }) => {
    const questionNumber = `Q${index + 1}`;
    const answer = previewAnswers[question.id!];

    return (
      <div className="preview-question">
        <div className="preview-question-header">
          <span className="preview-question-number">{questionNumber}</span>
          <h3 className="preview-question-title">
            {question.question}
            {question.required && (
              <span className="preview-required-indicator"> *</span>
            )}
          </h3>
        </div>

        {/* Short Answer */}
        {question.type === "short" && (
          <input
            type="text"
            className="preview-text-input"
            placeholder={question.placeholder || "Your answer"}
            value={answer || ""}
            onChange={(e) => handleAnswerChange(question.id!, e.target.value)}
            maxLength={question.maxLength}
          />
        )}

        {/* Long Answer */}
        {question.type === "long" && (
          <textarea
            className="preview-textarea"
            placeholder={question.placeholder || "Your detailed answer"}
            value={answer || ""}
            onChange={(e) => handleAnswerChange(question.id!, e.target.value)}
            rows={4}
          />
        )}

        {/* Multiple Choice */}
        {question.type === "multiple-choice" && (
          <div className="preview-option-group">
            {question.options?.map((option, idx) => (
              <label key={idx} className="preview-option-item">
                <input
                  type="radio"
                  className="preview-radio-input"
                  name={`preview-${question.id}`}
                  value={idx}
                  checked={answer === idx}
                  onChange={() => handleAnswerChange(question.id!, idx)}
                />
                <span className="preview-option-text">{option}</span>
              </label>
            ))}
          </div>
        )}

        {/* Checkbox */}
        {question.type === "checkbox" && (
          <div className="preview-option-group">
            {question.options?.map((option, idx) => (
              <label key={idx} className="preview-option-item">
                <input
                  type="checkbox"
                  className="preview-checkbox-input"
                  checked={(answer || []).includes(idx)}
                  onChange={(e) => {
                    const currentAnswers = answer || [];
                    if (e.target.checked) {
                      handleAnswerChange(question.id!, [
                        ...currentAnswers,
                        idx,
                      ]);
                    } else {
                      handleAnswerChange(
                        question.id!,
                        currentAnswers.filter((a: number) => a !== idx)
                      );
                    }
                  }}
                />
                <span className="preview-option-text">{option}</span>
              </label>
            ))}
          </div>
        )}

        {/* Rating */}
        {question.type === "rating" && (
          <div className="preview-rating-container">
            {Array.from({ length: question.starCount || 5 }).map((_, idx) => (
              <svg
                key={idx}
                className={`preview-rating-star ${
                  answer && idx < answer ? "filled" : "empty"
                }`}
                width="32"
                height="32"
                viewBox="0 0 24 24"
                strokeWidth="2"
                onClick={() => handleAnswerChange(question.id!, idx + 1)}
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            ))}
          </div>
        )}

        {/* Date */}
        {question.type === "date" && (
          <input
            type="date"
            className="preview-date-input"
            value={answer || ""}
            onChange={(e) => handleAnswerChange(question.id!, e.target.value)}
          />
        )}

        {/* Linear Scale */}
        {question.type === "LinearScale" && (
          <div className="preview-scale-container">
            <div className="preview-scale-labels">
              <span>{question.scaleStartLabel || "Low"}</span>
              <span>{question.scaleEndLabel || "High"}</span>
            </div>
            <div className="preview-scale-input-container">
              <span className="preview-scale-number">{question.scaleMin}</span>
              <input
                type="range"
                className="preview-scale-range"
                min={question.scaleMin}
                max={question.scaleMax}
                value={answer || question.scaleMin}
                onChange={(e) =>
                  handleAnswerChange(question.id!, Number(e.target.value))
                }
              />
              <span className="preview-scale-number">{question.scaleMax}</span>
            </div>
            <div className="preview-scale-value">
              {answer || question.scaleMin}
            </div>
          </div>
        )}

        {/* Upload */}
        {question.type === "upload" && (
          <div className="preview-upload-container">
            <input
              type="file"
              className="preview-upload-input"
              multiple={true}
              accept={question.allowedTypes?.join(",") || "*"}
              onChange={(e) => handleAnswerChange(question.id!, e.target.files)}
            />
            <p className="preview-upload-info">
              Max files: {question.maxFiles || 1} | Max size:{" "}
              {question.maxFileSizeMb || 5}MB
            </p>
            <p className="preview-upload-types">
              Allowed types: {question.allowedTypes?.join(", ") || "All types"}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="preview-modal-overlay">
      <div className="preview-modal-container">
        {/* Modal Header */}
        <div className="preview-modal-header">
          <div>
            <h2 className="preview-modal-title">📋 Form Preview</h2>
            <p className="preview-modal-subtitle">
              {formTitle} - {currentPageTitle}
            </p>
          </div>
          <button className="preview-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="preview-modal-content">
          {questions.length === 0 ? (
            <div className="preview-empty-state">
              <h3>No questions to preview</h3>
              <p>Add some questions to see how your form will look!</p>
            </div>
          ) : (
            <>
              <div className="preview-form-header">
                <h1 className="preview-form-title">{formTitle}</h1>
                <h2 className="preview-page-title">{currentPageTitle}</h2>
              </div>

              {questions.map((question, index) => (
                <PreviewQuestion
                  key={question.id}
                  question={question}
                  index={index}
                />
              ))}

              <div className="preview-navigation">
                <button className="preview-nav-button primary">
                  Next Page
                </button>
                <button className="preview-nav-button secondary">
                  Previous
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

interface ConditionModalProps {
  setConditionModel: (value: boolean) => void;
  pages: { _id: string; title: string }[];
  formId?: string;
  questions: Question[];
  selectedConditionOptions: { [questionId: string]: number };
  setSelectedConditionOptions: React.Dispatch<
    React.SetStateAction<{ [questionId: string]: number }>
  >;
  setCondition: React.Dispatch<React.SetStateAction<boolean>>;
}
const ConditionModel: React.FC<ConditionModalProps> = ({
  setConditionModel,
  pages,
  formId,
  questions,
  selectedConditionOptions,
  setSelectedConditionOptions,
  setCondition,
}) => {
  const [sourcePage, setSourcePage] = useState<string>(pages[0]?._id || "");
  const [trueDest, setTrueDest] = useState<string>(pages[0]?._id || "");
  const [falseDest, setFalseDest] = useState<string>(pages[0]?._id || "");

  const handleContinue = async () => {
    if (!formId) return;

    const selectedOptions = selectedConditionOptions;

    if (Object.keys(selectedOptions).length === 0) {
      alert("No condition options selected");
      return;
    }

    // Validate that all selected questions have MongoDB IDs
    const invalidQuestions = Object.keys(selectedOptions).filter(
      (frontendId) => {
        const question = questions.find((q) => q.id === frontendId);
        return !question?._id || question._id.startsWith("temp_");
      }
    );

    if (invalidQuestions.length > 0) {
      alert("Please save the form first. Some questions don't have valid IDs.");
      return;
    }

    // Create rules array from selected options
    const rules = Object.entries(selectedOptions).map(
      ([questionId, optionIndex]) => {
        const question = questions.find((q) => q.id === questionId);
        const selectedOptionText = question?.options?.[optionIndex] || "";

        return {
          questionId: question?._id || questionId,
          adminAnswer: selectedOptionText,
        };
      }
    );

    // Extract MongoDB question IDs
    const questionIds = Object.keys(selectedOptions).map((frontendId) => {
      const question = questions.find((q) => q.id === frontendId);
      return question?._id || frontendId;
    });

    const payload = {
      formId,
      pageId: sourcePage,
      questionIds,
      rules,
      sourcePage,
      trueDestinationPage: trueDest,
      falseDestinationPage: falseDest,
      logicOperator: "AND",
    };

    console.log("🚀 Sending payload:", JSON.stringify(payload, null, 2));

    try {
      // const result = await createCondition(payload);
      // console.log("✅ Condition created successfully:", result);
      setConditionModel(false);
      setCondition(false);
      setSelectedConditionOptions({});
    } catch (error: any) {
      console.error("❌ Failed to create condition:", error);
      console.error("Error response:", error.response?.data);
      alert(
        `Failed to create condition: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button
          onClick={() => setConditionModel(false)}
          className="close-button"
        >
          &times;
        </button>

        <h3>Create Condition</h3>

        <div
          className="selected-conditions"
          style={{
            marginBottom: "20px",
            padding: "10px",
            backgroundColor: "#f5f5f5",
            borderRadius: "5px",
          }}
        >
          <h4>Selected Options:</h4>
          {Object.entries(selectedConditionOptions).map(
            ([questionId, optionIndex]) => {
              const question = questions.find((q) => q.id === questionId);
              const optionText = question?.options?.[optionIndex];
              return (
                <div
                  key={questionId}
                  className="condition-item"
                  style={{ marginBottom: "10px" }}
                >
                  <strong>Q:</strong> {question?.question} <br />
                  <strong>Selected:</strong> {optionText}
                </div>
              );
            }
          )}
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Source Page
          </label>
          <select
            value={sourcePage}
            onChange={(e) => setSourcePage(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
          >
            {pages.map((page) => (
              <option key={page._id} value={page._id}>
                {page.title}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            If TRUE, go to
          </label>
          <select
            value={trueDest}
            onChange={(e) => setTrueDest(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
          >
            {pages.map((page) => (
              <option key={page._id} value={page._id}>
                {page.title}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            If FALSE, go to
          </label>
          <select
            value={falseDest}
            onChange={(e) => setFalseDest(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
          >
            {pages.map((page) => (
              <option key={page._id} value={page._id}>
                {page.title}
              </option>
            ))}
          </select>
        </div>

        <div
          style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}
        >
          <button
            onClick={() => setConditionModel(false)}
            style={{
              padding: "10px 20px",
              backgroundColor: "#ccc",
              border: "none",
              borderRadius: "5px",
            }}
          >
            Cancel
          </button>
          <button
            className="continue-button"
            onClick={handleContinue}
            disabled={Object.keys(selectedConditionOptions).length === 0}
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              opacity:
                Object.keys(selectedConditionOptions).length === 0 ? 0.5 : 1,
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};
