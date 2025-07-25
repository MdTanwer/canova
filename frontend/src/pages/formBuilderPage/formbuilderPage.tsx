import React, { useState } from "react";
import "../../styles/formBuilder/formbuilder.css";
import Sidebar from "../../components/formbuilder/sidebar";
import FormHeader from "../../components/formbuilder/FormHeader";
import RightSidebar from "../../components/formbuilder/RightSidebar";

const FormBuilderPage: React.FC = () => {
  const [activeItem, setActiveItem] = useState("home");
  const [backgroundColor, setBackgroundColor] = useState("#646464");
  const [sectionColor, setSectionColor] = useState("#646464");

  const handleItemClick = (item: string) => {
    setActiveItem(item);
  };

  const handleAddQuestion = () => {
    console.log("Add Question clicked");
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

  return (
    <div className="form-container">
      <Sidebar activeItem={activeItem} onItemClick={handleItemClick} />
      <main className="form-main-content">
        <div className="form-content-wrapper">
          <FormHeader />
          <div className="form-builder-content">
            <div className="form-builder-main">
              main ojifoif br <br />
              dkdfhiekfjcontent
            </div>
            <div>
              <RightSidebar
                onAddQuestion={handleAddQuestion}
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
