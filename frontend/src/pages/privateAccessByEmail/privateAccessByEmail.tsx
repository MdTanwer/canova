import React from "react";

import "../../styles/home/Dashboard.css";
import Publicform from "../../components/publickform/publickform";

interface Props {
  id: string;
  title: string;
}

const PrivateAccess: React.FC<Props> = ({ id, title }) => {
  return (
    <div style={{ padding: "40px" }}>
      <section className="projects-section">
        <div className="projects-grid">
          <Publicform id={id} title={title} />
        </div>
      </section>
    </div>
  );
};

export default PrivateAccess;
