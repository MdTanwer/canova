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
    type: "short" | "long" | "multiple-choice" | "time" | "rating";
    question: string;
    options?: string[];
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
    };
    setQuestions([...questions, newQuestion]);
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
              <option className="answer-type-option" value="time">
                Time
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
              <div className="rating-answer-preview">
                <div className="rating-scale">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <div key={num} className="rating-item">
                      <div
                        className="rating-circle editable-rating"
                        data-value={num}
                      >
                        {num}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rating-labels">
                  <input
                    type="text"
                    placeholder="Low rating label"
                    className="rating-label-input"
                  />
                  <input
                    type="text"
                    placeholder="High rating label"
                    className="rating-label-input"
                  />
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
