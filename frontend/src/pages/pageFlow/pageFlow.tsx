import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Page } from "../../types/types";
import { getFormNmae, getPages } from "../../api/formBuilderApi";
import "../../styles/formBuilder/formbuilder.css";
import Sidebar from "../../components/formbuilder/Sidebar";
import "../../styles/formBuilder/pageFlow.css";

const PageFlow = () => {
  const { id: formId } = useParams<{ id: string; pageId: string }>();
  const [allPages, setAllPages] = useState<Page[]>([]);
  const [activeItem, setActiveItem] = useState("");
  const [formTitle, setFormTitle] = useState<string>("");
  // Fetch pages
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
  // Fetch form title
  useEffect(() => {
    const fetchFormTitle = async () => {
      if (!formId) return;
      try {
        const result = (await getFormNmae(formId)) as { formName: string };
        if (result && result.formName) {
          setFormTitle(result.formName);
        }
      } catch (error) {
        console.error("Failed to fetch form name:", error);
      }
    };
    fetchFormTitle();
  }, [formId]);
  const handleItemClick = async (item: string) => {
    // Save current page questions to backend if there are unsaved changes
    setActiveItem(item);
  };

  return (
    <>
      <div className="">
        <Sidebar
          activeItem={activeItem}
          onItemClick={handleItemClick}
          pages={allPages}
          formbuilder={false}
        />

        <div
          style={{
            border: "2px solid #696969",
            marginLeft: "270px",
            minHeight: "100vh",
            borderRadius: "20px",
          }}
        >
          <div
            style={{
              borderBottom: "2px solid #696969",
              fontFamily: "Inter, sans-serif",
              fontWeight: 400, // Regular
              fontSize: "20px",
            }}
          >
            <h1 style={{ marginLeft: "40px" }}>{formTitle}</h1>
          </div>
        </div>
      </div>
    </>
  );
};

export default PageFlow;
