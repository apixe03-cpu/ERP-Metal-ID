"use client";
import { useState, useEffect } from "react";
import { PlusCircle, Trash2, Box } from "lucide-react";
import "@/components/Modal.css";
import FileUploader from "@/components/FileUploader";
import AttachmentList from "@/components/AttachmentList";

export default function NewTemplateModal({ isOpen, onClose, onSaved, materialsConfig = [], initialData = null, workCenters = [] }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMaterialId, setSelectedMaterialId] = useState("");
  const [widthMm, setWidthMm] = useState("");
  const [heightMm, setHeightMm] = useState("");
  const [processes, setProcesses] = useState(["CORTE_LASER"]); 
  const [loading, setLoading] = useState(false);
  const [templateFiles, setTemplateFiles] = useState([]);

  useEffect(() => {
    if (isOpen && initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      
      if (initialData.material && initialData.thickness) {
        const mat = materialsConfig.find(m => m.material === initialData.material && m.thickness === initialData.thickness);
        if (mat) setSelectedMaterialId(mat.id);
      }
      
      setWidthMm(initialData.widthMm || "");
      setHeightMm(initialData.heightMm || "");
      setTemplateFiles(initialData.files || []);
      try {
        const parsed = typeof initialData.processesJson === 'string' 
          ? JSON.parse(initialData.processesJson) 
          : initialData.processesJson;
        setProcesses(Array.isArray(parsed) ? parsed : ["CORTE_LASER"]);
      } catch (e) {
        setProcesses(["CORTE_LASER"]);
      }
    } else if (isOpen && !initialData) {
      setTitle(""); setDescription(""); setSelectedMaterialId(""); setWidthMm(""); setHeightMm(""); setProcesses(["CORTE_LASER"]);
    }
  }, [isOpen, initialData, materialsConfig]);

  if (!isOpen) return null;

  const handleAddProcess = () => setProcesses([...processes, "SOLDADURA"]);
  
  const handleRemoveProcess = (index) => {
    setProcesses(processes.filter((_, i) => i !== index));
  };

  const handleProcessChange = (index, value) => {
    const newProcesses = [...processes];
    newProcesses[index] = value;
    setProcesses(newProcesses);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (processes.length === 0) return alert("Debe agregar al menos un proceso.");

    setLoading(true);
    try {
      const isEdit = !!initialData;
      const url = isEdit ? `/api/templates/${initialData.id}` : "/api/templates";
      const method = isEdit ? "PUT" : "POST";
      
      const mat = materialsConfig.find(m => m.id === selectedMaterialId);
      const material = mat ? mat.material : null;
      const thickness = mat ? mat.thickness : null;

      const payload = { title, description, material, thickness, widthMm, heightMm, processes, fileIds: templateFiles.map(f => f.id) };
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        onSaved();
        onClose();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass scrollable" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{initialData ? "Modificar Plantilla" : "Nueva Plantilla de Producto"}</h2>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Nombre del Producto</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Instrucciones / Observaciones</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Ej: Pintar con esmalte sintético blanco"
              rows={2}
            />
          </div>
          
          <div className="form-row">
            <div className="form-group flex-1">
              <label>Material y Espesor</label>
              <select value={selectedMaterialId} onChange={(e) => setSelectedMaterialId(e.target.value)} required>
                <option value="">Seleccionar</option>
                {materialsConfig.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.material} - {m.thickness}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group flex-1">
              <label>Tamaño (Ancho x Alto mm)</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <input type="number" placeholder="Ancho" value={widthMm} onChange={(e) => setWidthMm(e.target.value)} required />
                <input type="number" placeholder="Alto" value={heightMm} onChange={(e) => setHeightMm(e.target.value)} required />
              </div>
            </div>
          </div>

          <div className="form-group processes-section">
            <label>Secuencia de Procesos</label>
            <div className="processes-list">
              {processes.map((proc, index) => (
                <div key={index} className="process-item">
                  <span className="process-step">{index + 1}</span>
                  <select value={proc} onChange={(e) => handleProcessChange(index, e.target.value)}>
                    {workCenters.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                  <button type="button" className="btn-icon-danger" onClick={() => handleRemoveProcess(index)}><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
            <button type="button" className="btn btn-secondary btn-small mt-2" onClick={handleAddProcess}>
              <PlusCircle size={16} /> Agregar Siguiente Proceso
            </button>
          </div>

          <div className="form-group mt-4" style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
            <label>Planos y Archivos Adjuntos</label>
            <FileUploader 
              targetId={initialData?.id || null} 
              targetType="TEMPLATE" 
              onUploadSuccess={(file) => setTemplateFiles(prev => [...prev, file])} 
            />
            <AttachmentList 
              files={templateFiles} 
              onUpdateFiles={setTemplateFiles}
            />
          </div>

          <div className="modal-actions mt-4">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{initialData ? "Actualizar" : "Guardar Plantilla"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
