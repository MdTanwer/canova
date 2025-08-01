import React, { useRef, useEffect } from "react";

interface ManageDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: () => void;
  selectedOption: string;
}

const ManageDropdown: React.FC<ManageDropdownProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedOption = "Anyone",
}) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const options = [
    { value: "anyone", label: "Anyone" },
    { value: "restricted", label: "Restricted" },
  ];

  return (
    <div ref={dropdownRef} className="manage-dropdown">
      {options.map((option) => (
        <div
          key={option.value}
          className={`dropdown-option ${
            selectedOption === option.label ? "selected" : ""
          }`}
          onClick={() => {
            onSelect(option.label);
            onClose();
          }}
        >
          {option.label}
        </div>
      ))}

      <style jsx>{`
        .manage-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          min-width: 120px;
          z-index: 1002;
          overflow: hidden;
          border: 1px solid #e0e0e0;
          margin-top: 2px;
        }

        .dropdown-option {
          padding: 12px 16px;
          cursor: pointer;
          font-size: 14px;
          color: #333;
          transition: background-color 0.2s;
        }

        .dropdown-option:hover {
          background-color: #f5f5f5;
        }

        .dropdown-option.selected {
          background-color: #e3f2fd;
          color: #1976d2;
        }

        .dropdown-option:not(:last-child) {
          border-bottom: 1px solid #f0f0f0;
        }
      `}</style>
    </div>
  );
};

export default ManageDropdown;
