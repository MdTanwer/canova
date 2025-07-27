// import React, { useState } from "react";

// interface Question {
//   id: string;
//   type: "short" | "long" | "multiple-choice" | "time" | "rating";
//   question: string;
//   options?: string[];
// }

// const FormCanvas = () => {
//   const [questions, setQuestions] = useState<Question[]>([]);
//   const [backgroundColor, setBackgroundColor] = useState("#B6B6B6");
//   const [sectionColor, setSectionColor] = useState("#B6B6B6");

//   const addQuestion = (type: Question["type"] = "short") => {
//     const newQuestion: Question = {
//       id: `q${questions.length + 1}`,
//       type: type,
//       question: "What is ?",
//       options:
//         type === "multiple-choice" ? ["Option 01", "Option 02"] : undefined,
//     };
//     setQuestions([...questions, newQuestion]);
//   };

//   const updateQuestion = (id: string, field: keyof Question, value: any) => {
//     setQuestions(
//       questions.map((q) => (q.id === id ? { ...q, [field]: value } : q))
//     );
//   };

//   const updateOption = (
//     questionId: string,
//     optionIndex: number,
//     value: string
//   ) => {
//     setQuestions(
//       questions.map((q) =>
//         q.id === questionId && q.options
//           ? {
//               ...q,
//               options: q.options.map((opt, idx) =>
//                 idx === optionIndex ? value : opt
//               ),
//             }
//           : q
//       )
//     );
//   };

//   const addOption = (questionId: string) => {
//     setQuestions(
//       questions.map((q) =>
//         q.id === questionId && q.options
//           ? { ...q, options: [...q.options, `Option ${q.options.length + 1}`] }
//           : q
//       )
//     );
//   };

//   const removeOption = (questionId: string, optionIndex: number) => {
//     setQuestions(
//       questions.map((q) =>
//         q.id === questionId && q.options && q.options.length > 2
//           ? { ...q, options: q.options.filter((_, idx) => idx !== optionIndex) }
//           : q
//       )
//     );
//   };

//   const QuestionRenderer = ({
//     question,
//     index,
//   }: {
//     question: Question;
//     index: number;
//   }) => {
//     const questionNumber = `Q${index + 1}`;

//     const getAnswerTypeLabel = (type: string) => {
//       switch (type) {
//         case "short":
//           return "Short Answer";
//         case "long":
//           return "Long Answer";
//         case "multiple-choice":
//           return "Multiple Choice";
//         case "time":
//           return "Time";
//         case "rating":
//           return "Rating";
//         default:
//           return "Short Answer";
//       }
//     };

//     return (
//       <div className="question-container">
//         <div className="question-header">
//           <span className="question-number">{questionNumber}</span>
//           <input
//             type="text"
//             value={question.question}
//             className="question-input editable-question"
//             onChange={(e) =>
//               updateQuestion(question.id, "question", e.target.value)
//             }
//             placeholder="Enter your question here"
//           />
//           <select
//             className="answer-type-dropdown"
//             value={question.type}
//             onChange={(e) =>
//               updateQuestion(question.id, "type", e.target.value)
//             }
//           >
//             <option value="short">Short Answer</option>
//             <option value="long">Long Answer</option>
//             <option value="multiple-choice">Multiple Choice</option>
//             <option value="time">Time</option>
//             <option value="rating">Rating</option>
//           </select>
//         </div>

//         <div className="answer-area">
//           {question.type === "short" && (
//             <div className="short-answer-preview">
//               <input
//                 type="text"
//                 placeholder="Short answer text"
//                 className="editable-answer-input"
//               />
//             </div>
//           )}

//           {question.type === "long" && (
//             <div className="long-answer-preview">
//               <textarea
//                 placeholder="Long answer text"
//                 className="editable-answer-textarea"
//                 rows={4}
//               />
//             </div>
//           )}

//           {question.type === "multiple-choice" && (
//             <div className="multiple-choice-area">
//               {question.options?.map((option, idx) => (
//                 <div key={idx} className="option-row">
//                   <input
//                     type="radio"
//                     name={`q${question.id}`}
//                     className="radio-input"
//                   />
//                   <input
//                     type="text"
//                     value={option}
//                     className="option-input editable"
//                     onChange={(e) =>
//                       updateOption(question.id, idx, e.target.value)
//                     }
//                     placeholder="Enter option text"
//                   />
//                   {question.options && question.options.length > 2 && (
//                     <button
//                       className="delete-option-btn"
//                       onClick={() => removeOption(question.id, idx)}
//                     >
//                       ×
//                     </button>
//                   )}
//                 </div>
//               ))}
//               <button
//                 className="add-option-btn"
//                 onClick={() => addOption(question.id)}
//               >
//                 + Add option
//               </button>
//             </div>
//           )}

//           {question.type === "time" && (
//             <div className="time-answer-preview">
//               <input
//                 type="time"
//                 className="editable-time-input"
//                 defaultValue="12:00"
//               />
//             </div>
//           )}

//           {question.type === "rating" && (
//             <div className="rating-answer-preview">
//               <div className="rating-scale">
//                 {[1, 2, 3, 4, 5].map((num) => (
//                   <div key={num} className="rating-item">
//                     <div
//                       className="rating-circle editable-rating"
//                       data-value={num}
//                     >
//                       {num}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//               <div className="rating-labels">
//                 <input
//                   type="text"
//                   placeholder="Low rating label"
//                   className="rating-label-input"
//                 />
//                 <input
//                   type="text"
//                   placeholder="High rating label"
//                   className="rating-label-input"
//                 />
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="form-builder-container">
//       {/* Left Sidebar */}
//       <div className="sidebar">
//         <div className="sidebar-header">
//           <span className="close-icon">×</span>
//           <span className="sidebar-title">CANOVA</span>
//         </div>

//         <div className="pages-list">
//           <div className="page-item active">Page 01</div>
//           <div className="page-item">Page 02</div>
//           <div className="page-item">Page 03</div>
//           <div className="page-item">Page 04</div>
//         </div>

//         <button className="add-page-btn">
//           <span>+</span> Add new Page
//         </button>
//       </div>

//       {/* Main Canvas */}
//       <div className="main-canvas">
//         <div className="canvas-header">
//           <h1 className="canvas-title">Title</h1>
//           <div className="header-actions">
//             <button className="preview-btn">Preview</button>
//             <button className="save-btn">Save</button>
//           </div>
//         </div>

//         <div className="questions-area">
//           {questions.length === 0 ? (
//             <div className="empty-canvas">
//               <p>Click "Add Question" to start building your form</p>
//             </div>
//           ) : (
//             questions.map((question, index) => (
//               <QuestionRenderer
//                 key={question.id}
//                 question={question}
//                 index={index}
//               />
//             ))
//           )}
//         </div>
//       </div>

//       {/* Right Sidebar */}
//       <div className="right-sidebar">
//         <div className="action-buttons">
//           <button
//             className="action-btn primary"
//             onClick={() => addQuestion("short")}
//           >
//             <span>+</span> Add Question
//           </button>
//           <button className="action-btn">
//             <span>≡</span> Add Text
//           </button>
//           <button className="action-btn">
//             <span>⚙</span> Add Condition
//           </button>
//           <button className="action-btn">
//             <span>🖼</span> Add Image
//           </button>
//           <button className="action-btn">
//             <span>▶</span> Add Video
//           </button>
//           <button className="action-btn">
//             <span>📄</span> Add Sections
//           </button>
//         </div>

//         <div className="styling-section">
//           <div className="color-section">
//             <label>Background Color</label>
//             <div className="color-picker">
//               <div
//                 className="color-preview"
//                 style={{ backgroundColor: backgroundColor }}
//               ></div>
//               <input
//                 type="text"
//                 value={backgroundColor}
//                 onChange={(e) => setBackgroundColor(e.target.value)}
//               />
//               <span>100%</span>
//             </div>
//           </div>

//           <div className="color-section">
//             <label>Section Color</label>
//             <div className="color-picker">
//               <div
//                 className="color-preview"
//                 style={{ backgroundColor: sectionColor }}
//               ></div>
//               <input
//                 type="text"
//                 value={sectionColor}
//                 onChange={(e) => setSectionColor(e.target.value)}
//               />
//               <span>100%</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FormCanvas;

// // CSS Styles
// const styles = `
// .form-builder-container {
//   display: flex;
//   height: 100vh;
//   font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
//   background: #f5f5f5;
// }

// .sidebar {
//   width: 200px;
//   background: white;
//   border-right: 1px solid #e0e0e0;
//   padding: 20px;
//   display: flex;
//   flex-direction: column;
// }

// .sidebar-header {
//   display: flex;
//   align-items: center;
//   gap: 8px;
//   margin-bottom: 30px;
//   font-weight: 600;
//   color: #666;
// }

// .close-icon {
//   font-size: 20px;
//   color: #999;
// }

// .sidebar-title {
//   color: #333;
// }

// .pages-list {
//   flex: 1;
//   margin-bottom: 20px;
// }

// .page-item {
//   padding: 10px 15px;
//   margin-bottom: 5px;
//   cursor: pointer;
//   border-radius: 6px;
//   color: #666;
// }

// .page-item.active {
//   background: #e3f2fd;
//   color: #1976d2;
//   font-weight: 500;
// }

// .add-page-btn {
//   display: flex;
//   align-items: center;
//   gap: 8px;
//   width: 100%;
//   padding: 10px 15px;
//   border: 1px dashed #ccc;
//   background: transparent;
//   border-radius: 6px;
//   cursor: pointer;
//   color: #666;
// }

// .main-canvas {
//   flex: 1;
//   background: white;
//   display: flex;
//   flex-direction: column;
//   border: 3px solid #4a90e2;
//   margin: 10px;
//   border-radius: 8px;
// }

// .canvas-header {
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   padding: 20px 40px;
//   border-bottom: 1px solid #e0e0e0;
// }

// .canvas-title {
//   font-size: 24px;
//   font-weight: 600;
//   margin: 0;
//   color: #333;
// }

// .header-actions {
//   display: flex;
//   gap: 12px;
// }

// .preview-btn {
//   padding: 8px 20px;
//   border: 1px solid #ccc;
//   background: white;
//   border-radius: 6px;
//   cursor: pointer;
//   color: #333;
// }

// .save-btn {
//   padding: 8px 20px;
//   background: #333;
//   color: white;
//   border: none;
//   border-radius: 6px;
//   cursor: pointer;
// }

// .questions-area {
//   flex: 1;
//   padding: 40px;
//   overflow-y: auto;
// }

// .empty-canvas {
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   height: 200px;
//   color: #999;
//   font-size: 16px;
// }

// .question-container {
//   background: white;
//   border: 1px solid #e0e0e0;
//   border-radius: 8px;
//   padding: 24px;
//   margin-bottom: 24px;
//   box-shadow: 0 1px 3px rgba(0,0,0,0.1);
// }

// .question-header {
//   display: flex;
//   align-items: center;
//   gap: 16px;
//   margin-bottom: 20px;
// }

// .question-number {
//   font-weight: 600;
//   color: #333;
//   min-width: 30px;
// }

// .question-input {
//   flex: 1;
//   border: 1px solid transparent;
//   font-size: 16px;
//   outline: none;
//   padding: 8px 12px;
//   border-radius: 4px;
//   background: transparent;
//   transition: all 0.2s ease;
// }

// .question-input.editable-question {
//   border: 1px solid #ddd;
//   background: white;
// }

// .question-input.editable-question:focus {
//   border-color: #4a90e2;
//   box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.1);
//   background: white;
// }

// .question-input.editable-question:hover {
//   border-color: #999;
// }

// .answer-type-dropdown {
//   padding: 8px 12px;
//   border: 1px solid #ccc;
//   border-radius: 4px;
//   background: white;
//   min-width: 140px;
// }

// .answer-area {
//   margin-top: 16px;
// }

// .short-answer-preview {
//   background: #f8f9fa;
//   border-radius: 4px;
//   padding: 20px;
// }

// .long-answer-preview {
//   background: #f8f9fa;
//   border-radius: 4px;
//   padding: 20px;
// }

// .editable-answer-input {
//   width: 100%;
//   border: 1px solid #ddd;
//   border-radius: 4px;
//   padding: 12px 16px;
//   font-size: 14px;
//   outline: none;
//   background: white;
// }

// .editable-answer-input:focus {
//   border-color: #4a90e2;
//   box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.1);
// }

// .editable-answer-textarea {
//   width: 100%;
//   border: 1px solid #ddd;
//   border-radius: 4px;
//   padding: 12px 16px;
//   font-size: 14px;
//   outline: none;
//   background: white;
//   resize: vertical;
//   min-height: 80px;
//   font-family: inherit;
// }

// .editable-answer-textarea:focus {
//   border-color: #4a90e2;
//   box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.1);
// }

// .option-input.editable {
//   border: 1px solid #ddd;
//   background: white;
//   transition: border-color 0.2s ease;
// }

// .option-input.editable:focus {
//   border-color: #4a90e2;
//   box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.1);
// }

// .delete-option-btn {
//   background: #ff4757;
//   color: white;
//   border: none;
//   border-radius: 50%;
//   width: 24px;
//   height: 24px;
//   cursor: pointer;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   font-size: 16px;
//   line-height: 1;
// }

// .delete-option-btn:hover {
//   background: #ff3742;
// }

// .editable-time-input {
//   background: white;
//   border: 1px solid #ddd;
//   padding: 12px 20px;
//   border-radius: 4px;
//   font-size: 16px;
//   outline: none;
// }

// .editable-time-input:focus {
//   border-color: #4a90e2;
//   box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.1);
// }

// .editable-rating {
//   transition: all 0.2s ease;
//   cursor: pointer;
// }

// .editable-rating:hover {
//   border-color: #4a90e2;
//   background: #e3f2fd;
//   transform: scale(1.1);
// }

// .rating-labels {
//   display: flex;
//   justify-content: space-between;
//   margin-top: 16px;
//   gap: 16px;
// }

// .rating-label-input {
//   flex: 1;
//   border: 1px solid #ddd;
//   border-radius: 4px;
//   padding: 8px 12px;
//   font-size: 12px;
//   outline: none;
//   background: white;
//   text-align: center;
// }

// .rating-label-input:focus {
//   border-color: #4a90e2;
//   box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.1);
// }

// .answer-placeholder, .answer-placeholder-large {
//   color: #999;
//   font-style: italic;
// }

// .multiple-choice-area {
//   display: flex;
//   flex-direction: column;
//   gap: 12px;
// }

// .option-row {
//   display: flex;
//   align-items: center;
//   gap: 12px;
// }

// .radio-input {
//   width: 16px;
//   height: 16px;
// }

// .option-input {
//   flex: 1;
//   border: none;
//   background: #f8f8f8;
//   padding: 8px 12px;
//   border-radius: 4px;
//   outline: none;
// }

// .add-option-btn {
//   align-self: flex-start;
//   background: none;
//   border: 1px dashed #ccc;
//   padding: 8px 16px;
//   border-radius: 4px;
//   cursor: pointer;
//   color: #666;
//   margin-top: 8px;
// }

// .time-answer-preview {
//   background: #f8f9fa;
//   border-radius: 4px;
//   padding: 40px 20px;
//   text-align: center;
// }

// .time-input-preview {
//   background: white;
//   border: 1px solid #ddd;
//   padding: 12px 20px;
//   border-radius: 4px;
//   display: inline-block;
//   color: #999;
// }

// .rating-answer-preview {
//   background: #f8f9fa;
//   border-radius: 4px;
//   padding: 30px 20px;
//   text-align: center;
// }

// .rating-scale {
//   display: flex;
//   justify-content: center;
//   gap: 16px;
// }

// .rating-item {
//   text-align: center;
// }

// .rating-circle {
//   width: 40px;
//   height: 40px;
//   border: 2px solid #ddd;
//   border-radius: 50%;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   cursor: pointer;
//   transition: all 0.2s ease;
// }

// .rating-circle:hover {
//   border-color: #4a90e2;
//   background: #e3f2fd;
// }

// .right-sidsddebar {
//   width: 280px;
//   background: #f5f5f5;
//   padding: 20px;
//   border-left: 1px solid #e0e0e0;
//   display: flex;
//   flex-direction: column;
// }

// .action-buttons {
//   margin-bottom: 40px;
// }

// .action-btn {
//   display: flex;
//   align-items: center;
//   gap: 12px;
//   width: 100%;
//   padding: 12px 16px;
//   margin-bottom: 8px;
//   border: 1px solid #e0e0e0;
//   background: white;
//   border-radius: 6px;
//   cursor: pointer;
//   text-align: left;
//   font-size: 14px;
//   color: #333;
// }

// .action-btn:hover {
//   background: #f8f8f8;
// }

// .action-btn.primary {
//   background: #4a90e2;
//   color: white;
//   border-color: #4a90e2;
// }

// .styling-section {
//   flex: 1;
// }

// .color-section {
//   margin-bottom: 24px;
// }

// .color-section label {
//   display: block;
//   margin-bottom: 8px;
//   font-weight: 500;
//   color: #333;
//   font-size: 14px;
// }

// .color-picker {
//   display: flex;
//   align-items: center;
//   gap: 8px;
//   background: white;
//   padding: 8px 12px;
//   border: 1px solid #e0e0e0;
//   border-radius: 4px;
// }

// .color-preview {
//   width: 24px;
//   height: 24px;
//   border-radius: 4px;
//   border: 1px solid #ddd;
// }

// .color-picker input {
//   flex: 1;
//   border: none;
//   outline: none;
//   font-size: 13px;
// }

// .color-picker span {
//   font-size: 13px;
//   color: #666;
// }
// `;

// // Inject styles
// if (typeof document !== "undefined") {
//   const styleSheet = document.createElement("style");
//   styleSheet.textContent = styles;
//   document.head.appendChild(styleSheet);
// }
