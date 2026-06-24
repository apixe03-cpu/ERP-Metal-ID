"use client";
import { useState, useEffect } from "react";
import { Download, Eye, Clock } from "lucide-react";
import "./Modal.css";

export default function AdjustStockPropioModal({ stockItem, history = [], isOpen, onClose, onUpdated }) {
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && stockItem) {
      setQuantity(stockItem.quantity);
    }
  }, [isOpen, stockItem]);

  if (!isOpen || !stockItem) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/finished-products/${stockItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: parseInt(quantity) })
      });
      if (res.ok) {
        onUpdated();
      } else {
        alert("Error al actualizar");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("¿Seguro que deseas eliminar este producto del stock por completo?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/finished-products/${stockItem.id}`, { method: "DELETE" });
      if (res.ok) {
        onUpdated();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass scrollable" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', padding: '2rem' }}>
        <div className="modal-header">
          <h2>Ajustar Stock: {stockItem.productName}</h2>
        </div>

        {stockItem.template && (
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
            <h4 style={{ color: 'var(--accent-color)', marginBottom: '0.5rem' }}>Especificaciones del Producto</h4>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.9rem' }}>
              {stockItem.template.material && <span><strong>Material:</strong> {stockItem.template.material} - {stockItem.template.thickness}</span>}
              {stockItem.template.widthMm && <span><strong>Dimensiones:</strong> {stockItem.template.widthMm} x {stockItem.template.heightMm} mm</span>}
            </div>
            
            {stockItem.template.description && (
              <p style={{ marginTop: '0.5rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>{stockItem.template.description}</p>
            )}

            {stockItem.template.files && stockItem.template.files.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <h5>Archivos de Diseño</h5>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  {stockItem.template.files.map(f => (
                    <div key={f.id} className="glass" style={{ padding: '0.5rem', borderRadius: '4px', textAlign: 'center', width: '120px' }}>
                      <p style={{ fontSize: '0.7rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</p>
                      {f.type === "DXF" && (
                        <>
                          <img src={`${f.url}.svg`} alt="DXF" style={{ width: '100%', height: '60px', objectFit: 'contain', margin: '0.5rem 0' }} />
                          <a href={`${f.url}.svg`} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ padding: '0.2rem', fontSize: '0.7rem', display: 'block' }}>
                            <Eye size={12} style={{ display: 'inline' }} /> Ver Plano
                          </a>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Cantidad Actual</label>
            <input 
              type="number" 
              value={quantity} 
              onChange={e => setQuantity(e.target.value)} 
              required 
            />
          </div>

          {history.length > 0 && (
            <div className="mt-4" style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--accent-color)' }}>
                <Clock size={16} /> Historial de Fabricación
              </h4>
              <table className="data-table" style={{ width: '100%', fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Orden Origen</th>
                    <th>Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(h => {
                    const finalQty = h.workOrder?.processes?.[0]?.goodQuantity || h.workOrder?.expectedQuantity;
                    return (
                      <tr key={h.id}>
                        <td>{new Date(h.deliveredAt).toLocaleDateString()}</td>
                        <td>{h.workOrder?.title} <span className="text-muted">({h.remitoNumber})</span></td>
                        <td style={{ color: 'var(--success-color)' }}>+{finalQty}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="modal-actions mt-4" style={{ justifyContent: 'space-between' }}>
            <button type="button" className="btn btn-icon-danger" onClick={handleDelete} title="Eliminar Registro">
              Borrar
            </button>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>Actualizar Stock</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
