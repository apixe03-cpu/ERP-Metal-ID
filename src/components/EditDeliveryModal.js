"use client";
import { useState, useEffect } from "react";
import "@/components/Modal.css";

export default function EditDeliveryModal({ delivery, isOpen, onClose, onUpdated }) {
  const [clientName, setClientName] = useState("");
  const [remitoNumber, setRemitoNumber] = useState("");
  const [deliveryType, setDeliveryType] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && delivery) {
      setClientName(delivery.clientName);
      setRemitoNumber(delivery.remitoNumber);
      setDeliveryType(delivery.deliveryType);
    }
  }, [isOpen, delivery]);

  if (!isOpen || !delivery) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/deliveries/${delivery.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientName, remitoNumber, deliveryType })
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Modificar Entrega</h2>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Cliente</label>
            <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} required />
          </div>
          <div className="form-row">
            <div className="form-group flex-1">
              <label>Remito</label>
              <input type="text" value={remitoNumber} onChange={e => setRemitoNumber(e.target.value)} required />
            </div>
            <div className="form-group flex-1">
              <label>Modalidad</label>
              <select value={deliveryType} onChange={e => setDeliveryType(e.target.value)}>
                <option value="RETIRO">Retiro en taller</option>
                <option value="ENVIO">Envío</option>
              </select>
            </div>
          </div>
          <div className="modal-actions mt-4">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>Actualizar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
