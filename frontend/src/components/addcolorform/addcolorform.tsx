import React, { useState, useRef, useEffect } from "react";
import "./addcolorform.css";
import { updateFormDetails } from "../../api/formBuilderApi";
import { toast } from "react-toastify";
type Props = {
  setFormbColor: (value: boolean) => void;
  currentColor?: string;
  onColorUpdate?: (color: string) => void;
};
import { useParams } from "react-router-dom";

// Predefined color palette
const colorPalette = [
  { name: "Default White", value: "#ffffff" },
  { name: "Light Blue", value: "#e3f2fd" },
  { name: "Light Green", value: "#e8f5e8" },
  { name: "Light Purple", value: "#f3e5f5" },
  { name: "Light Pink", value: "#fce4ec" },
  { name: "Light Orange", value: "#fff3e0" },
  { name: "Light Yellow", value: "#fffde7" },
  { name: "Light Gray", value: "#f5f5f5" },
  { name: "Light Cyan", value: "#e0f7fa" },
  { name: "Light Lime", value: "#f9fbe7" },
  { name: "Warm Beige", value: "#faf5f0" },
  { name: "Cool Blue", value: "#e1f5fe" },
  { name: "Mint Green", value: "#e0f2f1" },
  { name: "Lavender", value: "#ede7f6" },
  { name: "Peach", value: "#fce8e6" },
  { name: "Light Coral", value: "#ffebee" },
];

const Addcolorform: React.FC<Props> = ({
  setFormbColor,
  currentColor = "#ffffff",
  onColorUpdate,
}) => {
  const [selectedColor, setSelectedColor] = useState<string>(currentColor);
  const { id: formId } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setFormbColor(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setFormbColor]);

  // Update selected color when current color changes
  useEffect(() => {
    setSelectedColor(currentColor);
  }, [currentColor]);

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
  };

  const handleApplyColor = async () => {
    if (!formId) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await updateFormDetails(formId, {
        backgroundColor: selectedColor,
      });

      if (result.success) {
        toast.success("Color updated successfully!");
        if (onColorUpdate) {
          onColorUpdate(selectedColor);
        }

        // Close tooltip after successful update
        setTimeout(() => {
          setFormbColor(false);
        }, 1500);
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || "Failed to update color";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const isColorSelected = (color: string) => selectedColor === color;

  return (
    <div
      ref={containerRef}
      onClick={(e) => e.stopPropagation()}
      className="color-tooltip-container"
    >
      <div className="color-tooltip-header">
        <h4>Choose Form Background Color</h4>
        <button
          className="close-tooltip-btn"
          onClick={() => setFormbColor(false)}
          aria-label="Close color picker"
        >
          ✕
        </button>
      </div>

      {/* Color Palette Grid */}
      <div className="color-palette-grid">
        {colorPalette.map((color, index) => (
          <div
            key={index}
            className={`color-swatch ${
              isColorSelected(color.value) ? "selected" : ""
            }`}
            style={{ backgroundColor: color.value }}
            onClick={() => handleColorSelect(color.value)}
            title={color.name}
          >
            {isColorSelected(color.value) && (
              <div className="selected-indicator">✓</div>
            )}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="color-actions">
        <button
          className="cancel-btn"
          onClick={() => setFormbColor(false)}
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          className="apply-color-btn"
          onClick={handleApplyColor}
          disabled={isLoading || selectedColor === currentColor}
        >
          {isLoading ? "Applying..." : "Apply Color"}
        </button>
      </div>
    </div>
  );
};

export default Addcolorform;
