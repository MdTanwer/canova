import React from "react";
import "../../styles/ActionCard/ActionCard.css";

interface ActionCardProps {
  title: string;
  subtitle: string;
  icon: string;
  onClick: () => void;
}

const ActionCard: React.FC<ActionCardProps> = ({
  title,
  subtitle,
  icon,
  onClick,
}) => {
  return (
    <div className="project-action-card" onClick={onClick}>
      <div className=" project-action-icon">
        <img src={icon} alt="icon" />
      </div>

      <div className=" project-action-content">
        <h3 className=" project-action-title">{title}</h3>
        <p className=" project-action-subtitle">{subtitle}</p>
      </div>
    </div>
  );
};

export default ActionCard;
