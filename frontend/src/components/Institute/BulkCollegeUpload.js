import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "./Institute.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3030/api";

const BulkCollegeUpload = ({ onClose }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const close = () => {
    if (onClose) onClose();
    else window.dispatchEvent(new Event("closeBulkCollegeModal"));
  };

  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && close();
    document.addEventListener("keydown", onEsc);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onEsc);
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const onBackdrop = (e) => {
    if (e.target.classList.contains("bulk-college-overlay")) close();
  };

  const handleFileSelect = (selected) => {
    if (!selected) return;
    const allowed = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (!allowed.includes(selected.type)) {
      setMessage("Please select a valid Excel file (.xls or .xlsx)");
      setFile(null);
      return;
    }
    setFile(selected);
    setMessage("");
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    handleFileSelect(dropped);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const downloadTemplate = async () => {
    try {
      const res = await fetch(`${API_BASE}/bulk-colleges/download-template`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to download template");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "college_bulk_upload_template.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setMessage("Failed to download template");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select an Excel file");
      return;
    }
    setUploading(true);
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("excelFile", file);
      const res = await fetch(`${API_BASE}/bulk-colleges/bulk-upload`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Upload failed");
      setMessage(`Successfully uploaded ${data.count} colleges`);
      setFile(null);
    } catch (err) {
      setMessage(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const modalContent = (
    <div className="bulk-college-overlay" onClick={onBackdrop}>
      <div className="bulk-college-modal" onClick={(e) => e.stopPropagation()}>
        <div className="bulk-college-header">
          <h2>Bulk College Upload</h2>
          <button className="bulk-close" onClick={close} aria-label="Close">×</button>
        </div>

        <div className="bulk-college-body">
          <div className="bulk-instructions">
            <h3>Instructions:</h3>
            <ul>
              <li>Download the Excel template and fill in college details</li>
              <li>
                <strong>Required columns:</strong> name, code, email
              </li>
              <li>
                <strong>Optional columns:</strong> password, institute (ObjectId if not logged in as institute), contactNumber, line1, line2, city, state, country, pincode, website, type, status
              </li>
              <li>If no password is provided, default will be <code>CODE@123</code></li>
              <li>
                <strong>Type:</strong> "Engineering College", "Medical College", "Arts College", etc.
              </li>
              <li><strong>Status:</strong> "Active" or "Inactive"</li>
              <li>Maximum file size: 5MB</li>
            </ul>
            <div className="bulk-download-row">
              <button className="btn primary" onClick={downloadTemplate}>
                ⬇ Download Excel Template
              </button>
            </div>
          </div>

          <div
            className={`dropzone ${dragOver ? "over" : ""}`}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
          >
            <input
              id="college-file-input"
              type="file"
              accept=".xls,.xlsx"
              style={{ display: "none" }}
              onChange={(e) => handleFileSelect(e.target.files?.[0])}
            />
            <label htmlFor="college-file-input" className="dropzone-label">
              <div className="dz-icon">☁</div>
              <div className="dz-text">
                {file ? file.name : "Drop Excel file here or click to browse"}
              </div>
            </label>
          </div>
        </div>

        {message && <div className="bulk-message">{message}</div>}

        <div className="bulk-college-footer">
          <button className="btn secondary" onClick={close}>Cancel</button>
          <button className="btn primary" disabled={uploading} onClick={handleUpload}>
            {uploading ? "Uploading..." : "Upload Colleges"}
          </button>
        </div>
      </div>
    </div>
  );
  return ReactDOM.createPortal(modalContent, document.body);
};

export default BulkCollegeUpload;
