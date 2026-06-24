"use client";
import { useState, useEffect } from "react";
import "@/components/Modal.css";

export default function AdjustStockModal({ isOpen, onClose, onUpdated, materialsConfig = [], defaultItem }) {
  const [materialId, setMaterialId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [isBySheets, setIsBySheets] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (defaultItem) {
        const mat = materialsConfig.find(m => m.material === defaultItem.material && m.thickness === defaultItem.thickness);
        if (mat) setMaterialId(mat.id);
      } else {
        setMaterialId("");
      }
      setQuantity("");
      setIsBySheets(false);
    }
  }, [isOpen, defaultItem, materialsConfig]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!materialId) return alert("Selecciona un material");
    setLoading(true);
    
    try {
      const mat = materialsConfig.find(m => m.id === materialId);
      let finalQuantitySqM = parseFloat(quantity);

      if (isBySheets) {
        const sheetSqM = (mat.sheetWidthMm * mat.sheetHeightMm) / 1000000;
        finalQuantitySqM = finalQuantitySqM * sheetSqM;
      }

      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          material: mat.material,
          thickness: mat.thickness, 
          quantitySqM: finalQuantitySqM 
        })
      });
      
      if (res.ok) {
        setMaterialId("");
        setQuantity("");
        onUpdated();
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
      <div className="modal-content glass" onClick={e => e.stopPropagation()}>
        <h2>Ajuste Manual de Stock</h2>
        <p className="text-muted">Añade metros cuadrados de chapa al inventario (o usa un valor negativo para restar).</p>
        
        <form onSubmit={handleSubmit} className="modal-form mt-2">
          <div className="form-group">
            <label>Material y Espesor</label>
            <select value={materialId} onChange={(e) => setMaterialId(e.target.value)} required>
              <option value="">Seleccionar material y espesor</option>
              {materialsConfig.map(m => (
                <option key={m.id} value={m.id}>
                  {m.material} - {m.thickness}
                </option>
              ))}
            </select>
          </div>

          {(() => {
            const mat = materialsConfig.find(m => m.id === materialId);
            const canUseSheets = mat && mat.sheetWidthMm && mat.sheetHeightMm;

            return (
              <>
                {canUseSheets && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input 
                      type="checkbox" 
                      id="bySheets" 
                      checked={isBySheets} 
                      onChange={e => setIsBySheets(e.target.checked)} 
                      style={{ width: 'auto' }}
                    />
                    <label htmlFor="bySheets" style={{ cursor: 'pointer', margin: 0, fontWeight: 'normal' }}>
                      Ingresar por cantidad de planchas
                    </label>
                  </div>
                )}
                <div className="form-group">
                  <label>Cantidad a Sumar ({isBySheets ? 'planchas' : 'm²'})</label>
                  <input 
                    type="number" 
                    step={isBySheets ? "1" : "0.01"}
                    value={quantity} 
                    onChange={(e) => setQuantity(e.target.value)} 
                    placeholder={isBySheets ? "Ej: 5" : "Ej: 5.5"}
                    required 
                  />
                  {isBySheets && quantity && (
                    <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                      ≈ {((parseFloat(quantity) * ((mat.sheetWidthMm * mat.sheetHeightMm) / 1000000)) || 0).toFixed(2)} m²
                    </span>
                  )}
                </div>
              </>
            );
          })()}

          <div className="modal-actions mt-4">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Guardando..." : "Guardar Ajuste"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
