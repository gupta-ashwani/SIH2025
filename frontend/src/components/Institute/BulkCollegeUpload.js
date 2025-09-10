import React, { useState } from "react";
import axios from "axios";
import "./Institute.css";

const BulkCollegeUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select an Excel file.");
      return;
    }
    setUploading(true);
    setMessage("");
    const formData = new FormData();
    formData.append("excelFile", file);
    try {
      const response = await axios.post(
        "/api/bulk-colleges/bulk-upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
      setMessage(`Successfully uploaded ${response.data.count} colleges!`);
    } catch (err) {
      setMessage(
        err.response?.data?.error ||
          "Upload failed. Please check your file and try again."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bulk-college-upload-modal">
      <div className="bulk-college-upload-instructions">
        <h2>Bulk College Upload</h2>
        <strong>Instructions:</strong>
        <ul>
          <li>Download the Excel template and fill in college details</li>
          <li>
            <strong>Required columns:</strong> name, code, email, password,
            institute (ObjectId)
          </li>
          <li>
            <strong>Optional columns:</strong> contactNumber, line1, line2,
            city, state, country, pincode, website, type, status
          </li>
          <li>
            If no password is provided, default will be <code>code@123</code>
          </li>
          <li>
            <strong>Type:</strong> e.g., "Engineering College", "Medical
            College", etc.
          </li>
          <li>
            <strong>Status:</strong> "Active" or "Inactive"
          </li>
          <li>Maximum file size: 5MB</li>
        </ul>
        <div className="bulk-college-upload-download">
          <a
            href="/templates/college_bulk_template.xlsx"
            download
            className="btn btn-primary"
          >
            &#8681; Download Excel Template
          </a>
        </div>
      </div>
      <div className="bulk-college-upload-dropzone">
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileChange}
          style={{ display: "none" }}
          id="bulk-college-upload-input"
        />
        <label
          htmlFor="bulk-college-upload-input"
          className="bulk-college-upload-dropzone-label"
        >
          <div className="bulk-college-upload-icon">
            <i className="fas fa-upload"></i>
          </div>
          <div>
            {file ? file.name : "Drop Excel file here or click to browse"}
          </div>
        </label>
      </div>
      <div className="bulk-college-upload-btns">
        <a
          href="/templates/college_bulk_template.csv"
          download
          className="btn btn-primary"
          style={{ marginRight: "1em" }}
        >
          <i className="fas fa-file-csv" style={{ marginRight: "0.5em" }}></i>
          Download Sample CSV Template
        </a>
        <button
          className="btn btn-secondary"
          type="button"
          onClick={() =>
            window.dispatchEvent(new Event("closeBulkCollegeModal"))
          }
        >
          Cancel
        </button>
        <button
          className="btn btn-primary"
          onClick={handleUpload}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload Colleges"}
        </button>
      </div>
      {message && <div className="bulk-college-upload-message">{message}</div>}
    </div>
  );
};

export default BulkCollegeUpload;
