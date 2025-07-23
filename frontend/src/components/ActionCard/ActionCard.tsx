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
    <div className="action-card" onClick={onClick}>
      <div className="action-icon">{icon}</div>

      <div className="action-content">
        <h3 className="action-title">{title}</h3>
        <p className="action-subtitle">{subtitle}</p>
      </div>
    </div>
  );
};

export default ActionCard;
