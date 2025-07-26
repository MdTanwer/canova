import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../../styles/formBuilder/formbuilder.css";
import Sidebar from "../../components/formbuilder/Sidebar";
import FormHeader from "../../components/formbuilder/FormHeader";
import RightSidebar from "../../components/formbuilder/RightSidebar";
import { getPages, createNextPages } from "../../api/formBuilderApi";

interface Page {
  _id: string;
  title: string;
}

const FormBuilderPage: React.FC = () => {
  const [activeItem, setActiveItem] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#646464");
  const [sectionColor, setSectionColor] = useState("#646464");
  const [allPages, setAllPages] = useState<Page[]>([]);
  const { id: formId } = useParams<{ id: string }>();

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
          <FormHeader />
          <div className="form-builder-content">
            <div className="form-builder-main"></div>
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
