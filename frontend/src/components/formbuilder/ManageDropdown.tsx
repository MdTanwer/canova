import React, { useRef, useEffect } from "react";
import "../../styles/formBuilder/ManageDropdon.css";
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
  const dropdownRef = useRef<HTMLDivElement>(null);

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
            onSelect();
            onClose();
          }}
        >
          {option.label}
        </div>
      ))}
    </div>
  );
};

export default ManageDropdown;
