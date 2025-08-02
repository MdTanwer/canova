import React, { useState, useEffect } from "react";
import "./addDesc.css";
import { useParams } from "react-router-dom";
import { updateFormDescription } from "../../api/formBuilderApi";
import { toast } from "react-toastify";
type Props = {
  formId?: string;
  initialDescription?: string;
  onDescriptionUpdate?: (description: string) => void;
  setDescriptionForm: (descriptionForm: boolean) => void;
};

const AddDesc: React.FC<Props> = ({
  initialDescription = "",
  onDescriptionUpdate,
  setDescriptionForm,
}) => {
  const [description, setDescription] = useState<string>(initialDescription);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { id: formId } = useParams<{ id: string; pageId: string }>();

  // Update local state when initialDescription changes
  useEffect(() => {
    setDescription(initialDescription);
  }, [initialDescription]);

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setDescription(e.target.value);
    // Clear any existing messages
  };

  const handleSaveDescription = async () => {
    if (!formId) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await updateFormDescription(formId, description);

      if (result.success) {
        toast.success("Description updated successfully!"); // Call the callback function if provided
        setDescriptionForm(false);
        if (onDescriptionUpdate) {
          onDescriptionUpdate(description);
        }

        // Clear success message after 3 seconds
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || "Failed to update description";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Save on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSaveDescription();
    }
  };

  return (
    <div className="add-container">
      <textarea
        className="add-answer-textarea"
        value={description}
        onChange={handleDescriptionChange}
        onKeyDown={handleKeyDown}
        placeholder="Set description in the form text"
        rows={8}
        disabled={isLoading}
      />

      <div className="description-actions">
        <button
          onClick={handleSaveDescription}
          disabled={isLoading || !description.trim()}
          className="save-description-btn"
        >
          {isLoading ? "Saving..." : "Save Description"}
        </button>
      </div>

      <br />

      {/* Status Messages */}
    </div>
  );
};

export default AddDesc;
