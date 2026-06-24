"use client";
import { useState } from "react";
import { UploadCloud, File, Image as ImageIcon, CheckCircle, X } from "lucide-react";

export default function FileUploader({ targetId, targetType, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      await handleUpload(selected);
    }
  };

  const handleUpload = async (selectedFile) => {
    setUploading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);
    if (targetType === "WORK_ORDER" && targetId) formData.append("workOrderId", targetId);
    if (targetType === "TEMPLATE" && targetId) formData.append("templateId", targetId);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        if (onUploadSuccess) onUploadSuccess(data.attachment);
      } else {
        alert("Error al subir archivo");
      }
    } catch (e) {
      console.error(e);
      alert("Error de red");
    } finally {
      setUploading(false);
      setFile(null); // Reset para poder subir otro
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <input 
          type="file" 
          id={`file-upload-${targetId || 'new'}`} 
          style={{ display: 'none' }} 
          onChange={handleFileChange}
          accept=".dxf,.pdf,image/*"
        />
        <label htmlFor={`file-upload-${targetId || 'new'}`} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', flex: 1, justifyContent: 'center' }}>
          <UploadCloud size={18} /> {uploading ? "Subiendo archivo..." : "Seleccionar y Subir Archivo"}
        </label>
      </div>

      {file && (
        <div style={{ fontSize: '0.9rem', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={16} /> Listo para subir: {file.name}
        </div>
      )}
    </div>
  );
}
