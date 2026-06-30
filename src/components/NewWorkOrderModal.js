"use client";
import { useState } from "react";
import { PlusCircle, Trash2 } from "lucide-react";
import "./Modal.css";
import FileUploader from "./FileUploader";
import AttachmentList from "./AttachmentList";

const PROCESS_OPTIONS = [
  "CORTE_LASER", "PLEGADO", "MONTAJE", "SOLDADURA", 
  "REBARBADO", "REMACHES_ROSCADOS", "PINTURA", "CONTROL_CALIDAD"
];

export default function NewWorkOrderModal({ isOpen, onClose, onCreated, materialsConfig = [] }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("NORMAL");
  const [expectedQuantity, setExpectedQuantity] = useState(1);
  const [selectedMaterialId, setSelectedMaterialId] = useState("");
  const [widthMm, setWidthMm] = useState("");
  const [heightMm, setHeightMm] = useState("");
  const [processes, setProcesses] = useState(["CORTE_LASER"]); 
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

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
    if (processes.length === 0) {
      alert("Debe agregar al menos un proceso.");
      return;
    }

    setLoading(true);
    
    try {
      const mat = materialsConfig.find(m => m.id === selectedMaterialId);
      const material = mat ? mat.material : null;
      const thickness = mat ? mat.thickness : null;

      const payload = { 
        title, 
        description,
        priority, 
        material,
        thickness, 
        expectedQuantity: parseInt(expectedQuantity),
        widthMm: widthMm ? parseFloat(widthMm) : null,
        heightMm: heightMm ? parseFloat(heightMm) : null,
        processes,
        fileIds: uploadedFiles.map(f => f.id)
      };

      const res = await fetch("/api/work-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setTitle("");
        setDescription("");
        setPriority("NORMAL");
        setExpectedQuantity(1);
        setSelectedMaterialId("");
        setWidthMm("");
        setHeightMm("");
        setProcesses(["CORTE_LASER", "PLEGADO"]);
        setUploadedFiles([]);
        onCreated();
        onClose();
      } else {
        const err = await res.json();
        alert(err.error || "Error al crear el trabajo");
      }
    } catch (error) {
      console.error("Error creating order:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass scrollable" onClick={e => e.stopPropagation()}>
        <h2>Nuevo Trabajo</h2>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Título / Descripción</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Soportes de motor"
              required 
            />
          </div>
          
          <div className="form-row">
            <div className="form-group flex-1">
              <label>Prioridad</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="BAJA">Baja</option>
                <option value="NORMAL">Normal</option>
                <option value="ALTA">Alta</option>
              </select>
            </div>
            
            <div className="form-group flex-1">
              <label>Cantidad a Fabricar</label>
              <input 
                type="number" 
                min="1"
                value={expectedQuantity} 
                onChange={(e) => setExpectedQuantity(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label>Instrucciones Personalizadas / Descripción</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Ej: Pintar de negro mate, embalar con extra burbuja..."
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label>Material y Espesor</label>
              <select value={selectedMaterialId} onChange={(e) => setSelectedMaterialId(e.target.value)}>
                <option value="">Seleccionar</option>
                {materialsConfig.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.material} - {m.thickness}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group flex-1">
              <label>Tamaño Pieza (Mm)</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input 
                  type="number" 
                  placeholder="Ancho"
                  value={widthMm} 
                  onChange={(e) => setWidthMm(e.target.value)}
                  style={{ width: '100%' }}
                />
                <span>x</span>
                <input 
                  type="number" 
                  placeholder="Alto"
                  value={heightMm} 
                  onChange={(e) => setHeightMm(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>

          <div className="form-group mt-4" style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
            <label>Planos y Archivos</label>
            <FileUploader 
              targetId={null} 
              targetType="WORK_ORDER" 
              onUploadSuccess={(file) => setUploadedFiles(prev => [...prev, file])} 
            />
            <AttachmentList 
              files={uploadedFiles} 
              onUpdateFiles={setUploadedFiles}
            />
          </div>

          <div className="form-group processes-section">
            <label>Secuencia de Procesos (Ruteo)</label>
            <div className="processes-list">
              {processes.map((proc, index) => (
                <div key={index} className="process-item">
                  <span className="process-step">{index + 1}</span>
                  <select 
                    value={proc} 
                    onChange={(e) => handleProcessChange(index, e.target.value)}
                  >
                    {PROCESS_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt.replace("_", " ")}</option>
                    ))}
                  </select>
                  <button type="button" className="btn-icon-danger" onClick={() => handleRemoveProcess(index)}>
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
            <button type="button" className="btn btn-secondary btn-small mt-2" onClick={handleAddProcess}>
              <PlusCircle size={16} /> Agregar Siguiente Proceso
            </button>
          </div>

          <div className="modal-actions mt-4">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Guardando..." : "Crear Trabajo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
