import React, { useState, useRef } from "react";
import "./UploadMedia.css";
import cut from "../../assets/cross1.svg";
import { addMedia } from "../../api/formBuilderQ$A";
import { toast } from "react-toastify";
interface mediaProps {
  setOpenuploadMedia: (value: boolean) => void;
  setReferenceUrl: (value: string) => void;
}
const Uploadmedia: React.FC<mediaProps> = ({
  setOpenuploadMedia,
  setReferenceUrl,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      console.log("Files dropped:", files);
      // Handle file upload logic here
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];

      const mediaType = file.type.startsWith("video") ? "video" : "image";

      const formData = new FormData();
      formData.append("file", file);
      formData.append("mediaType", mediaType);

      try {
        const response = await addMedia(formData);
        console.log("Upload success:", response);
        setReferenceUrl(response.media.file.url);
        setOpenuploadMedia(false);
        toast.success("Upload success");
      } catch (error: any) {
        console.error("Upload failed:", error);
        toast.error("Failed to upload file.");
      }
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="upload-container">
      <div className="upload-header">
        <button
          className="upload-close-button"
          onClick={() => setOpenuploadMedia(false)}
        >
          <img src={cut} alt="" />
        </button>
        <h2 className="upload-title">Upload</h2>
      </div>

      <div className="file-tab">
        <span className="file-tab-text">File</span>
      </div>

      <div
        className={`upload-area ${isDragOver ? "drag-over" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="upload-content">
          <h3 className="upload-main-text">Drag & drop files to upload</h3>
          <p className="upload-subtext">Consider upto 300 mb per video</p>

          <div className="upload-divider">
            <span className="divider-text">or</span>
          </div>

          <button className="browse-button" onClick={handleBrowseClick}>
            Browse files
          </button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            style={{ display: "none" }}
            accept="video/*,image/*"
          />
        </div>
      </div>
    </div>
  );
};

export default Uploadmedia;
