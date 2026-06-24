"use client";
import { useState, useEffect } from "react";
import { ShoppingCart, Plus, Save } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ComprasClient({ materials, initialPurchases }) {
  const router = useRouter();
  const [materialId, setMaterialId] = useState("");
  const [widthMm, setWidthMm] = useState("");
  const [heightMm, setHeightMm] = useState("");
  const [quantity, setQuantity] = useState("");
  const [providerName, setProviderName] = useState("");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (materialId) {
      const mat = materials.find(m => m.id === materialId);
      if (mat && mat.sheetWidthMm && mat.sheetHeightMm) {
        setWidthMm(mat.sheetWidthMm.toString());
        setHeightMm(mat.sheetHeightMm.toString());
      }
    }
  }, [materialId, materials]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!materialId || !widthMm || !heightMm || !quantity) {
      alert("Por favor completa los campos requeridos.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materialId,
          widthMm: parseFloat(widthMm),
          heightMm: parseFloat(heightMm),
          quantity: parseInt(quantity, 10),
          providerName,
          receiptNumber
        })
      });
      if (res.ok) {
        setMaterialId("");
        setWidthMm("");
        setHeightMm("");
        setQuantity("");
        setProviderName("");
        setReceiptNumber("");
        router.refresh();
      } else {
        alert("Error al registrar la compra.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculatedM2 = ((parseFloat(widthMm) || 0) / 1000) * ((parseFloat(heightMm) || 0) / 1000) * (parseInt(quantity) || 0);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* Formulario */}
        <form onSubmit={handleSubmit} className="glass p-4" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: 'fit-content', padding: '1.5rem', borderRadius: '12px' }}>
          <h3 style={{ marginBottom: '1rem' }}><Plus size={20} style={{ display: 'inline', marginBottom: '-4px' }} /> Nueva Compra</h3>
          
          <div className="form-group">
            <label>Material y Espesor</label>
            <select value={materialId} onChange={e => setMaterialId(e.target.value)} required>
              <option value="">Seleccionar material...</option>
              {materials.map(m => (
                <option key={m.id} value={m.id}>{m.material} - {m.thickness}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Tamaño Chapa (mm)</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="number" placeholder="Ancho (mm)" value={widthMm} onChange={e => setWidthMm(e.target.value)} required />
              <input type="number" placeholder="Alto (mm)" value={heightMm} onChange={e => setHeightMm(e.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <label>Cantidad de Planchas</label>
            <input type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} required />
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label>Proveedor (Opcional)</label>
              <input type="text" value={providerName} onChange={e => setProviderName(e.target.value)} placeholder="Nombre empresa" />
            </div>
            <div className="form-group flex-1">
              <label>Remito / Factura</label>
              <input type="text" value={receiptNumber} onChange={e => setReceiptNumber(e.target.value)} placeholder="Nro de comprobante" />
            </div>
          </div>

          <div style={{ padding: '1rem', background: 'rgba(249, 115, 22, 0.1)', borderRadius: '8px', color: 'var(--accent-color)' }}>
            <strong>Total a ingresar:</strong> {calculatedM2.toFixed(2)} m²
          </div>

          <button type="submit" className="btn btn-primary mt-2" disabled={loading || !materialId || !widthMm || !heightMm || !quantity}>
            <Save size={18} style={{ display: 'inline', marginRight: '0.5rem', marginBottom: '-4px' }} />
            {loading ? "Registrando..." : "Registrar Compra"}
          </button>
        </form>

        {/* Historial */}
        <div className="glass p-4" style={{ overflowY: 'auto', padding: '1.5rem', borderRadius: '12px' }}>
          <h3>Historial Reciente</h3>
          <table className="data-table mt-4" style={{ width: '100%', textAlign: 'center' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'center' }}>Fecha</th>
                <th style={{ textAlign: 'center' }}>Material</th>
                <th style={{ textAlign: 'center' }}>Dimensiones</th>
                <th style={{ textAlign: 'center' }}>Cant.</th>
                <th style={{ textAlign: 'center' }}>Ingreso (m²)</th>
                <th style={{ textAlign: 'center' }}>Proveedor / Remito</th>
              </tr>
            </thead>
            <tbody>
              {initialPurchases.map(p => (
                <tr key={p.id}>
                  <td>{new Date(p.purchasedAt).toLocaleDateString()}</td>
                  <td><strong>{p.material}</strong> <br/><span style={{fontSize:'0.8rem', color:'var(--accent-color)'}}>{p.thickness}</span></td>
                  <td>{p.widthMm} x {p.heightMm} mm</td>
                  <td>{p.quantity}</td>
                  <td style={{ color: 'var(--success-color)' }}>+{p.calculatedSqM.toFixed(2)} m²</td>
                  <td>{p.providerName || '-'}<br/><span className="text-muted">{p.receiptNumber || '-'}</span></td>
                </tr>
              ))}
              {initialPurchases.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">No hay compras registradas aún.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
  );
}
