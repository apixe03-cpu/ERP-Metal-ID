"use client";
import { useState, useEffect } from "react";
import "@/components/Modal.css";

export default function ProduceTemplateModal({ template, isOpen, onClose, onProduced, workCenters = [] }) {
  const [quantity, setQuantity] = useState(1);
  const [priority, setPriority] = useState("NORMAL");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !template) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const payload = { 
        title: `Lote: ${template.title}`, 
        description: template.description || "",
        priority: priority, 
        material: template.material,
        thickness: template.thickness,  
        expectedQuantity: parseInt(quantity),
        widthMm: template.widthMm,
        heightMm: template.heightMm,
        processes: template.processesJson ? JSON.parse(template.processesJson) : ["CORTE_LASER", "PLEGADO", "SOLDADURA", "PINTURA"],
        templateId: template.id, // VINCULO AL CATALOGO
        templateFiles: template.files || []
      };

      const res = await fetch("/api/work-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setQuantity(1);
        onProduced();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass" onClick={e => e.stopPropagation()}>
        <h2>Enviar a Producción</h2>
        <p className="text-muted">Se creará una nueva orden de trabajo con el ruteo de <strong>{template.title}</strong>.</p>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group flex-1">
              <label>¿Cuántas unidades?</label>
              <input 
                type="number" 
                min="1" 
                value={quantity} 
                onChange={(e) => setQuantity(e.target.value)} 
                required 
                style={{ fontSize: '1.2rem', padding: '0.8rem', textAlign: 'center' }}
              />
            </div>
            
            <div className="form-group flex-1">
              <label>Prioridad</label>
              <select 
                value={priority} 
                onChange={(e) => setPriority(e.target.value)}
                style={{ fontSize: '1.2rem', padding: '0.8rem' }}
              >
                <option value="BAJA">Baja</option>
                <option value="NORMAL">Normal</option>
                <option value="ALTA">Alta</option>
              </select>
            </div>
          </div>

          <div className="modal-actions mt-4">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Enviando..." : "🚀 Iniciar Producción"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
